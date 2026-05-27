#!/usr/bin/env python3
"""Build static library content payloads for the /learn section."""

from __future__ import annotations

import json
import os
import re
import time
import urllib.error
import urllib.request
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from library_enrichment import enrich_entry


WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
REFERENCE_DIR = WORKSPACE_ROOT / "reference"
MANIFEST_PATH = REFERENCE_DIR / "manifest.json"
TAXONOMY_PATH = Path(__file__).resolve().parent / "library_taxonomy.json"
OUTPUT_DIR = WORKSPACE_ROOT / "web" / "content" / "library"
ENTRIES_DIR = OUTPUT_DIR / "entries"
README_DIR = OUTPUT_DIR / "readmes"
PUBLIC_LEARN_DIR = WORKSPACE_ROOT / "web" / "public" / "learn"
OG_IMAGE_DIR = PUBLIC_LEARN_DIR / "og"
MONOGRAM_DIR = PUBLIC_LEARN_DIR / "monogram"
GITHUB_CACHE_DIR = Path(__file__).resolve().parent / ".cache" / "github"

CATEGORY_CLUSTERS = {
    "build": ["general-purpose-sdks", "compilers-languages", "cloud-interop", "pulse-control"],
    "simulate": ["simulators", "visualization-tomography", "benchmarks-analysis"],
    "optimize": [
        "optimization-qubo",
        "annealing-ising",
        "quantum-chemistry",
        "quantum-ml",
        "photonics",
    ],
    "secure": ["post-quantum-crypto", "error-correction-mitigation", "networking"],
    "learn": ["games-learning"],
}

IGNORE_DIRS = {
    ".git",
    ".github",
    ".venv",
    "venv",
    "__pycache__",
    "node_modules",
    ".next",
    "dist",
    "build",
    "target",
    ".mypy_cache",
    ".pytest_cache",
}

EXTENSION_LANGUAGE_MAP = {
    ".py": "Python",
    ".ipynb": "Jupyter",
    ".jl": "Julia",
    ".rs": "Rust",
    ".cpp": "C++",
    ".cc": "C++",
    ".cxx": "C++",
    ".hpp": "C++",
    ".hh": "C++",
    ".hxx": "C++",
    ".h": "C/C++",
    ".c": "C",
    ".cs": "C#",
    ".swift": "Swift",
    ".java": "Java",
    ".kt": "Kotlin",
    ".scala": "Scala",
    ".go": "Go",
    ".ts": "TypeScript",
    ".tsx": "TypeScript",
    ".js": "JavaScript",
    ".jsx": "JavaScript",
    ".mjs": "JavaScript",
    ".qasm": "OpenQASM",
    ".quil": "Quil",
    ".fsi": "F#",
    ".fs": "F#",
    ".rb": "Ruby",
    ".php": "PHP",
    ".r": "R",
    ".sql": "SQL",
    ".sh": "Shell",
    ".ps1": "PowerShell",
    ".lua": "Lua",
    ".tex": "LaTeX",
}

CATEGORY_TEMPLATES = {
    "general-purpose-sdks": {
        "audience": "Developers who want a broad entry point for building circuits, experimenting with algorithms, and integrating quantum workflows into larger applications.",
        "outcomes": [
            "Prototype end-to-end circuit workflows without committing to a niche backend too early.",
            "Learn how the project represents circuits, gates, jobs, and results.",
            "Compare how a major ecosystem frames practical quantum development."
        ],
    },
    "simulators": {
        "audience": "Developers and researchers who need to test ideas locally before running on hardware or who want to compare simulation strategies.",
        "outcomes": [
            "Benchmark how different simulation methods trade accuracy for runtime.",
            "Inspect circuit behavior, noise assumptions, or state evolution offline.",
            "Choose the right simulator for a debugging, teaching, or research workflow."
        ],
    },
    "quantum-chemistry": {
        "audience": "Researchers, students, and developers exploring how quantum software is used for chemistry and electronic-structure problems.",
        "outcomes": [
            "See how chemistry problems are mapped into quantum-friendly representations.",
            "Understand the workflow around Hamiltonians, ansatze, and measurement loops.",
            "Compare beginner-friendly entry points into chemistry-focused quantum tooling."
        ],
    },
    "optimization-qubo": {
        "audience": "Teams exploring routing, scheduling, allocation, and other combinatorial problems that can be modeled as optimization workloads.",
        "outcomes": [
            "Understand how this project models constrained optimization problems.",
            "Compare QUBO, QAOA, and hybrid optimization workflows against classical baselines.",
            "Identify pieces that could inform a practical planning stack like Qtangl."
        ],
    },
    "annealing-ising": {
        "audience": "Developers interested in Ising-model formulations, annealing workflows, and D-Wave-style solver ecosystems.",
        "outcomes": [
            "See how annealing-oriented projects model optimization problems.",
            "Understand embeddings, samplers, and the surrounding tooling needed in practice.",
            "Compare annealing workflows against gate-model and hybrid alternatives."
        ],
    },
    "quantum-ml": {
        "audience": "Researchers and practitioners experimenting with quantum machine learning, variational models, and differentiable circuit stacks.",
        "outcomes": [
            "Learn how the project connects model training ideas to quantum primitives.",
            "Inspect the assumptions behind differentiable or ML-oriented workflows.",
            "Compare how serious or experimental the ML story really is."
        ],
    },
    "photonics": {
        "audience": "People exploring optical and photonic models of quantum computing, especially outside the usual gate-model framing.",
        "outcomes": [
            "Understand how photonic circuits, modes, and optical programs are represented.",
            "Compare photonic workflows with more familiar circuit-model SDKs.",
            "Learn which parts of the photonics ecosystem are most approachable."
        ],
    },
    "pulse-control": {
        "audience": "Hardware-adjacent developers and researchers working closer to experiments, pulse schedules, or lab orchestration.",
        "outcomes": [
            "See how low-level control stacks differ from higher-level SDKs.",
            "Understand where pulse sequencing and experiment orchestration fit in the stack.",
            "Learn which projects matter when hardware control is part of the workflow."
        ],
    },
    "compilers-languages": {
        "audience": "Developers who want to understand the representations and compilers that sit between high-level code and runnable circuits.",
        "outcomes": [
            "Compare IRs, DSLs, transpilers, and compiler assumptions across ecosystems.",
            "Understand how high-level code becomes something a backend can execute.",
            "Spot tools that matter when interoperability and compilation quality are important."
        ],
    },
    "error-correction-mitigation": {
        "audience": "Researchers and advanced developers working on noise, reliability, and the realities of imperfect quantum hardware.",
        "outcomes": [
            "Learn how this project frames error handling or mitigation.",
            "Compare whether it targets analysis, simulation, or production-minded workflows.",
            "Understand where noise-aware tooling fits in a modern stack."
        ],
    },
    "networking": {
        "audience": "Researchers and students exploring distributed quantum systems, communication protocols, and quantum internet concepts.",
        "outcomes": [
            "See how the project models nodes, links, and entanglement distribution.",
            "Understand what a networking-oriented workflow looks like in software.",
            "Compare education-focused versus research-focused networking tools."
        ],
    },
    "post-quantum-crypto": {
        "audience": "Security-minded developers and teams looking for practical quantum-safe cryptography resources they can evaluate today.",
        "outcomes": [
            "Identify which libraries are reference implementations versus production integrations.",
            "Understand how PQC work differs from quantum-computing SDK work.",
            "Find the right starting point for learning or experimentation."
        ],
    },
    "games-learning": {
        "audience": "Beginners, educators, and curious developers who want a more approachable path into quantum concepts.",
        "outcomes": [
            "Get a gentler introduction before diving into full SDKs.",
            "See how different projects teach circuits, superposition, and measurement.",
            "Identify resources that work well for onboarding or self-study."
        ],
    },
    "visualization-tomography": {
        "audience": "People who learn best by seeing state structure, measurement results, or circuit behavior laid out visually.",
        "outcomes": [
            "Understand how the project helps inspect or reconstruct quantum systems.",
            "Compare visual tooling against more code-heavy workflows.",
            "Use the resource as a bridge between theory, experiments, and debugging."
        ],
    },
    "benchmarks-analysis": {
        "audience": "Researchers and evaluators comparing toolchains, algorithms, hardware assumptions, or performance tradeoffs.",
        "outcomes": [
            "Learn what this project measures and why it matters.",
            "Compare benchmarking assumptions instead of taking headline claims at face value.",
            "Use the resource to evaluate ecosystems more critically."
        ],
    },
    "cloud-interop": {
        "audience": "Teams that need to connect multiple providers, runtimes, or software ecosystems instead of staying in one stack.",
        "outcomes": [
            "See how the project smooths over provider or runtime boundaries.",
            "Understand tradeoffs between portability and provider-specific features.",
            "Compare where interoperability helps versus where it adds abstraction."
        ],
    },
}


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower())
    return slug.strip("-")


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def clean_markdown(text: str) -> str:
    text = re.sub(r"<!--.*?-->", " ", text, flags=re.DOTALL)
    text = re.sub(r"```.*?```", " ", text, flags=re.DOTALL)
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = re.sub(r"!\[[^\]]*\]\([^)]+\)", " ", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"^#{1,6}\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"^\s*[-*]\s+", "", text, flags=re.MULTILINE)
    text = re.sub(r"^\s*\d+\.\s+", "", text, flags=re.MULTILINE)
    text = re.sub(r"\|", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def clean_paragraph(paragraph: str) -> str:
    paragraph = clean_markdown(paragraph)
    paragraph = paragraph.replace(" .", ".").replace(" ,", ",")
    return paragraph.strip()


def split_paragraphs(markdown_text: str) -> list[str]:
    raw_paragraphs = re.split(r"\n\s*\n", markdown_text)
    cleaned: list[str] = []
    for raw in raw_paragraphs:
        paragraph = clean_paragraph(raw)
        if len(paragraph.split()) < 8:
            continue
        lowered = paragraph.lower()
        if lowered.startswith(("install", "running", "build", "test", "license")):
            continue
        if "http://" in lowered and len(paragraph.split()) < 18:
            continue
        cleaned.append(paragraph)
    return cleaned


def truncate_words(text: str, limit: int) -> str:
    words = text.split()
    if len(words) <= limit:
        return text
    return " ".join(words[:limit]).rstrip(",;:.") + "..."


def first_sentence(text: str) -> str:
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    for part in parts:
        if len(part.split()) >= 6:
            return truncate_words(part, 32)
    return truncate_words(text.strip(), 32)


def find_readme(repo_dir: Path) -> Path | None:
    if not repo_dir.exists():
        return None

    top_level = [
        child
        for child in repo_dir.iterdir()
        if child.is_file() and child.stem.lower().startswith("readme")
    ]
    if top_level:
        return sorted(top_level, key=lambda path: (len(path.name), path.name.lower()))[0]

    for child in repo_dir.rglob("*"):
        if child.is_file() and child.stem.lower().startswith("readme"):
            return child
    return None


def detect_primary_language(repo_dir: Path) -> str:
    counts: Counter[str] = Counter()
    if not repo_dir.exists():
        return "Mixed"

    for root, dirs, files in os.walk(repo_dir):
        dirs[:] = [
            name
            for name in dirs
            if name not in IGNORE_DIRS and not name.startswith(".")
        ]
        for filename in files:
            ext = Path(filename).suffix.lower()
            language = EXTENSION_LANGUAGE_MAP.get(ext)
            if language:
                counts[language] += 1

    if not counts:
        return "Mixed"
    return counts.most_common(1)[0][0]


def detect_license(repo_dir: Path) -> str:
    candidate_names = [
        "LICENSE",
        "LICENSE.txt",
        "LICENSE.md",
        "COPYING",
        "COPYING.txt",
        "COPYING.md",
    ]
    for candidate in candidate_names:
        path = repo_dir / candidate
        if path.exists():
            text = path.read_text(encoding="utf-8", errors="ignore").lower()
            return identify_license(text)
    return "Unknown"


def identify_license(text: str) -> str:
    if "apache license" in text and "2.0" in text:
        return "Apache-2.0"
    if "mit license" in text:
        return "MIT"
    if "bsd 3-clause" in text or "redistribution and use in source and binary forms" in text:
        return "BSD"
    if "gnu general public license" in text and "lesser" in text:
        return "LGPL"
    if "gnu general public license" in text:
        return "GPL"
    if "mozilla public license" in text:
        return "MPL"
    if "eclipse public license" in text:
        return "EPL"
    if "creative commons" in text:
        return "Creative Commons"
    return "Custom / project-specific"


def load_taxonomy() -> dict[str, Any]:
    taxonomy = read_json(TAXONOMY_PATH)
    taxonomy["categoriesBySlug"] = {
        item["slug"]: item for item in taxonomy["categories"]
    }
    taxonomy["topicsBySlug"] = {
        item["slug"]: item for item in taxonomy["topics"]
    }
    return taxonomy


def github_repo_cache_path(owner: str, name: str) -> Path:
    return GITHUB_CACHE_DIR / f"{owner}__{name}.json"


def fetch_github_repo(owner: str, name: str) -> dict[str, Any]:
    cache_path = github_repo_cache_path(owner, name)
    if cache_path.exists():
        return read_json(cache_path)

    token = os.environ.get("GITHUB_TOKEN")
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "qtangl-library-builder/1.0",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    request = urllib.request.Request(
        f"https://api.github.com/repos/{owner}/{name}",
        headers=headers,
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        if error.code == 403 and not token:
            return {}
        return {}
    except (urllib.error.URLError, json.JSONDecodeError):
        return {}

    cache_path.parent.mkdir(parents=True, exist_ok=True)
    cache_path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    if not token:
        time.sleep(0.7)
    return payload


def ensure_monogram(slug: str, owner: str, title: str) -> str:
    MONOGRAM_DIR.mkdir(parents=True, exist_ok=True)
    path = MONOGRAM_DIR / f"{slug}.svg"
    if path.exists():
        return f"/learn/monogram/{slug}.svg"
    initial = (title or owner)[:1].upper()
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
  <rect width="640" height="480" fill="#0a0a0a"/>
  <circle cx="320" cy="220" r="120" fill="#1a1a1a" stroke="#333" stroke-width="2"/>
  <text x="320" y="250" text-anchor="middle" font-family="system-ui,sans-serif" font-size="96" fill="#e5e5e5">{initial}</text>
  <text x="320" y="400" text-anchor="middle" font-family="system-ui,sans-serif" font-size="22" fill="#888">{owner}</text>
</svg>"""
    path.write_text(svg, encoding="utf-8")
    return f"/learn/monogram/{slug}.svg"


def ensure_og_image(slug: str, owner: str, name: str, is_flagship: bool) -> str | None:
    OG_IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    target = OG_IMAGE_DIR / f"{slug}.png"
    if target.exists() and target.stat().st_size > 500:
        return f"/learn/og/{slug}.png"
    if not is_flagship:
        return None
    url = f"https://opengraph.githubassets.com/1/{owner}/{name}"
    request = urllib.request.Request(url, headers={"User-Agent": "qtangl-library-builder/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            target.write_bytes(response.read())
        return f"/learn/og/{slug}.png"
    except urllib.error.URLError:
        return None


def classify_category(
    slug: str,
    haystack: str,
    taxonomy: dict[str, Any],
) -> dict[str, Any]:
    manual = taxonomy["manualCategoryBySlug"].get(slug)
    if manual:
        return taxonomy["categoriesBySlug"][manual]

    scored: list[tuple[int, dict[str, Any]]] = []
    for category in taxonomy["categories"]:
        score = 0
        for keyword in category["keywords"]:
            if keyword.lower() in haystack:
                score += max(2, len(keyword.split()))
        if category["slug"].replace("-", " ") in haystack:
            score += 2
        scored.append((score, category))

    scored.sort(key=lambda item: item[0], reverse=True)
    best_score, best_category = scored[0]
    if best_score == 0:
        return taxonomy["categoriesBySlug"]["general-purpose-sdks"]
    return best_category


def assign_topics(
    slug: str,
    category_slug: str,
    taxonomy: dict[str, Any],
) -> list[dict[str, str]]:
    topic_slugs = set(taxonomy["categoriesBySlug"][category_slug].get("topicSlugs", []))
    for topic in taxonomy["topics"]:
        if slug in topic.get("resourceSlugs", []):
            topic_slugs.add(topic["slug"])
    for manual_topic in taxonomy["manualTopicBySlug"].get(slug, []):
        topic_slugs.add(manual_topic)

    return [
        {
            "slug": topic_slug,
            "title": taxonomy["topicsBySlug"][topic_slug]["title"],
        }
        for topic_slug in sorted(topic_slugs)
    ]


def build_paragraphs(
    name: str,
    owner: str,
    summary: str,
    category: dict[str, Any],
    primary_language: str,
    readme_excerpt: str,
    archived: bool,
) -> list[str]:
    paragraphs = [
        f"{name} is an open-source project in the {category['title'].lower()} category. "
        f"It is maintained by {owner} and primarily looks like a {primary_language} codebase. "
        f"{summary}"
    ]

    second = (
        f"For readers mapping the ecosystem, this resource is useful because it shows how one team approaches "
        f"{category['title'].lower()} workflows in practice."
    )
    if readme_excerpt:
        second += f" The repository README emphasizes: {truncate_words(readme_excerpt, 48)}"
    if archived:
        second += " The repository also appears to be archival or no longer actively maintained, which matters when evaluating it for current production use."
    paragraphs.append(second)
    return paragraphs


def compute_related(entries: list[dict[str, Any]], target: dict[str, Any]) -> list[str]:
    scored: list[tuple[int, str]] = []
    target_topics = {topic["slug"] for topic in target["topics"]}
    for candidate in entries:
        if candidate["slug"] == target["slug"]:
            continue
        score = 0
        if candidate["category"]["slug"] == target["category"]["slug"]:
            score += 4
        overlap = target_topics.intersection(
            {topic["slug"] for topic in candidate["topics"]}
        )
        score += len(overlap) * 2
        if candidate["featured"]:
            score += 1
        if candidate["flagship"]:
            score += 1
        score += min(candidate.get("stars", 0) // 1000, 3)
        if score:
            scored.append((score, candidate["slug"]))

    scored.sort(key=lambda item: (-item[0], item[1]))
    return [slug for _, slug in scored[:6]]


def build_entry(
    repo: dict[str, str],
    taxonomy: dict[str, Any],
    known_slugs: set[str],
) -> dict[str, Any]:
    owner = repo["owner"]
    name = repo["name"]
    slug = slugify(f"{owner}-{name}")
    repo_dir = REFERENCE_DIR / f"{owner}__{name}"
    readme_path = find_readme(repo_dir)
    readme_text = (
        readme_path.read_text(encoding="utf-8", errors="ignore")
        if readme_path
        else ""
    )
    paragraphs = split_paragraphs(readme_text)
    readme_excerpt = truncate_words(" ".join(paragraphs[:2]), 110)
    github_data = fetch_github_repo(owner, name)
    enriched = enrich_entry(
        repo_dir=repo_dir,
        readme_text=readme_text,
        owner=owner,
        name=name,
        extension_map=EXTENSION_LANGUAGE_MAP,
        known_slugs=known_slugs,
        github_data=github_data,
    )

    primary_language = (
        github_data.get("language")
        or enriched.get("primaryLanguage")
        or detect_primary_language(repo_dir)
    )
    if primary_language == "Mixed":
        primary_language = enriched.get("primaryLanguage")
    primary_languages = enriched.get("primaryLanguages") or (
        [primary_language] if primary_language and primary_language != "Mixed" else []
    )

    license_name = enriched.get("license") or detect_license(repo_dir)
    if license_name in {None, "Unknown", "NOASSERTION"}:
        license_name = None

    description_candidates = [
        github_data.get("description") or "",
        paragraphs[0] if paragraphs else "",
        clean_markdown(readme_text[:4000]),
    ]
    description = next((item for item in description_candidates if item.strip()), "")
    summary = first_sentence(description or f"{name} is an open-source quantum project.")

    archived = bool(
        github_data.get("archived")
        or github_data.get("disabled")
        or "no longer maintained" in readme_text.lower()
        or "deprecated" in readme_text.lower()
    )

    haystack = " ".join(
        [
            slug.replace("-", " "),
            description.lower(),
            readme_excerpt.lower(),
            " ".join(topic.lower() for topic in github_data.get("topics", [])),
        ]
    )
    category = classify_category(slug, haystack, taxonomy)
    topics = assign_topics(slug, category["slug"], taxonomy)

    what_it_is = build_paragraphs(
        name=name,
        owner=owner,
        summary=summary,
        category=category,
        primary_language=primary_language or "multi-language",
        readme_excerpt=readme_excerpt,
        archived=archived,
    )
    template = CATEGORY_TEMPLATES[category["slug"]]
    stars = enriched.get("stars") or github_data.get("stargazers_count") or 0
    is_flagship = slug in set(taxonomy["flagshipResourceSlugs"])
    og_path = ensure_og_image(slug, owner, name, is_flagship)
    monogram_path = ensure_monogram(slug, owner, name)
    image_path = og_path or (f"/learn/flagship/{slug}.png" if is_flagship else monogram_path)

    return {
        "slug": slug,
        "owner": owner,
        "name": name,
        "title": name,
        "repoUrl": repo["url"],
        "homepageUrl": github_data.get("homepage") or None,
        "category": {
            "slug": category["slug"],
            "title": category["title"],
            "description": category["description"],
        },
        "topics": topics,
        "primaryLanguage": primary_language,
        "primaryLanguages": primary_languages,
        "license": license_name,
        "summary": summary,
        "description": truncate_words(description, 60),
        "whatItIs": what_it_is,
        "whoItsFor": template["audience"],
        "whatYouCanBuild": template["outcomes"],
        "readmeExcerpt": readme_excerpt or enriched.get("readmeMarkdown", "")[:500],
        "readmePath": str(readme_path.relative_to(WORKSPACE_ROOT)) if readme_path else None,
        "readmeMarkdownPath": f"readmes/{slug}.md",
        "clonePath": str(repo_dir.relative_to(WORKSPACE_ROOT)) if repo_dir.exists() else None,
        "stars": stars,
        "lastPushedAt": enriched.get("lastPushedAt"),
        "defaultBranch": enriched.get("defaultBranch", "main"),
        "githubTopics": github_data.get("topics", []),
        "quickstart": enriched.get("quickstart"),
        "codeSamples": enriched.get("codeSamples", []),
        "packageMeta": enriched.get("packageMeta", {}),
        "citationBibtex": enriched.get("citationBibtex"),
        "supportedBackendSlugs": enriched.get("supportedBackendSlugs", []),
        "externalLinks": enriched.get("externalLinks", {}),
        "openIssuesCount": enriched.get("openIssuesCount"),
        "subscribersCount": enriched.get("subscribersCount"),
        "latestRelease": enriched.get("latestRelease"),
        "ownerType": enriched.get("ownerType"),
        "ownerUrl": enriched.get("ownerUrl"),
        "featured": slug in set(taxonomy["featuredResourceSlugs"]),
        "flagship": is_flagship,
        "qtanglRelevant": slug in set(taxonomy["qtanglRelevantSlugs"]),
        "archived": archived,
        "imagePath": image_path,
        "_readmeMarkdown": enriched.get("readmeMarkdown", ""),
    }


def build_categories_payload(
    entries: list[dict[str, Any]],
    taxonomy: dict[str, Any],
) -> list[dict[str, Any]]:
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for entry in entries:
        grouped[entry["category"]["slug"]].append(entry)

    cluster_by_category = {
        category_slug: cluster
        for cluster, slugs in CATEGORY_CLUSTERS.items()
        for category_slug in slugs
    }

    payload: list[dict[str, Any]] = []
    for category in taxonomy["categories"]:
        members = sorted(grouped.get(category["slug"], []), key=lambda item: item["title"].lower())
        payload.append(
            {
                "slug": category["slug"],
                "title": category["title"],
                "description": category["description"],
                "cluster": cluster_by_category.get(category["slug"], "build"),
                "topicSlugs": category.get("topicSlugs", []),
                "heroImagePath": f"/learn/categories/{category['slug']}.png",
                "resourceCount": len(members),
                "resourceSlugs": [member["slug"] for member in members],
                "featuredSlugs": [member["slug"] for member in members if member["featured"]][:8],
            }
        )
    return payload


def main() -> int:
    taxonomy = load_taxonomy()
    manifest = read_json(MANIFEST_PATH)
    repos: list[dict[str, str]] = manifest["repos"]
    known_slugs = {slugify(f"{repo['owner']}-{repo['name']}") for repo in repos}

    entries = [build_entry(repo, taxonomy, known_slugs) for repo in repos]
    entries.sort(key=lambda item: item["title"].lower())

    for entry in entries:
        entry["relatedSlugs"] = compute_related(entries, entry)

    compact_entries = [
        {
            "slug": entry["slug"],
            "title": entry["title"],
            "owner": entry["owner"],
            "name": entry["name"],
            "repoUrl": entry["repoUrl"],
            "category": entry["category"],
            "topics": entry["topics"],
            "primaryLanguage": entry["primaryLanguage"],
            "primaryLanguages": entry.get("primaryLanguages", []),
            "license": entry["license"],
            "summary": entry["summary"],
            "description": entry["description"],
            "stars": entry["stars"],
            "lastPushedAt": entry.get("lastPushedAt"),
            "featured": entry["featured"],
            "flagship": entry["flagship"],
            "qtanglRelevant": entry["qtanglRelevant"],
            "archived": entry["archived"],
            "imagePath": entry["imagePath"],
        }
        for entry in entries
    ]

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    ENTRIES_DIR.mkdir(parents=True, exist_ok=True)
    README_DIR.mkdir(parents=True, exist_ok=True)

    for existing_entry in ENTRIES_DIR.glob("*.json"):
        existing_entry.unlink()

    write_json(OUTPUT_DIR / "index.json", compact_entries)
    write_json(OUTPUT_DIR / "categories.json", build_categories_payload(entries, taxonomy))
    write_json(
        OUTPUT_DIR / "meta.json",
        {
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "repoCount": len(entries),
            "sourceUrl": manifest["source_url"],
            "featuredSlugs": taxonomy["featuredResourceSlugs"],
            "flagshipSlugs": taxonomy["flagshipResourceSlugs"],
            "qtanglRelevantSlugs": taxonomy["qtanglRelevantSlugs"],
        },
    )

    for entry in entries:
        readme_markdown = entry.pop("_readmeMarkdown", "")
        if readme_markdown:
            readme_file = README_DIR / f"{entry['slug']}.md"
            readme_file.write_text(readme_markdown, encoding="utf-8")
        write_json(ENTRIES_DIR / f"{entry['slug']}.json", entry)

    print(f"Wrote {OUTPUT_DIR / 'index.json'}")
    print(f"Wrote {OUTPUT_DIR / 'categories.json'}")
    print(f"Wrote {OUTPUT_DIR / 'meta.json'}")
    print(f"Wrote {len(entries)} entry files to {ENTRIES_DIR}")
    print(f"Wrote README markdown files to {README_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
