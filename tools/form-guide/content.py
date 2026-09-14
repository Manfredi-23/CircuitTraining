# =============================================================================
# content.py - assembles the long-form content and binds it to the programme.
#
# CONTENT is keyed by canonical movement slug, not by exercise id, because the
# same movement appears under different ids in different sessions. Weighted
# pull-ups are home-weighted-pullup, cave-weighted-pullup and
# addon-weighted-pullup; the form is identical and only the prescription differs.
# EXERCISE_MAP binds every id in src/core/data-*.ts to one slug, and build.py
# fails loudly if any id is unmapped, so adding an exercise to the app without
# writing its form guide breaks the build rather than shipping a blank page.
# =============================================================================

import parts_home
import parts_cave
import parts_morn

CONTENT = {}
CONTENT.update(parts_home.CONTENT)
CONTENT.update(parts_cave.CONTENT)
CONTENT.update(parts_morn.CONTENT)

# HANG mode adds no movements of its own: its sessions are built from the
# finger-training entries in parts_cave and the dead hang from parts_home.

EXERCISE_MAP = {
    # ---- HOME ---------------------------------------------------------------
    "home-warmup": "warmup-flow",
    "home-front-lever": "front-lever",
    "home-leg-raise": "hanging-leg-raise",
    "home-hollow-arch": "hollow-arch",
    "home-pallof": "pallof-press",
    "home-copenhagen": "copenhagen-plank",
    "home-band-er-01": "band-external-rotation",
    "home-weighted-pullup": "weighted-pullup",
    "home-lockoff": "lock-off-ladder",
    "home-row": "inverted-row",
    "home-dead-hang": "dead-hang",
    "home-wrist-armour": "wrist-extensor-pronator",
    "home-pike-press": "pike-press",
    "home-pushup": "push-up",
    "home-split-squat": "bulgarian-split-squat",
    "home-sl-rdl": "single-leg-rdl",
    "home-cuff-circuit": "cuff-circuit",
    "home-wrist-block": "wrist-conditioning",
    "home-hip-flow": "hip-mobility-flow",
    "wrists-daily-block": "wrist-conditioning",
    "wrists-loaded-extension": "quadruped-wrist-rocks",
    # ---- CAVE ---------------------------------------------------------------
    "cave-warmup-pulse": "cave-warmup",
    "cave-warmup-fingers": "progressive-finger-loading",
    "cave-max-hang": "max-hang-halfcrimp",
    "cave-weighted-pullup": "weighted-pullup",
    "cave-lockoff": "lock-off-ladder",
    "cave-front-lever": "front-lever",
    "cave-band-er": "band-external-rotation",
    "cave-limit-boulder": "limit-boulder",
    "cave-campus": "campus-ladders",
    "cave-explosive-pull": "explosive-pullup",
    "cave-toehook": "ring-toehook",
    "cave-trx-ytw": "trx-ytw",
    "cave-recruitment-pulls": "recruitment-pulls",
    "cave-repeaters": "repeaters",
    "cave-pullup-se": "pullup-strength-endurance",
    "cave-kb-press": "kb-overhead-press",
    "cave-split-squat": "bulgarian-split-squat",
    "cave-wrist-armour": "wrist-extensor-pronator",
    "test-max-hang": "test-max-hang",
    "test-weighted-pullup": "test-weighted-pullup",
    "test-lockoff": "test-lockoff",
    "test-front-lever": "test-front-lever",
    "test-hip-mobility": "test-hip-mobility",
    "addon-weighted-pullup": "weighted-pullup",
    "addon-pushup": "ring-dips",
    "addon-goblet-squat": "goblet-squat",
    "addon-russian-twist": "russian-twist",
    "addon-cuff": "band-external-rotation",
    # ---- HANG ---------------------------------------------------------------
    "hang-warmup-pulse": "cave-warmup",
    "hang-warmup-progressive": "progressive-finger-loading",
    "max-hang-halfcrimp": "max-hang-halfcrimp",
    "max-hang-openhand": "max-hang-drag",
    "hang02-warmup-pulse": "cave-warmup",
    "hang02-warmup-progressive": "progressive-finger-loading",
    "repeaters-73": "repeaters",
    "critical-force-block": "critical-force",
    "dead-hang-3grip": "dead-hang",
    "density-hangs": "density-hangs",
    # ---- MORN ---------------------------------------------------------------
    "morn-breathing": "breathing-9090",
    "morn-deadbug": "dead-bug",
    "morn-hollow": "hollow-body",
    "morn-leg-lowers": "band-leg-lowers",
    "morn-side-plank": "side-plank-reach-through",
    "morn-pressout": "half-kneeling-pressout",
    "morn-chop": "standing-band-chop",
    "morn-nohang": "pull-edge-nohang",
    "morn-vacuum": "stomach-vacuum",
    "morn-supine-twist": "supine-twist",
    "morn-catcow": "cat-cow-thread",
    "morn-hip-9090": "hip-switch-9090",
    "morn-pullapart": "band-pull-apart",
    "morn-birddog": "bird-dog",
    "morn-bridge-march": "glute-bridge-march",
    "morn-side-plank-hold": "side-plank-hold",
    "morn-nohang-easy": "pull-edge-nohang",
    "morn-deadbug-slow": "dead-bug",
}


def validate():
    """Every mapped slug must exist, and every written slug must be reachable."""
    missing = sorted({s for s in EXERCISE_MAP.values() if s not in CONTENT})
    orphans = sorted(set(CONTENT) - set(EXERCISE_MAP.values()))
    return missing, orphans
