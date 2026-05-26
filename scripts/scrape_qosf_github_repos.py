#!/usr/bin/env python3
"""Scrape GitHub repo links from QOSF's project list and clone them locally."""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

QOSF_PROJECT_LIST_URL = "https://www.qosf.org/project_list/"
GITHUB_URL_RE = re.compile(r"https?://github\.com/[^\s\"'<>]+", re.IGNORECASE)
REPO_PATH_RE = re.compile(
    r"^https?://github\.com/(?P<owner>[^/]+)/(?P<repo>[^/?#]+)",
    re.IGNORECASE,
)

DEFAULT_OUTPUT_DIR = Path(__file__).resolve().parent.parent / "reference" / "qosf-github-repos"


@dataclass(frozen=True)
class GitHubRepo:
    owner: str
    name: str
    url: str

    @property
    def slug(self) -> str:
        return f"{self.owner}/{self.name}"

    @property
    def clone_dir_name(self) -> str:
        return f"{self.owner}__{self.name}"


def fetch_html(url: str, timeout: int = 60) -> str:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "qtangl-qosf-scraper/1.0"},
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return response.read().decode("utf-8", errors="replace")


def normalize_repo_url(raw_url: str) -> str | None:
    cleaned = raw_url.rstrip(").,;")
    match = REPO_PATH_RE.match(cleaned)
    if not match:
        return None

    owner = match.group("owner")
    repo = match.group("repo")
    if repo.endswith(".git"):
        repo = repo[:-4]

    return f"https://github.com/{owner}/{repo}"


def extract_repos(html: str) -> list[GitHubRepo]:
    repos: dict[str, GitHubRepo] = {}
    for raw_url in GITHUB_URL_RE.findall(html):
        normalized = normalize_repo_url(raw_url)
        if not normalized:
            continue

        owner, name = normalized.rsplit("/", 2)[-2:]
        repos[normalized] = GitHubRepo(owner=owner, name=name, url=normalized)

    return sorted(repos.values(), key=lambda repo: repo.slug.lower())


def save_manifest(
    output_dir: Path,
    source_url: str,
    repos: Iterable[GitHubRepo],
) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    repo_list = list(repos)

    manifest = {
        "source_url": source_url,
        "scraped_at": datetime.now(timezone.utc).isoformat(),
        "repo_count": len(repo_list),
        "repos": [asdict(repo) for repo in repo_list],
    }

    manifest_path = output_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    repos_txt_path = output_dir / "repos.txt"
    repos_txt_path.write_text(
        "\n".join(repo.url for repo in repo_list) + "\n",
        encoding="utf-8",
    )


def clone_repo(
    repo: GitHubRepo,
    output_dir: Path,
    depth: int,
    force: bool,
) -> tuple[str, bool, str]:
    destination = output_dir / repo.clone_dir_name

    if destination.exists():
        if not force:
            return repo.slug, True, "skipped (already exists)"
        shutil.rmtree(destination)

    command = [
        "git",
        "clone",
        "--depth",
        str(depth),
        repo.url,
        str(destination),
    ]

    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            check=False,
        )
    except FileNotFoundError:
        return repo.slug, False, "git is not installed or not on PATH"

    if result.returncode == 0:
        return repo.slug, True, "cloned"

    message = (result.stderr or result.stdout or "unknown error").strip()
    return repo.slug, False, message.splitlines()[-1] if message else "clone failed"


def clone_repos(
    repos: Iterable[GitHubRepo],
    output_dir: Path,
    depth: int,
    jobs: int,
    force: bool,
) -> tuple[int, int, int]:
    repo_list = list(repos)
    cloned = 0
    skipped = 0
    failed = 0

    with ThreadPoolExecutor(max_workers=max(1, jobs)) as executor:
        futures = {
            executor.submit(clone_repo, repo, output_dir, depth, force): repo
            for repo in repo_list
        }

        for future in as_completed(futures):
            slug, ok, message = future.result()
            if ok and message.startswith("skipped"):
                skipped += 1
                print(f"[skip] {slug}")
            elif ok:
                cloned += 1
                print(f"[ok]   {slug}")
            else:
                failed += 1
                print(f"[fail] {slug}: {message}", file=sys.stderr)

    return cloned, skipped, failed


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Scrape GitHub repository links from the QOSF project list and "
            "optionally clone them for local reference."
        )
    )
    parser.add_argument(
        "--url",
        default=QOSF_PROJECT_LIST_URL,
        help=f"Page to scrape (default: {QOSF_PROJECT_LIST_URL})",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help=f"Directory for manifest and clones (default: {DEFAULT_OUTPUT_DIR})",
    )
    parser.add_argument(
        "--manifest-only",
        action="store_true",
        help="Only scrape links and write manifest files; do not clone repos",
    )
    parser.add_argument(
        "--depth",
        type=int,
        default=1,
        help="Shallow clone depth (default: 1)",
    )
    parser.add_argument(
        "--jobs",
        type=int,
        default=4,
        help="Parallel git clones (default: 4)",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-clone repos that already exist in the output directory",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    output_dir = args.output_dir.resolve()

    try:
        html = fetch_html(args.url)
    except urllib.error.URLError as exc:
        print(f"Failed to fetch {args.url}: {exc}", file=sys.stderr)
        return 1

    repos = extract_repos(html)
    if not repos:
        print("No GitHub repositories found.", file=sys.stderr)
        return 1

    save_manifest(output_dir, args.url, repos)
    print(f"Found {len(repos)} unique repositories.")
    print(f"Wrote {output_dir / 'manifest.json'}")
    print(f"Wrote {output_dir / 'repos.txt'}")

    if args.manifest_only:
        return 0

    print(f"Cloning into {output_dir} (depth={args.depth}, jobs={args.jobs})...")
    cloned, skipped, failed = clone_repos(
        repos,
        output_dir,
        depth=args.depth,
        jobs=args.jobs,
        force=args.force,
    )
    print(f"Done: {cloned} cloned, {skipped} skipped, {failed} failed.")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
