#!/usr/bin/env python3
# =============================================================================
# build.py - generate the printed form guide.
#
#   python3 tools/form-guide/build.py
#
# Writes docs/7bit-form-guide.pdf and docs/form-guide-image-prompts.txt.
#
# The programme data comes from src/core/data-*.ts via dump-exercises.ts, so
# prescriptions in the book are never retyped and cannot drift from the app.
# The long-form steps and image prompts come from parts_*.py. Line art comes
# from assets/illus, which is CC BY-SA 4.0 and credited on the licence page.
#
# Requires: reportlab, pillow, and npx tsx for the data dump.
# =============================================================================

import json
import os
import shutil
import subprocess
import sys
import tempfile

from PIL import Image
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, KeepTogether, NextPageTemplate, PageBreak,
    Paragraph, PageTemplate, Spacer, Table, TableStyle,
)

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from content import CONTENT, EXERCISE_MAP, validate          # noqa: E402
from style import render_prompt                              # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
ASSETS = os.path.join(HERE, "assets")
OUT_DIR = os.path.join(ROOT, "docs")
OUT_PDF = os.path.join(OUT_DIR, "7bit-form-guide.pdf")
OUT_TXT = os.path.join(OUT_DIR, "form-guide-image-prompts.txt")

# ---- Palette, straight from src/app/globals.css -----------------------------
INK = colors.HexColor("#181610")
INK_DIM = colors.HexColor("#6B6759")
INK_FAINT = colors.HexColor("#C9C5B8")
ACCENT = colors.HexColor("#E64D19")
PARCHMENT = colors.HexColor("#E4E2DD")
PAPER = colors.HexColor("#FAF9F6")

PAGE_W, PAGE_H = A4
MARGIN = 18 * mm

# Kode Mono has no typographic dashes or curly quotes. Rather than ship a page
# full of empty boxes, fold them to ASCII: it suits the app's voice anyway.
SUBS = {
    "—": "-", "–": "-", "‘": "'", "’": "'",
    "“": '"', "”": '"', "…": "...", " ": " ",
    "°": " deg", "×": "x", "−": "-", "•": "-",
}


def flat(s):
    """Normalise text to glyphs the font actually has, and escape for XML."""
    if s is None:
        return ""
    for bad, good in SUBS.items():
        s = s.replace(bad, good)
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


# ---- Fonts ------------------------------------------------------------------

def register_fonts():
    reg = os.path.join(ASSETS, "fonts", "KodeMono-Regular.ttf")
    bold = os.path.join(ASSETS, "fonts", "KodeMono-Bold.ttf")
    if not (os.path.exists(reg) and os.path.exists(bold)):
        sys.exit("Missing fonts in tools/form-guide/assets/fonts/")
    pdfmetrics.registerFont(TTFont("Kode", reg))
    pdfmetrics.registerFont(TTFont("Kode-Bold", bold))


# ---- Styles -----------------------------------------------------------------

def styles():
    def s(name, **kw):
        kw.setdefault("fontName", "Kode")
        kw.setdefault("textColor", INK)
        kw.setdefault("alignment", TA_LEFT)
        return ParagraphStyle(name, **kw)

    return {
        "cover_title": s("cover_title", fontName="Kode-Bold", fontSize=34,
                         leading=38, textColor=INK),
        "cover_sub": s("cover_sub", fontSize=11, leading=17, textColor=INK_DIM),
        "h1": s("h1", fontName="Kode-Bold", fontSize=26, leading=30,
                spaceAfter=2),
        "h2": s("h2", fontName="Kode-Bold", fontSize=15, leading=19,
                spaceBefore=4, spaceAfter=4),
        "label": s("label", fontName="Kode-Bold", fontSize=7.5, leading=11,
                   textColor=ACCENT, spaceBefore=7, spaceAfter=3),
        "body": s("body", fontSize=8.8, leading=13.2, spaceAfter=3),
        "body_dim": s("body_dim", fontSize=8.3, leading=12.4,
                      textColor=INK_DIM, spaceAfter=3),
        "step": s("step", fontSize=8.8, leading=13.2, leftIndent=13,
                  firstLineIndent=-13, spaceAfter=3.5),
        "meta": s("meta", fontSize=7.6, leading=11, textColor=INK_DIM),
        "meta_b": s("meta_b", fontName="Kode-Bold", fontSize=7.6, leading=11),
        "prompt": s("prompt", fontSize=6.9, leading=9.6, textColor=INK,
                    spaceAfter=4),
        "caption": s("caption", fontSize=6.8, leading=9.6, textColor=INK_DIM),
        "toc": s("toc", fontSize=8.5, leading=12.6),
    }


# ---- Page furniture ---------------------------------------------------------

def _page_base(canvas, doc, fill):
    canvas.saveState()
    canvas.setFillColor(fill)
    canvas.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    canvas.restoreState()


def page_content(canvas, doc):
    """Background only. The footer is drawn at page END, see footer()."""
    _page_base(canvas, doc, PAPER)


def footer(canvas, doc):
    """Drawn after the page's flowables, so running_head names THIS page."""
    canvas.saveState()
    canvas.setFont("Kode", 6.5)
    canvas.setFillColor(INK_DIM)
    canvas.drawString(MARGIN, 11 * mm, "7BIT FORM GUIDE")
    section = getattr(doc, "running_head", "")
    if section:
        canvas.drawCentredString(PAGE_W / 2, 11 * mm, flat(section).upper())
    canvas.setFillColor(INK)
    canvas.drawRightString(PAGE_W - MARGIN, 11 * mm, str(canvas.getPageNumber()))
    canvas.setStrokeColor(INK_FAINT)
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN, 14.5 * mm, PAGE_W - MARGIN, 14.5 * mm)
    canvas.restoreState()


def page_plain(canvas, doc):
    _page_base(canvas, doc, PARCHMENT)


class Doc(BaseDocTemplate):
    """Carries the running head so page_content can print the current mode."""

    def __init__(self, path, **kw):
        super().__init__(path, **kw)
        self.running_head = ""
        self.page_index = {}
        frame = Frame(MARGIN, 18 * mm, PAGE_W - 2 * MARGIN,
                      PAGE_H - 18 * mm - 16 * mm, id="body",
                      leftPadding=0, rightPadding=0,
                      topPadding=0, bottomPadding=0)
        self.addPageTemplates([
            PageTemplate(id="plain", frames=[frame], onPage=page_plain),
            PageTemplate(id="content", frames=[frame], onPage=page_content,
                         onPageEnd=footer),
        ])

    def afterFlowable(self, flowable):
        head = getattr(flowable, "_running_head", None)
        if head is not None:
            self.running_head = head
        slug = getattr(flowable, "_mark_slug", None)
        if slug is not None:
            self.page_index.setdefault(slug, self.page)


class SetHead(Spacer):
    """Zero-height marker that switches the running head on this page."""

    def __init__(self, head):
        super().__init__(0, 0)
        self._running_head = head


class Mark(Spacer):
    """Zero-height marker recording which page a movement starts on.

    The book is built twice: the first pass collects these, the second prints
    the index with real page numbers.
    """

    def __init__(self, slug):
        super().__init__(0, 0)
        self._mark_slug = slug


# ---- Illustrations ----------------------------------------------------------

def tint(mask_path, out_path):
    """The vendored art is an alpha mask. Paint it ink on white for print."""
    mask = Image.open(mask_path).convert("L")
    img = Image.new("RGB", mask.size, (255, 255, 255))
    ink = Image.new("RGB", mask.size, (24, 22, 16))
    img.paste(ink, (0, 0), mask)
    img.save(out_path)
    return img.size


def illus_block(entry, tmp, st, width):
    """An outlined strip of line-art frames, or a note saying there is none."""
    spec = entry.get("illus")
    note = entry.get("illus_note")
    if not spec:
        text = note or ("No openly-licensed illustration exists for this "
                        "movement. Generate it from the prompt below.")
        box = Table([[Paragraph("NO STOCK ILLUSTRATION. " + flat(text),
                                st["caption"])]], colWidths=[width])
        box.setStyle(TableStyle([
            ("BOX", (0, 0), (-1, -1), 0.8, INK_FAINT),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        return [box]

    slug, frames = spec
    cells, widths = [], []
    cell_w = min(42 * mm, (width - 8) / max(len(frames), 1))
    for n in frames:
        src = os.path.join(ASSETS, "illus", slug, f"frame-{n}.png")
        if not os.path.exists(src):
            continue
        dst = os.path.join(tmp, f"{slug}-{n}.png")
        if not os.path.exists(dst):
            tint(src, dst)
        with Image.open(dst) as im:
            w, h = im.size
        # Fit inside the cell without distorting the drawing.
        scale = min(cell_w / w, (34 * mm) / h)
        from reportlab.platypus import Image as RLImage
        cells.append(RLImage(dst, width=w * scale, height=h * scale))
        widths.append(cell_w)
    if not cells:
        return []

    strip = Table([cells], colWidths=widths)
    strip.setStyle(TableStyle([
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    rows = [[strip]]
    if note:
        rows.append([Paragraph(flat(note), st["caption"])])
    box = Table(rows, colWidths=[width])
    box.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.8, INK_FAINT),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return [box]


# ---- Data -------------------------------------------------------------------

def load_programme():
    cached = os.path.join(HERE, ".exercises.json")
    try:
        raw = subprocess.run(
            ["npx", "--yes", "tsx", os.path.join(HERE, "dump-exercises.ts")],
            cwd=ROOT, capture_output=True, text=True, timeout=300,
        )
        if raw.returncode == 0 and raw.stdout.strip().startswith("{"):
            with open(cached, "w") as fh:
                fh.write(raw.stdout)
            return json.loads(raw.stdout)
        print("  tsx dump failed, falling back to cache:",
              raw.stderr.strip().splitlines()[-1:] or "no stderr")
    except (OSError, subprocess.TimeoutExpired) as exc:
        print("  tsx unavailable, falling back to cache:", exc)
    if os.path.exists(cached):
        return json.load(open(cached))
    sys.exit("No programme data: tsx failed and no cache exists.")


def index_usage(data):
    """Where each exercise id appears, and under what prescription."""
    usage = {}
    for mode in data["modes"]:
        for circ in mode["circuits"]:
            for lst, kind in ((circ["exercises"], "in"),
                              (circ["substitutes"], "substitute in")):
                for ex in lst:
                    usage.setdefault(ex["id"], []).append({
                        "mode": mode["mode"], "num": circ["circuitNum"],
                        "title": circ["title"], "kind": kind, "ex": ex,
                    })
    return usage


def prescription(ex):
    unit = "s" if ex["unit"] == "sec" else " reps"
    work = f"{ex['sets']} x {ex['work']}{unit}"
    if ex.get("perSide"):
        work += " per side"
    return f"{work}, rest {ex['restSec']}s"


# ---- Exercise page ----------------------------------------------------------

def bullets(items, st, style="body"):
    return [Paragraph("- " + flat(t), st[style]) for t in items]


def numbered(items, st):
    return [Paragraph(f"{i}. {flat(t)}", st["step"])
            for i, t in enumerate(items, 1)]


def kv_table(rows, st, width):
    data = [[Paragraph(flat(k), st["meta_b"]), Paragraph(flat(v), st["meta"])]
            for k, v in rows]
    t = Table(data, colWidths=[26 * mm, width - 26 * mm])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 1.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1.5),
    ]))
    return t


def exercise_story(slug, entry, uses, protocols, st, tmp, width):
    """One movement: prescription, illustration, steps, checks, prompt."""
    primary = uses[0]["ex"]
    story = []

    story.append(Paragraph(flat(primary["name"]).upper(), st["h2"]))
    rule = Table([[""]], colWidths=[width], rowHeights=[2])
    rule.setStyle(TableStyle([("LINEABOVE", (0, 0), (-1, 0), 1.6, ACCENT)]))
    story.append(rule)
    story.append(Spacer(1, 5))

    caps = ", ".join(primary["capacities"])
    meta = [
        ("BLOCK", f"{primary['block']} / {primary['intensity']}"),
        ("TRAINS", caps),
    ]
    where = []
    for u in uses:
        tag = " [substitute]" if u["kind"].startswith("substitute") else ""
        # Name the exercise when the session calls it something else, so a card
        # reading "Dead Hang - Grip Rotation" still finds this page.
        alias = "" if u["ex"]["name"] == primary["name"] \
            else f" as {u['ex']['name']}"
        where.append(f"{u['mode']} {u['num']} {u['title']}{tag}{alias}: "
                     f"{prescription(u['ex'])}")
    meta.append(("APPEARS IN", "  |  ".join(where)))
    aliases = sorted({u["ex"]["name"] for u in uses} - {primary["name"]})
    if aliases:
        meta.append(("ALSO CALLED", ", ".join(aliases)))
    meta.append(("LOAD", primary["load"]["text"]))
    meta.append(("PROGRESSION", primary["progression"]))
    if primary.get("fixed"):
        meta.append(("FIXED", "Protocol taken as written. Never scaled by "
                              "level or energy."))
    if primary.get("gate"):
        g = primary["gate"]
        meta.append(("SAFETY GATE", g["reason"]))
    story.append(kv_table(meta, st, width))

    story.extend(illus_block(entry, tmp, st, width))

    story.append(Paragraph("SETUP", st["label"]))
    story.extend(numbered(entry["setup"], st))

    story.append(Paragraph("EXECUTION", st["label"]))
    story.extend(numbered(entry["exec"], st))

    story.append(Paragraph("POSITION CHECKS", st["label"]))
    story.extend(bullets(entry["checks"], st))

    story.append(Paragraph("COMMON MISTAKES", st["label"]))
    story.extend(bullets(entry["mistakes"], st))

    form = primary.get("form") or {}
    if form.get("breathing"):
        story.append(Paragraph("BREATHING", st["label"]))
        story.append(Paragraph(flat(form["breathing"]), st["body"]))

    why = []
    if form.get("cue"):
        why.append(flat(form["cue"]))
    proto = protocols.get(primary.get("protocolId") or "")
    if proto:
        why.append(f"<b>{flat(proto['name'])}.</b> {flat(proto['rationale'])}")
        why.append(f"<i>Protocol: {flat(proto['work'])}. Rest {flat(proto['rest'])}. "
                   f"{flat(proto['sets'])}. {flat(proto['intensity'])}. "
                   f"{flat(proto['frequency'])}.</i>")
        why.append(f"<i>Source: {flat(proto['source'])}</i>")
    if why:
        story.append(Paragraph("WHY", st["label"]))
        for p in why:
            story.append(Paragraph(p, st["body_dim"]))

    if primary.get("note"):
        story.append(Paragraph("NOTE", st["label"]))
        story.append(Paragraph(flat(primary["note"]), st["body_dim"]))

    variations = primary.get("variations") or []
    if variations:
        story.append(Paragraph("VARIATION LADDER", st["label"]))
        rows = [[Paragraph(f"L{v['minLevel']}", st["meta_b"]),
                 Paragraph(flat(v["name"]), st["meta"]),
                 Paragraph(flat(v.get("load") or ""), st["meta"])]
                for v in variations]
        t = Table(rows, colWidths=[12 * mm, (width - 12 * mm) * 0.5,
                                   (width - 12 * mm) * 0.5])
        t.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 1.5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 1.5),
            ("LINEBELOW", (0, 0), (-1, -2), 0.3, INK_FAINT),
        ]))
        story.append(t)

    story.append(Paragraph("ILLUSTRATION PROMPT", st["label"]))
    body = [Paragraph(flat(chunk), st["prompt"])
            for chunk in render_prompt(entry["prompt"]).split("\n\n")]
    box = Table([[body]], colWidths=[width])
    box.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.8, ACCENT),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.append(box)
    story.append(Spacer(1, 14))
    return story


# ---- Front and back matter --------------------------------------------------

def cover(st, counts):
    return [
        Spacer(1, 58 * mm),
        Paragraph("7BIT", st["cover_title"]),
        Paragraph("FORM GUIDE", st["cover_title"]),
        Spacer(1, 9),
        Paragraph(
            "Illustrated step-by-step reference for every exercise in the "
            "circuit training programme.", st["cover_sub"]),
        Spacer(1, 22),
        Paragraph(
            f"{counts['movements']} movements &nbsp;|&nbsp; "
            f"{counts['slots']} exercise slots &nbsp;|&nbsp; "
            f"{counts['variations']} variations &nbsp;|&nbsp; "
            f"{counts['circuits']} sessions across 4 modes",
            st["cover_sub"]),
        Spacer(1, 4),
        Paragraph(
            f"{counts['illustrated']} movements carry openly-licensed line art. "
            f"All {counts['movements']} carry a full illustration prompt.",
            st["cover_sub"]),
        Spacer(1, 30),
        Paragraph("Generated from src/core by tools/form-guide/build.py",
                  st["cover_sub"]),
    ]


HOWTO = [
    ("WHAT THIS IS",
     "One entry for every distinct movement in the programme. The app's "
     "workout card carries a short form guide because it has to fit on a phone "
     "mid-set. This is the long version: numbered setup and execution, the "
     "position checkpoints that tell you whether a rep counted, the failure "
     "modes worth knowing about, and the protocol and evidence behind the "
     "prescription."),
    ("HOW IT IS ORGANISED",
     "By mode: HOME, CAVE, HANG, MORN. A movement that appears in several "
     "sessions is written once and its APPEARS IN line lists every session it "
     "belongs to, with that session's own sets, work and rest. The "
     "prescriptions are pulled straight out of src/core, so they match the app "
     "exactly."),
    ("THE ILLUSTRATIONS",
     "Where openly-licensed line art exists for a movement it is printed at the "
     "top of the entry, credited on the licence page at the back. It does not "
     "exist for the climbing-specific half of this programme. There is no stock "
     "artwork, at any licence, for max hangs, repeaters, density hangs, "
     "no-hangs, recruitment pulls, campus ladders, critical force blocks or the "
     "front lever ladder. Those entries say so, and are drawn from the prompt."),
    ("THE ILLUSTRATION PROMPTS",
     "Every entry ends with a complete, self-contained image-generation prompt "
     "in an orange box. Paste one into an image model and it produces the "
     "illustration for that movement: panel-by-panel body positions, the joint "
     "angles that decide whether the position is right, where the arrows go, "
     "and a negative prompt. Every prompt shares the same house style block, so "
     "a set generated from this book reads as one set rather than a folder of "
     "unrelated pictures."),
    ("COPYING THE PROMPTS OUT",
     "Copying text out of a PDF mangles line breaks. docs/form-guide-image-"
     "prompts.txt has all of them as plain text, one per movement, ready to "
     "paste or to loop over in a script."),
    ("THE ORANGE RULE",
     "In the prompts, burnt orange is reserved for annotation: arrows, angle "
     "marks, callout numbers, ticks and crosses. It never appears on the body. "
     "That is what keeps a diagram readable at a glance and separates the "
     "instruction from the anatomy."),
    ("A NOTE ON THE FINGER WORK",
     "The grip illustrations are the ones worth generating first. Half-crimp, "
     "open hand and three-finger drag look similar at a glance and load the "
     "pulleys differently, and drifting between them mid-hang is the most "
     "common way a finger session quietly becomes something other than what "
     "was prescribed. Those prompts specify the joint angles and the thumb "
     "position explicitly, and they ask for the wrong versions to be drawn "
     "alongside the right one."),
]


def howto(st):
    out = [SetHead("How to use this book"),
           Paragraph("HOW TO USE THIS BOOK", st["h1"]), Spacer(1, 10)]
    for head, text in HOWTO:
        out.append(Paragraph(head, st["label"]))
        out.append(Paragraph(flat(text), st["body"]))
    return out


def index_page(st, width, usage, page_index):
    """Alphabetical index, including every name a session calls a movement.

    Built for the case that actually happens: the card says a name, you want
    the page, and you are standing under a hangboard.
    """
    rows = []
    for slug in CONTENT:
        ids = [i for i, s in EXERCISE_MAP.items() if s == slug]
        uses = [u for i in ids for u in usage.get(i, [])]
        if not uses:
            continue
        primary = uses[0]["ex"]["name"]
        page = page_index.get(slug)
        for name in sorted({u["ex"]["name"] for u in uses}):
            label = name if name == primary else f"{name}  (see {primary})"
            rows.append((name.upper(), label, page))
    rows.sort(key=lambda r: r[0])

    half = (len(rows) + 1) // 2
    cols = [rows[:half], rows[half:]]
    col_w = (width - 6 * mm) / 2

    def column(entries):
        data = [[Paragraph(flat(label), st["meta"]),
                 Paragraph(str(page) if page else "-", st["meta_b"])]
                for _, label, page in entries]
        t = Table(data, colWidths=[col_w - 10 * mm, 10 * mm])
        t.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("ALIGN", (1, 0), (1, -1), "RIGHT"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 1.5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 1.5),
        ]))
        return t

    spread = Table([[column(cols[0]), "", column(cols[1])]],
                   colWidths=[col_w, 6 * mm, col_w])
    spread.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"),
                                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                                ("RIGHTPADDING", (0, 0), (-1, -1), 0)]))
    return [SetHead("Index"), Paragraph("INDEX", st["h1"]), Spacer(1, 10),
            Paragraph(flat("Every name the app uses, alphabetically. Where a "
                           "session calls a movement something else, the entry "
                           "points at the page it is written up on."),
                      st["body_dim"]),
            Spacer(1, 8), spread, PageBreak()]


def licence_page(st, width):
    attrib_path = os.path.join(ASSETS, "illus", "attribution.json")
    attrib = json.load(open(attrib_path)) if os.path.exists(attrib_path) else {}
    used = sorted({e["illus"][0] for e in CONTENT.values() if e.get("illus")})

    out = [SetHead("Licences and sources"),
           Paragraph("LICENCES AND SOURCES", st["h1"]), Spacer(1, 10)]

    out.append(Paragraph("EXERCISE LINE ART", st["label"]))
    out.append(Paragraph(flat(
        "The figure illustrations in this book are from the Workout Guide "
        "library by Bryl Lim, licensed CC BY-SA 4.0, itself derived from "
        "Everkinetic artwork also licensed CC BY-SA 4.0. They have been "
        "recoloured to the 7Bit ink tone and trimmed for print; no other "
        "change has been made. Because the licence is ShareAlike, any "
        "redistribution of this book or of those images must carry the same "
        "licence and this credit."), st["body"]))
    out.append(Paragraph(flat(
        "Source: github.com/bryllim/workout-guide  |  "
        "github.com/everkinetic/data  |  "
        "creativecommons.org/licenses/by-sa/4.0/"), st["body_dim"]))

    out.append(Paragraph("MOVEMENTS USING THAT ART", st["label"]))
    names = [flat(attrib.get(s, {}).get("name") or s) for s in used]
    out.append(Paragraph(", ".join(names) + ".", st["body_dim"]))

    out.append(Paragraph("EVERYTHING ELSE", st["label"]))
    out.append(Paragraph(flat(
        "The written steps, position checks, mistake lists and illustration "
        "prompts were written for this book. The prescriptions, protocols, "
        "rationales and sources are generated from src/core in this "
        "repository. Each entry's WHY section names the protocol and the "
        "evidence behind it; the full protocol table lives in "
        "src/core/protocols.ts."), st["body"]))

    out.append(Paragraph("TYPEFACE", st["label"]))
    out.append(Paragraph(flat(
        "Kode Mono by Isa Ozler, SIL Open Font License 1.1. The licence text "
        "ships at tools/form-guide/assets/fonts/OFL.txt."), st["body"]))

    out.append(Paragraph("FURTHER READING", st["label"]))
    for line in [
        "Lattice Training, hangboarding and assessment guides - latticetraining.com",
        "Eric Horst, 7/3 repeater protocol - trainingforclimbing.com",
        "Giles et al., 4-minute all-out finger flexor critical force test",
        "Effects of Different Loading Programs on Finger Strength in Rock "
        "Climbers, Sports Medicine Open (2024) - the density hang evidence",
        "Saeterbakken et al., core training in highly trained climbers, "
        "PLOS ONE (2018)",
        "Front Physiol (2021), two versus four weekly campus board sessions",
        "McGill, core endurance standards for the bird dog and side bridge",
    ]:
        out.append(Paragraph("- " + flat(line), st["body_dim"]))

    out.append(Paragraph("A CAVEAT WORTH PRINTING", st["label"]))
    out.append(Paragraph(flat(
        "This is a written reference, not coaching. Nothing in it has been "
        "checked by a physiotherapist. The finger and campus work in "
        "particular carries real injury risk, which is why the app gates the "
        "campus board behind a tested benchmark rather than behind experience. "
        "Pain that is sharp, that clicks, or that sits in a joint rather than "
        "a muscle is a stop signal, not a training cue."), st["body"]))
    return out


# ---- Assembly ---------------------------------------------------------------

def summarise(data, usage):
    """The figures printed on the cover and in the build log."""
    slugs = {EXERCISE_MAP[i] for i in usage}
    return {
        "movements": len(slugs),
        "slots": sum(len(v) for v in usage.values()),
        "variations": sum(len(us[0]["ex"].get("variations") or [])
                          for us in usage.values()),
        "circuits": sum(len(m["circuits"]) for m in data["modes"]),
        "illustrated": sum(1 for s in slugs if CONTENT[s].get("illus")),
    }


def assemble(st, data, usage, tmp, page_index):
    """The whole book as a flowable story. Run twice: see build()."""
    protocols = data.get("protocols", {})
    width = PAGE_W - 2 * MARGIN

    # Order movements by the first session they appear in, per mode.
    by_mode = {}
    seen = set()
    for mode in data["modes"]:
        for circ in mode["circuits"]:
            for lst in (circ["exercises"], circ["substitutes"]):
                for ex in lst:
                    slug = EXERCISE_MAP[ex["id"]]
                    if slug in seen:
                        continue
                    seen.add(slug)
                    by_mode.setdefault(mode["mode"], []).append(slug)

    counts = summarise(data, usage)
    story = cover(st, counts)
    story.append(NextPageTemplate("content"))
    story.append(PageBreak())
    story.extend(howto(st))
    story.append(PageBreak())

    # Contents
    story.append(SetHead("Contents"))
    story.append(Paragraph("CONTENTS", st["h1"]))
    story.append(Spacer(1, 10))
    for mode in data["modes"]:
        name = mode["mode"]
        if name not in by_mode:
            continue
        story.append(Paragraph(name, st["label"]))
        for circ in mode["circuits"]:
            line = (f"{circ['circuitNum']} {circ['title']} - {circ['subtitle']}"
                    f"  ({circ['duration']} min, recovery "
                    f"{circ['recoveryHours']}h)")
            story.append(Paragraph(flat(line), st["toc"]))
        movements = ", ".join(
            flat(usage[next(i for i, s in EXERCISE_MAP.items() if s == slug)][0]
                 ["ex"]["name"]) for slug in by_mode[name])
        story.append(Paragraph(movements, st["body_dim"]))
    story.append(PageBreak())

    # Mode sections
    for mode in data["modes"]:
        name = mode["mode"]
        if name not in by_mode:
            continue
        story.append(SetHead(name))
        story.append(Paragraph(name, st["h1"]))
        rule = Table([[""]], colWidths=[width], rowHeights=[2])
        rule.setStyle(TableStyle([("LINEABOVE", (0, 0), (-1, 0), 2.5, INK)]))
        story.append(rule)
        story.append(Spacer(1, 8))
        for circ in mode["circuits"]:
            head = (f"{circ['circuitNum']} {circ['title']} - "
                    f"{circ['subtitle']}")
            story.append(Paragraph(flat(head), st["label"]))
            story.append(Paragraph(flat(circ["focus"]), st["body"]))
            bits = [f"{circ['duration']} min",
                    f"recovery {circ['recoveryHours']}h",
                    ", ".join(circ["capacities"])]
            story.append(Paragraph(flat("  |  ".join(bits)), st["body_dim"]))
            if circ.get("note"):
                story.append(Paragraph(flat(circ["note"]), st["body_dim"]))
            story.append(Spacer(1, 4))
        story.append(PageBreak())

        for slug in by_mode[name]:
            ids = [i for i, s in EXERCISE_MAP.items() if s == slug]
            uses = [u for i in ids for u in usage.get(i, [])]
            block = exercise_story(slug, CONTENT[slug], uses, protocols,
                                   st, tmp, width)
            # Keep the heading with at least the meta table and illustration.
            story.append(KeepTogether([Mark(slug)] + block[:4]))
            story.extend(block[4:])
        story.append(PageBreak())

    story.extend(index_page(st, width, usage, page_index))
    story.extend(licence_page(st, width))
    return story


def build():
    missing, orphans = validate()
    if missing:
        sys.exit(f"Content missing for slugs: {missing}")
    if orphans:
        print(f"  warning: unreferenced content slugs: {orphans}")

    register_fonts()
    st = styles()
    data = load_programme()
    usage = index_usage(data)

    unmapped = sorted(set(usage) - set(EXERCISE_MAP))
    if unmapped:
        sys.exit(f"Exercises in the app with no form guide entry: {unmapped}")

    tmp = tempfile.mkdtemp(prefix="7bit-illus-")
    os.makedirs(OUT_DIR, exist_ok=True)

    def run(path, page_index):
        doc = Doc(path, pagesize=A4, title="7Bit Form Guide",
                  author="7Bit Circuit Training",
                  subject="Exercise form reference")
        doc.build(assemble(st, data, usage, tmp, page_index))
        return doc.page_index

    # Pass one discovers which page each movement lands on; pass two prints
    # the index with those numbers. Adding the index does not move anything
    # before it, so the numbers stay correct.
    scratch = os.path.join(tmp, "pass1.pdf")
    found = run(scratch, {})
    run(OUT_PDF, found)

    write_prompts_txt(usage)
    shutil.rmtree(tmp, ignore_errors=True)

    counts = summarise(data, usage)
    size = os.path.getsize(OUT_PDF) / 1e6
    print(f"  {OUT_PDF}  ({size:.1f} MB)")
    print(f"  {OUT_TXT}")
    print(f"  {counts['movements']} movements, {counts['slots']} slots, "
          f"{counts['illustrated']} with stock line art, "
          f"{len(found)} indexed")


def write_prompts_txt(usage):
    """Plain text copy of every prompt: PDFs are miserable to copy out of."""
    lines = [
        "7BIT FORM GUIDE - ILLUSTRATION PROMPTS",
        "",
        "One prompt per movement. Each is self-contained: paste it into an "
        "image model as-is.",
        "Generated by tools/form-guide/build.py - do not edit by hand.",
        "", "=" * 78, "",
    ]
    for slug in sorted(CONTENT):
        ids = [i for i, s in EXERCISE_MAP.items() if s == slug]
        uses = [u for i in ids for u in usage.get(i, [])]
        name = uses[0]["ex"]["name"] if uses else slug
        where = ", ".join(sorted({f"{u['mode']} {u['num']}" for u in uses}))
        has_art = "stock line art available" if CONTENT[slug].get("illus") \
            else "NO STOCK ART - this prompt is the only source"
        lines += [
            f"### {name}",
            f"# slug: {slug}  |  appears in: {where}  |  {has_art}",
            "",
            render_prompt(CONTENT[slug]["prompt"]),
            "", "-" * 78, "",
        ]
    with open(OUT_TXT, "w") as fh:
        fh.write("\n".join(lines))


if __name__ == "__main__":
    build()
