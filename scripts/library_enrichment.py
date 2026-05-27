"""Extract structured metadata from cloned reference repos for the Learn library."""

from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path
from typing import Any

BACKEND_IMPORT_PATTERN = re.compile(
    r"\b(?:import|from)\s+(qiskit|cirq|pennylane|braket|dwave|dimod|openfermion|projectq|stim|pyzx|yao)\b",
    re.IGNORECASE,
)

BACKEND_SLUG_MAP = {
    "qiskit": "qiskit-qiskit",
    "cirq": "quantumlib-cirq",
    "pennylane": "xanaduai-pennylane",
    "braket": "aws-amazon-braket-sdk-python",
    "dwave": "dwavesystems-dwave-ocean-sdk",
    "dimod": "dwavesystems-dimod",
    "openfermion": "quantumlib-openfermion",
    "projectq": "projectq-framework-projectq",
    "stim": "quantumlib-stim",
    "pyzx": "quantomatic-pyzx",
    "yao": "quantumbfs-yao-jl",
}

LINK_PATTERNS = {
    "docs": re.compile(
        r"https?://[^\s\)>\"']*(?:readthedocs\.io|docs\.|quantumai\.google|documentation)[^\s\)>\"']*",
        re.IGNORECASE,
    ),
    "paper": re.compile(
        r"https?://[^\s\)>\"']*arxiv\.org/[^\s\)>\"']*",
        re.IGNORECASE,
    ),
    "community": re.compile(
        r"https?://[^\s\)>\"']*(?:slack\.com|discord\.(?:gg|com)|gitter\.im|matrix\.to)[^\s\)>\"']*",
        re.IGNORECASE,
    ),
    "pypi": re.compile(
        r"https?://pypi\.org/project/[^\s\)>\"']+",
        re.IGNORECASE,
    ),
}

FENCED_CODE_RE = re.compile(
    r"```(?P<lang>[a-zA-Z0-9+#.-]*)\s*\r?\n(?P<body>.*?)```",
    re.DOTALL,
)

HEADING_RE = re.compile(r"^#{1,6}\s+(.+)$", re.MULTILINE)


def run_git(repo_dir: Path, *args: str) -> str | None:
    if not (repo_dir / ".git").exists():
        return None
    try:
        result = subprocess.run(
            ["git", "-C", str(repo_dir), *args],
            capture_output=True,
            text=True,
            timeout=15,
            check=False,
        )
        if result.returncode != 0:
            return None
        return result.stdout.strip() or None
    except (OSError, subprocess.TimeoutExpired):
        return None


def git_last_pushed_at(repo_dir: Path) -> str | None:
    return run_git(repo_dir, "log", "-1", "--format=%cI")


def git_default_branch(repo_dir: Path) -> str:
    branch = run_git(repo_dir, "symbolic-ref", "--short", "refs/remotes/origin/HEAD")
    if branch and branch.startswith("origin/"):
        return branch.split("/", 1)[1]
    branch = run_git(repo_dir, "rev-parse", "--abbrev-ref", "HEAD")
    return branch or "main"


def parse_stars_from_readme(readme_text: str, owner: str, name: str) -> int | None:
    readme_text = normalize_newlines(readme_text)
    patterns = [
        rf"img\.shields\.io/github/stars/{re.escape(owner)}/{re.escape(name)}",
        rf"github\.com/{re.escape(owner)}/{re.escape(name)}/stargazers",
        rf"badge/stars/{re.escape(owner)}-{re.escape(name)}",
    ]
    for pattern in patterns:
        for match in re.finditer(pattern, readme_text, re.IGNORECASE):
            window = readme_text[max(0, match.start() - 80) : match.end() + 200]
            number_match = re.search(
                r"(?:stars|stargazers)[^\d]*(\d[\d,]*)|(\d[\d,]*)\s*(?:stars|stargazers)",
                window,
                re.IGNORECASE,
            )
            if number_match:
                value = number_match.group(1) or number_match.group(2)
                if value:
                    return int(value.replace(",", ""))
    return None


def walk_license_files(repo_dir: Path) -> list[Path]:
    candidates: list[Path] = []
    for pattern in ("LICENSE*", "LICENCE*", "COPYING*"):
        candidates.extend(repo_dir.glob(pattern))
    return sorted(candidates, key=lambda p: (len(p.name), p.name.lower()))


def parse_pyproject_license(repo_dir: Path) -> str | None:
    pyproject = repo_dir / "pyproject.toml"
    if not pyproject.exists():
        return None
    text = pyproject.read_text(encoding="utf-8", errors="ignore")
    match = re.search(r'license\s*=\s*(?:"([^"]+)"|\'([^\']+)\')', text, re.IGNORECASE)
    if match:
        return match.group(1) or match.group(2)
    match = re.search(r"license\s*=\s*\{[^}]*text\s*=\s*['\"]([^'\"]+)['\"]", text, re.IGNORECASE)
    if match:
        return match.group(1)
    return None


def parse_package_json_license(repo_dir: Path) -> str | None:
    package_json = repo_dir / "package.json"
    if not package_json.exists():
        return None
    try:
        payload = json.loads(package_json.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None
    license_value = payload.get("license")
    if isinstance(license_value, str):
        return license_value
    if isinstance(license_value, dict):
        return license_value.get("type")
    return None


def scan_spdx_header(repo_dir: Path, limit: int = 50) -> str | None:
    extensions = {".py", ".rs", ".cpp", ".c", ".h", ".js", ".ts", ".jl", ".go"}
    checked = 0
    for path in repo_dir.rglob("*"):
        if checked >= limit:
            break
        if path.suffix.lower() not in extensions:
            continue
        if any(part.startswith(".") for part in path.parts):
            continue
        checked += 1
        try:
            head = path.read_text(encoding="utf-8", errors="ignore")[:4000]
        except OSError:
            continue
        match = re.search(r"SPDX-License-Identifier:\s*([A-Za-z0-9.-]+)", head)
        if match:
            return match.group(1)
    return None


def identify_license_text(text: str) -> str | None:
    lowered = text.lower()
    if "apache license" in lowered and "2.0" in lowered:
        return "Apache-2.0"
    if "mit license" in lowered:
        return "MIT"
    if "bsd 3-clause" in lowered or "redistribution and use in source and binary forms" in lowered:
        return "BSD-3-Clause"
    if "gnu general public license" in lowered and "lesser" in lowered:
        return "LGPL"
    if "gnu general public license" in lowered:
        return "GPL"
    if "mozilla public license" in lowered:
        return "MPL-2.0"
    if "eclipse public license" in lowered:
        return "EPL"
    if "creative commons" in lowered:
        return "CC"
    return None


def detect_license_enhanced(repo_dir: Path) -> str | None:
    for candidate in walk_license_files(repo_dir):
        try:
            identified = identify_license_text(
                candidate.read_text(encoding="utf-8", errors="ignore")
            )
            if identified:
                return identified
        except OSError:
            continue
    for parser in (parse_pyproject_license, parse_package_json_license):
        parsed = parser(repo_dir)
        if parsed:
            normalized = parsed.strip()
            if normalized.upper() in {"MIT", "APACHE-2.0", "BSD-3-CLAUSE", "GPL-3.0"}:
                return normalized
            if "apache" in normalized.lower():
                return "Apache-2.0"
            return normalized
    return scan_spdx_header(repo_dir)


def detect_languages(repo_dir: Path, extension_map: dict[str, str]) -> list[str]:
    counts: dict[str, int] = {}
    ignore = {".git", ".github", "node_modules", "__pycache__", ".venv", "venv", "dist", "build"}
    for path in repo_dir.rglob("*"):
        if not path.is_file():
            continue
        if any(part in ignore for part in path.parts):
            continue
        language = extension_map.get(path.suffix.lower())
        if language:
            counts[language] = counts.get(language, 0) + 1
    if not counts:
        return []
    return [lang for lang, _ in sorted(counts.items(), key=lambda item: (-item[1], item[0]))[:3]]


def normalize_newlines(text: str) -> str:
    return text.replace("\r\n", "\n").replace("\r", "\n")


def extract_quickstart(readme_text: str) -> dict[str, str] | None:
    readme_text = normalize_newlines(readme_text)
    headings = list(HEADING_RE.finditer(readme_text))
    for index, match in enumerate(headings):
        title = match.group(1).strip().lower()
        if not any(keyword in title for keyword in ("quick start", "quickstart", "getting started", "hello")):
            continue
        start = match.end()
        end = headings[index + 1].start() if index + 1 < len(headings) else len(readme_text)
        section = readme_text[start:end]
        for code_match in FENCED_CODE_RE.finditer(section):
            lang = (code_match.group("lang") or "text").lower()
            if lang in {"", "text", "console", "shell", "sh", "bash"} or lang in {
                "python",
                "py",
                "javascript",
                "js",
                "julia",
            }:
                body = code_match.group("body").strip()
                if len(body.splitlines()) >= 2:
                    return {"language": lang or "python", "source": body[:4000]}
        break

    for code_match in FENCED_CODE_RE.finditer(readme_text):
        lang = (code_match.group("lang") or "python").lower()
        if lang in {"python", "py", "javascript", "js", "julia", "bash", "sh", "shell"}:
            body = code_match.group("body").strip()
            if len(body.splitlines()) >= 3 and "import " in body:
                return {"language": lang, "source": body[:4000]}

    install_match = re.search(
        r"##\s*install(?:ation)?.*?(```[\s\S]*?```)",
        readme_text,
        re.IGNORECASE,
    )
    if install_match:
        code_match = FENCED_CODE_RE.search(install_match.group(1))
        if code_match:
            return {
                "language": (code_match.group("lang") or "bash").lower(),
                "source": code_match.group("body").strip()[:2000],
            }
    return None


def collect_code_samples(repo_dir: Path, limit: int = 3) -> list[dict[str, str]]:
    samples: list[dict[str, str]] = []
    search_roots = [
        repo_dir / "examples",
        repo_dir / "example",
        repo_dir / "tutorials",
        repo_dir / "tutorial",
        repo_dir / "docs" / "examples",
    ]
    for root in search_roots:
        if not root.exists():
            continue
        for path in sorted(root.rglob("*")):
            if len(samples) >= limit:
                return samples
            if path.name in {"__init__.py", "setup.py", "conftest.py"}:
                continue
            if path.suffix == ".py":
                try:
                    source = path.read_text(encoding="utf-8", errors="ignore")
                except OSError:
                    continue
                if "Apache License" in source[:800] and "import " not in source[:1200]:
                    continue
                lines = [
                    line
                    for line in source.splitlines()
                    if line.strip() and not line.strip().startswith("# Copyright")
                ]
                if len(lines) < 8:
                    continue
                snippet = "\n".join(lines[:40])
                samples.append(
                    {
                        "title": path.stem.replace("_", " ").title(),
                        "language": "python",
                        "source": snippet[:2500],
                        "path": str(path.relative_to(repo_dir)).replace("\\", "/"),
                    }
                )
            elif path.suffix == ".ipynb":
                try:
                    notebook = json.loads(path.read_text(encoding="utf-8"))
                except (OSError, json.JSONDecodeError):
                    continue
                for cell in notebook.get("cells", []):
                    if cell.get("cell_type") != "code":
                        continue
                    source_lines = cell.get("source", [])
                    if isinstance(source_lines, str):
                        source = source_lines
                    else:
                        source = "".join(source_lines)
                    if len(source.strip().splitlines()) < 4:
                        continue
                    samples.append(
                        {
                            "title": path.stem.replace("_", " ").title(),
                            "language": "python",
                            "source": source.strip()[:2500],
                            "path": str(path.relative_to(repo_dir)).replace("\\", "/"),
                        }
                    )
                    break
                if len(samples) >= limit:
                    return samples
    return samples


def parse_citation_cff(repo_dir: Path) -> str | None:
    cff_path = repo_dir / "CITATION.cff"
    if not cff_path.exists():
        return None
    text = cff_path.read_text(encoding="utf-8", errors="ignore")
    title_match = re.search(r"^title:\s*['\"]?(.+?)['\"]?\s*$", text, re.MULTILINE)
    authors = re.findall(r"^  family-names:\s*(.+)$", text, re.MULTILINE)
    year_match = re.search(r"^date-released:\s*['\"]?(\d{4})", text, re.MULTILINE)
    doi_match = re.search(r"^doi:\s*['\"]?(10\.[^\s'\"]+)", text, re.MULTILINE)
    title = title_match.group(1) if title_match else "Software"
    author = " and ".join(authors[:3]) if authors else "Unknown"
    year = year_match.group(1) if year_match else "n.d."
    doi = doi_match.group(1) if doi_match else None
    key = re.sub(r"[^a-zA-Z0-9]", "", title.lower())[:24] or "reference"
    bib = (
        f"@software{{{key},\n"
        f"  title = {{{title}}},\n"
        f"  author = {{{author}}},\n"
        f"  year = {{{year}}},\n"
    )
    if doi:
        bib += f"  doi = {{{doi}}},\n"
    bib += "}\n"
    return bib


def parse_package_metadata(repo_dir: Path) -> dict[str, Any]:
    meta: dict[str, Any] = {}
    pyproject = repo_dir / "pyproject.toml"
    if pyproject.exists():
        text = pyproject.read_text(encoding="utf-8", errors="ignore")
        for field, pattern in {
            "name": r'\[project\][\s\S]*?name\s*=\s*["\']([^"\']+)["\']',
            "version": r'\[project\][\s\S]*?version\s*=\s*["\']([^"\']+)["\']',
            "requiresPython": r'requires-python\s*=\s*["\']([^"\']+)["\']',
        }.items():
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                meta[field] = match.group(1)
        deps = re.findall(r'dependencies\s*=\s*\[[\s\S]*?\]', text)
        if deps:
            dep_names = re.findall(r'["\']([a-zA-Z0-9_-]+)', deps[0])
            meta["dependencies"] = dep_names[:12]
    package_json = repo_dir / "package.json"
    if package_json.exists():
        try:
            payload = json.loads(package_json.read_text(encoding="utf-8"))
            meta.setdefault("name", payload.get("name"))
            meta.setdefault("version", payload.get("version"))
        except json.JSONDecodeError:
            pass
    return meta


def detect_supported_backends(repo_dir: Path, known_slugs: set[str]) -> list[str]:
    found: list[str] = []
    scan_dirs = [repo_dir / "examples", repo_dir]
    seen: set[str] = set()
    for root in scan_dirs:
        if not root.exists():
            continue
        for path in root.rglob("*.py"):
            if path.stat().st_size > 200_000:
                continue
            try:
                text = path.read_text(encoding="utf-8", errors="ignore")[:8000]
            except OSError:
                continue
            for match in BACKEND_IMPORT_PATTERN.finditer(text):
                slug = BACKEND_SLUG_MAP.get(match.group(1).lower())
                if slug and slug in known_slugs and slug not in seen:
                    seen.add(slug)
                    found.append(slug)
    return found[:8]


def extract_external_links(readme_text: str) -> dict[str, list[str]]:
    links: dict[str, list[str]] = {"docs": [], "paper": [], "community": [], "pypi": []}
    for kind, pattern in LINK_PATTERNS.items():
        for match in pattern.finditer(readme_text):
            url = match.group(0).rstrip(".,;)")
            if url not in links[kind]:
                links[kind].append(url)
            if len(links[kind]) >= 4:
                break
    return {key: value for key, value in links.items() if value}


def strip_readme_for_display(readme_text: str) -> str:
    """Remove badge-heavy header blocks; keep substantive markdown."""
    lines = readme_text.splitlines()
    output: list[str] = []
    skipped_header = False
    for line in lines:
        if not skipped_header and (
            "img.shields.io" in line
            or line.strip().startswith("<div align=\"center\">")
            or line.strip() == "<div align=\"center\">"
        ):
            continue
        if line.strip() == "</div>" and not skipped_header:
            skipped_header = True
            continue
        if "img.shields.io" in line and len(line) < 200:
            continue
        output.append(line)
        if line.startswith("## ") and not skipped_header:
            skipped_header = True
    return "\n".join(output).strip()


def enrich_entry(
    repo_dir: Path,
    readme_text: str,
    owner: str,
    name: str,
    extension_map: dict[str, str],
    known_slugs: set[str],
    github_data: dict[str, Any],
) -> dict[str, Any]:
    languages = detect_languages(repo_dir, extension_map)
    license_name = (
        (github_data.get("license") or {}).get("spdx_id")
        if github_data.get("license")
        else None
    )
    if not license_name or license_name == "NOASSERTION":
        license_name = detect_license_enhanced(repo_dir)
    stars = github_data.get("stargazers_count")
    if not stars:
        parsed_stars = parse_stars_from_readme(readme_text, owner, name)
        stars = parsed_stars or 0
    last_pushed = github_data.get("pushed_at") or git_last_pushed_at(repo_dir)
    default_branch = github_data.get("default_branch") or git_default_branch(repo_dir)
    quickstart = extract_quickstart(readme_text)
    code_samples = collect_code_samples(repo_dir)
    package_meta = parse_package_metadata(repo_dir)
    citation_bibtex = parse_citation_cff(repo_dir)
    supported_backends = detect_supported_backends(repo_dir, known_slugs)
    external_links = extract_external_links(readme_text)
    readme_full = strip_readme_for_display(normalize_newlines(readme_text))

    return {
        "primaryLanguages": languages,
        "primaryLanguage": languages[0] if languages else None,
        "license": license_name,
        "stars": stars,
        "lastPushedAt": last_pushed,
        "defaultBranch": default_branch,
        "quickstart": quickstart,
        "codeSamples": code_samples,
        "packageMeta": package_meta,
        "citationBibtex": citation_bibtex,
        "supportedBackendSlugs": supported_backends,
        "externalLinks": external_links,
        "readmeMarkdown": readme_full,
        "openIssuesCount": github_data.get("open_issues_count"),
        "subscribersCount": github_data.get("subscribers_count"),
        "latestRelease": (github_data.get("latest_release") or {}).get("tag_name"),
        "ownerType": (github_data.get("owner") or {}).get("type"),
        "ownerUrl": (github_data.get("owner") or {}).get("html_url"),
    }
