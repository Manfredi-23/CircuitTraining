#!/usr/bin/env python3
"""
generate-ios-assets.py — build the iOS app icon and launch image from the app's
own logo, so the home screen, the splash and the header all use one geometry.

The logo is pixel-art built from plain <rect> elements, which means it can be
drawn exactly rather than approximated: the rects are parsed straight out of
public/images/logo.svg and re-rendered at icon resolution.

Run from the repo root:  python3 tools/generate-ios-assets.py
Requires: pillow
"""

import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
LOGO = ROOT / "public" / "images" / "logo.svg"
ICONSET = ROOT / "ios/App/App/Assets.xcassets/AppIcon.appiconset"
SPLASHSET = ROOT / "ios/App/App/Assets.xcassets/Splash.imageset"

# Design tokens, from src/app/globals.css.
INK = (24, 22, 16)
ACCENT = (230, 77, 25)
PARCHMENT_TOP = (228, 226, 221)     # #E4E2DD
PARCHMENT_BOTTOM = (178, 173, 159)  # #B2AD9F

RECT_RE = re.compile(
    r'<rect\s+x="([-\d.]+)"\s+y="([-\d.]+)"\s+width="([-\d.]+)"\s+height="([-\d.]+)"'
)


def load_rects():
    """Every rect in the logo, as (x, y, w, h) in the SVG's 150x60 viewBox."""
    svg = LOGO.read_text()
    rects = [tuple(float(v) for v in m.groups()) for m in RECT_RE.finditer(svg)]
    if not rects:
        sys.exit(f"no <rect> elements found in {LOGO}")
    return rects


def bounds(rects):
    x0 = min(r[0] for r in rects)
    y0 = min(r[1] for r in rects)
    x1 = max(r[0] + r[2] for r in rects)
    y1 = max(r[1] + r[3] for r in rects)
    return x0, y0, x1, y1


def parchment(size):
    """
    The app's background gradient. globals.css uses a radial gradient anchored
    near the top; a vertical approximation is indistinguishable behind a glyph
    and keeps this script dependency-free.
    """
    img = Image.new("RGB", (size, size), PARCHMENT_TOP)
    draw = ImageDraw.Draw(img)
    for y in range(size):
        t = (y / max(1, size - 1)) ** 0.85
        draw.line(
            [(0, y), (size, y)],
            fill=tuple(
                round(a + (b - a) * t)
                for a, b in zip(PARCHMENT_TOP, PARCHMENT_BOTTOM)
            ),
        )
    return img


def draw_rects(img, rects, scale, ox, oy, colour, accent_last=False):
    draw = ImageDraw.Draw(img)
    for i, (x, y, w, h) in enumerate(rects):
        fill = ACCENT if (accent_last and i == len(rects) - 1) else colour
        draw.rectangle(
            [
                round(ox + x * scale),
                round(oy + y * scale),
                round(ox + (x + w) * scale) - 1,
                round(oy + (y + h) * scale) - 1,
            ],
            fill=fill,
        )


def render(rects, canvas, coverage, accent_last=False):
    """Centre the given rects on a parchment square at `coverage` of its width."""
    x0, y0, x1, y1 = bounds(rects)
    src_w, src_h = x1 - x0, y1 - y0

    scale = min(canvas * coverage / src_w, canvas * coverage / src_h)
    ox = (canvas - src_w * scale) / 2 - x0 * scale
    oy = (canvas - src_h * scale) / 2 - y0 * scale

    img = parchment(canvas)
    draw_rects(img, rects, scale, ox, oy, INK, accent_last=accent_last)
    return img


def main():
    rects = load_rects()

    # The icon is the "7" alone. The full wordmark is unreadable at 60x60 on a
    # home screen; a single glyph is what makes an icon findable.
    seven = [r for r in rects if r[0] < 32]
    # The foot of the stem goes accent orange — a detail at full size, and at
    # 60x60 it just reads as the mark having a colour.
    icon = render(seven, 1024, coverage=0.52, accent_last=True)
    ICONSET.mkdir(parents=True, exist_ok=True)
    icon.save(ICONSET / "AppIcon-512@2x.png", "PNG")
    print("wrote AppIcon-512@2x.png (1024x1024)")

    # The launch image is the full wordmark, small on a large square: the same
    # asset is stretched across every device size and orientation.
    splash = render(rects, 2732, coverage=0.30)
    SPLASHSET.mkdir(parents=True, exist_ok=True)
    for name in (
        "splash-2732x2732.png",
        "splash-2732x2732-1.png",
        "splash-2732x2732-2.png",
    ):
        splash.save(SPLASHSET / name, "PNG")
        print(f"wrote {name} (2732x2732)")

    # The PWA manifest and the browser tab use the same icon.
    web = ROOT / "public" / "images"
    for size, name in ((512, "app-icon-512.png"), (192, "app-icon-192.png"), (180, "apple-touch-icon.png")):
        render(seven, size, coverage=0.52, accent_last=True).save(web / name, "PNG")
        print(f"wrote public/images/{name} ({size}x{size})")


if __name__ == "__main__":
    main()
