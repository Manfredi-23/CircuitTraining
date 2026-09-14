# =============================================================================
# parts_morn.py - long-form content for MORN mode.
#
# The wake-up routine: yoga mat, medium band with no anchor, small pull edge on
# a sling. Nothing here loads a tendon hard enough to cost the next session,
# which is why recoveryHours is 0 on both circuits and why none of these entries
# talk about working to failure.
#
# The cold-tissue warnings on the no-hang entry are not boilerplate. Pulleys are
# stiffest on waking, and the whole point of the morning finger dose is that it
# stays submaximal. The real finger work is HANG 03.
# =============================================================================

from style import E, prompt

CONTENT = {}

CONTENT["breathing-9090"] = E(
    steps_setup=[
        "On your back on the mat. Hips and knees BOTH at 90 degrees: feet flat on a wall, "
        "on a chair seat, or on the floor with the knees up.",
        "Arms at your sides, palms up.",
        "Press the lower back FLAT into the mat and keep it there for the whole exercise.",
        "The only rule for this session: get on the mat.",
    ],
    steps_exec=[
        "INHALE through the nose for FOUR counts. Send the air into the SIDES AND BACK of "
        "the ribcage, not into the belly. Feel the ribs widen sideways.",
        "EXHALE through pursed lips for SIX TO EIGHT counts, as if blowing out a candle "
        "slowly. Keep going until the ribs pull DOWN and the abdominal wall switches on by "
        "itself.",
        "Pause for a beat at the bottom of the exhale, empty, before the next inhale.",
        "Roughly four breath cycles, about forty seconds.",
        "HEEL PRESS VARIATION: push the heels into the wall at about 20 percent effort "
        "throughout.",
        "BAND VARIATION: hold a band overhead under light tension and pull it apart a "
        "little on each exhale.",
    ],
    checks=[
        "The lower back stays flat on the mat for every breath, including the inhale.",
        "If the lower ribs flare toward the ceiling, the exhale was too short.",
        "By breath three the abdominal wall should tighten without you consciously bracing "
        "it. That is the switch this exercise exists to flip.",
    ],
    mistakes=[
        "Belly breathing instead of rib breathing.",
        "Lower back arching off the mat.",
        "Rushing the exhale, which is the half that does the work.",
        "Skipping it because it feels too easy, which loses the switch that makes the next "
        "eight exercises work.",
    ],
    illus=None,
    illus_note="No openly-licensed frame shows the 90/90 breathing position. Generate from "
               "the prompt.",
    prompt=prompt(
        panels=[
            "INHALE. Climber lying on his back on a mat, hips and knees BOTH bent to "
            "exactly 90 degrees with the lower legs resting horizontally on a plain low "
            "chair seat. Arms relaxed at the sides, palms up. The lower back is pressed "
            "FLAT against the mat with no gap. The ribcage is shown WIDENING SIDEWAYS. "
            "Side view.",
            "EXHALE. The same position, but the ribcage has visibly drawn DOWN and IN "
            "toward the hips, the lower ribs flattened, the abdominal wall drawn tight. "
            "The lower back is still flat on the mat.",
            "INCORRECT. The same position but with the lower ribs FLARED UP toward the "
            "ceiling and a clear GAP between the lower back and the mat.",
        ],
        equipment="A plain exercise mat and a plain low chair. Nothing else.",
        angles="Hips and knees at EXACTLY 90 degrees in all three panels. In panels 1 and 2 "
               "the lumbar spine touches the mat along its whole length with no gap. Panel "
               "3 shows the gap and the rib flare, and differs in nothing else.",
        arrows="In panel 1, orange arrows pointing OUTWARD at both sides of the ribcage "
               "with the label '4 counts in, nose'. In panel 2, orange arrows pointing DOWN "
               "and IN at the ribcage with the label '6 to 8 counts out, pursed lips'. In "
               "panel 3, an orange X and a small orange arc highlighting the gap under the "
               "lower back.",
    ),
)

CONTENT["dead-bug"] = E(
    steps_setup=[
        "On your back, arms straight up over the chest, hips and knees at 90 degrees.",
        "Press the lower back FLAT into the mat. This contact is the exercise.",
        "BAND VERSION: loop the band around both arches and hold one end in each hand, arms "
        "vertical, band under light tension. The band loads both directions so the return "
        "is working too.",
        "SLOW VERSION: no band at all. The tempo is the load, roughly two seconds out and "
        "two seconds back.",
    ],
    steps_exec=[
        "Extend ONE LEG long and low while the OPPOSITE ARM reaches back overhead.",
        "Go only as far as the lower back stays glued down. That limit is different for "
        "everyone and it changes day to day.",
        "Return under control. Do not let a band snap the limbs back: resist it.",
        "Alternate sides. Left plus right is two reps.",
        "Sixteen reps in circuit 01 with the band, fourteen slow reps in circuit 02 without.",
    ],
    checks=[
        "Imagine a strip of paper under your lower back that someone is trying to pull out. "
        "Your job for the whole set is to trap it.",
        "Opposite arm and opposite leg, every rep.",
        "If you have to hold your breath, shorten the range.",
    ],
    mistakes=[
        "Lower back arching as the leg lowers. The moment the paper slips free, you went "
        "too far.",
        "Arm and leg on the same side.",
        "Racing the reps, which is especially wrong on the slow version where the tempo IS "
        "the load.",
        "Letting the band snap the limbs back instead of resisting it.",
    ],
    illus=("banded-dead-bug", [1, 2, 3]),
    illus_note=None,
    prompt=prompt(
        panels=[
            "START. Climber on his back on a mat, both arms reaching straight UP toward the "
            "ceiling over the chest, hips and knees BOTH at 90 degrees so the shins are "
            "horizontal. Lower back pressed FLAT into the mat. Side view.",
            "EXTENDED. The same figure with the RIGHT leg extended long and low, hovering "
            "just above the mat, and the LEFT arm reaching back overhead toward the floor "
            "behind the head. The other arm and leg remain in the start position. THE LOWER "
            "BACK IS STILL FLAT against the mat.",
            "INCORRECT. The same extended position but with the lower back ARCHED and a "
            "clear gap beneath it, the ribcage flared. The limbs have reached further than "
            "the trunk can control.",
        ],
        equipment="A plain exercise mat. Optionally a light band looped around both arches "
                  "with the ends held in the hands. Nothing else.",
        angles="Opposite arm and opposite leg in panels 2 and 3, never the same side. In "
               "panel 2 the lumbar spine touches the mat along its whole length. Panel 3 "
               "differs only by the arch and the gap.",
        arrows="A small orange horizontal strip drawn under the lower back in panels 1 and "
               "2 labelled 'trap this', shown pinned flat. In panel 3 the same strip is "
               "shown slipping out through the gap, with an orange X in the panel corner.",
    ),
)

CONTENT["hollow-body"] = E(
    steps_setup=[
        "On your back on the mat.",
        "Press the lower back into the mat and SQUEEZE THE RIBS DOWN toward the hips. Both, "
        "before you lift anything.",
        "TUCKED: knees drawn to the chest, hands reaching past the knees, shoulder blades "
        "just off the mat.",
        "FULL: arms extended overhead by the ears, legs straight and held low.",
    ],
    steps_exec=[
        "Hold the shape. The shape is the entire exercise.",
        "The longer the arms and legs, the harder the lever. LENGTHEN ONLY AS FAR AS THE "
        "LOWER BACK STAYS GLUED DOWN.",
        "Twenty-five seconds, two sets, twenty-five seconds rest.",
        "ROCKS VARIATION: keep the identical rigid shape and rock from the shoulders to the "
        "hips using the CURVE OF THE BACK. Never bend in the middle. The shape does not "
        "change; it just travels.",
        "Progress: two clean 25 second holds, then lengthen the lever. Knees out, then arms "
        "overhead, then rocks.",
    ],
    checks=[
        "No gap under the lower back at any point.",
        "Chin slightly tucked but not jammed to the chest, neck long.",
        "If the lower back lifts on the inhale, bend the knees more.",
    ],
    mistakes=[
        "Lower back arching, which loses the whole exercise.",
        "Chin jammed to the chest.",
        "Arms drifting down toward the hips to compensate, which shortens the lever without "
        "admitting it.",
        "Holding to failure on day one and dreading it tomorrow. This is a daily routine.",
    ],
    illus=("hollow-body-hold", [1, 2]),
    illus_note=None,
    prompt=prompt(
        panels=[
            "TUCKED. Climber on his back on a mat, knees drawn up toward the chest, hands "
            "reaching forward past the outside of the knees, shoulder blades lifted just "
            "off the mat, chin slightly tucked, lower back pressed FLAT into the mat. "
            "Side view.",
            "FULL. The same climber with the arms extended straight back overhead beside "
            "the ears and the legs straight and lowered to hover about 15cm above the mat. "
            "The body forms one long shallow banana curve with the lower back still pressed "
            "flat against the mat.",
            "ROCKS. The same FULL shape shown mid-rock, tipped slightly so more weight is "
            "on the upper back, with the body shape completely UNCHANGED, rocking on the "
            "curve of the back like a rocking chair.",
        ],
        equipment="A plain exercise mat. Nothing else.",
        angles="In ALL THREE panels the lumbar spine touches the mat and the rib cage is "
               "drawn down. The body shape in panel 3 is IDENTICAL to panel 2, only its "
               "angle on the mat differs: it must not bend in the middle.",
        arrows="A small orange arrow pointing at the lower back where it meets the mat in "
               "panels 1 and 2, with a cross-mark showing no gap. A curved orange "
               "double-headed rocking arrow beneath the body in panel 3 showing the "
               "direction of travel.",
        extra="A progression ladder read left to right: tucked, full, rocks.",
    ),
)

CONTENT["band-leg-lowers"] = E(
    steps_setup=[
        "On your back, legs up toward the ceiling.",
        "Hands flat UNDER THE GLUTES at first. Move them to your sides once the position "
        "holds without help.",
        "Band over both arches with the ends held at the chest, so it resists the legs "
        "coming down.",
        "Lower back flat before the first rep.",
    ],
    steps_exec=[
        "Lower BOTH LEGS slowly toward the floor.",
        "STOP THE INSTANT the lower back starts to arch. That point is your range today.",
        "Pause a beat at the bottom of your range.",
        "Return to vertical, exhaling hard on the way up. The exhale keeps the ribs down.",
        "Twelve reps. Bend the knees to shorten the lever if the straight-leg version breaks "
        "the position.",
        "Progress: STRAIGHTEN THE LEGS BEFORE YOU SLOW THE TEMPO. Then take five seconds on "
        "the lowering.",
    ],
    checks=[
        "The lower back never leaves the mat.",
        "The legs move under control both directions. No bouncing at the bottom.",
        "The head stays down and the neck relaxed.",
    ],
    mistakes=[
        "Arching the lower back to gain range you cannot control.",
        "Yanking the legs back up with the hip flexors instead of controlling them with the "
        "trunk.",
        "Bouncing at the bottom.",
        "Straining the neck instead of leaving the head down on the mat.",
    ],
    illus=("lying-leg-raise", [1, 2]),
    illus_note=None,
    prompt=prompt(
        panels=[
            "TOP. Climber on his back on a mat with both legs straight and raised VERTICAL "
            "toward the ceiling, a band looped over both arches with its ends held in both "
            "hands at the chest, hands flat under the glutes or at the sides, lower back "
            "pressed flat. Side view.",
            "BOTTOM. The same figure with both straight legs LOWERED to about 30 degrees "
            "above the floor, band stretched and under tension. The LOWER BACK IS STILL "
            "FLAT against the mat, ribs down.",
            "INCORRECT. The legs lowered further, almost to the floor, but with the lower "
            "back ARCHED clear of the mat and the ribs flared. This is what going past your "
            "range looks like.",
        ],
        equipment="A plain exercise mat and a resistance band drawn as two clean parallel "
                  "lines from the arches to the chest. Nothing else.",
        angles="Legs straight and knees locked in all panels. In panels 1 and 2 the lumbar "
               "spine touches the mat. Panel 3 differs only by the arch and the gap.",
        arrows="An orange downward arrow tracing the path of the feet from panel 1 to panel "
               "2. A small orange bracket marking the lower-back contact in panel 2 and the "
               "same bracket showing a GAP in panel 3, with an orange X in the corner.",
    ),
)

CONTENT["side-plank-reach-through"] = E(
    steps_setup=[
        "On your side, ELBOW DIRECTLY UNDER THE SHOULDER, forearm flat and pointing forward.",
        "EASY: knees bent and stacked. FULL: legs straight, feet stacked or staggered.",
        "Lift the hips into ONE STRAIGHT LINE. Top arm reaching to the ceiling.",
        "Set the hips high before the first rep. They stay there.",
    ],
    steps_exec=[
        "Rotate the TORSO and thread the top arm DOWN AND THROUGH the gap under your body, "
        "reaching as far behind you as you can.",
        "The rotation comes from turning the RIBCAGE against a fixed pelvis. That is where "
        "the obliques live.",
        "Rotate back and reach the arm to the ceiling. That is one rep.",
        "Twelve reps on one side, then switch. Hips stay high throughout.",
        "Progress: knees down until twelve clean reps, then straight legs, then hold the "
        "band in the top hand.",
    ],
    checks=[
        "The hips do not dip between reps. If they do, drop to knees down.",
        "The elbow stays under the shoulder, not creeping forward.",
        "The ribcage turns, not just the arm.",
    ],
    mistakes=[
        "Hips sagging between reps, which turns this into a shoulder exercise.",
        "Elbow ahead of the shoulder instead of under it.",
        "Threading with the arm alone while the ribcage stays still.",
        "Uneven reps left versus right.",
    ],
    illus=("side-plank-hip-dip", [1, 2]),
    illus_note="Stock frames show the side plank base. The thread-through rotation is "
               "drawn from the prompt.",
    prompt=prompt(
        panels=[
            "OPEN. Climber in a side plank on one forearm, elbow DIRECTLY under the "
            "shoulder, legs straight and feet stacked, hips lifted so the body is one "
            "straight line from feet to head. The top arm reaches straight UP toward the "
            "ceiling, chest open and facing forward. Front three-quarter view.",
            "THREADED. The same side plank with the hips STILL HIGH, but the torso has "
            "rotated so the top arm has threaded DOWN and THROUGH the gap beneath the body, "
            "reaching far behind. The ribcage has visibly turned while the hips stay square "
            "and lifted.",
            "INCORRECT. The same threading position but with the HIPS SAGGING toward the "
            "floor, the body no longer a straight line.",
        ],
        equipment="A plain exercise mat. Nothing else.",
        angles="The supporting elbow is DIRECTLY under the shoulder in all panels. In "
               "panels 1 and 2 the body is one straight line with the hips fully lifted. In "
               "panel 2 the rotation is clearly in the RIBCAGE and shoulders, not just the "
               "arm. Panel 3 differs only by the sagging hips.",
        arrows="A dashed orange straight line through the body in panels 1 and 2 showing "
               "the plank. An orange curved arrow at the RIBCAGE in panel 2 showing where "
               "the rotation originates. An orange X in the corner of panel 3 with a small "
               "downward arrow at the dropped hip.",
    ),
)

CONTENT["half-kneeling-pressout"] = E(
    steps_setup=[
        "Half-kneeling: one knee down on the mat, the other foot forward and flat. Set the "
        "front foot far enough forward to give you a real base.",
        "TRAP ONE END OF THE BAND under the down knee, or under the front foot on that same "
        "side. Other end in both hands at the sternum.",
        "The band now pulls DIAGONALLY DOWN AND ACROSS and will try to twist and bend you "
        "toward it.",
        "Squeeze the DOWN-SIDE GLUTE and stand tall through the spine.",
    ],
    steps_exec=[
        "Press both hands STRAIGHT OUT from the chest to full arm extension.",
        "The band gets harder as the hands travel, so the hardest point is full extension.",
        "Hold a beat at full extension.",
        "Return the hands to the sternum under control.",
        "Ten reps, then swap knees AND band side.",
        "Progress: add a 3 second hold at full extension, then move to tall kneeling, then "
        "press overhead.",
    ],
    checks=[
        "The ribcage does not turn and the torso does not tip toward the anchor.",
        "The hips stay SQUARE. They must not shift sideways to compensate.",
        "You are not trying to twist. You are refusing to.",
    ],
    mistakes=[
        "Rotating or side-bending toward the band, which loses the entire point.",
        "A band too light to feel, which makes the whole set decorative.",
        "Front foot too close to the knee, killing the base.",
        "Hips shifting instead of staying square.",
    ],
    illus=("half-kneeling-pallof-press", [1, 2]),
    illus_note=None,
    prompt=prompt(
        panels=[
            "START. Climber in a half-kneeling position on a mat: right knee down, left "
            "foot forward and flat, torso tall and vertical. A band runs from under the "
            "RIGHT KNEE diagonally up to both hands held together at the sternum. Front "
            "three-quarter view.",
            "PRESSED OUT. The same half-kneeling position with both arms extended STRAIGHT "
            "forward from the sternum, band stretched taut and under obvious tension. The "
            "torso is still perfectly UPRIGHT and SQUARE, with no twist toward the band and "
            "no side-bend.",
            "INCORRECT. The same pressed-out position but with the torso visibly TWISTED "
            "and TIPPED toward the band anchor, one shoulder dropped, hips shifted sideways.",
        ],
        equipment="A plain exercise mat and a resistance band drawn as two clean parallel "
                  "lines running from beneath the down knee to the hands. Nothing else.",
        angles="Front knee and down knee both at roughly 90 degrees. Torso VERTICAL and "
               "square in panels 1 and 2, hips level. Panel 3 differs only by the twist, "
               "the tip and the shifted hips.",
        arrows="An orange straight arrow showing the hands travelling forward in panel 2. A "
               "separate orange curved arrow showing the band's rotational pull, crossed "
               "with a small orange X to mark that this rotation must NOT happen. An orange "
               "X in the corner of panel 3.",
    ),
)

CONTENT["standing-band-chop"] = E(
    steps_setup=[
        "Stand on ONE END of the band with the left foot, feet shoulder width.",
        "Other end in both hands, arms fairly straight, hands down by the LEFT HIP, band "
        "already under tension before the first rep.",
        "Soft knees, tall chest.",
        "This is the first standing exercise in the session, by design. You are getting up.",
    ],
    steps_exec=[
        "Pull the band DIAGONALLY UP AND ACROSS the body.",
        "Finish with the hands HIGH OUTSIDE THE RIGHT SHOULDER and the ribcage rotating to "
        "follow.",
        "Drive the rotation from the RIBS and the front-side obliques. Your arms are a "
        "rope; your trunk is the winch.",
        "Control it back down to the left hip. Do not let the band snap you down.",
        "Twelve reps on one diagonal, then stand on the other end and reverse.",
        "Progress: add a 2 second hold at the top, then move to a split stance so the trunk "
        "does more of the work.",
    ],
    checks=[
        "The torso genuinely rotates. If the arms travel and the chest stays still, nothing "
        "is training.",
        "No leaning back to get the hands higher.",
        "Equal counts left and right.",
    ],
    mistakes=[
        "Chopping with the arms while the torso stays still.",
        "Leaning back to gain height, which loads the lower back instead of the obliques.",
        "Letting the band snap you down on the return.",
        "Uneven counts left versus right, which is how obliques get built asymmetrically.",
    ],
    illus=("banded-woodchop", [1, 2, 3]),
    illus_note=None,
    prompt=prompt(
        panels=[
            "START LOW. Climber standing with feet shoulder width, the LEFT FOOT standing "
            "on one end of a resistance band. Both hands hold the other end together, arms "
            "fairly straight, hands down beside the LEFT HIP, band already under tension. "
            "Knees soft, chest tall. Front three-quarter view.",
            "MID CHOP. The same figure with the hands travelling diagonally up across the "
            "body to roughly chest height, the RIBCAGE beginning to rotate to the right, "
            "band stretched.",
            "FINISH HIGH. The same figure with the hands finished HIGH outside the RIGHT "
            "SHOULDER, arms extended, the ribcage clearly rotated to the right, torso still "
            "upright with NO backward lean, both feet flat on the floor.",
        ],
        equipment="A plain resistance band drawn as two clean parallel lines from beneath "
                  "the left foot to the hands. Nothing else.",
        angles="The spine stays UPRIGHT in all three panels: no backward lean at the "
               "finish. The rotation is visible in the RIBCAGE and shoulders, not just the "
               "arms. Both feet stay flat on the floor.",
        arrows="A long orange diagonal arrow tracing the path of the hands from the left hip "
               "to outside the right shoulder, spanning all three panels. A separate small "
               "orange curved arrow at the RIBCAGE in panel 3 marking where the rotation "
               "comes from.",
    ),
)

CONTENT["pull-edge-nohang"] = E(
    steps_setup=[
        "Loop the sling around ONE FOOT and sit or stand with that leg out in front. Edge "
        "in one hand.",
        "BECAUSE THE LEG SETS THE LOAD, you decide exactly how hard this is. That is what "
        "makes it safe first thing in the morning.",
        "OPEN HAND: joints mostly extended, only the base knuckle flexed. HALF-CRIMP: middle "
        "joints near 90 degrees, fingertip joints still slightly curved, THUMB OFF the index "
        "finger.",
        "Elbow slightly bent, shoulder packed down.",
    ],
    steps_exec=[
        "BUILD TENSION GRADUALLY over the first two seconds by pressing down through the "
        "foot. NEVER SNATCH AT IT.",
        "Hold ten seconds at roughly 40 to 50 percent of what you could pull. In circuit 02 "
        "the open-hand version is lighter still, 30 to 40 percent: circulation, not strength.",
        "Release over a second. Swap hands.",
        "One primer set per hand. This is NOT a density block: the full 10 x 10s protocol "
        "is HANG 03.",
        "ROLL VARIATION: slowly curl the fingers from open hand toward half-crimp and back "
        "once during the hold, moving through the range under gentle load.",
        "Progress by FREQUENCY, not load. Daily for a month, then a second block at least "
        "six hours later, before you ever pull harder than half.",
    ],
    checks=[
        "Breathing completely relaxed for the full ten seconds. If you are bracing, back "
        "the load off.",
        "Thumb clearly OFF the index finger. A wrapped thumb makes it a full crimp.",
        "Nothing clicks, pinches or feels sharp.",
    ],
    mistakes=[
        "Going near maximal on cold tendons. Finger tendons are stiffest and least "
        "hydrated on waking, and a hard morning pull is how climbers collect pulley "
        "injuries.",
        "Snatching the load on rather than building it over two seconds.",
        "Thumb wrapped over the index finger.",
        "Continuing through any click, pinch or sharp point. Stop and skip it for the day: "
        "skipping costs nothing in this app.",
        "Doing it first, before anything else is warm. It goes last, after the trunk work.",
    ],
    illus=None,
    illus_note="No openly-licensed frame shows a no-hang device. This is the highest-risk "
               "movement in MORN and the illustration matters. Generate from the prompt.",
    prompt=prompt(
        panels=[
            "SETUP. Climber seated upright on a mat with one leg extended straight forward. "
            "A sling loops around the arch of that extended FOOT and runs up to a small "
            "flat pull edge held in one hand at about waist height. The elbow is slightly "
            "bent and the shoulder is packed down. He is relaxed and upright, clearly not "
            "straining. Side view.",
            "OPEN HAND, CORRECT. A large anatomical close-up of the hand on the small edge: "
            "the fingers DRAPED with all their joints close to STRAIGHT, only the base "
            "knuckles flexed, the thumb hanging free and clearly NOT touching the index "
            "finger.",
            "HALF-CRIMP, CORRECT. The same close-up but with the middle knuckles bent to "
            "roughly 90 degrees and the fingertip joints slightly curved. The THUMB IS "
            "STILL OFF, resting alongside the hand and not over the index finger.",
            "FULL CRIMP, INCORRECT. The same close-up with the THUMB WRAPPED OVER THE TOP "
            "of the index fingernail, locking the grip. This position must not be used here.",
        ],
        equipment="A plain webbing sling, a small flat rectangular pull edge, a plain "
                  "exercise mat. Nothing else.",
        angles="Panel 1 must make it obvious that the LEG, not bodyweight, sets the load: "
               "the foot presses down against the sling and the climber's posture is "
               "relaxed. Panels 2, 3 and 4 differ only in finger and thumb position.",
        arrows="An orange arrow at the foot in panel 1 pressing DOWN, labelled 'leg sets "
               "the load', and an orange '40-50%' label beside the arm. An orange tick in "
               "the corners of panels 2 and 3, an orange X in the corner of panel 4, with a "
               "small orange arrow pointing at the thumb in all three close-ups.",
        extra="Draw the hands very large and anatomically exact: four fingers plus thumb, "
              "correct joint count, no fused or warped digits. The thumb position is the "
              "whole instructional point of panels 2 to 4.",
    ),
)

CONTENT["stomach-vacuum"] = E(
    steps_setup=[
        "SUPINE: on your back, knees bent, feet flat. QUADRUPED: hands and knees, flat back. "
        "STANDING: feet shoulder width, hands on the thighs.",
        "Each position removes a little help from gravity, which is why they unlock in that "
        "order.",
        "Best done fasted, before breakfast. That is genuinely the easiest time to get a "
        "full contraction.",
    ],
    steps_exec=[
        "EXHALE EVERY LAST BIT OF AIR. Empty the lungs completely. This has to happen first: "
        "you cannot draw the abdominal wall in around a full ribcage.",
        "With the lungs EMPTY and WITHOUT BREATHING IN, pull the navel UP AND BACK toward "
        "the spine as hard as you can.",
        "Hold for fifteen seconds.",
        "Release and breathe normally before the second set.",
        "Two sets, fifteen seconds each, fifteen seconds rest.",
        "Progress: supine until fifteen seconds is comfortable, then quadruped, then standing.",
    ],
    checks=[
        "The hold happens on EMPTY lungs. No air held in.",
        "Nothing shortens. Everything draws INWARD. This is not a crunch.",
        "Come out of it the moment you need to breathe.",
    ],
    mistakes=[
        "Sucking in without exhaling first, which cannot work around a full ribcage.",
        "Holding until lightheaded.",
        "Doing it on a full stomach.",
        "Confusing it with a crunch. The trunk does not flex at all here.",
    ],
    illus=None,
    illus_note="No openly-licensed frame shows a stomach vacuum. Generate from the prompt.",
    prompt=prompt(
        panels=[
            "FULL EXHALE. Climber on hands and knees on a mat with a flat neutral back, "
            "having just blown all the air out: the ribcage is drawn down, the abdomen "
            "relaxed and hanging slightly. Side view, close framing on the torso.",
            "VACUUM. The same quadruped position with the lungs still EMPTY and the abdomen "
            "drawn sharply UP AND IN toward the spine, creating a deep visible hollow under "
            "the ribcage. The back stays FLAT and neutral: the spine does not round or arch.",
            "PROGRESSION POSITIONS. Three small figures side by side at reduced scale: one "
            "lying supine with knees bent, one on hands and knees, one standing with hands "
            "on the thighs, each showing the same drawn-in abdomen.",
        ],
        equipment="A plain exercise mat. Nothing else.",
        angles="The spine stays NEUTRAL and flat in panels 1 and 2: the difference between "
               "them is ONLY the abdominal wall drawing inward, never spinal flexion. Do "
               "not draw a rounded cat-stretch back.",
        arrows="Orange arrows at the abdomen in panel 2 pointing UP and IN toward the "
               "spine. An orange 'lungs empty' label with a small crossed-out breath symbol "
               "in both panels 1 and 2. Small orange numbers 1, 2, 3 above the three "
               "figures in panel 3 marking the unlock order.",
    ),
)

CONTENT["supine-twist"] = E(
    steps_setup=[
        "On your back, arms out wide in a T, palms up.",
        "Draw both knees toward the chest.",
        "Let the knees fall together to one side while keeping BOTH SHOULDER BLADES ON THE "
        "FLOOR.",
    ],
    steps_exec=[
        "Rest and breathe for twenty seconds, letting the knees sink a little lower on each "
        "exhale.",
        "The point is NOT slamming the knees to the floor. It is keeping the far shoulder "
        "pinned while the pelvis rotates away from it. That is where the rotation actually "
        "happens.",
        "Switch sides.",
        "REACH VARIATION: actively press the opposite arm along the floor away from the "
        "knees, which pulls the stretch further up the obliques and lats.",
        "Four or five slow breaths per side.",
    ],
    checks=[
        "Both shoulder blades stay in contact with the floor.",
        "The knees sink on the exhale rather than being forced.",
        "Both sides get equal time.",
    ],
    mistakes=[
        "Letting the top shoulder peel off the mat, which turns it into a shrug and removes "
        "the stretch.",
        "Forcing the knees down.",
        "Skipping the second side because the first got comfortable.",
    ],
    illus=("torso-twist-stretch", [1]),
    illus_note=None,
    prompt=prompt(
        panels=[
            "Climber lying on his back on a mat, arms stretched out WIDE in a T with palms "
            "up, both knees bent and fallen together to the LEFT side so they rest toward "
            "the floor. BOTH SHOULDER BLADES REMAIN FLAT ON THE MAT, the head turned gently "
            "to the right. Viewed from directly above.",
            "INCORRECT. The same position but with the RIGHT shoulder blade PEELED UP off "
            "the mat as the knees pull it over, so the twist has been lost.",
        ],
        equipment="A plain exercise mat. Nothing else.",
        angles="Panel 1: both shoulder blades in full contact with the mat, knees stacked "
               "and fallen to one side, head turned away from the knees. Panel 2 differs "
               "ONLY in the lifted shoulder.",
        arrows="An orange downward arrow pressing on the far shoulder in panel 1 with the "
               "label 'keep this down'. An orange curved arrow at the pelvis showing it "
               "rotating away. An orange X in the corner of panel 2 with a small arrow at "
               "the lifted shoulder.",
    ),
)

CONTENT["cat-cow-thread"] = E(
    steps_setup=[
        "On hands and knees. Hands under the shoulders, knees under the hips.",
        "Spine long and neutral to start.",
        "Eight cat-cow, then four threads alternating.",
    ],
    steps_exec=[
        "COW: let the belly drop, lift the chest and the tailbone. Inhale into it.",
        "CAT: press the floor away, round the whole spine, tuck the tailbone. Exhale into it.",
        "MOVE ONE VERTEBRA AT A TIME. Move slowly enough to feel each one arrive. Eight "
        "full cycles.",
        "THREAD THE NEEDLE: from neutral, thread one arm UNDER the body and across until "
        "the shoulder and the side of the head rest on the mat.",
        "Unwind and reach that same arm up to the ceiling, opening the chest. Alternate "
        "sides. Four threads total.",
    ],
    checks=[
        "The spine moves segment by segment, not as one rigid block.",
        "The hands stay under the shoulders and do not drift forward.",
        "The neck follows the spine rather than being cranked.",
    ],
    mistakes=[
        "Moving the spine as one rigid block.",
        "Cranking the neck at the ends of the range.",
        "Hands drifting ahead of the shoulders.",
        "Speeding up. This is the wake-up, not the workout.",
    ],
    illus=("cat-cow-stretch", [1, 2]),
    illus_note="Stock frames show cat and cow. The thread-through is drawn from the prompt.",
    prompt=prompt(
        panels=[
            "COW. Climber on hands and knees on a mat, hands under shoulders and knees "
            "under hips, with the belly dropped, the chest lifted and the tailbone tilted "
            "up, so the spine forms a smooth downward curve. Side view.",
            "CAT. The same quadruped position with the whole spine ROUNDED upward, tailbone "
            "tucked under, head released down, forming a smooth upward arc.",
            "THREAD THE NEEDLE. The same quadruped base, but one arm has threaded UNDER the "
            "body and across to the opposite side, so that shoulder and the side of the head "
            "rest on the mat, the torso rotated. The other hand stays planted.",
            "UNWIND. The same base with that arm now reaching straight UP toward the "
            "ceiling, chest opened and rotated upward, gaze following the hand.",
        ],
        equipment="A plain exercise mat. Nothing else.",
        angles="Hands stay under the shoulders and knees under the hips in ALL FOUR panels. "
               "In panels 1 and 2 the spinal curve is smooth and continuous, not hinged at "
               "one point. The neck follows the line of the spine, never cranked.",
        arrows="Orange curved arrows along the spine in panels 1 and 2 showing the direction "
               "of the curl. An orange arrow showing the threading path of the arm in panel "
               "3 and the upward reach in panel 4.",
        extra="Four stages of one flow, read left to right. Same figure, same scale.",
    ),
)

CONTENT["hip-switch-9090"] = E(
    steps_setup=[
        "Sit with BOTH KNEES BENT AT 90 DEGREES: one leg in front, one out to the side, "
        "both shins flat on the floor.",
        "Sit TALL. If the lower back rounds, sit up on a folded edge of the mat.",
        "Hands light on the floor for balance to start. Lose them as soon as you can.",
    ],
    steps_exec=[
        "WITHOUT PUSHING OFF THE HANDS, lift both knees and rotate them through the middle "
        "to the mirror-image position on the other side.",
        "Slow and controlled. The middle of the rotation is the part that matters and the "
        "part everyone rushes.",
        "Left plus right is two reps. Twelve reps.",
        "LIFT VARIATION: pause with the knees off the floor mid-rotation.",
        "Progress: lose the hands first, then add the mid-rotation pause.",
    ],
    checks=[
        "The lower back stays long and the chest stays tall.",
        "Both knees stay at 90 degrees throughout.",
        "The hands are not doing the work.",
    ],
    mistakes=[
        "Pushing off the hands.",
        "Rounding the lower back to compensate for tight hips. Sit on a folded mat edge "
        "instead.",
        "Rushing the middle rather than controlling it.",
    ],
    illus=None,
    illus_note="No openly-licensed frame shows the 90/90 hip switch. Generate from the "
               "prompt.",
    prompt=prompt(
        panels=[
            "RIGHT SIDE. Climber seated on a mat with BOTH knees bent to 90 degrees: the "
            "right leg folded in FRONT with the shin across the body, the left leg folded "
            "OUT TO THE SIDE, both shins flat on the floor. Sitting TALL with a long flat "
            "lower back, hands resting lightly on the floor. Three-quarter view from above "
            "and in front.",
            "MID ROTATION. The same figure with BOTH KNEES LIFTED off the floor, passing "
            "through the middle of the rotation, shins in the air, torso still tall and "
            "square, hands NOT pushing off the floor.",
            "LEFT SIDE. The mirror image of panel 1: the left leg folded in front, the "
            "right leg out to the side, both shins flat, sitting tall.",
        ],
        equipment="A plain exercise mat. Nothing else.",
        angles="BOTH knees at 90 degrees in every panel. The lumbar spine stays LONG and "
               "upright in all three, never rounded. In panel 2 the hands are clearly clear "
               "of the floor or only lightly touching.",
        arrows="A large orange curved arrow sweeping across all three panels showing the "
               "knees rotating through the middle from right to left. A small orange arrow "
               "pointing at the hands in panel 2 labelled 'no push'.",
        extra="Three stages of one continuous rotation, read left to right.",
    ),
)

CONTENT["band-pull-apart"] = E(
    steps_setup=[
        "Standing tall, band in both hands IN FRONT at shoulder height, arms straight.",
        "Hands wide enough apart that there is already light tension before the first rep.",
        "Ribs down, glutes lightly on. This stops you arching to fake range.",
    ],
    steps_exec=[
        "Pull the band APART until the hands are wide and the band touches the chest, "
        "SQUEEZING THE SHOULDER BLADES together at the end.",
        "Return under control.",
        "OVERHEAD PASS: continue the hands UP AND BACK over the head as far as the shoulders "
        "allow, then reverse the same path. Widen the grip if anything pinches.",
        "Fifteen reps. Never to failure.",
        "Progress: NARROW THE GRIP before you use a heavier band. Full dislocates only when "
        "the overhead pass is painless.",
    ],
    checks=[
        "The shoulder blades do the work, not the hands.",
        "The lower back does not arch on the overhead pass.",
        "Arms stay straight. Bending the elbows is cheating the pull.",
    ],
    mistakes=[
        "Arching the lower back to fake overhead range.",
        "Shrugging toward the ears.",
        "Grip too narrow for your current mobility.",
        "Bending the elbows to cheat the pull.",
    ],
    illus=("band-pull-apart", [1, 2]),
    illus_note=None,
    prompt=prompt(
        panels=[
            "START. Climber standing tall, holding a resistance band in both hands out in "
            "FRONT at shoulder height, arms completely STRAIGHT, hands roughly shoulder "
            "width apart with the band under light tension. Ribs down, torso vertical. "
            "Front view.",
            "PULLED APART. The same figure with the arms straight and pulled WIDE apart so "
            "the band touches the chest, shoulder blades squeezed together, shoulders DOWN "
            "and not shrugged.",
            "OVERHEAD PASS. The same figure with the arms straight and the band having "
            "travelled UP and BACK over the head, hands now behind the head line, torso "
            "still VERTICAL with the ribs down and no lower-back arch.",
        ],
        equipment="A plain resistance band drawn as two clean parallel lines. Nothing else.",
        angles="Arms COMPLETELY STRAIGHT in all three panels: any elbow bend is the fault "
               "this drawing exists to prevent. Torso vertical in all three, especially "
               "panel 3, where the temptation is to arch.",
        arrows="Orange outward arrows at both hands in panel 2. A long orange arc tracing "
               "the hands' path up and over the head in panel 3. A small orange downward "
               "arrow at each shoulder marking that they stay depressed. A faint greyed "
               "arched-back figure behind panel 3 marked with a small orange X.",
    ),
)

CONTENT["bird-dog"] = E(
    steps_setup=[
        "Hands and knees, spine neutral. Hands under shoulders, knees under hips.",
        "IMAGINE BALANCING A GLASS OF WATER ON YOUR LOWER BACK that must not spill for the "
        "whole set.",
        "Head in line with the spine, gaze down at the mat.",
    ],
    steps_exec=[
        "Extend ONE ARM forward and the OPPOSITE LEG back until both are level with the "
        "torso. No higher.",
        "Hold briefly at full extension.",
        "Return WITHOUT TOUCHING DOWN, and switch sides.",
        "Twelve reps, slow and alternating.",
        "Progress: add a 3 second hold at full extension, then draw elbow to knee underneath "
        "before extending again.",
    ],
    checks=[
        "The hips stay LEVEL. They must not rotate open as the leg lifts.",
        "The leg stops at hip height. Higher means the back has arched.",
        "The moving limbs are a distraction. The exercise is the trunk refusing to rotate "
        "or tip while they move.",
    ],
    mistakes=[
        "Hips rotating open as the leg lifts.",
        "Kicking the leg above hip height and arching the back.",
        "Reaching too fast.",
        "Head lifting out of line with the spine.",
    ],
    illus=("bird-dog", [1, 2, 3]),
    illus_note=None,
    prompt=prompt(
        panels=[
            "START. Climber on hands and knees on a mat, hands under shoulders, knees under "
            "hips, spine long and NEUTRAL, head in line with the spine, gaze down. Side view.",
            "EXTENDED. The same figure with the RIGHT arm extended straight forward and the "
            "LEFT leg extended straight back, BOTH exactly LEVEL with the torso, forming "
            "one long straight line from the extended fingertips through the spine to the "
            "extended heel. The lower back stays flat and the hips stay level.",
            "INCORRECT. The same extension but with the leg KICKED UP ABOVE hip height, the "
            "lower back visibly ARCHED, and the hips rotated open so one side is higher "
            "than the other.",
        ],
        equipment="A plain exercise mat. Optionally a small glass of water balanced on the "
                  "lower back in panel 2, upright and unspilled. Nothing else.",
        angles="In panel 2 the extended arm and leg are HORIZONTAL, level with the torso, "
               "no higher. The spine is a straight neutral line. Panel 3 differs by the "
               "raised leg, the arched back and the open hip.",
        arrows="A dashed orange straight line running from the extended fingertips through "
               "the spine to the extended heel in panel 2. A small orange level-bubble or "
               "level-line across the hips in panel 2 showing them square. An orange X in "
               "the corner of panel 3, with the glass of water shown tipping and spilling.",
    ),
)

CONTENT["glute-bridge-march"] = E(
    steps_setup=[
        "On your back, feet hip-width and flat, heels about 30cm from the glutes.",
        "Arms at the sides.",
        "Band above the knees for the loaded version.",
    ],
    steps_exec=[
        "Drive through the HEELS and lift the hips to a straight line from knees to "
        "shoulders. Finish with the GLUTES, not by hyperextending the lower back.",
        "From there, lift ONE FOOT a few centimetres without letting the hips drop or tilt.",
        "Replace it, then lift the other. Left plus right is two reps.",
        "HIPS STAY HIGH FOR THE WHOLE SET. Sixteen reps.",
        "Progress: hips dead level for all sixteen first, then add the band above the knees.",
    ],
    checks=[
        "The hips do not drop the moment a foot lifts.",
        "The pelvis stays level side to side, not tilting toward the lifted leg.",
        "Drive through the heels, not the toes.",
    ],
    mistakes=[
        "Hips dropping the moment a foot lifts.",
        "Rushing.",
        "Pushing through the toes instead of the heels.",
        "Hyperextending the lower back at the top instead of finishing with the glutes.",
    ],
    illus=("glute-bridge-march", [1, 2]),
    illus_note=None,
    prompt=prompt(
        panels=[
            "BRIDGE. Climber lying on his back on a mat with both feet flat and hip-width, "
            "heels close to the glutes, hips LIFTED so the body forms a straight line from "
            "the knees through the hips to the shoulders. Arms flat at the sides. A light "
            "band sits above the knees. Side view.",
            "MARCH. The same bridged position with ONE foot lifted a few centimetres off "
            "the mat, knee still bent at 90 degrees. The HIPS REMAIN AT EXACTLY THE SAME "
            "HEIGHT as panel 1 and the pelvis is level, not tilted.",
            "FRONT VIEW. The same marching position seen from the feet end, showing both "
            "hip bones LEVEL with each other despite one foot being lifted.",
        ],
        equipment="A plain exercise mat and a light band above the knees. Nothing else.",
        angles="The hip height is IDENTICAL in panels 1 and 2: that is the checkpoint. The "
               "line from knee to shoulder is straight, with no lower-back hyperextension. "
               "In panel 3 the pelvis is level.",
        arrows="A dashed orange horizontal line at hip height drawn across BOTH panels 1 and "
               "2 at the same level, proving the hips do not drop. An orange arrow pressing "
               "down through the supporting HEEL. In panel 3, a short orange level-line "
               "across both hip bones.",
    ),
)

CONTENT["side-plank-hold"] = E(
    steps_setup=[
        "On your side, ELBOW UNDER THE SHOULDER, forearm pointing forward.",
        "EASY: knees bent and stacked. FULL: legs straight, feet stacked or staggered.",
        "Lift the hips into one straight line. Top hand on the hip or reaching up.",
    ],
    steps_exec=[
        "Hold. Push the floor away with the forearm and LIFT THE BOTTOM RIBS toward the "
        "ceiling.",
        "Twenty-five seconds. Full time on one side, then the other.",
        "ADVANCED: lift and hold the TOP LEG, adding hip abduction on top of the trunk hold.",
        "Progress: knees down until 25 seconds is easy, then straight legs, then the top "
        "leg lift.",
    ],
    checks=[
        "The bottom shoulder does not sink. If it does, you are hanging on the joint rather "
        "than holding with the trunk.",
        "You are on a true side position, not rolled forward or back.",
        "Breathing slow and even. If you cannot breathe evenly, drop to knees down.",
    ],
    mistakes=[
        "Hips sagging.",
        "Rolling forward or back off the true side position.",
        "Bottom shoulder collapsing.",
        "Forty seconds on the strong side and fifteen on the weak one. Match them.",
    ],
    illus=("side-plank", [1, 2]),
    illus_note=None,
    prompt=prompt(
        panels=[
            "KNEES DOWN. Climber in a side plank on one forearm with the elbow DIRECTLY "
            "under the shoulder, knees bent and stacked, hips lifted so the body is a "
            "straight line from knees to head. Top hand on the hip. Front three-quarter view.",
            "FULL. The same side plank with the legs STRAIGHT and the feet stacked, hips "
            "lifted so the body is one straight line from feet to head, the bottom shoulder "
            "pushed actively AWAY from the floor so it does not sink.",
            "INCORRECT. The same full position but with the HIPS SAGGING toward the floor "
            "and the bottom shoulder COLLAPSED so the head appears sunk toward it.",
        ],
        equipment="A plain exercise mat. Nothing else.",
        angles="The supporting elbow is DIRECTLY under the shoulder in all panels. In "
               "panels 1 and 2 the body is a straight line and there is a clear gap between "
               "the ear and the bottom shoulder. Panel 3 differs by the sag and the "
               "collapsed shoulder.",
        arrows="A dashed orange straight line through the body in panels 1 and 2. An orange "
               "arrow at the bottom shoulder pointing AWAY from the floor in panel 2, and a "
               "small orange bracket marking the ear-to-shoulder gap. An orange X in the "
               "corner of panel 3.",
        extra="Panels 1 and 2 are a progression, panel 3 is the common failure. Same figure "
              "and scale throughout.",
    ),
)
