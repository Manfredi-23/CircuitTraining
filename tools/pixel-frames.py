#!/usr/bin/env python3
"""
pixel-frames.py — hand-drawn frames to an animated card illustration.

The counterpart to dot-figures.py for artwork drawn by hand instead of posed
from a skeleton. Each illustration is a folder of frames drawn on the 30 x 30
grid in design/pixel-grid.svg:

    design/illustrations/<name>/01.svg, 02.svg, 03.svg ...
    design/illustrations/<name>/anim.json        (optional)

Every lit cell is a <rect> on the 10px grid, filled with one of three colours:

    #181610  ink     the body
    #8A8780  dim     far-side limbs; rendered as ink at 42% opacity
    #E64D19  accent  equipment

A rect larger than one cell lights every cell it covers. Anything else in the
file (the guide lines, the reference figure, a background) is ignored, so the
template can be drawn straight over. No transforms: keep rectangles as plain
rectangles on whole-cell coordinates.

anim.json, all keys optional:
    {"ms": [500, 150, 500], "loop": "pingpong", "still": 1, "shape": "dot"}
    ms     per-frame duration, one number for all or one per frame (default 400)
    loop   "pingpong" plays 1-2-3-2-1..., "cycle" plays 1-2-3-1... (default pingpong)
    still  1-based frame shown under reduced motion (default 1)
    shape  "dot" (round LEDs, as now) or "square" (pixels) (default dot)

Frames are played as steps, never tweened: in-betweens of hand-drawn pixel art
turn to mush. Draw the in-betweens you want to see.

    python3 tools/pixel-frames.py <name>            # writes public/images/<name>.svg + still/
    python3 tools/pixel-frames.py --all             # every folder in design/illustrations
                                                    # (folders starting with _ are skipped)
    python3 tools/pixel-frames.py <name> --out DIR  # write somewhere else (previews)

Point a session's `illustration` at '<name>.svg' to use it.
"""

import importlib.util
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'design', 'illustrations')
CELL = 10

# Reuse the renderer, so hand-drawn and generated figures share one look.
_spec = importlib.util.spec_from_file_location('dot_figures', os.path.join(ROOT, 'tools', 'dot-figures.py'))
dots = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(dots)

TONE_OF = {'#181610': 'ink', '#8a8780': 'dim', '#e64d19': 'acc'}
RECT_RE = re.compile(r'<rect\b([^>]*)/?>', re.I)
ATTR_RE = re.compile(r'([\w-]+)\s*=\s*"([^"]*)"')


def read_frame(path):
    """{(x, y): tone} from one drawn frame."""
    frame = {}
    for m in RECT_RE.finditer(open(path).read()):
        a = dict(ATTR_RE.findall(m.group(1)))
        fill = a.get('fill', '').lower()
        if not fill and 'style' in a:
            sm = re.search(r'fill:\s*(#[0-9a-fA-F]{6})', a['style'])
            fill = sm.group(1).lower() if sm else ''
        tone = TONE_OF.get(fill)
        if not tone:
            continue
        if 'transform' in a:
            sys.exit(f'{path}: rect has a transform; flatten it to plain x/y first')
        x, y = float(a.get('x', 0)), float(a.get('y', 0))
        w, h = float(a['width']), float(a['height'])
        for cx in range(round(x / CELL), round((x + w) / CELL)):
            for cy in range(round(y / CELL), round((y + h) / CELL)):
                dots.put(frame, cx, cy, tone)
    if not frame:
        sys.exit(f'{path}: no lit cells found (check the three fill colours)')
    return frame


def build(name, out_dir):
    folder = os.path.join(SRC, name)
    files = sorted(f for f in os.listdir(folder) if re.fullmatch(r'\d+\.svg', f))
    if not files:
        sys.exit(f'{folder}: no frames (01.svg, 02.svg ...)')
    cfg_path = os.path.join(folder, 'anim.json')
    cfg = json.load(open(cfg_path)) if os.path.exists(cfg_path) else {}

    drawn = [read_frame(os.path.join(folder, f)) for f in files]
    ms = cfg.get('ms', 400)
    ms = ms if isinstance(ms, list) else [ms] * len(drawn)
    if len(ms) != len(drawn):
        sys.exit(f'{name}: anim.json ms has {len(ms)} values for {len(drawn)} frames')

    order = list(range(len(drawn)))
    if cfg.get('loop', 'pingpong') == 'pingpong' and len(drawn) > 2:
        order += list(range(len(drawn) - 2, 0, -1))
    frames = [(drawn[i], ms[i]) for i in order]
    still = int(cfg.get('still', 1)) - 1

    svg = dots.to_svg(name, frames, still)
    still_svg = dots.still_svg(name, drawn[still])
    if cfg.get('shape', 'dot') == 'square':
        for old, new in (('stroke-linecap:round', 'stroke-linecap:square'),
                         (f'stroke-width:{dots.DOT}', 'stroke-width:0.86')):
            svg, still_svg = svg.replace(old, new), still_svg.replace(old, new)

    os.makedirs(os.path.join(out_dir, 'still'), exist_ok=True)
    open(os.path.join(out_dir, f'{name}.svg'), 'w').write(svg)
    open(os.path.join(out_dir, 'still', f'{name}.svg'), 'w').write(still_svg)
    print(f'{name:16s} {len(drawn)} drawn, {len(frames)} played, {sum(m for _, m in frames)} ms loop, {len(svg) / 1024:.1f} KB')


def main():
    args = sys.argv[1:]
    out_dir = os.path.join(ROOT, 'public', 'images')
    if '--out' in args:
        i = args.index('--out')
        out_dir = args[i + 1]
        del args[i:i + 2]
    names = sorted(d for d in os.listdir(SRC)
                   if os.path.isdir(os.path.join(SRC, d)) and not d.startswith('_')) if args == ['--all'] else args
    if not names:
        sys.exit(__doc__)
    for name in names:
        build(name, out_dir)


if __name__ == '__main__':
    main()
