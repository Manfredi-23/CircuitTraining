# =============================================================================
# parts_home.py - long-form content for HOME mode.
#
# The app already carries a short FormGuide on every exercise (setup, execution,
# cue, breathing, mistakes). That is deliberately terse: it has to fit on a
# phone card mid-set. This file is the long form. For every distinct movement in
# the programme it carries:
#
#   steps     - numbered setup and execution, written so someone who has never
#               seen the movement can build it from the page alone
#   checks    - position checkpoints: what to look for, what it should feel like
#   mistakes  - expanded failure modes, each with the correction
#   illus     - which vendored line-art frames illustrate it, if any
#   prompt    - a self-contained image-generation prompt for the illustration
#
# The prompt exists because no openly-licensed illustration library covers the
# climbing-specific half of this programme. Max hangs, repeaters, no-hangs,
# density hangs, recruitment pulls, campus ladders and the front lever ladder
# have no stock art at any license. Those are drawn from the prompt. The prompts
# are written for every movement regardless, so the whole book can be reissued
# in one visual style if you ever want to replace the stock frames.
#
# Keys are canonical movement slugs. EXERCISE_MAP in content.py binds every
# exercise id in src/core/data-*.ts to one of them.
#
# HOME - mat, pull-up bar, band, a chair.
# =============================================================================

from style import E, prompt

CONTENT = {}

CONTENT["warmup-flow"] = E(
    steps_setup=[
        "Mat down with two metres of clear floor. Band within reach. Pull-up bar accessible.",
        "Take your shoes off. You want to feel the floor for the balance work.",
        "Set a five-minute timer so you do not cut this short or drift past it.",
    ],
    steps_exec=[
        "TWO MINUTES PULSE RAISER. Anything that moves the whole body and raises the "
        "breathing rate without loading the fingers: skipping on the spot, star jumps, "
        "fast marching with big arm swings, or a brisk stair set. Finish it breathing "
        "noticeably harder but able to talk.",
        "TEN SHOULDER CIRCLES EACH DIRECTION. Arms straight, draw the largest circle the "
        "shoulder allows. Backwards first, then forwards. Slow enough that you can feel "
        "where the range runs out.",
        "FIFTEEN BAND EXTERNAL ROTATIONS PER SIDE. Elbow pinned to the ribs at 90 degrees, "
        "band held across the body, rotate the forearm out and control it back.",
        "TEN SCAPULAR PULL-UPS. Dead hang with straight arms. Without bending the elbows, "
        "pull the shoulder blades down and together so the body rises two or three "
        "centimetres, then release back to a full passive hang. Straight arms throughout.",
        "TWENTY SECONDS RELAXED DEAD HANG. Hang, breathe, let the shoulders decompress. "
        "This is the readiness check: note anything that feels tender or sharp.",
    ],
    checks=[
        "Warm and switched on, not tired. You should finish wanting to train.",
        "The last dead hang tells you what today actually is. Sharp or tender in a finger "
        "means the session gets downgraded now, not after the first working set.",
        "Sweat starting, breathing raised, joints moving freely through full range.",
    ],
    mistakes=[
        "Starting the first working set cold because the session is short. The session "
        "being short is exactly why the warm-up is not optional.",
        "Turning the pulse raiser into a workout. You are not trying to earn anything here.",
        "Doing the scapular pull-ups with bent elbows, which makes them tiny pull-ups and "
        "skips the scapular range entirely.",
    ],
    illus=("scapular-pull-up", [1, 2]),
    illus_note="Frames show the scapular pull-up, the one component of the flow that is "
               "most often done wrong. The rest of the flow is drawn from the prompt.",
    prompt=prompt(
        panels=[
            "A lean climber standing on a mat mid pulse-raiser, marching on the spot with "
            "one knee driven up to hip height and opposite arm swinging forward, upright "
            "posture, both feet visible.",
            "The same figure standing, arms straight out from the shoulders, drawing a "
            "large backward shoulder circle. Show the arc of the circle as a dashed orange "
            "ellipse traced by the fingertips.",
            "The same figure side-on, upper arm pinned against the ribs with the elbow bent "
            "to 90 degrees, holding a resistance band that runs off-frame horizontally, "
            "forearm rotated outward away from the belly.",
            "The same figure hanging from a horizontal bar with COMPLETELY STRAIGHT arms, "
            "shoulder blades pulled down and together so the head sits low between the "
            "shoulders and the ribcage has lifted slightly toward the bar. Elbows must be "
            "straight and locked, this is the critical detail.",
        ],
        equipment="A plain horizontal pull-up bar, a plain resistance band drawn as two "
                  "clean parallel lines, a plain rectangular exercise mat. No other objects.",
        angles="Panel 3: elbow exactly 90 degrees, upper arm touching the ribcage. "
               "Panel 4: elbows straight and locked, scapulae depressed and retracted, the "
               "gap between ear and shoulder deliberately large.",
        arrows="Orange curved arrow showing the shoulder circle direction in panel 2. "
               "Orange arrow showing the outward rotation path of the hand in panel 3. "
               "Orange downward arrow at each shoulder blade in panel 4, with a small "
               "orange bracket marking the ear-to-shoulder gap.",
    ),
)

CONTENT["front-lever"] = E(
    steps_setup=[
        "Hang from the bar with an overhand grip, hands roughly shoulder width.",
        "Depress the shoulders: pull the shoulder blades down and back, away from the ears. "
        "The arms stay straight for the whole exercise.",
        "Tuck the pelvis under and squeeze the glutes before you pull. Ribs pulled down "
        "toward the hips, not flared toward the bar.",
        "Pick the progression you can hold with a flat lower back, not the one you can "
        "reach. In order: tuck, advanced tuck, one-leg, straddle, full.",
    ],
    steps_exec=[
        "Keeping the elbows locked, press down and back into the bar with straight arms. "
        "The lats do this, not the biceps. The body rotates up around the shoulders.",
        "Bring the body to horizontal in your progression. TUCK: knees tight to the chest, "
        "thighs parallel to the floor. ADVANCED TUCK: knees open to roughly 90 degrees at "
        "the hip, shins parallel to the floor, back flat. ONE-LEG: one leg straight, the "
        "other tucked. STRADDLE: both legs straight and split wide. FULL: legs together.",
        "Hold. The line from shoulders to hips must stay flat. The hold ends when the "
        "lower back arches, not when the clock does.",
        "Lower with control rather than dropping out of it. The descent is free training.",
        "Rest the full two minutes between sets. This is a maximal-quality hold, not "
        "conditioning.",
    ],
    checks=[
        "A straight line, or a slight hollow, from shoulder to hip. Never an arch.",
        "Elbows locked. If they bend, the lats have given up and the arms have taken over.",
        "Shoulders pulled down. If the shoulders ride up toward the ears the position is "
        "already failing.",
        "You should feel this across the lats, the lower abs and the glutes at once. If it "
        "is only abs, you are not pressing into the bar.",
    ],
    mistakes=[
        "Arching the back to make it easier. This is the universal cheat and it removes the "
        "exact thing the exercise trains. Regress a progression instead.",
        "Bending the arms. It turns a lat and trunk exercise into a weak row.",
        "Skipping ahead a progression before the current one is solid. Five clean sets of "
        "twelve seconds is the gate, and it is not negotiable.",
        "Holding the breath for ten seconds, which raises intra-abdominal pressure but "
        "leaves you unable to finish the set.",
    ],
    illus=None,
    illus_note="No openly-licensed illustration exists for the front lever ladder. "
               "Generate from the prompt.",
    prompt=prompt(
        panels=[
            "TUCK FRONT LEVER. A lean climber hanging from a horizontal bar with both arms "
            "completely straight, body rotated back so the torso is horizontal and facing "
            "the ceiling, knees pulled tight to the chest, thighs parallel to the floor, "
            "back flat. Side view, full profile.",
            "ADVANCED TUCK FRONT LEVER. Same hang, same straight arms, torso horizontal, "
            "but the hips have opened to roughly 90 degrees so the thighs point down-ish "
            "and the shins are horizontal. The lower back is visibly FLAT, not arched.",
            "ONE-LEG FRONT LEVER. Same hang, one leg fully straight and horizontal in line "
            "with the torso, the other knee tucked to the chest.",
            "STRADDLE FRONT LEVER. Same hang, both legs straight and split wide apart, body "
            "horizontal, toes pointed.",
            "FULL FRONT LEVER. Same hang, the entire body one perfectly straight horizontal "
            "line from hands to pointed toes, parallel to the floor.",
        ],
        equipment="A single plain horizontal bar at the top of each panel. Nothing else.",
        angles="In EVERY panel: elbows completely straight and locked, shoulder blades "
               "depressed, torso horizontal and parallel to the floor, lower back FLAT with "
               "a very slight posterior pelvic tilt. Under no circumstances draw an arched "
               "lower back.",
        arrows="A thin dashed orange horizontal reference line running through the torso in "
               "every panel to show the body is parallel to the floor. A short orange arrow "
               "at the shoulder in panel 1 pointing down and back, labelled with the number "
               "1, indicating the straight-arm press into the bar.",
        extra="This is a progression ladder read left to right, easiest to hardest. The "
              "figure, the bar and the scale must be identical in all five panels so only "
              "the leg position changes.",
    ),
)

CONTENT["hanging-leg-raise"] = E(
    steps_setup=[
        "Dead hang from the bar, overhand grip, hands shoulder width.",
        "Pack the shoulders before the first rep: pull the blades down and back so you are "
        "hanging actively, not sagging in the sockets.",
        "Let the body come completely still. Never start the first rep on a swing.",
    ],
    steps_exec=[
        "Tilt the pelvis under first, then raise the legs. Leading with the pelvis is what "
        "makes this a trunk exercise rather than a hip flexor exercise.",
        "Raise to your progression. KNEE RAISE: knees to the chest. STRAIGHT LEG: straight "
        "legs to horizontal. TOES TO BAR: continue until the toes touch the bar between "
        "the hands.",
        "Pause for a beat at the top. The pause is what kills the swing.",
        "Lower slowly and under control, resisting the whole way down. On the three-second "
        "lower variation, count it out.",
        "Come to a complete stop at the bottom. If the body is swinging, kill the swing "
        "before the next rep rather than using it.",
    ],
    checks=[
        "The shoulders stay packed for all eight reps, including the last one.",
        "No forward-backward swing. If there is a swing, the reps are being thrown.",
        "The lower abs are doing the work at the top of the rep, not just the front of the hips.",
    ],
    mistakes=[
        "Swinging into each rep. It moves the legs without loading the trunk and it is the "
        "reason most people's leg raises never get harder.",
        "Letting the shoulders go passive at the bottom, which hangs the whole body weight "
        "off the shoulder capsule.",
        "Chasing toes-to-bar before straight-leg raises are clean.",
        "Rushing the lowering phase, which throws away half the exercise.",
    ],
    illus=("hanging-leg-raise", [1, 2, 3]),
    illus_note=None,
    prompt=prompt(
        panels=[
            "HANGING KNEE RAISE. Climber in a dead hang from a bar, shoulders packed down, "
            "knees drawn up to the chest, pelvis tilted under. Side view.",
            "HANGING STRAIGHT LEG RAISE. Same hang, legs completely straight and raised to "
            "horizontal, forming a clean L shape with the torso.",
            "TOES TO BAR. Same hang, body curled so both feet have risen all the way to "
            "touch the bar between the hands, legs straight.",
        ],
        equipment="A single plain horizontal bar at the top of each panel.",
        angles="Shoulders depressed and packed in all three panels, with a visible gap "
               "between ear and shoulder. Panel 2: hip at exactly 90 degrees, knees locked "
               "straight. Pelvis tucked under in all panels.",
        arrows="Orange curved arrow tracing the upward path of the feet in each panel. A "
               "small orange arrow at the pelvis in panel 1 showing the posterior tilt.",
        extra="A progression ladder read left to right. Same figure, same bar, same scale.",
    ),
)

CONTENT["hollow-arch"] = E(
    steps_setup=[
        "HOLLOW: lie on your back on the mat, knees to the chest, hands by your ears.",
        "Press the lower back hard into the floor and keep it there. That contact is the "
        "whole exercise. Squeeze the ribs down toward the hips.",
        "ARCH: lie face down, arms extended overhead, forehead resting on the mat.",
    ],
    steps_exec=[
        "HOLLOW. With the lower back glued to the floor, lift the shoulder blades a few "
        "centimetres off the mat and extend the arms and legs away from each other. Legs "
        "low, arms by the ears. Extend only as far as the lower back stays pressed down.",
        "Hold the shape for the full thirty seconds. The shape is the exercise. The moment "
        "the lower back lifts, shorten the lever: bend the knees or bring the arms forward.",
        "ARCH. Face down, squeeze the glutes, then lift the chest and the thighs off the mat "
        "at the same time. Arms stay extended overhead, neck long, eyes down at the mat.",
        "Hold for thirty seconds. Alternate: one set hollow, next set arch, next set hollow.",
    ],
    checks=[
        "Hollow: you can slide nothing under the lower back. That is the pass mark.",
        "Arch: the lift comes from the glutes and the upper back, not from cranking the neck.",
        "Both positions should be a continuous, even effort across the whole front or back "
        "of the body, not a local burn in one spot.",
    ],
    mistakes=[
        "Lower back lifting off the floor in the hollow, which is how people hold a longer "
        "lever than they have earned and train nothing.",
        "Cranking the neck in the arch by looking forward. Keep the eyes on the mat.",
        "Skipping the arch. Most climbers train the hollow and never the arch, which leaves "
        "the front-lever line unbalanced and the posterior chain untrained.",
    ],
    illus=("hollow-body-hold", [1]),
    illus_note="Stock frame shows the hollow. The arch is drawn from the prompt.",
    prompt=prompt(
        panels=[
            "HOLLOW HOLD. Climber lying on his back on a mat, lower back pressed flat into "
            "the mat, shoulder blades lifted just off the mat, arms extended straight back "
            "beside the ears, legs straight and lifted low, about 15cm off the floor. The "
            "whole body forms a shallow banana curve with the belly as the low point. "
            "Side view.",
            "ARCH HOLD. The same climber face down on the mat, arms extended straight "
            "overhead and lifted off the mat, chest lifted, both thighs lifted off the mat, "
            "glutes engaged, neck long with the gaze down at the mat. The body forms a "
            "shallow reverse curve, the mirror image of panel 1. Side view.",
        ],
        equipment="A plain rectangular exercise mat in each panel. Nothing else.",
        angles="Panel 1: the lumbar spine MUST be touching the mat with no visible gap, "
               "chin slightly tucked, arms straight. Panel 2: only the belly and hips "
               "contact the mat, arms and legs both clear of it, neck in line with the spine.",
        arrows="In panel 1, a short orange arrow pointing down at the lower back where it "
               "meets the mat, with a small orange cross-mark showing there is NO gap. In "
               "panel 2, orange arrows at the chest and at the thighs both pointing upward.",
        extra="The two panels are mirror images of each other, front-side and back-side of "
              "the same trunk shape. Draw them at identical scale.",
    ),
)

CONTENT["pallof-press"] = E(
    steps_setup=[
        "Anchor the band at roughly chest height: a door handle, a post, or a loop around "
        "something solid.",
        "Stand side-on to the anchor, feet shoulder width, knees soft.",
        "Take the band in both hands and hold it against the sternum. Step away from the "
        "anchor until the band is under real tension before you start.",
        "Square the hips and shoulders to the front. The band will now be trying to rotate "
        "you toward the anchor. Your job is to refuse.",
    ],
    steps_exec=[
        "Press both hands straight out from the sternum to full arm extension.",
        "The band gets harder the further the hands travel, and the leverage against your "
        "trunk peaks at full extension.",
        "Hold at full extension for two seconds without letting anything turn.",
        "Return the hands to the sternum under control. That is one rep.",
        "Complete all ten reps on one side, then turn around and do ten on the other.",
    ],
    checks=[
        "Hips and shoulders stay square to the front for every rep. Nothing rotates.",
        "The hands travel in a straight line out from the sternum, level, not drifting "
        "toward the anchor.",
        "The effort is felt in the side of the trunk away from the anchor, and in the deep "
        "abdominal wall, not in the arms.",
    ],
    mistakes=[
        "Letting the torso rotate. That is the exercise failing, not the exercise getting "
        "harder.",
        "Using a band so heavy the hips have to counterbalance by pushing out sideways.",
        "Pressing fast and bouncing back in. The two-second hold at full extension is where "
        "the work is.",
    ],
    illus=("banded-pallof-press", [1, 2, 3]),
    illus_note=None,
    prompt=prompt(
        panels=[
            "START. Climber standing side-on to a resistance band that runs horizontally "
            "off-frame to the left at chest height. Both hands clasped together holding the "
            "band against the sternum, elbows tucked. Feet shoulder width, hips and "
            "shoulders square to the viewer. Front three-quarter view.",
            "PRESSED OUT. The same figure, arms now fully extended straight forward from "
            "the sternum, band stretched and under obvious tension. Hips and shoulders still "
            "perfectly square, no rotation whatsoever, torso vertical.",
        ],
        equipment="A resistance band drawn as two clean parallel lines running off the left "
                  "edge of the frame at chest height. No anchor point visible, no other objects.",
        angles="Shoulders and hips both perfectly square and level in both panels. In panel "
               "2 the arms are straight and horizontal at sternum height. The spine stays "
               "vertical, no side-bend toward the band.",
        arrows="An orange straight arrow showing the hands travelling forward from chest to "
               "full extension. A separate orange curved arrow at the ribcage showing the "
               "rotational pull of the band, crossed through with a small orange X to mark "
               "that this rotation must NOT happen.",
    ),
)

CONTENT["copenhagen-plank"] = E(
    steps_setup=[
        "Set a chair or bench beside the mat, at roughly knee height.",
        "Lie on your side with the bottom forearm on the mat, elbow directly under the "
        "shoulder, forearm pointing forward.",
        "Rest the TOP leg on the chair. EASY VERSION: the inside of the knee rests on the "
        "chair. FULL VERSION: the inside of the ankle rests on the chair, leg straight.",
        "The bottom leg starts on the floor.",
    ],
    steps_exec=[
        "Press down through the top leg into the chair and lift the hips until the body is "
        "one straight line from ankle to head.",
        "Lift the bottom leg off the floor toward the top one, so both legs are held in the "
        "air and the adductors of the top leg carry the load.",
        "Hold for twenty seconds, hips high, chest open to the front.",
        "Lower under control. Complete the hold on one side, then switch.",
    ],
    checks=[
        "A straight line from the ankle through the hip to the head, seen from the front.",
        "The chest stays open and square. The shoulder stack is vertical.",
        "You feel this hard on the inside of the top thigh. That is the adductor, and that "
        "is the point.",
    ],
    mistakes=[
        "Hips sagging. Once the hips drop the adductor unloads and the hold is decorative.",
        "Rolling the chest toward the floor, which turns it into a different and easier "
        "exercise.",
        "Going straight to the full ankle-supported version. Earn it at the knee first.",
    ],
    illus=("copenhagen-plank", [1, 2, 3]),
    illus_note=None,
    prompt=prompt(
        panels=[
            "KNEE VERSION. Climber in a side plank supported on one forearm on a mat, elbow "
            "directly under the shoulder. The TOP leg is bent with the inside of the knee "
            "resting on a low plain bench. The bottom leg is lifted clear of the floor. "
            "Hips lifted so the body is a straight line. Front three-quarter view.",
            "FULL VERSION. The same side plank, but now the top leg is completely STRAIGHT "
            "with the inside of the ankle resting on the bench, and the bottom leg is lifted "
            "and held alongside it in the air. Body one rigid straight line from the "
            "supporting elbow through the hips to the feet.",
        ],
        equipment="A plain low rectangular bench drawn in simple outline, and a plain "
                  "exercise mat. Nothing else.",
        angles="Supporting elbow at exactly 90 degrees and positioned DIRECTLY under the "
               "shoulder in both panels. Hips fully lifted, no sag: draw a straight "
               "reference through ankle, hip and shoulder. Chest open and square to the "
               "viewer, not rotated toward the floor.",
        arrows="A dashed orange straight line running the length of the body from ankle to "
               "head in both panels, showing the required straight line. An orange arrow at "
               "the inside of the top thigh pointing down into the bench, marking where the "
               "load is carried.",
        extra="Panel 1 is the regression, panel 2 the full version. Same figure and scale.",
    ),
)

CONTENT["band-external-rotation"] = E(
    steps_setup=[
        "Anchor a light band at elbow height. Stand side-on so the band runs across the "
        "front of your body.",
        "Take the band in the hand furthest from the anchor.",
        "Pin the elbow to the ribs and bend it to 90 degrees. A rolled towel between elbow "
        "and ribs helps enforce this.",
        "Start with the forearm across the belly, band already under light tension.",
    ],
    steps_exec=[
        "Keeping the elbow pinned, rotate the forearm outward, away from the belly, as if "
        "opening a gate. Only the forearm moves.",
        "Stop when the forearm is pointing straight ahead or a little beyond. Do not force "
        "past comfortable range.",
        "Return slowly, resisting the band the whole way back. The return is the half most "
        "people throw away.",
        "Fifteen reps, then swap sides.",
    ],
    checks=[
        "The elbow never leaves the ribs. If the towel drops, the set is over.",
        "The effort is felt at the back of the shoulder, not in the forearm or the lat.",
        "The band is light enough that rep fifteen looks identical to rep one.",
    ],
    mistakes=[
        "Elbow drifting off the ribs, which lets the shoulder substitute bigger muscles and "
        "skips the cuff entirely.",
        "Going heavy. This is maintenance for a joint, not a lift. It stays light forever.",
        "Rotating the whole torso away to gain range.",
        "Dropping it from the programme once the shoulder stops complaining, which is the "
        "point at which it is working.",
    ],
    illus=None,
    illus_note="No openly-licensed frame covers band external rotation. Generate from "
               "the prompt.",
    prompt=prompt(
        panels=[
            "START. Climber standing, viewed from the front. The right upper arm is pressed "
            "flat against the ribcage with the elbow bent to exactly 90 degrees. The right "
            "forearm is horizontal and drawn ACROSS the front of the belly. A resistance "
            "band runs from the right hand horizontally off the right edge of the frame.",
            "FINISH. The same figure, upper arm still pressed to the ribs and elbow still "
            "at exactly 90 degrees, but the forearm has rotated outward so it now points "
            "straight forward, away from the body. The band is visibly stretched.",
        ],
        equipment="A resistance band drawn as two clean parallel lines leaving the frame "
                  "horizontally at elbow height. Optionally a small rolled towel wedged "
                  "between the upper arm and the ribs. Nothing else.",
        angles="The elbow is at EXACTLY 90 degrees in both panels and the upper arm stays "
               "in contact with the ribcage in both. Shoulders level and square, torso "
               "upright and not rotated.",
        arrows="An orange curved arrow showing the outward rotation path of the hand, "
               "sweeping like a gate opening. An orange dot marking the elbow as the fixed "
               "pivot, with a small orange 'fixed' bracket holding it against the ribs.",
    ),
)

CONTENT["weighted-pullup"] = E(
    steps_setup=[
        "Load first: a pack with weight in it, or a dipping belt. Put it on before you "
        "touch the bar so the first rep is not a wrestling match.",
        "Take an overhand grip just outside shoulder width.",
        "Hang completely: arms straight, shoulders relaxed into a full dead hang. This is "
        "the start position for every single rep.",
        "Before pulling, set the shoulders: pull the blades down and back, ribs down, "
        "glutes lightly on so the body is a plank rather than a sack.",
    ],
    steps_exec=[
        "Pull by driving the elbows down and back toward your back pockets. Think about "
        "pulling the bar toward the chest rather than the chin toward the bar.",
        "Continue until the chest is close to the bar and the chin is clearly over it. Half "
        "reps do not count and do not build anything.",
        "Lower under control all the way to a full dead hang, arms completely straight, "
        "shoulders released. Do not bounce out of the bottom.",
        "Pause for a beat at the bottom, reset the shoulders, then start the next rep.",
        "Four reps at RPE 8 to 9: you should finish each set believing you had one or two "
        "more in you, not zero.",
        "Rest the full 150 seconds. This is a maximal strength set and the rest is part of "
        "the prescription, not a suggestion.",
    ],
    checks=[
        "Every rep starts from straight arms and a released shoulder.",
        "No kip, no swing, no leg drive. The body stays a rigid plank throughout.",
        "The last rep of the last set looks like the first rep of the first set. If it does "
        "not, the load is too heavy.",
    ],
    mistakes=[
        "Kipping. It moves the chin over the bar without adding strength and it teaches the "
        "shoulder to absorb a snap load.",
        "Half reps, where the arms never straighten at the bottom. The bottom quarter is "
        "where the lat is longest and where the strength you are missing lives.",
        "Picking a weight that turns a strength set into an endurance set. Four hard reps "
        "beats twelve easy ones for this quality.",
        "Cutting the rest because the set only took ten seconds.",
    ],
    illus=("weighted-pull-up", [1, 2, 3]),
    illus_note=None,
    prompt=prompt(
        panels=[
            "DEAD HANG START. Climber hanging from a horizontal bar with an overhand grip "
            "just outside shoulder width, arms COMPLETELY straight, shoulders released, "
            "body vertical and still, legs straight with ankles crossed. A weighted pack is "
            "worn on the back, or a simple weight belt with a single plate hanging between "
            "the legs on a short strap. Side-on three-quarter view.",
            "MID PULL. The same figure halfway up, elbows bent to roughly 90 degrees and "
            "driving DOWN AND BACK rather than out to the sides, chest beginning to rise "
            "toward the bar, body still rigid and vertical with no swing.",
            "TOP. The same figure at full contraction, chest close to the bar and chin "
            "clearly above it, elbows pulled down beside the ribs and back behind the torso "
            "line, shoulder blades squeezed down and together.",
        ],
        equipment="A plain horizontal pull-up bar. A simple weight belt with one round "
                  "plate hanging on a short strap between the legs. No gym background.",
        angles="Panel 1: elbows fully locked straight, a visible gap between ears and "
               "shoulders. Panel 2: elbows at 90 degrees, upper arms angled back behind the "
               "torso, NOT flared wide to the sides. Panel 3: chin above bar height, "
               "shoulder blades depressed and retracted. Body vertical in all three panels, "
               "no arch, no knees swinging forward.",
        arrows="An orange straight arrow at each elbow in panel 2 pointing down and back "
               "toward the hips, marking the pull direction. A dashed orange vertical "
               "reference line through the whole body in all three panels, showing the body "
               "stays on one line and does not swing.",
    ),
)

CONTENT["lock-off-ladder"] = E(
    steps_setup=[
        "Overhand grip on the bar, shoulder width. Have a clock or timer you can see.",
        "Pull all the way to the top, chin over the bar. This is where the descent starts.",
        "One set is one continuous descent through three angles, on one arm's worth of "
        "effort. You do not come back up between positions.",
    ],
    steps_exec=[
        "Lower until the elbows are at roughly 120 degrees, which is a shallow bend, arms "
        "still fairly extended. HOLD FIVE SECONDS.",
        "Lower to 90 degrees, elbows square. HOLD FIVE SECONDS. This is the angle most "
        "climbers actually fail at on the wall.",
        "Lower to roughly 60 degrees, a deep lock with the hands near the collarbones. "
        "HOLD FIVE SECONDS.",
        "Drop off or lower to a dead hang. That is one set, fifteen seconds of holding.",
        "Rest two minutes, then repeat. Three sets per side if you are doing the one-arm "
        "version, three sets total if two-armed.",
        "To make it harder: add two seconds per position, then go one-armed with the free "
        "hand resting lightly on the working wrist, then add weight.",
    ],
    checks=[
        "Each position is held, not passed through. If you are sinking, the set is already "
        "over.",
        "The elbow angle stays fixed for the full five seconds. Shaking is fine and "
        "expected. Drifting is not.",
        "Shoulders stay packed down. The moment they ride up toward the ears the position "
        "has failed.",
    ],
    mistakes=[
        "Sinking through the positions instead of holding them, which turns a set of "
        "isometrics into a slow negative.",
        "On the one-arm version, pulling with the assisting hand. It rests on the wrist, it "
        "does not grip and it does not help.",
        "Only training the deep lock, which is the position that feels strongest and "
        "transfers least. Ninety degrees is the one that matters.",
    ],
    illus=None,
    illus_note="No openly-licensed frame shows a graded lock-off ladder. Generate from "
               "the prompt.",
    prompt=prompt(
        panels=[
            "120 DEGREE LOCK-OFF. Climber hanging from a horizontal bar, holding a static "
            "position with elbows bent only slightly, to about 120 degrees, so the head is "
            "still well below the bar. Body still and vertical. Side view.",
            "90 DEGREE LOCK-OFF. The same figure holding a static position with elbows bent "
            "to exactly 90 degrees, forearms vertical, upper arms horizontal, eyes level "
            "with the bar.",
            "60 DEGREE LOCK-OFF. The same figure holding a deep static lock with elbows "
            "bent to about 60 degrees, hands close to the collarbones, chin above the bar.",
        ],
        equipment="A plain horizontal bar at the top of each panel. Nothing else.",
        angles="The elbow angle is the entire subject of this drawing and must be visibly "
               "and accurately different in each panel: 120 degrees, then 90 degrees, then "
               "60 degrees. Shoulder blades depressed in all three. Body vertical and "
               "motionless, legs straight with ankles crossed, no swing.",
        arrows="A burnt-orange angle arc drawn at the elbow in every panel with the degree "
               "figure written beside it: 120, 90, 60. A vertical dashed orange line at the "
               "side showing the descending height of the body across the three panels.",
        extra="Read left to right as one continuous descent: the figure gets HIGHER "
              "relative to the bar from panel 1 to panel 3 is WRONG. The figure starts high "
              "at the top of the bar and descends, so panel 1 (120 degrees) is the LOWEST "
              "body position and panel 3 (60 degrees) is the HIGHEST. Draw it that way.",
    ),
)

CONTENT["inverted-row"] = E(
    steps_setup=[
        "Set a bar at roughly hip height. No low bar: loop a band around something solid at "
        "chest height, or put rings or a TRX at that height.",
        "Lie underneath, take an overhand grip slightly wider than the shoulders.",
        "Set the body: heels on the floor, legs straight, hips lifted so you are a straight "
        "plank from heel to head. Squeeze the glutes to hold it there.",
        "Body angle sets the load. The more horizontal you are, the harder it is.",
    ],
    steps_exec=[
        "Start with the shoulder blades set: pull them down and back before the elbows "
        "bend at all.",
        "Pull the chest to the bar by driving the elbows back behind you. Lead with the "
        "elbow. The hands are hooks.",
        "Touch or come within a fist of the bar, and at the top squeeze the shoulder blades "
        "together for a beat.",
        "Lower under control to straight arms, letting the shoulder blades spread at the "
        "bottom without letting the hips drop.",
        "Eight reps. To progress: walk the feet further forward, then elevate the feet on a "
        "chair, then wear a loaded pack on the chest.",
    ],
    checks=[
        "One straight line from heel to head for the entire set. The hips are the first "
        "thing to give.",
        "The chest reaches the bar, not the chin or the belly.",
        "No shrugging. The shoulders stay down and away from the ears throughout.",
    ],
    mistakes=[
        "Hips sagging, which shortens the lever and quietly makes the exercise easier "
        "every rep.",
        "Stopping short of the bar. The last few centimetres are where the mid-back "
        "actually works.",
        "Shrugging the shoulders up toward the ears, which swaps the mid-back for the traps.",
    ],
    illus=("inverted-row", [1, 2, 3]),
    illus_note=None,
    prompt=prompt(
        panels=[
            "BOTTOM. Climber lying face-up beneath a waist-height horizontal bar, gripping "
            "it overhand slightly wider than shoulder width, arms COMPLETELY straight, "
            "heels on the floor, legs straight, hips lifted so the body is one rigid "
            "straight line from heel to head at roughly 30 degrees to the floor. Side view.",
            "TOP. The same figure pulled up so the CHEST touches the bar, elbows driven "
            "back behind the torso, shoulder blades squeezed together, body still one "
            "perfectly straight line from heel to head with no hip sag.",
        ],
        equipment="A plain horizontal bar at about waist height, supported by two simple "
                  "upright posts. Nothing else.",
        angles="The body is a straight rigid line in BOTH panels, heel to hip to shoulder "
               "to head, with absolutely no sag at the hips. In panel 2 the upper arms are "
               "angled back behind the torso line, not flared out sideways, and the chest "
               "reaches bar height.",
        arrows="A dashed orange straight line running the full length of the body in both "
               "panels, showing the plank. An orange arrow at each elbow in panel 2 "
               "pointing backwards. A small orange arrow at the hips in panel 1 pointing "
               "UP, crossed with an X in a small inset to mark that sagging is the failure.",
    ),
)

CONTENT["dead-hang"] = E(
    steps_setup=[
        "Overhand grip on the bar, hands shoulder width.",
        "Hang, then immediately engage: pull the shoulder blades down and slightly together "
        "so you are supported by muscle, not hanging off the joint capsule.",
        "Have a towel ready if you are doing the grip rotation.",
    ],
    steps_exec=[
        "Hang for forty-five seconds with the shoulders ACTIVE the whole time.",
        "Switch grip every fifteen seconds: overhand on the bar, then a towel draped over "
        "the bar, then back. On the HANG-mode version, rotate through half-crimp, open hand "
        "and three-finger drag instead.",
        "Throughout, try to bend the bar apart: imagine pulling your hands away from each "
        "other. This keeps the lats and the cuff switched on.",
        "Step off deliberately at the end rather than dropping.",
        "Progress to sixty seconds, then add a small weight rather than adding more time.",
    ],
    checks=[
        "A visible gap between the ears and the shoulders for the full duration.",
        "The work is felt in the forearms and the lats, not as a stretch in the shoulders.",
        "You end the hang because the forearms are done, not because the skin hurts.",
    ],
    mistakes=[
        "Dead shoulders, which is where the name misleads people. The shoulders stay "
        "active; only the fingers are passive.",
        "Gritting through pain in the fingers rather than fatigue in the forearms. Finger "
        "pain is a stop signal, not a challenge.",
        "Adding time indefinitely. Past sixty seconds this becomes a skin-tolerance test.",
    ],
    illus=("dead-hang", [1]),
    illus_note="Frame 1 shows the straight-arm hang. Ignore any bent-arm frames in the "
               "stock set: those are pull-ups, not hangs.",
    prompt=prompt(
        panels=[
            "ACTIVE HANG, CORRECT. Climber hanging from a horizontal bar with straight "
            "arms, but with the shoulder blades pulled DOWN and slightly together so there "
            "is a clear visible gap between the ears and the shoulders, chest slightly "
            "lifted, body still and vertical. Front view.",
            "PASSIVE HANG, INCORRECT. The same figure hanging completely relaxed, shoulders "
            "shrugged up around the ears so the head appears sunk between them, chest "
            "collapsed, body slack.",
        ],
        equipment="A plain horizontal bar. Optionally a simple towel draped over the bar in "
                  "panel 1 with a hand gripping each end. Nothing else.",
        angles="Arms completely straight in BOTH panels. The ONLY difference between the "
               "two panels is the shoulder position: depressed and packed in panel 1, "
               "shrugged and passive in panel 2. Exaggerate this difference so it reads "
               "clearly.",
        arrows="An orange downward arrow at each shoulder blade in panel 1 with an orange "
               "bracket marking the ear-to-shoulder gap. In panel 2, an orange upward arrow "
               "at each shoulder and a single orange X mark in the corner of the panel to "
               "flag it as the error.",
        extra="Panel 1 is correct, panel 2 is the common error. Mark panel 2 clearly as "
              "wrong with the orange X, and do not add any other text.",
    ),
)

CONTENT["wrist-extensor-pronator"] = E(
    steps_setup=[
        "Sit down. Rest the working forearm along the top of your thigh with the wrist and "
        "hand hanging just past the knee.",
        "Take a light weight or a band in that hand. Light means a 1 to 2kg dumbbell, a "
        "full water bottle, or a light band.",
        "The forearm stays pressed to the thigh throughout. Only the wrist moves.",
    ],
    steps_exec=[
        "WRIST EXTENSION, fifteen reps. Palm facing DOWN. Let the hand drop toward the "
        "floor, then curl it up toward the ceiling. Lower over three full seconds every "
        "single rep.",
        "PRONATION, fifteen reps. Hold the weight by one end so it is off-balance, thumb "
        "up, forearm still on the thigh. Rotate the palm slowly DOWN toward the floor, then "
        "back to thumb-up under control.",
        "Swap sides and repeat both movements.",
        "Progress by adding reps to twenty, then a marginally heavier weight. Keep the "
        "three-second lowering forever.",
    ],
    checks=[
        "The forearm never lifts off the thigh. If it does, the load is too heavy.",
        "The lowering phase is genuinely three seconds. Count it.",
        "You feel this on the OUTSIDE of the forearm, the side climbing never trains.",
    ],
    mistakes=[
        "Going heavy and fast, which is the one way to make an elbow prehab exercise cause "
        "elbow pain.",
        "Rushing the lowering phase, which is the part that actually remodels the tendon.",
        "Dropping it from the programme once the elbow stops complaining. This is "
        "maintenance, and the quiet period is the evidence it works.",
    ],
    illus=("wrist-extension", [1, 2]),
    illus_note=None,
    prompt=prompt(
        panels=[
            "WRIST EXTENSION, BOTTOM. Climber seated on a plain bench, forearm resting "
            "along the top of the thigh with the wrist hanging just past the knee, palm "
            "facing DOWN, holding a small dumbbell. The hand has dropped down toward the "
            "floor so the wrist is fully flexed. Side view, close framing on torso, arm "
            "and thigh.",
            "WRIST EXTENSION, TOP. The same position, but the hand has curled UP toward the "
            "ceiling so the wrist is fully extended, the forearm still flat on the thigh.",
            "PRONATION. The same seated position, forearm on the thigh, but now holding the "
            "dumbbell by ONE END so it sticks out sideways, with the thumb pointing up. An "
            "orange arc shows the hand rotating so the palm turns down toward the floor.",
        ],
        equipment="A plain bench, a small short dumbbell. Nothing else.",
        angles="The forearm stays in contact with the thigh in ALL THREE panels and the "
               "elbow angle never changes. Only the wrist moves in panels 1 and 2; only "
               "forearm rotation happens in panel 3.",
        arrows="Orange curved arrow showing the upward curl path in panels 1 to 2. Orange "
               "rotational arc arrow around the forearm axis in panel 3. A small orange "
               "bracket holding the forearm to the thigh in every panel, marking it fixed.",
    ),
)

CONTENT["pike-press"] = E(
    steps_setup=[
        "Start in a downward dog: hands shoulder width on the floor, feet walked in toward "
        "the hands, hips high, legs as straight as your hamstrings allow.",
        "Walk the feet in until the torso is close to vertical. The more vertical the "
        "torso, the more this becomes a shoulder press rather than a push-up.",
        "Shift the weight forward over the hands. Fingers spread, gripping the floor.",
        "For the band version instead: stand on the middle of a band, hold an end in each "
        "hand at shoulder height, elbows tucked.",
    ],
    steps_exec=[
        "Lower by bending the elbows, bringing the CROWN of the head toward the floor "
        "between the hands. Not the forehead, not the nose: the top of the head.",
        "Keep the hips high throughout. The hips dropping is what turns this into a "
        "push-up.",
        "Touch lightly or come within a couple of centimetres, then press back up.",
        "Finish every rep by pushing the floor away and actively reaching the shoulders up "
        "toward the ceiling at the top. That last reach is the part climbers need most.",
        "Eight reps. Progress: feet elevated on a chair, then hands on blocks for a "
        "deficit, then toward a wall handstand push-up.",
    ],
    checks=[
        "Hips stay high for all eight reps. Watch the last two, that is when they drop.",
        "The head travels to a point BETWEEN the hands, not in front of them.",
        "At the top, the shoulders are actively pushed up, not passively resting.",
    ],
    mistakes=[
        "Hips dropping as fatigue arrives, which silently converts the exercise into a "
        "push-up and trains the wrong thing.",
        "Not reaching depth, so the shoulder never works through the range it is losing.",
        "Skipping the active reach at the top. Overhead range is the whole reason this "
        "movement is in the programme.",
    ],
    illus=("pike-push-up", [1, 2, 3]),
    illus_note=None,
    prompt=prompt(
        panels=[
            "TOP. Climber in an inverted-V pike position: hands flat on the floor shoulder "
            "width, feet walked in close to the hands, hips high at the apex, legs nearly "
            "straight, arms COMPLETELY straight, head between the arms, torso close to "
            "vertical. Side view.",
            "BOTTOM. The same pike shape, but the elbows have bent and the CROWN of the "
            "head has lowered to just above the floor between the hands. The hips remain "
            "HIGH at the apex, unchanged from panel 1. Elbows track back at roughly 45 "
            "degrees, not flared wide.",
            "FEET ELEVATED. The harder variation: the same pike push-up but with both feet "
            "resting on a low plain chair, so the torso is fully vertical and the body "
            "forms a sharper, more upright V.",
        ],
        equipment="A plain exercise mat. In panel 3 only, a plain low chair. Nothing else.",
        angles="The hip is the key checkpoint: in panels 1 and 2 the hips must be at the "
               "SAME high apex, proving they did not drop during the rep. The head goes "
               "BETWEEN the hands, level with or behind the line of the fingers, never in "
               "front of them.",
        arrows="An orange dashed horizontal line level with the hips in panels 1 and 2, "
               "identical in both, showing the hips do not move. An orange straight arrow "
               "showing the head's downward path in panel 2. A small orange upward arrow at "
               "the shoulders in panel 1 marking the active reach at lockout.",
    ),
)

CONTENT["push-up"] = E(
    steps_setup=[
        "Hands flat on the floor directly under the shoulders, fingers spread and pointing "
        "forward.",
        "Walk the feet back to a plank: one straight line from heels through hips to the "
        "crown of the head.",
        "Squeeze the glutes and pull the ribs down. Set this before the first rep, not "
        "halfway through the set.",
    ],
    steps_exec=[
        "Lower the chest toward the floor, keeping the elbows at roughly 45 degrees from "
        "the ribs. Not tucked to the sides, not flared to 90.",
        "Go down until the chest is about a fist off the floor.",
        "Press back to full lockout, arms completely straight.",
        "At the top, push the floor away and let the shoulder blades spread apart. That "
        "protraction at the top is where the serratus works, and it is the half most people "
        "skip.",
        "Twelve reps. Progress by elevating the feet, then wearing a loaded pack, then "
        "archer push-ups. Do not chase hypertrophy here.",
    ],
    checks=[
        "The body is one line for the whole set. Hips neither sag nor pike up.",
        "Elbows at 45 degrees, forming an arrow shape with the body rather than a T.",
        "Full lockout with the shoulder blades spread at the top of every rep.",
    ],
    mistakes=[
        "Elbows flared to 90 degrees, which loads the front of the shoulder in its least "
        "stable position.",
        "Hips sagging, which is a trunk failure showing up in a pressing exercise.",
        "Adding endless reps in the belief that more is better. This is enough pressing to "
        "stay balanced, not enough to build chest mass you then have to carry up the wall.",
    ],
    illus=("push-up", [1, 2]),
    illus_note=None,
    prompt=prompt(
        panels=[
            "TOP. Climber in a high plank, hands flat on the floor directly under the "
            "shoulders, arms straight and locked, body one perfectly straight line from "
            "heels through hips to the crown of the head, shoulder blades spread apart. "
            "Side view.",
            "BOTTOM. The same figure lowered until the chest is about a fist's height above "
            "the floor, with the upper arms angled back at roughly 45 degrees from the "
            "ribcage. The body remains one straight line, hips neither sagging nor raised.",
            "OVERHEAD VIEW OF ELBOW PATH. A simple top-down diagram of the same figure at "
            "the bottom position, showing the upper arms forming an arrow shape with the "
            "torso at about 45 degrees, NOT a T shape at 90 degrees.",
        ],
        equipment="A plain exercise mat. Nothing else.",
        angles="Elbows at 45 degrees from the ribs, clearly not 90. The body is a straight "
               "rigid line in both side-view panels. Full elbow lockout in panel 1.",
        arrows="A dashed orange straight line through the body in panels 1 and 2 showing "
               "the plank. In panel 3, an orange angle arc at the armpit marked 45, and a "
               "faint greyed-out 90-degree T position drawn behind it with a small orange X.",
    ),
)

CONTENT["bulgarian-split-squat"] = E(
    steps_setup=[
        "Stand facing away from a chair, roughly one long stride in front of it.",
        "Place the top of the rear foot on the chair seat, at about knee height.",
        "Check the front foot position: when you lower, the front shin should stay close to "
        "vertical. If the knee shoots forward, step the front foot further out.",
        "Stand tall, chest up, hands on hips or holding a loaded pack to the chest.",
    ],
    steps_exec=[
        "Lower straight down by bending the front knee, sending the rear knee toward the "
        "floor. The torso stays upright.",
        "Descend until the rear knee is just above the floor, or as deep as you can go with "
        "the front heel flat.",
        "Drive up through the front HEEL, not the toes. Think about pushing the floor away.",
        "Return to standing without locking out aggressively, then start the next rep.",
        "Eight reps on one side, then swap. Progress to twelve bodyweight reps per side, "
        "then add a loaded pack.",
    ],
    checks=[
        "The front knee tracks over the second toe. It does not cave inward.",
        "The front heel stays flat on the floor for the whole rep.",
        "The torso stays upright. Folding forward turns this into a different exercise.",
        "The rear leg is a kickstand for balance, not a source of power.",
    ],
    mistakes=[
        "Front knee caving inward, which is the single most common fault and the one worth "
        "fixing first.",
        "Torso folding forward to help, which shifts the load off the front leg.",
        "Turning it into a high-rep burn set. This is strength work. Eight hard reps, not "
        "twenty easy ones.",
    ],
    illus=("bulgarian-split-squat", [1, 2, 3]),
    illus_note=None,
    prompt=prompt(
        panels=[
            "TOP. Climber standing in a split stance with the top of the REAR foot resting "
            "on a plain low chair behind him at about knee height. The front leg is "
            "straight, front foot flat on the floor a long stride ahead of the chair. Torso "
            "upright and tall, hands on hips. Side view.",
            "BOTTOM. The same split stance lowered so the REAR knee is just above the "
            "floor, the FRONT shin close to vertical, front heel flat on the ground, front "
            "thigh roughly parallel to the floor. Torso still upright, not folded forward.",
            "FRONT VIEW, KNEE TRACKING. The same bottom position seen from the front, "
            "showing the front knee tracking directly out over the second toe, hips level.",
        ],
        equipment="A plain low chair or bench. Nothing else.",
        angles="In panel 2 the front shin is close to VERTICAL and the front heel is flat "
               "on the floor. Torso upright in all panels, not hinged forward. In panel 3 "
               "the knee is directly above the second toe, not collapsed inward.",
        arrows="An orange dashed vertical line running up the front shin in panel 2, "
               "showing it stays vertical. An orange arrow pointing down into the front "
               "HEEL marking where the drive comes from. In panel 3, an orange dashed "
               "vertical line from knee to second toe, plus a faint greyed inward-collapsed "
               "knee drawn behind it with a small orange X.",
    ),
)

CONTENT["single-leg-rdl"] = E(
    steps_setup=[
        "Stand on one leg with a soft bend in that knee. The knee angle stays the same for "
        "the whole rep.",
        "Set the back flat and the chest proud. Shoulders pulled back.",
        "Square the hips to the floor. Hold something light at the chest, or nothing at all "
        "to start.",
    ],
    steps_exec=[
        "Hinge at the HIP: push the hips backwards while the torso comes forward and the "
        "free leg extends straight back behind you.",
        "Torso and free leg move as one rigid line, like a see-saw pivoting at the hip.",
        "Descend until you feel a strong stretch in the hamstring of the standing leg, or "
        "until the torso is roughly parallel to the floor, whichever comes first.",
        "Return by driving the hips FORWARD, not by lifting the chest. Squeeze the glute at "
        "the top.",
        "Ten reps one side, then swap. Progress by adding load, then slowing the lowering "
        "to three seconds.",
    ],
    checks=[
        "The lower back stays flat throughout. The moment it rounds, you have gone too far.",
        "The hips stay SQUARE to the floor. The hip of the free leg must not rotate open "
        "toward the ceiling.",
        "The standing knee bend does not change during the rep.",
        "You feel it in the hamstring and glute of the standing leg.",
    ],
    mistakes=[
        "Rounding the lower back to reach further down. Range you cannot control with a "
        "flat back is not range you own.",
        "Letting the hip of the free leg rotate open, which is the way the body cheats a "
        "single-leg hinge.",
        "Bending the standing knee more and more as you descend, which turns a hinge into "
        "a squat.",
    ],
    illus=("single-leg-romanian-deadlift", [1, 2, 3]),
    illus_note=None,
    prompt=prompt(
        panels=[
            "TOP. Climber standing on one leg, that knee with a soft slight bend, torso "
            "upright and tall, the other leg hanging relaxed, hips square. Side view.",
            "BOTTOM. The same figure hinged forward at the hip so the torso is roughly "
            "PARALLEL to the floor, with the free leg extended straight back behind him "
            "also parallel to the floor, forming one continuous straight line from the back "
            "of the head through the spine to the free heel. The standing knee bend is "
            "UNCHANGED from panel 1. The lower back is flat, not rounded.",
            "REAR VIEW, HIP SQUARENESS. The same bottom position seen from behind, showing "
            "both hip bones level and square to the floor, the free leg's hip NOT rotated "
            "open toward the ceiling.",
        ],
        equipment="Nothing. Bodyweight only.",
        angles="The standing knee holds the same soft bend in panels 1 and 2. In panel 2 "
               "the head, spine and free leg form ONE straight line parallel to the floor. "
               "The lumbar spine is flat, never rounded. In panel 3 the pelvis is level.",
        arrows="A dashed orange straight line from the crown of the head through the spine "
               "to the free heel in panel 2, showing the see-saw line. An orange arrow at "
               "the hips pointing BACKWARD in panel 2, marking the hinge direction. In "
               "panel 3, a short orange level-line across both hip bones.",
    ),
)

CONTENT["cuff-circuit"] = E(
    steps_setup=[
        "Anchor a light band at elbow height for the rotations. For the Y-T-W you hold the "
        "band in both hands with no anchor.",
        "Stand tall, ribs down, shoulders relaxed away from the ears. This posture holds "
        "for every rep of all four movements.",
        "Pick a band light enough that the last rep looks like the first.",
    ],
    steps_exec=[
        "EXTERNAL ROTATIONS, 12 per side. Elbow pinned to the ribs at 90 degrees. Rotate "
        "the forearm outward, control it back. Only the forearm moves.",
        "Y, 12 reps. Hold the band in both hands in front of the thighs. Pull it apart and "
        "up overhead into a Y shape, arms straight, thumbs up. Lower under control.",
        "T, 12 reps. Band in both hands at chest height, arms straight in front. Pull apart "
        "straight out to the sides into a T, squeezing the shoulder blades together.",
        "W, 12 reps. Band in both hands, elbows bent and tucked near the ribs. Pull the "
        "band apart and drive the elbows back and down, forming a W with the arms.",
        "That is one round. Three rounds with 45 seconds between.",
    ],
    checks=[
        "No shrugging in any of the four movements. The shoulders stay down.",
        "The movements are precise and slow. You should be able to stop at any point in "
        "the range.",
        "The work is felt around the shoulder blade and the back of the shoulder, not in "
        "the lats or the neck.",
    ],
    mistakes=[
        "Shrugging, which is the body recruiting the traps to do the cuff's job.",
        "Using a heavy band and recruiting the lats. This is scapular and cuff control, "
        "not a back workout.",
        "Rushing. Precision over load, every time. It stays light forever.",
    ],
    illus=("prone-y-raise", [1, 2]),
    illus_note="Stock frames show the Y position. The T, W and rotation positions are "
               "drawn from the prompt.",
    prompt=prompt(
        panels=[
            "EXTERNAL ROTATION. Climber standing, upper arm pinned flat against the ribs, "
            "elbow bent to exactly 90 degrees, forearm rotated outward away from the belly, "
            "holding a band that runs off-frame horizontally. Front view.",
            "Y POSITION. The same figure standing, holding a band in both hands, arms "
            "straight and raised overhead in a wide V or Y shape, thumbs pointing up, band "
            "stretched between the hands, shoulders DOWN and not shrugged.",
            "T POSITION. The same figure, arms straight and held out horizontally to both "
            "sides forming a T, band stretched across the chest, shoulder blades squeezed "
            "together, shoulders down.",
            "W POSITION. The same figure, elbows bent and pulled back and down close to the "
            "ribs with the forearms angled up and out, so the arms form a W shape, band "
            "stretched between the hands.",
        ],
        equipment="A plain resistance band drawn as two clean parallel lines. Nothing else.",
        angles="The shoulders are DOWN and away from the ears in all four panels: this is "
               "the single most important detail. Torso upright and still, ribs down, no "
               "leaning back. Elbow exactly 90 degrees in panel 1.",
        arrows="An orange arrow showing the band's path of travel in each panel. A small "
               "orange downward arrow at each shoulder in panels 2, 3 and 4 reinforcing "
               "that the shoulders stay depressed and must not shrug.",
        extra="These are four positions of one circuit, read left to right. Same figure, "
              "same scale, same band in every panel.",
    ),
)

CONTENT["wrist-conditioning"] = E(
    steps_setup=[
        "Sit down. Rest the forearm on a thigh or a table with the wrist just past the edge "
        "so the hand can move freely in every direction.",
        "Take a light weight in the hand: 1 to 2kg, a full bottle, or a light band.",
        "Four movements, twelve reps each, three seconds on every lowering phase. Then "
        "repeat the whole block on the other side.",
    ],
    steps_exec=[
        "WRIST EXTENSION, palm down, 12 reps. Let the hand drop, curl it up toward the "
        "ceiling, lower over three seconds.",
        "WRIST FLEXION, palm up, 12 reps. Let the hand drop back, curl it up toward you, "
        "lower over three seconds.",
        "RADIAL AND ULNAR DEVIATION, 12 reps. Thumb up, forearm on the support. Move the "
        "hand up toward the thumb side, then down toward the little-finger side. The "
        "forearm does not roll.",
        "PRONATION AND SUPINATION, 12 reps. Hold the weight by ONE END so it is "
        "off-balance. Rotate the palm slowly down, then slowly up. Control both directions.",
        "STOP any movement immediately if it produces sharp or pinching pain rather than "
        "muscular effort.",
    ],
    checks=[
        "The forearm stays supported and still. Only the hand moves.",
        "Every lowering phase is a genuine three seconds.",
        "Effort, never pain. Muscular fatigue is the target; sharp or pinching is a stop.",
    ],
    mistakes=[
        "Going heavy. This block gets heavier more slowly than anything else in the "
        "programme, on purpose.",
        "Rushing the lowering phase, which is the part that actually drives the adaptation.",
        "Working into pain in the belief that it is strengthening something.",
        "Dropping the block as soon as the symptoms quieten down, which is the point at "
        "which it is working.",
    ],
    illus=("wrist-curl", [1, 2]),
    illus_note="Stock frames show wrist flexion. Extension, deviation and rotation are "
               "drawn from the prompt.",
    prompt=prompt(
        panels=[
            "WRIST EXTENSION. Climber seated, forearm resting flat along the top of the "
            "thigh with the wrist just past the knee, palm facing DOWN, holding a small "
            "dumbbell. Hand curled UP toward the ceiling. Side view, close framing.",
            "WRIST FLEXION. Same seated setup but palm facing UP, hand curled up toward "
            "the forearm.",
            "RADIAL AND ULNAR DEVIATION. Same seated setup, forearm on the thigh, thumb "
            "pointing UP, holding the dumbbell by one end. Two ghosted positions of the "
            "hand shown: one tilted up toward the thumb side, one tilted down toward the "
            "little-finger side.",
            "PRONATION AND SUPINATION. Same seated setup, holding the dumbbell by ONE END "
            "so it projects sideways. An orange rotational arc shows the forearm rolling "
            "the palm from facing up to facing down.",
        ],
        equipment="A plain bench or chair, a small short dumbbell. Nothing else.",
        angles="The forearm remains in contact with the thigh in ALL FOUR panels and the "
               "elbow angle never changes. Only the wrist and forearm rotation move. Keep "
               "the hand anatomically correct with five clearly separated fingers.",
        arrows="Orange curved arrows showing each direction of travel. A small orange "
               "bracket clamping the forearm to the thigh in every panel to mark it fixed. "
               "In panel 3 use a double-headed orange arrow for the two directions.",
        extra="Four movements of one wrist block, read left to right. Same seated figure, "
              "same scale, same close framing throughout.",
    ),
)

CONTENT["hip-mobility-flow"] = E(
    steps_setup=[
        "Mat, clear floor, something solid to hold for balance in the squat.",
        "Four positions, roughly forty seconds each, two rounds. Fifteen seconds between "
        "rounds.",
        "This is loaded end range, not passive stretching. You will contract gently into "
        "each position.",
    ],
    steps_exec=[
        "90/90 BOTH SIDES. Sit with both knees bent at 90 degrees, one leg in front, one "
        "out to the side. Sit tall. Press the front shin gently into the floor for five "
        "seconds, release, sink a little further. Switch sides.",
        "FROG. On hands and knees, knees wide apart, shins in line with the thighs, feet "
        "turned out. Rock the hips slowly back toward the heels and forward again. Keep the "
        "lower back flat.",
        "DEEP SQUAT HOLD. Feet shoulder width, sink into the deepest squat you can with the "
        "heels down. Hold onto something if needed. Use the elbows to press the knees gently "
        "outward.",
        "COUCH STRETCH, per side. Rear foot up against a wall or on a chair, front foot "
        "forward, back knee down. Tuck the pelvis under and squeeze the rear glute. That "
        "glute squeeze is what makes it work.",
        "Then repeat the whole round.",
    ],
    checks=[
        "The lower back stays flat in the frog and the 90/90. If it rounds, sit up on a "
        "folded edge of the mat.",
        "In the couch stretch the pelvis is tucked under. Without that, you are stretching "
        "the lower back rather than the hip flexor.",
        "You are contracting gently into end range, not hanging passively in it.",
    ],
    mistakes=[
        "Treating it as passive stretching. Range you cannot contract into is range you "
        "cannot use on the wall.",
        "Rounding the lower back to fake more hip range.",
        "Skipping the second round because the first felt fine.",
    ],
    illus=("worlds-greatest-stretch", [1, 2]),
    illus_note="Stock frames show a lunge-and-rotate. The four flow positions are drawn "
               "from the prompt.",
    prompt=prompt(
        panels=[
            "90/90 SEATED. Climber seated on a mat with BOTH knees bent to 90 degrees: one "
            "leg folded in front with the shin across the body, the other folded out to the "
            "side, both shins flat on the floor. Sitting TALL with a flat lower back. "
            "Three-quarter view from above and in front.",
            "FROG. Climber on hands and knees with the knees spread very wide, shins in "
            "line with the thighs, feet turned outward, hips sinking back toward the heels. "
            "Lower back flat. View from the side and slightly above.",
            "DEEP SQUAT HOLD. Climber in a full deep squat, hips below the knees, heels "
            "FLAT on the floor, torso upright, elbows inside the knees pressing them gently "
            "outward. Front view.",
            "COUCH STRETCH. Climber in a half-kneeling lunge with the REAR foot raised "
            "behind him against a plain wall, rear knee on the mat, front foot flat and "
            "forward, torso upright, pelvis visibly TUCKED UNDER. Side view.",
        ],
        equipment="A plain exercise mat. A plain flat wall in panel 4 only. Nothing else.",
        angles="Panel 1: both knees at exactly 90 degrees, spine tall and flat. Panel 2: "
               "lower back flat, not arched or rounded. Panel 3: heels flat on the floor, "
               "hip crease below knee height. Panel 4: pelvis in posterior tilt with the "
               "tailbone tucked, torso vertical, rear glute engaged.",
        arrows="An orange arrow at each position showing the direction of gentle pressure: "
               "front shin pressing down in panel 1, hips rocking back in panel 2, elbows "
               "pressing knees outward in panel 3, pelvis tucking under in panel 4.",
        extra="Four positions of one mobility flow, read left to right. Same figure and "
              "scale throughout.",
    ),
)

CONTENT["quadruped-wrist-rocks"] = E(
    steps_setup=[
        "On hands and knees on the mat. Knees under hips.",
        "Place the hands flat with the FINGERS POINTING FORWARD to start. Arms straight, "
        "elbows soft but not locked hard.",
        "Only put as much weight through the hands as is comfortable. You control the load "
        "by how far forward you lean.",
    ],
    steps_exec=[
        "FINGERS FORWARD. Rock the body slowly forward over the hands so the wrists bend "
        "further into extension, then rock back. Twelve slow rocks.",
        "FINGERS OUT TO THE SIDES. Turn both hands so the fingers point outward. Rock "
        "gently side to side and forward. Twelve rocks.",
        "FINGERS POINTING BACK toward the knees. This is the strongest stretch. Rock back "
        "toward the heels very gently. Twelve rocks. Reduce the lean if it is sharp.",
        "BACK OF THE HANDS DOWN. Turn the hands over so the backs rest on the mat, fingers "
        "pointing toward the knees. Rock gently. This one needs almost no load.",
        "Move slowly. Rocking is the exercise; the position is just the setup.",
    ],
    checks=[
        "You control the intensity entirely with how far you lean. Nothing here should be "
        "sharp.",
        "The arms stay straight but not hyper-locked.",
        "A broad stretch across the forearm and the palm, never a pinch at the back of the "
        "wrist joint.",
    ],
    mistakes=[
        "Loading too fast. This is loaded mobility for a joint that climbing hammers in one "
        "narrow position and never trains elsewhere.",
        "Bouncing rather than rocking slowly.",
        "Pushing through a pinch at the back of the wrist. Back off the lean instead.",
    ],
    illus=("cat-cow-stretch", [1]),
    illus_note="Stock frame shows the quadruped base position only. The four hand "
               "orientations are drawn from the prompt.",
    prompt=prompt(
        panels=[
            "FINGERS FORWARD. Climber on hands and knees on a mat, arms straight, hands "
            "flat with fingers pointing FORWARD, body rocked forward over the hands so the "
            "wrists are in deep extension. Side view with the hand clearly visible.",
            "FINGERS OUT. The same quadruped position but both hands rotated so the fingers "
            "point OUTWARD to the sides, away from the body.",
            "FINGERS BACK. The same quadruped position with both hands rotated so the "
            "fingers point BACKWARD toward the knees, body rocking back toward the heels.",
            "BACKS OF HANDS DOWN. The same quadruped position with the hands turned over so "
            "the BACKS of the hands rest on the mat, fingers pointing back toward the knees, "
            "very little weight through the arms.",
        ],
        equipment="A plain exercise mat. Nothing else.",
        angles="Knees directly under hips and hands roughly under shoulders in all panels. "
               "Arms straight but not hyperextended. The spine stays neutral and flat "
               "throughout, this is a wrist drill, not a cat-cow.",
        arrows="A small orange curved arrow at the torso in each panel showing the rocking "
               "direction. An orange inset close-up of the HAND in each panel showing the "
               "exact finger orientation, since that is the whole point of the drawing.",
        extra="Four hand orientations of one wrist drill, read left to right in increasing "
              "difficulty. Draw the hands large and unambiguous: five clearly separated "
              "fingers, correct anatomy, no fusing.",
    ),
)

