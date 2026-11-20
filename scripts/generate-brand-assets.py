"""Regenerate the favicon rasters, grain, and social image. Fonts are already vendored."""

from __future__ import annotations

import random
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
TMP = Path("/tmp/1know2see-fonts")
INK = (24, 23, 21)
PAPER = (232, 232, 227)
MUTED = (107, 100, 92)


def ttf(src: Path, dest: Path, weight: int | None = None) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    font = TTFont(src)
    if weight is not None and "fvar" in font:
        font = instantiateVariableFont(font, {"wght": weight})
    font.flavor = None
    font.save(dest)


def mark(size: int) -> Image.Image:
    image = Image.new("RGB", (size, size), INK)
    draw = ImageDraw.Draw(image)
    gap = size * 0.058
    top = size * 0.22
    bottom = size * 0.78
    width = max(1, round(size * 0.018))
    center = size / 2
    draw.line([(center - gap, top), (center - gap, bottom)], fill=PAPER, width=width)
    draw.line([(center + gap, top), (center + gap, bottom)], fill=PAPER, width=width)
    radius = max(2, size * 0.045)
    dot_y = size * 0.48
    draw.ellipse(
        (center - gap - radius, dot_y - radius, center - gap + radius, dot_y + radius),
        fill=PAPER,
    )
    return image


def noise() -> None:
    rng = random.Random(20)
    image = Image.new("RGBA", (180, 180), (0, 0, 0, 0))
    pixels = image.load()
    for y in range(180):
        for x in range(180):
            if rng.random() > 0.2:
                continue
            shade = (8, 8, 7) if rng.random() < 0.72 else (232, 232, 227)
            pixels[x, y] = (*shade, rng.randint(10, 24))
    image.save(PUBLIC / "noise.png")


def social(display: ImageFont.FreeTypeFont, mono: ImageFont.FreeTypeFont, zh: ImageFont.FreeTypeFont) -> None:
    image = Image.new("RGB", (1200, 630), PAPER)
    draw = ImageDraw.Draw(image)
    draw.text((72, 64), "1KNOW2SEE", font=mono, fill=MUTED)
    draw.text((68, 150), "想得更深", font=zh, fill=INK)
    draw.text((68, 300), "看得更远", font=zh, fill=INK)
    draw.text((72, 520), "THINK DEEPER, SEE FURTHER", font=display, fill=INK)
    image.save(PUBLIC / "og.png", optimize=True)


def main() -> None:
    ttf(PUBLIC / "fonts/schibsted-grotesk-latin-wght-normal.woff2", TMP / "schibsted.ttf", 900)
    ttf(PUBLIC / "fonts/ibm-plex-mono-latin-400-normal.woff2", TMP / "plex.ttf")
    ttf(PUBLIC / "fonts/noto-sans-sc-chinese-simplified-900-normal.woff2", TMP / "noto.ttf")
    noise()
    mark(32).save(PUBLIC / "favicon-32.png")
    mark(180).save(PUBLIC / "apple-touch-icon.png")
    mark(192).save(PUBLIC / "icon-192.png")
    mark(512).save(PUBLIC / "icon-512.png")
    social(
        ImageFont.truetype(TMP / "schibsted.ttf", 28),
        ImageFont.truetype(TMP / "plex.ttf", 22),
        ImageFont.truetype(TMP / "noto.ttf", 120),
    )
    print("wrote brand assets")


if __name__ == "__main__":
    main()
