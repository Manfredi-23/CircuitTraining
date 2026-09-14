# =============================================================================
# style.py - the house visual style for every generated illustration, and the
# small helpers the content modules are written against.
#
# Every image prompt in the book is assembled from the same HOUSE_STYLE and
# NEGATIVE blocks, so a set generated from these prompts reads as one book
# rather than a folder of unrelated pictures. Colours are the app's own tokens
# from src/app/globals.css: --ink, the parchment --bg, and --accent.
# =============================================================================

HOUSE_STYLE = (
    "Technical instructional line drawing for a climbing training manual. "
    "Dark charcoal ink (#181610) line art on a flat warm parchment background (#E4E2DD). "
    "Strictly two colours plus one accent: a single burnt-orange (#E64D19) used ONLY for "
    "motion arrows, angle marks and callout numbers, never on the body. "
    "No shading, no gradients, no cross-hatching, no textures, no background scenery, "
    "no gym interior, no floor shadow. Uniform 2px stroke weight throughout. "
    "Anatomically correct adult male climber, lean and light, short dark hair, plain "
    "fitted shorts and a plain vest, barefoot unless the panel says otherwise. "
    "The whole body inside the frame with a clear margin on every side. "
    "Flat orthographic projection, no perspective distortion, no foreshortening of the "
    "working limb. Calm, precise and diagrammatic: a coach's manual, not a fitness advert."
)

NEGATIVE = (
    "photorealism, 3D render, gym background, mirrors, weight racks, colour photography, "
    "dramatic lighting, drop shadows, muscle striation shading, watermark, logo, brand name, "
    "text labels other than the numbers specified, extra limbs, warped hands, fused fingers, "
    "wrong number of fingers, distorted joints, impossible elbow or knee angles, "
    "cropped hands or feet, bodybuilder mass, exaggerated musculature"
)


def prompt(panels, equipment, angles, arrows, extra=""):
    """One image-generation prompt, stored in parts and flattened for printing."""
    return {
        "panels": panels,
        "equipment": equipment,
        "angles": angles,
        "arrows": arrows,
        "extra": extra,
    }


def render_prompt(p):
    """Flatten a prompt into the single copy-pasteable block printed in the PDF."""
    parts = [HOUSE_STYLE]
    n = len(p["panels"])
    if n == 1:
        parts.append("COMPOSITION: one square panel, 1:1.")
    else:
        numbers = ", ".join(str(i + 1) for i in range(n))
        parts.append(
            f"COMPOSITION: {n} panels side by side in a single horizontal strip, equal "
            f"width, thin 1px ink rule between panels, each panel numbered {numbers} in "
            f"burnt orange in its top-left corner. The same figure at the same scale in "
            f"every panel."
        )
    parts.append("EQUIPMENT: " + p["equipment"])
    for i, panel in enumerate(p["panels"], 1):
        parts.append(f"PANEL {i}: {panel}")
    parts.append("KEY ANGLES AND POSITIONS: " + p["angles"])
    parts.append("ANNOTATION: " + p["arrows"])
    if p["extra"]:
        parts.append("NOTE: " + p["extra"])
    parts.append("NEGATIVE PROMPT: " + NEGATIVE)
    return "\n\n".join(parts)


def E(steps_setup, steps_exec, checks, mistakes, prompt, illus=None, illus_note=None):
    """One movement's long-form entry.

    illus is (slug, [frame numbers]) into tools/form-guide/assets/illus, or None
    where no openly-licensed artwork exists and the prompt is the only source.
    """
    return {
        "setup": steps_setup,
        "exec": steps_exec,
        "checks": checks,
        "mistakes": mistakes,
        "prompt": prompt,
        "illus": illus,
        "illus_note": illus_note,
    }
