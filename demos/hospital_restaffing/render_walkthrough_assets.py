from __future__ import annotations

import shutil
import sys
import textwrap
from pathlib import Path

import imageio.v2 as imageio
import numpy as np
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[2]
PUBLIC_DIR = ROOT / "web" / "public" / "demos" / "hospital"
DEMO_DIR = ROOT / "demos" / "hospital_restaffing"
SIZE = (1280, 720)
FPS = 1

SLIDES = [
    (
        30,
        "04:11 alert",
        "Sarah K., a cath-lab nurse with ACLS and PALS, calls out 49 minutes before shift start.",
    ),
    (
        30,
        "The staffing problem",
        "Marcus must preserve acuity, rest rules, and cost discipline without defaulting to agency.",
    ),
    (
        45,
        "Live classical pass",
        "Qtangl runs a live CP-SAT solve first because the classical path still leads.",
    ),
    (
        45,
        "Hybrid micro-solve",
        "A cached QPU trace replays against the local repair window so the page stays recording-safe.",
    ),
    (
        40,
        "Three feasible alternates",
        "The hybrid pass is slower, but it surfaces multiple feasible swaps with fatigue and fairness trade-offs.",
    ),
    (
        30,
        "Audit-ready output",
        "Each candidate carries a QUBO snapshot, binding constraints, cost breakdown, and reproducibility metadata.",
    ),
]


def get_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
    ]
    for candidate in candidates:
        path = Path(candidate)
        if path.exists():
            return ImageFont.truetype(str(path), size=size)
    return ImageFont.load_default()


TITLE_FONT = get_font(46)
BODY_FONT = get_font(24)
LABEL_FONT = get_font(18)


def render_slide(title: str, body: str) -> Image.Image:
    image = Image.new("RGB", SIZE, "#040507")
    draw = ImageDraw.Draw(image)

    draw.rounded_rectangle((64, 64, 1216, 656), radius=32, outline="#3a3f46", width=2, fill="#0b0d10")
    draw.text((96, 104), "Qtangl hospital re-staffing demo", fill="#d0d4dc", font=LABEL_FONT)
    draw.text((96, 156), title, fill="white", font=TITLE_FONT)

    body_lines = textwrap.wrap(body, width=48)
    y = 248
    for line in body_lines:
        draw.text((96, y), line, fill="#c2c6ce", font=BODY_FONT)
        y += 40

    draw.rounded_rectangle((96, 500, 1184, 620), radius=24, outline="#5f6772", width=2)
    draw.text((126, 534), "Open the live page at /demo/hospital", fill="#ffffff", font=BODY_FONT)
    draw.text(
        (126, 575),
        "Manual vs Classical vs Hybrid, with an audit drawer and a built-in ROI calculator.",
        fill="#c2c6ce",
        font=LABEL_FONT,
    )
    return image


def build_frames(slides: list[tuple[int, str, str]]) -> list[Image.Image]:
    frames: list[Image.Image] = []
    for duration_seconds, title, body in slides:
        frame = render_slide(title, body)
        frames.extend([frame.copy() for _ in range(duration_seconds * FPS)])
    return frames


def write_video(frames: list[Image.Image], output_path: Path, fps: int) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with imageio.get_writer(output_path, fps=fps, codec="libx264", format="FFMPEG") as writer:
        for frame in frames:
            writer.append_data(np.asarray(frame))


def write_gif(frames: list[Image.Image], output_path: Path, fps: int) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    imageio.mimsave(output_path, [np.asarray(frame) for frame in frames], fps=fps)


def main() -> None:
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    frames = build_frames(SLIDES)
    walkthrough_path = PUBLIC_DIR / "walkthrough.mp4"
    write_video(frames, walkthrough_path, FPS)
    shutil.copy2(walkthrough_path, DEMO_DIR / "walkthrough.mp4")

    sixty_frames = frames[: 60 * FPS]
    thirty_frames = frames[: 30 * FPS]
    fifteen_frames = frames[: 15 * FPS]

    write_video(sixty_frames, PUBLIC_DIR / "walkthrough_60s.mp4", FPS)
    write_video(thirty_frames, PUBLIC_DIR / "walkthrough_30s.mp4", FPS)
    write_gif(fifteen_frames, PUBLIC_DIR / "walkthrough_15s.gif", FPS)

    print("Wrote walkthrough assets to", PUBLIC_DIR)


if __name__ == "__main__":
    sys.exit(main())
