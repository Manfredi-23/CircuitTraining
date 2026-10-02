#!/usr/bin/env python3
"""
dot-figures.py — the animated dot-matrix session illustrations.

Each figure is a stick skeleton posed at a few keyframes. The script tweens
between them, rasterises every frame onto a 30 x 30 LED grid, and writes one
self-animating SVG per figure into public/images/, under the filenames the
session data already references. The app needs no code change: an SVG used as
an <img> runs its own CSS animation.

Three lit tones — ink for the body, dimmed ink for the far-side limbs, accent
for the equipment — over a faint grid of unlit dots. Frames are plain CSS
opacity steps, and under prefers-reduced-motion every figure holds its key pose.

    python3 tools/dot-figures.py              # write public/images/*.svg and still/*.svg
    python3 tools/dot-figures.py --sheet out  # also write a contact sheet of every frame

Edit a pose here and re-run; do not hand-edit the SVGs.
"""

import math
import os
import sys

GRID = 30
INK = '#181610'
ACCENT = '#E64D19'
DIM_OPACITY = 0.42
UNLIT_OPACITY = 0.07
DOT = 0.8          # lit dot diameter, in grid units
UNLIT_DOT = 0.5
# Empty margin around the grid, in grid units. The card gives the image less
# height than its 200px box, and the title and tabs overlap its edges; the old
# art left the same margin.
PAD = 6

TONES = ('ink', 'dim', 'acc')   # draw order: later tones win a shared dot
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'images')


# ---------------------------------------------------------------------------
# Raster primitives. A frame is a dict {(x, y): tone}.
# ---------------------------------------------------------------------------

def put(frame, x, y, tone):
    if 0 <= x < GRID and 0 <= y < GRID:
        # Body over equipment over far limbs: the figure stays readable.
        rank = {'dim': 0, 'acc': 1, 'ink': 2}
        if (x, y) not in frame or rank[tone] >= rank[frame[(x, y)]]:
            frame[(x, y)] = tone


def seg(frame, a, b, r, tone):
    """Light every dot whose centre is within r of segment a-b."""
    (x1, y1), (x2, y2) = a, b
    for x in range(int(min(x1, x2) - r - 1), int(max(x1, x2) + r + 2)):
        for y in range(int(min(y1, y2) - r - 1), int(max(y1, y2) + r + 2)):
            dx, dy = x2 - x1, y2 - y1
            L = dx * dx + dy * dy
            t = 0 if L == 0 else max(0, min(1, ((x - x1) * dx + (y - y1) * dy) / L))
            px, py = x1 + t * dx, y1 + t * dy
            if (x - px) ** 2 + (y - py) ** 2 <= r * r:
                put(frame, x, y, tone)


def disc(frame, c, r, tone):
    cx, cy = c
    for x in range(int(cx - r - 1), int(cx + r + 2)):
        for y in range(int(cy - r - 1), int(cy + r + 2)):
            if (x - cx) ** 2 + (y - cy) ** 2 <= r * r:
                put(frame, x, y, tone)


def ring(frame, c, r, w, tone):
    cx, cy = c
    for x in range(int(cx - r - 1), int(cx + r + 2)):
        for y in range(int(cy - r - 1), int(cy + r + 2)):
            d = math.hypot(x - cx, y - cy)
            if r - w <= d <= r:
                put(frame, x, y, tone)


def rect(frame, x1, y1, x2, y2, tone):
    for x in range(x1, x2 + 1):
        for y in range(y1, y2 + 1):
            put(frame, x, y, tone)


# ---------------------------------------------------------------------------
# Skeletons. Poses are dicts of named points in grid units, y down.
# ---------------------------------------------------------------------------

HEAD_R = 2.3
TORSO_R = 1.1
LIMB_R = 0.85


def side_body(f, p, facing=1):
    """Side view. Far limbs (suffix 2) dim, near limbs (suffix 1) ink."""
    for s, tone in (('2', 'dim'), ('1', 'ink')):
        if 'K' + s in p:
            seg(f, p['P'], p['K' + s], LIMB_R, tone)
            seg(f, p['K' + s], p['A' + s], LIMB_R, tone)
            ax, ay = p['A' + s]
            seg(f, (ax, ay), (ax + 1.6 * facing, ay), 0.6, tone)
        if 'E' + s in p:
            seg(f, p['N'], p['E' + s], LIMB_R, tone)
            seg(f, p['E' + s], p['W' + s], LIMB_R, tone)
        if s == '2':
            seg(f, p['N'], p['P'], TORSO_R, 'ink')
            head(f, p)


def head(f, p):
    """Head offset away from the neck so one unlit dot separates them."""
    (hx, hy), (nx, ny) = p['H'], p['N']
    dx, dy = hx - nx, hy - ny
    L = math.hypot(dx, dy) or 1
    disc(f, (hx + dx / L * 0.9, hy + dy / L * 0.9), HEAD_R, 'ink')


def front_body(f, p):
    """Front view: two shoulders, two hips, both sides ink."""
    seg(f, p['N'], p['P'], TORSO_R, 'ink')
    seg(f, p['S1'], p['S2'], LIMB_R, 'ink')
    seg(f, p['Q1'], p['Q2'], LIMB_R, 'ink')
    for s in '12':
        seg(f, p['S' + s], p['E' + s], LIMB_R, 'ink')
        seg(f, p['E' + s], p['W' + s], LIMB_R, 'ink')
        seg(f, p['Q' + s], p['K' + s], LIMB_R, 'ink')
        seg(f, p['K' + s], p['A' + s], LIMB_R, 'ink')
    head(f, p)


def floor(f, x1, x2, y=28):
    for x in range(x1, x2 + 1):
        put(f, x, y, 'dim')


def lerp_pose(a, b, t):
    return {k: (a[k][0] + (b[k][0] - a[k][0]) * t, a[k][1] + (b[k][1] - a[k][1]) * t) for k in a}


def shift(p, dx=0.0, dy=0.0):
    return {k: (x + dx, y + dy) for k, (x, y) in p.items()}


def rotate(p, keys, centre, deg):
    cx, cy = centre
    c, s = math.cos(math.radians(deg)), math.sin(math.radians(deg))
    out = dict(p)
    for k in keys:
        x, y = p[k]
        out[k] = (cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c)
    return out


def mirror(p, axis=15.0):
    """Mirror a front pose left-right, swapping the side suffixes."""
    swap = {'1': '2', '2': '1'}
    out = {}
    for k, (x, y) in p.items():
        k2 = k[:-1] + swap[k[-1]] if k[-1] in swap else k
        out[k2] = (2 * axis - x, y)
    return out


def ease(t):
    return 0.5 - 0.5 * math.cos(math.pi * t)


# ---------------------------------------------------------------------------
# Figures. Each returns [(pose, hold_ms)] keyframes and a draw(frame, pose).
# The cycle tweens keyframe i -> i+1 in `steps` frames, holding each keyframe.
# ---------------------------------------------------------------------------

def fig_pullups():
    down = {
        'H': (15, 10.8), 'N': (15, 13.2), 'P': (15, 20.5),
        'S1': (12.6, 13.2), 'S2': (17.4, 13.2),
        'E1': (10.4, 9.8), 'E2': (19.6, 9.8), 'W1': (9.4, 6.6), 'W2': (20.6, 6.6),
        'Q1': (13.9, 20.5), 'Q2': (16.1, 20.5),
        'K1': (13.6, 24.3), 'K2': (16.4, 24.3), 'A1': (14, 27.6), 'A2': (16, 27.6),
    }
    up = {
        'H': (15, 4.3), 'N': (15, 7.6), 'P': (15, 15),
        'S1': (12.4, 8.2), 'S2': (17.6, 8.2),
        'E1': (8.2, 9.2), 'E2': (21.8, 9.2), 'W1': (9.4, 6.6), 'W2': (20.6, 6.6),
        'Q1': (13.9, 15), 'Q2': (16.1, 15),
        'K1': (13.4, 19), 'K2': (16.6, 19), 'A1': (14.2, 22.6), 'A2': (15.8, 22.6),
    }

    def draw(f, p):
        seg(f, (4, 6), (26, 6), 0.5, 'acc')
        seg(f, (4, 6), (4, 29), 0.5, 'acc')
        seg(f, (26, 6), (26, 29), 0.5, 'acc')
        front_body(f, p)
    return [(down, 500), (up, 350)], draw, 4, 0


def fig_maxhangs():
    hang = {
        'H': (15, 9.6), 'N': (15, 12.2), 'P': (15, 19.2),
        'S1': (12.6, 12.4), 'S2': (17.4, 12.4),
        'E1': (10.9, 8.8), 'E2': (19.1, 8.8), 'W1': (9.8, 5.6), 'W2': (20.2, 5.6),
        'Q1': (13.9, 19.2), 'Q2': (16.1, 19.2),
        'K1': (13.6, 23.2), 'K2': (16.4, 23.2), 'A1': (13.8, 27.2), 'A2': (16.2, 27.2),
    }
    # Scapular engagement: straight arms, the body lifts by the shoulders only,
    # and the knees come up a little as the trunk switches on.
    engaged = shift(hang, dy=-2.4)
    engaged.update({'W1': hang['W1'], 'W2': hang['W2'],
                    'S1': (12.2, 10.4), 'S2': (17.8, 10.4),
                    'K1': (13.2, 20.2), 'K2': (16.8, 20.2), 'A1': (14.2, 24.4), 'A2': (15.8, 24.4)})

    def draw(f, p):
        seg(f, (3, 5), (27, 5), 0.55, 'acc')
        front_body(f, p)
    return [(hang, 700), (engaged, 900)], draw, 3, 1


def fig_hangboard():
    # A board with two hands on it, 7s on / 3s off, sped up. The timer row
    # under the board fills during the hang and drains during the rest.
    def draw(f, p):
        rect(f, 3, 5, 26, 5, 'acc')
        rect(f, 3, 12, 26, 12, 'acc')
        rect(f, 3, 5, 3, 12, 'acc')
        rect(f, 26, 5, 26, 12, 'acc')
        for x1, x2, y in ((6, 9, 8), (12, 17, 8), (20, 23, 8), (5, 8, 10), (11, 18, 10), (21, 24, 10)):
            rect(f, x1, y, x2, y, 'dim')
        on = p['on'][0]
        drop = (1 - on) * 3.5
        for hx in (10.5, 19.5):
            # Fingers over the edge, then the forearm hanging below the board.
            seg(f, (hx - 1.5, 12 + drop), (hx + 1.5, 12 + drop), 0.7, 'ink')
            seg(f, (hx, 13 + drop), (hx, 20 + drop), 1.1, 'ink')
        n = int(round(p['t'][0]))
        for i in range(10):
            if i < n:
                put(f, 10 + i, 28, 'ink' if i < 7 else 'acc')
    keys = []
    for i in range(11):
        keys.append(({'on': (1.0 if i <= 7 else 0.0, 0), 't': (i, 0)}, 160))
    return keys, draw, 1, 5


def fig_barbell():
    down = {
        'H': (21.2, 11.8), 'N': (18.6, 13.6), 'P': (12.4, 18.6),
        'E1': (18.8, 17.4), 'W1': (19, 21.6), 'E2': (18.4, 17.4), 'W2': (18.6, 21.6),
        'K1': (18.2, 22.2), 'A1': (15.6, 27.4), 'K2': (17.4, 22.4), 'A2': (14.6, 27.4),
    }
    up = {
        'H': (16.2, 5.8), 'N': (15.6, 8.8), 'P': (14.8, 16.2),
        'E1': (16, 12.6), 'W1': (16.6, 16.6), 'E2': (15.4, 12.6), 'W2': (16, 16.6),
        'K1': (15.8, 21.6), 'A1': (15.6, 27.4), 'K2': (15, 21.6), 'A2': (14.6, 27.4),
    }

    def draw(f, p):
        floor(f, 6, 25)
        wx, wy = p['W1']
        disc(f, (wx + 0.3, wy + 2.6), 3.3, 'acc')
        side_body(f, p)
    return [(down, 450), (up, 450)], draw, 4, 1


def fig_dumbbell():
    down = {
        'H': (15.2, 5.8), 'N': (15, 8.8), 'P': (14.8, 16.4),
        'E1': (15.4, 12.6), 'W1': (16.4, 16.6), 'E2': (14.4, 12.6), 'W2': (14.2, 16.6),
        'K1': (15.4, 21.8), 'A1': (15, 27.4), 'K2': (14.4, 21.8), 'A2': (14, 27.4),
    }
    up = dict(down)
    up['W1'] = (18.6, 9.6)

    def draw(f, p):
        floor(f, 8, 22)
        side_body(f, p)
        for w in ('W2', 'W1'):
            x, y = p[w]
            disc(f, (x + 0.4, y + 0.4), 1.4, 'acc')
    return [(down, 400), (up, 400)], draw, 3, 1


def fig_kettlebell():
    down = {
        'H': (20.4, 11.8), 'N': (18.2, 13.4), 'P': (12.6, 18.4),
        'E1': (16.4, 17.2), 'W1': (14.8, 21.2), 'E2': (16, 17.2), 'W2': (14.4, 21.2),
        'K1': (17.2, 22.4), 'A1': (16.2, 27.4), 'K2': (16.4, 22.4), 'A2': (13.2, 27.4),
    }
    up = {
        'H': (15.6, 5.8), 'N': (15.2, 8.8), 'P': (14.6, 16.2),
        'E1': (19, 9.6), 'W1': (22.8, 10.4), 'E2': (18.8, 9.8), 'W2': (22.6, 10.6),
        'K1': (15.6, 21.6), 'A1': (16.2, 27.4), 'K2': (14.4, 21.8), 'A2': (13.2, 27.4),
    }

    def draw(f, p):
        floor(f, 7, 26)
        side_body(f, p)
        (nx, ny), (wx, wy) = p['N'], p['W1']
        dx, dy = wx - nx, wy - ny
        L = math.hypot(dx, dy) or 1
        disc(f, (wx + dx / L * 2.0, wy + dy / L * 2.0), 1.9, 'acc')
    return [(down, 250), (up, 350)], draw, 4, 1


def fig_squats():
    stand = {
        'H': (15.6, 5.8), 'N': (15.2, 8.8), 'P': (14.6, 16.2),
        'E1': (18.6, 9.6), 'W1': (22.2, 10), 'E2': (18.4, 9.8), 'W2': (22, 10.2),
        'K1': (15.4, 21.6), 'A1': (15, 27.4), 'K2': (14.6, 21.6), 'A2': (14.2, 27.4),
    }
    deep = {
        'H': (17, 11.8), 'N': (15.4, 14.6), 'P': (11.4, 21.2),
        'E1': (19.2, 15), 'W1': (22.8, 15.4), 'E2': (19, 15.2), 'W2': (22.6, 15.6),
        'K1': (18.8, 22.2), 'A1': (15, 27.4), 'K2': (18, 22.4), 'A2': (14.2, 27.4),
    }

    def draw(f, p):
        floor(f, 7, 24)
        side_body(f, p)
    return [(stand, 450), (deep, 450)], draw, 4, 1


def fig_pushups():
    up = {
        'H': (24.2, 18.6), 'N': (21.4, 20.2), 'P': (13, 23.2),
        'E1': (21.4, 23.6), 'W1': (21.6, 27.2), 'E2': (20.8, 23.6), 'W2': (21, 27.2),
        'K1': (8.8, 25.2), 'A1': (4.6, 27.2), 'K2': (8.8, 25.2), 'A2': (4.6, 27.2),
    }
    down = {
        'H': (24.6, 23.2), 'N': (21.6, 24.4), 'P': (13, 25.8),
        'E1': (18.6, 24.6), 'W1': (21.6, 27.2), 'E2': (18, 24.6), 'W2': (21, 27.2),
        'K1': (8.8, 26.6), 'A1': (4.6, 27.2), 'K2': (8.8, 26.6), 'A2': (4.6, 27.2),
    }

    def draw(f, p):
        floor(f, 2, 27)
        side_body(f, p)
    return [(up, 450), (down, 350)], draw, 4, 0


def fig_morning():
    down = {
        'H': (15, 5.8), 'N': (15, 8.6), 'P': (15, 16.4),
        'S1': (12, 9), 'S2': (18, 9),
        'E1': (10.8, 12.8), 'E2': (19.2, 12.8), 'W1': (10.2, 16.6), 'W2': (19.8, 16.6),
        'Q1': (13.8, 16.4), 'Q2': (16.2, 16.4),
        'K1': (13.4, 21.8), 'K2': (16.6, 21.8), 'A1': (13.2, 27.4), 'A2': (16.8, 27.4),
    }
    reach = dict(down)
    reach.update({'E1': (10.4, 5.4), 'E2': (19.6, 5.4), 'W1': (9.2, 1.6), 'W2': (20.8, 1.6),
                  'H': (15, 5.4), 'N': (15, 8.2)})
    upper = ['H', 'N', 'S1', 'S2', 'E1', 'E2', 'W1', 'W2']
    left = rotate(reach, upper, (15, 16.4), -14)
    right = rotate(reach, upper, (15, 16.4), 14)

    def draw(f, p):
        floor(f, 8, 22)
        front_body(f, p)
    return [(down, 400), (reach, 300), (left, 400), (reach, 150), (right, 400), (reach, 300)], draw, 4, 1


def fig_core():
    # Band chop: the band runs from a high anchor to both hands, which drive
    # diagonally across the body while the ribcage turns.
    high = {
        'H': (15.6, 5.8), 'N': (15.4, 8.6), 'P': (15, 16.4),
        'S1': (12.8, 8.6), 'S2': (17.8, 9.2),
        'E1': (10.6, 7), 'E2': (13.6, 7.4), 'W1': (8.4, 5.2), 'W2': (8.8, 5.6),
        'Q1': (13.8, 16.4), 'Q2': (16.2, 16.4),
        'K1': (12.8, 21.8), 'K2': (17.2, 21.8), 'A1': (12, 27.4), 'A2': (18, 27.4),
    }
    low = dict(high)
    low.update({'H': (15.8, 6.2), 'N': (15.6, 9), 'S1': (13.2, 9.6), 'S2': (18.2, 9),
                'E1': (17.4, 13.8), 'E2': (19.6, 12.8), 'W1': (21.4, 17.8), 'W2': (21.8, 17.4)})

    def draw(f, p):
        floor(f, 7, 23)
        seg(f, (3, 2), (3, 4), 0.6, 'acc')
        seg(f, (3.5, 3), p['W1'], 0.45, 'acc')
        front_body(f, p)
    return [(high, 450), (low, 350)], draw, 4, 1


FIGURES = {
    'pullups': fig_pullups,
    'maxhangs': fig_maxhangs,
    'hangboard': fig_hangboard,
    'barbell': fig_barbell,
    'dumbbell': fig_dumbbell,
    'kettlebell': fig_kettlebell,
    'squats': fig_squats,
    'pushups': fig_pushups,
    'morning': fig_morning,
    'core': fig_core,
}


# ---------------------------------------------------------------------------
# Frames and SVG output
# ---------------------------------------------------------------------------

TWEEN_MS = 90   # one LED frame: fast enough to read as motion, slow enough to look like LEDs


def build_frames(fn):
    keys, draw, steps, still = fn()
    frames = []   # [(raster, ms)]

    def raster(pose):
        f = {}
        draw(f, pose)
        return f

    n = len(keys)
    for i, (pose, hold) in enumerate(keys):
        frames.append((raster(pose), hold))
        nxt = keys[(i + 1) % n][0]
        for s in range(1, steps):
            frames.append((raster(lerp_pose(pose, nxt, ease(s / steps))), TWEEN_MS))

    # Merge consecutive identical rasters.
    merged = []
    for r, ms in frames:
        if merged and merged[-1][0] == r:
            merged[-1] = (r, merged[-1][1] + ms)
        else:
            merged.append((r, ms))
    still_raster = raster(keys[still][0])
    still_idx = next(i for i, (r, _) in enumerate(merged) if r == still_raster)
    return merged, still_idx


def path_of(dots):
    return ''.join(f'M{x} {y}h0' for x, y in sorted(dots))


def to_svg(name, frames, still_idx):
    total = sum(ms for _, ms in frames)
    common = set(frames[0][0].items())
    for r, _ in frames[1:]:
        common &= set(r.items())

    def tone_paths(items, cls=''):
        out = []
        for tone in TONES:
            dots = [xy for xy, t in items if t == tone]
            if dots:
                out.append(f'<path class="{tone}" d="{path_of(dots)}"/>')
        return ''.join(out)

    css = [
        f'.ink{{stroke:{INK}}}.dim{{stroke:{INK};stroke-opacity:{DIM_OPACITY}}}.acc{{stroke:{ACCENT}}}',
        f'path{{fill:none;stroke-width:{DOT};stroke-linecap:round}}',
    ]
    groups = []
    t = 0
    for i, (r, ms) in enumerate(frames):
        a, b = 100 * t / total, 100 * (t + ms) / total
        t += ms
        css.append(
            f'.f{i}{{opacity:0;animation:k{i} {total}ms step-end infinite}}'
            f'@keyframes k{i}{{0%{{opacity:{1 if a == 0 else 0}}}{a:.3f}%{{opacity:1}}{b:.3f}%{{opacity:0}}}}'
        )
        groups.append(f'<g class="f f{i}">{tone_paths(set(r.items()) - common)}</g>')
    css.append(
        '@media (prefers-reduced-motion:reduce){.f{animation:none!important;opacity:0}'
        f'.f{still_idx}{{opacity:1}}}}'
    )

    unlit = (
        f'<pattern id="u" width="1" height="1" patternUnits="userSpaceOnUse" x="-0.5" y="-0.5">'
        f'<circle cx="0.5" cy="0.5" r="{UNLIT_DOT / 2}" fill="{INK}" fill-opacity="{UNLIT_OPACITY}"/></pattern>'
    )
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-0.5 - PAD} {-0.5 - PAD} {GRID + 2 * PAD} {GRID + 2 * PAD}" id="{name}">'
        f'<defs>{unlit}<style>{"".join(css)}</style></defs>'
        f'<rect x="-0.5" y="-0.5" width="{GRID}" height="{GRID}" fill="url(#u)"/>'
        f'{tone_paths(common)}{"".join(groups)}</svg>\n'
    )


def still_svg(name, frame):
    """The key pose alone, for prefers-reduced-motion. Chromium does not pass
    that preference into an SVG loaded as an image, so the page picks this file
    with <picture> instead of trusting the media query inside the animation."""
    parts = []
    for tone in TONES:
        dots = [xy for xy, t in frame.items() if t == tone]
        if dots:
            parts.append(f'<path class="{tone}" d="{path_of(dots)}"/>')
    css = (f'.ink{{stroke:{INK}}}.dim{{stroke:{INK};stroke-opacity:{DIM_OPACITY}}}.acc{{stroke:{ACCENT}}}'
           f'path{{fill:none;stroke-width:{DOT};stroke-linecap:round}}')
    unlit = (
        f'<pattern id="u" width="1" height="1" patternUnits="userSpaceOnUse" x="-0.5" y="-0.5">'
        f'<circle cx="0.5" cy="0.5" r="{UNLIT_DOT / 2}" fill="{INK}" fill-opacity="{UNLIT_OPACITY}"/></pattern>'
    )
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-0.5 - PAD} {-0.5 - PAD} {GRID + 2 * PAD} {GRID + 2 * PAD}" id="{name}-still">'
        f'<defs>{unlit}<style>{css}</style></defs>'
        f'<rect x="-0.5" y="-0.5" width="{GRID}" height="{GRID}" fill="url(#u)"/>{"".join(parts)}</svg>\n'
    )


def static_svg(frame):
    parts = []
    for tone in TONES:
        dots = [xy for xy, t in frame.items() if t == tone]
        if dots:
            colour = ACCENT if tone == 'acc' else INK
            op = DIM_OPACITY if tone == 'dim' else 1
            parts.append(f'<path d="{path_of(dots)}" stroke="{colour}" stroke-opacity="{op}" '
                         f'stroke-width="{DOT}" stroke-linecap="round" fill="none"/>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 -0.5 {GRID} {GRID}" width="120" height="120" '
            f'style="background:#E4E2DD;margin:2px">{"".join(parts)}</svg>')


def main():
    sheet_dir = None
    if '--sheet' in sys.argv:
        sheet_dir = sys.argv[sys.argv.index('--sheet') + 1]
    rows = []
    for name, fn in FIGURES.items():
        frames, still = build_frames(fn)
        svg = to_svg(name, frames, still)
        with open(os.path.join(OUT, f'{name}.svg'), 'w') as fh:
            fh.write(svg)
        os.makedirs(os.path.join(OUT, 'still'), exist_ok=True)
        with open(os.path.join(OUT, 'still', f'{name}.svg'), 'w') as fh:
            fh.write(still_svg(name, frames[still][0]))
        print(f'{name:11s} {len(frames):2d} frames  {sum(ms for _, ms in frames):5d} ms  {len(svg) / 1024:5.1f} KB')
        rows.append(f'<div style="font:11px monospace">{name}<br>' + ''.join(static_svg(r) for r, _ in frames) + '</div>')
    if sheet_dir:
        os.makedirs(sheet_dir, exist_ok=True)
        with open(os.path.join(sheet_dir, 'sheet.html'), 'w') as fh:
            fh.write('<html><body style="background:#fff">' + ''.join(rows) + '</body></html>')


if __name__ == '__main__':
    main()
