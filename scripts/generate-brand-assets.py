"""Regenerate the favicon rasters, grain, and social image. Fonts are already vendored."""

from __future__ import annotations

import random
from pathlib import Path

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
TMP = Path("/tmp/1know2see-fonts")
INK = (8, 9, 13)
BONE = (244, 240, 231)
MIST = (196, 189, 178)
SEAL = (225, 6, 0)


def ttf(src: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    font = TTFont(src)
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
    draw.line([(center - gap, top), (center - gap, bottom)], fill=BONE, width=width)
    draw.line([(center + gap, top), (center + gap, bottom)], fill=BONE, width=width)
    radius = max(2, size * 0.045)
    dot_y = size * 0.48
    draw.ellipse(
        (center - gap - radius, dot_y - radius, center - gap + radius, dot_y + radius),
        fill=SEAL,
    )
    return image


def noise() -> None:
    rng = random.Random(20)
    image = Image.new("L", (160, 160))
    pixels = image.load()
    for y in range(160):
        for x in range(160):
            pixels[x, y] = rng.randint(96, 168)
    image.save(PUBLIC / "noise.png")


def social(serif: ImageFont.FreeTypeFont, display: ImageFont.FreeTypeFont, sans: ImageFont.FreeTypeFont) -> None:
    image = Image.new("RGB", (1200, 630), INK)
    draw = ImageDraw.Draw(image)
    inset = 36
    arm = 28
    for x, y, dx, dy in (
        (inset, inset, 1, 1),
        (1200 - inset, inset, -1, 1),
        (inset, 630 - inset, 1, -1),
        (1200 - inset, 630 - inset, -1, -1),
    ):
        draw.line([(x, y), (x + dx * arm, y)], fill=BONE, width=2)
        draw.line([(x, y), (x, y + dy * arm)], fill=BONE, width=2)

    draw.text((88, 150), "一只见二", font=serif, fill=BONE)
    word = "1know2see"
    x = 88
    y = 292
    for char in word:
        color = SEAL if char in {"1", "2"} else BONE
        draw.text((x, y), char, font=display, fill=color)
        x += draw.textlength(char, font=display)
    draw.text((90, 430), "THINK DEEPER, SEE FURTHER", font=sans, fill=MIST)
    draw.line([(90, 478), (250, 478)], fill=SEAL, width=2)
    draw.text((90, 548), "1know2see.com", font=sans, fill=MIST)

    line_x = 1028
    draw.line([(line_x, 150), (line_x, 500)], fill=BONE, width=2)
    draw.line([(line_x + 22, 150), (line_x + 22, 500)], fill=BONE, width=2)
    draw.ellipse((line_x - 7, 312, line_x + 7, 326), fill=SEAL)
    image.save(PUBLIC / "og.png", optimize=True)


def main() -> None:
    ttf(PUBLIC / "fonts/syne-latin-800.woff2", TMP / "syne.ttf")
    ttf(PUBLIC / "fonts/outfit-latin-500.woff2", TMP / "outfit.ttf")
    ttf(PUBLIC / "fonts/noto-serif-sc-simplified-600.woff2", TMP / "serif.ttf")
    noise()
    mark(32).save(PUBLIC / "favicon-32.png")
    mark(180).save(PUBLIC / "apple-touch-icon.png")
    mark(192).save(PUBLIC / "icon-192.png")
    mark(512).save(PUBLIC / "icon-512.png")
    social(
        ImageFont.truetype(TMP / "serif.ttf", 92),
        ImageFont.truetype(TMP / "syne.ttf", 78),
        ImageFont.truetype(TMP / "outfit.ttf", 22),
    )
    print("wrote brand assets")


if __name__ == "__main__":
    main()
