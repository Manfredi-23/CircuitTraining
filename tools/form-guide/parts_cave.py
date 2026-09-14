# =============================================================================
# parts_cave.py - long-form content for CAVE mode.
#
# This is where the climbing-specific half of the programme lives, and where
# openly-licensed illustration libraries run out entirely. Max hangs, campus
# ladders, recruitment pulls, repeaters and limit bouldering have no stock art
# under any license, so every one of them is drawn from its prompt.
#
# The grip descriptions here are load-bearing. Half-crimp, open hand and drag
# are three different exercises that look similar at a glance, and drifting
# between them mid-hang is the most common way a finger session quietly becomes
# something other than what was prescribed.
# =============================================================================

from style import E, prompt

CONTENT = {}

CONTENT["cave-warmup"] = E(
    steps_setup=[
        "Band anchored at elbow height. Floor space. Access to jugs or an easy traverse.",
        "Fifteen minutes, in this order. The order is the point: general, then specific.",
    ],
    steps_exec=[
        "THREE MINUTES PULSE RAISER. Skipping, star jumps, brisk movement, easy "
        "hangboard-free activity. Finish breathing harder but able to talk.",
        "FIFTEEN BAND EXTERNAL ROTATIONS PER SIDE. Elbow pinned to the ribs at 90 degrees, "
        "rotate the forearm out, control it back.",
        "TEN SCAPULAR PULL-UPS. Straight arms throughout. Pull the shoulder blades down "
        "and together so the body rises a few centimetres, then release to a full hang.",
        "FIVE MINUTES EASY TRAVERSING OR JUGS. Big holds, easy movement, feet on. Let the "
        "fingers, elbows and shoulders take progressively more load.",
        "Finish warm and switched on, not tired. You should end this wanting to climb.",
    ],
    checks=[
        "Breathing raised, joints moving freely, hands warm rather than cold and stiff.",
        "Nothing tender, nothing sharp. If something is, the session downgrades now.",
        "You have not done anything hard enough to cost you a working set.",
    ],
    mistakes=[
        "Treating it as optional because you feel fine. Feeling fine cold is not the same "
        "as being warm.",
        "Turning it into a session. If the traverse becomes a project, the warm-up failed.",
        "Skipping straight to the board because the gym is busy.",
    ],
    illus=("scapular-pull-up", [1, 2]),
    illus_note="Frames show the scapular pull-up. The rest of the sequence is drawn from "
               "the prompt.",
    prompt=prompt(
        panels=[
            "Climber skipping on the spot with a plain skipping rope, both feet just off "
            "the ground, upright posture. Full body, front view.",
            "Climber standing side-on, upper arm pinned to the ribs with the elbow at 90 "
            "degrees, forearm rotated outward against a resistance band that runs off-frame.",
            "Climber hanging from a horizontal bar with COMPLETELY STRAIGHT arms, shoulder "
            "blades pulled down and together so the body has risen slightly and there is a "
            "large gap between ears and shoulders. Elbows locked straight.",
            "Climber traversing an easy overhanging climbing wall on large jug holds, both "
            "feet on footholds, arms straight, relaxed posture. Draw the wall as a plain "
            "outlined plane with simple rounded holds, no texture or background.",
        ],
        equipment="A plain skipping rope, a resistance band, a plain horizontal bar, and a "
                  "simply outlined climbing wall with plain rounded holds.",
        angles="Panel 2: elbow exactly 90 degrees, upper arm against the ribs. Panel 3: "
               "elbows straight and locked, scapulae depressed. Panel 4: arms straight, "
               "hips close to the wall, weight through the feet.",
        arrows="Orange directional arrows on the rotation path in panel 2 and downward at "
               "the shoulder blades in panel 3. An orange sequence number 1 to 4 in the "
               "corner of each panel marking the running order.",
        extra="Four stages of one warm-up, read left to right in order.",
    ),
)

CONTENT["progressive-finger-loading"] = E(
    steps_setup=[
        "Stand at the hangboard with both feet on the floor. Feet on the floor is how you "
        "control the load through the whole warm-up.",
        "Pick three holds in descending size: a jug, a 30mm edge, then the 20mm edge you "
        "will work on.",
        "Set a timer for 10 seconds on, 60 seconds off.",
    ],
    steps_exec=[
        "HANG ONE, JUG. Take roughly 40 percent of your weight through the hands, keeping "
        "the rest on your feet. Ten seconds. Step off. Rest sixty.",
        "HANG TWO, 30MM EDGE. Take a little more weight, maybe 50 percent. Ten seconds. "
        "Rest sixty.",
        "HANG THREE, 20MM EDGE. Around 60 percent, still with feet helping. Ten seconds. "
        "Rest sixty.",
        "HANG FOUR, 20MM EDGE. Close to your working position but still submaximal. Ten "
        "seconds.",
        "THE LAST HANG IS THE READINESS CHECK. Tender, sharp, clicking or aching means the "
        "session gets downgraded today, without negotiation. Move to DENSITY instead.",
    ],
    checks=[
        "Never progressed and never loaded. This is preparation, not training.",
        "Each hang is in the exact grip position you will use in the working sets.",
        "Fingers feel warm, blood-filled and responsive by the last hang.",
    ],
    mistakes=[
        "Skipping straight to the working load, which is how most finger injuries start.",
        "Doing the warm-up hangs in a different grip from the working sets.",
        "Ignoring what the last hang tells you because the session was already planned.",
    ],
    illus=None,
    illus_note="No openly-licensed frame shows progressive hangboard loading. Generate "
               "from the prompt.",
    prompt=prompt(
        panels=[
            "JUG, 40 PERCENT. Climber standing beneath a wall-mounted hangboard, BOTH FEET "
            "FLAT ON THE FLOOR, hands on the two largest jug holds of the board, arms "
            "nearly straight, body upright and taking only part of his weight through the "
            "hands. Side view showing clearly that the feet are loaded.",
            "30MM EDGE, 50 PERCENT. The same setup on a medium edge, feet still on the "
            "floor but with the knees slightly more bent so more weight goes through the "
            "hands.",
            "20MM EDGE, 60 PERCENT. The same setup on the small 20mm edge, feet still in "
            "contact with the floor, more weight through the arms, shoulders engaged and "
            "pulled down.",
        ],
        equipment="A plain wall-mounted hangboard drawn in simple outline with visibly "
                  "different hold sizes: two large jugs at the outside, a medium edge, and "
                  "a small edge. A plain floor line. Nothing else.",
        angles="THE FEET STAY ON THE FLOOR IN ALL THREE PANELS. This is the defining "
               "feature and must be unmistakable. Elbows slightly bent, never locked "
               "straight. Shoulders depressed and packed down away from the ears.",
        arrows="An orange percentage label beside each panel: 40%, 50%, 60%. An orange "
               "downward arrow through the body showing the load line, drawn thicker in "
               "each successive panel. A small orange arrow at the feet marking the weight "
               "they are still carrying.",
        extra="Three warm-up hangs in ascending load, read left to right. Same figure, same "
              "board, same scale.",
    ),
)

CONTENT["max-hang-halfcrimp"] = E(
    steps_setup=[
        "TWENTY MILLIMETRES, ALWAYS. Smaller edges concentrate load over a shorter contact "
        "area and are not a testing tool for fingers that are complaining.",
        "Set the half-crimp before you load it. SECOND KNUCKLES at roughly 90 degrees. "
        "FIRST KNUCKLES (the fingertip joints) EXTENDED, flat or slightly back. THUMB OFF, "
        "resting alongside the hand and doing nothing.",
        "Elbows SLIGHTLY BENT, never locked. Locked elbows put the load through the joint "
        "instead of the muscle.",
        "Shoulders down and back, ribs pulled down, glutes lightly engaged. The body is a "
        "plank hanging from the fingers, not a sack.",
        "Load: 85 to 90 percent of your tested 10 second max, added on a belt or removed "
        "with a pulley.",
    ],
    steps_exec=[
        "Step up or lift off smoothly. Never snatch onto the edge.",
        "Pull the edge TOWARD you rather than just hanging off it. Active fingers, active "
        "shoulders.",
        "Hold ten seconds, keeping the grip position identical from second one to second ten.",
        "Step off DELIBERATELY at ten seconds. Do not drop.",
        "Stop the set the moment the position degrades, not when the timer says so. A hang "
        "that drifts into a full crimp or an open drag is no longer the exercise you "
        "prescribed.",
        "Rest the full three minutes. Four to six sets.",
        "Progress: all four sets clean at ten seconds, then add 1 to 2kg next session.",
    ],
    checks=[
        "The knuckle profile is the same in second ten as it was in second one.",
        "Elbows stay slightly bent. Shoulders stay packed.",
        "The body hangs still. Kicking and swinging means the load is too high.",
        "You feel this in the forearm flexors, not as a point of pain in a finger.",
    ],
    mistakes=[
        "Drifting into full crimp (thumb over the index) or open drag under fatigue, which "
        "changes the exercise mid-set and loads the pulleys differently.",
        "Locked elbows, which is the most common source of medial elbow pain from hangboarding.",
        "Adding load before the current load is clean across every set.",
        "Training through sharpness, tenderness or joint ache. Any of those: stop the "
        "session and do DENSITY instead.",
    ],
    illus=None,
    illus_note="No openly-licensed frame shows hangboard grip positions. This one matters "
               "more than any other illustration in the book. Generate from the prompt.",
    prompt=prompt(
        panels=[
            "FULL BODY HANG. Climber hanging from a wall-mounted hangboard on a small 20mm "
            "edge with both hands, arms nearly straight with a SLIGHT visible bend at the "
            "elbows, shoulders pulled DOWN and back, ribs down, body held straight and "
            "still like a plank with legs together and slightly forward, toes pointed. "
            "Side-on three-quarter view.",
            "HALF-CRIMP, CORRECT. A large anatomical close-up of ONE HAND on a 20mm edge, "
            "seen from the side in profile. The knuckles at the base of the fingers are "
            "flexed, the MIDDLE knuckles are bent to approximately 90 degrees, and the "
            "FINGERTIP joints are EXTENDED FLAT so the fingertips lie flat on the edge. The "
            "THUMB is resting alongside the index finger, NOT wrapped over it. Four fingers, "
            "anatomically correct.",
            "FULL CRIMP, INCORRECT FOR THIS EXERCISE. The same close-up of one hand on the "
            "same edge, but now the fingertip joints are HYPEREXTENDED and the THUMB IS "
            "WRAPPED OVER THE TOP of the index fingernail, locking the grip.",
            "OPEN-HAND DRAG, INCORRECT FOR THIS EXERCISE. The same close-up, but the "
            "fingers are almost straight and draped over the edge with all joints nearly "
            "extended, only the base knuckles flexed, thumb hanging free.",
        ],
        equipment="A plain wall-mounted hangboard in simple outline with a clearly drawn "
                  "narrow 20mm edge. Nothing else.",
        angles="Panel 2 is the single most important drawing in this set: middle knuckle at "
               "90 degrees, fingertip joint FLAT, thumb OFF. Panels 3 and 4 must be "
               "unmistakably different from panel 2 in exactly those details. In panel 1 "
               "the elbows are slightly bent, never locked, and the shoulders are clearly "
               "depressed.",
        arrows="A burnt-orange 90-degree angle arc on the middle knuckle in panel 2. An "
               "orange tick mark in the corner of panel 2 and an orange X in the corners of "
               "panels 3 and 4. A small orange arrow pointing at the thumb in each of "
               "panels 2, 3 and 4, since the thumb is what distinguishes them.",
        extra="Draw the hands very large and anatomically exact: four fingers plus thumb, "
              "correct joint count, no fused or warped digits. The hand close-ups are the "
              "reason this illustration exists.",
    ),
)

CONTENT["max-hang-drag"] = E(
    steps_setup=[
        "Same 20mm edge, same board, same body position as the half-crimp hang.",
        "INDEX, MIDDLE AND RING ONLY. The little finger stays off the edge. Using it "
        "changes the exercise.",
        "Set the drag: fingers DRAPED over the edge, knuckles almost flat, all the finger "
        "joints close to straight. Only the base knuckles carry any flexion.",
        "Thumb resting alongside, doing nothing.",
        "Expect roughly 70 to 80 percent of your half-crimp load. It is a weaker position "
        "and that is normal.",
    ],
    steps_exec=[
        "Load smoothly. Elbows slightly bent, shoulders packed down, body a rigid plank.",
        "Hold ten seconds at 85 to 90 percent of your tested drag max.",
        "RESIST THE URGE TO CURL. As fatigue arrives the hand wants to pull into a crimp. "
        "The moment it does, the set is over.",
        "Step off deliberately. Rest three minutes. Three sets.",
        "Progress: five clean seconds on the last set before adding any load.",
    ],
    checks=[
        "Three fingers on, little finger clearly off.",
        "The knuckle profile stays flat. Any curl and it has become a crimp hang.",
        "This grip is the one that keeps working when the crimp is sore, so train it "
        "honestly rather than as an afterthought.",
    ],
    mistakes=[
        "Sliding into a crimp mid-hang, which is the whole failure mode of this exercise.",
        "Using the pinky, which changes the exercise and invalidates the comparison to "
        "your recorded drag numbers.",
        "Loading it like a half-crimp hang, which it will not support.",
    ],
    illus=None,
    illus_note="No openly-licensed frame shows the three-finger drag. Generate from the "
               "prompt.",
    prompt=prompt(
        panels=[
            "FULL BODY HANG. Climber hanging from a wall-mounted hangboard on a 20mm edge, "
            "arms nearly straight with a slight elbow bend, shoulders packed down, body "
            "straight and still. Side-on three-quarter view.",
            "THREE-FINGER DRAG, CORRECT. A large anatomical close-up of ONE HAND in profile "
            "on a 20mm edge. The INDEX, MIDDLE and RING fingers are DRAPED over the edge "
            "with all their joints close to STRAIGHT, only the base knuckles flexed, so the "
            "hand makes a smooth shallow curve rather than a step. The LITTLE FINGER is "
            "clearly lifted OFF the edge. The thumb hangs free alongside.",
            "CURLED INTO A CRIMP, INCORRECT. The same close-up, but the fingers have curled "
            "so the middle knuckles are bent toward 90 degrees, turning the drag into a "
            "crimp. This is the failure mode.",
        ],
        equipment="A plain wall-mounted hangboard in simple outline with a clearly drawn "
                  "narrow 20mm edge. Nothing else.",
        angles="Panel 2: all finger joints close to extended, the knuckle line nearly flat, "
               "little finger visibly raised clear of the edge. Panel 3 differs from panel "
               "2 ONLY in that the fingers have curled.",
        arrows="An orange arrow pointing at the raised little finger in panel 2, marking it "
               "as deliberately off. An orange tick in the corner of panel 2 and an orange "
               "X in the corner of panel 3.",
        extra="Draw the hands very large and anatomically exact, four fingers plus thumb, "
              "correct joint count. The distinction between panels 2 and 3 is the entire "
              "point of the drawing.",
    ),
)

CONTENT["repeaters"] = E(
    steps_setup=[
        "Half-crimp on the 20mm edge, same position as your max hangs.",
        "Load at 55 to 65 percent of your max hang load. This is deliberately much lighter "
        "than a max hang.",
        "TIMER RUNNING BEFORE YOU START. Seven seconds on, three seconds off, and three "
        "seconds is not long enough to set a timer in.",
        "This protocol is FIXED. It does not scale with level or energy.",
    ],
    steps_exec=[
        "Hang seven seconds. Step or drop off for three. Repeat six times. That is ONE SET, "
        "sixty seconds total.",
        "In each three-second gap, COME OFF THE EDGE AND SHAKE OUT. Staying on the edge "
        "through the rest windows turns a repeater into a long max hang.",
        "Rest 150 seconds between sets. Six sets is the dose.",
        "The last two repetitions of each set should be a genuine fight.",
        "Progress: when all six sets complete without early drops, add 1kg.",
    ],
    checks=[
        "If set six feels the same as set one, the load is too light.",
        "The grip position holds through all six pulls of a set. When it degrades, the set "
        "is finished.",
        "You end the block pumped, not injured. This trains strength-endurance, not "
        "maximum strength.",
    ],
    mistakes=[
        "Loading it like a max hang, which is the single most common error and makes six "
        "sets impossible.",
        "Staying on the edge through the three-second rests.",
        "Adding sets. Six is the protocol. If six is easy, add load, not volume.",
    ],
    illus=None,
    illus_note="No openly-licensed frame shows a repeater protocol. Generate from the "
               "prompt.",
    prompt=prompt(
        panels=[
            "ON, 7 SECONDS. Climber hanging from a wall-mounted hangboard on a 20mm edge in "
            "a half-crimp, arms slightly bent, shoulders packed down, body straight and "
            "still, feet off the floor. Side view.",
            "OFF, 3 SECONDS. The same climber standing on the floor directly beneath the "
            "board, both arms hanging down and RELAXED at his sides, one hand loosely "
            "shaking out, fingers open and loose. He is clearly OFF the board.",
        ],
        equipment="A plain wall-mounted hangboard with a visible 20mm edge, and a plain "
                  "floor line. Nothing else.",
        angles="Panel 1: half-crimp, middle knuckles near 90 degrees, fingertip joints "
               "flat, thumb off, elbows slightly bent, shoulders depressed. Panel 2: fully "
               "unloaded, hands completely off the board, shoulders relaxed.",
        arrows="A large orange '7s' label above panel 1 and a large orange '3s' label above "
               "panel 2. A circular orange arrow looping from panel 2 back to panel 1 with "
               "the orange label 'x6' beside it, showing the cycle repeats six times to "
               "make one set.",
        extra="Two alternating states of one interval protocol. The contrast between loaded "
              "and completely unloaded is the point: panel 2 must show the hands entirely "
              "off the board.",
    ),
)

CONTENT["critical-force"] = E(
    steps_setup=[
        "Same edge and same grip as your repeaters.",
        "Load at or just above your measured critical force, roughly 60 to 70 percent of "
        "max. If you have not tested it, start conservatively.",
        "Five clear minutes with nothing to interrupt you. Timer visible.",
        "This protocol is FIXED. Brutal and boring, and both of those are by design.",
    ],
    steps_exec=[
        "Seven seconds on, three seconds off, CONTINUOUSLY for four minutes. Twenty-four "
        "pulls with no set breaks.",
        "Settle into a rhythm in the first thirty seconds. The pace you set early decides "
        "whether you finish.",
        "Keep the effort EVEN. Do not reduce effort in the middle to survive to the end: "
        "that produces a number that means nothing and a stimulus that trains nothing.",
        "The last minute should be at the edge of failure without falling off.",
        "Rest five full minutes between blocks. Two to three blocks.",
        "Retest critical force every 6 to 8 weeks and reset the training load from it.",
    ],
    checks=[
        "A steady, sustainable rhythm rather than a fast start and a collapse.",
        "Breathing settled early. Panic breathing burns the set.",
        "This is the closest thing on a board to being pumped mid-route and having to keep "
        "going.",
    ],
    mistakes=[
        "Starting too heavy and blowing up at two minutes.",
        "Quietly reducing effort in the middle to survive to the end.",
        "Treating it as a max session. The load is moderate on purpose; the duration is "
        "what hurts.",
    ],
    illus=None,
    illus_note="No openly-licensed frame exists. Generate from the prompt.",
    prompt=prompt(
        panels=[
            "Climber hanging from a wall-mounted hangboard on a 20mm edge in a half-crimp, "
            "arms slightly bent, shoulders packed, body straight, showing visible effort and "
            "controlled breathing but good position. Side view.",
            "A simple diagrammatic TIMELINE drawn in ink and burnt orange: a horizontal bar "
            "four minutes long, divided into 24 alternating segments, the longer segments "
            "labelled 7s and the shorter ones 3s, with a burnt-orange horizontal dashed line "
            "running the full length of the bar labelled 'critical force'. No human figure "
            "in this panel.",
        ],
        equipment="A plain wall-mounted hangboard with a visible 20mm edge in panel 1. "
                  "Panel 2 is a pure diagram with no equipment.",
        angles="Panel 1: half-crimp with middle knuckles near 90 degrees and fingertips "
               "flat, elbows slightly bent, shoulders depressed, body still.",
        arrows="In panel 2, an orange bracket spanning the whole bar labelled '4 minutes, "
               "24 pulls'. In panel 1, a small orange arrow at the ribcage indicating "
               "steady rhythmic breathing.",
        extra="One figure panel and one diagram panel. Keep the diagram flat, simple and "
              "schematic, in the same ink and orange as everything else.",
    ),
)

CONTENT["density-hangs"] = E(
    steps_setup=[
        "Any edge, anywhere: home doorway board, the gym, a hangboard by the kitchen.",
        "Stand UNDER the edge with BOTH FEET ON THE FLOOR. The feet stay there.",
        "Take only PART of your weight through the fingers, about 40 percent of max. Light "
        "strain only.",
        "This protocol is FIXED, and the whole design depends on it staying light.",
    ],
    steps_exec=[
        "Ten seconds on, fifty seconds off. Ten times. Ten minutes total, one hundred "
        "seconds of actual hanging.",
        "Alternate grips across the ten hangs: half-crimp, open hand, three-finger drag, "
        "and two-finger pockets if they are healthy.",
        "It should feel ALMOST TOO EASY. That is the protocol working as designed, not you "
        "slacking.",
        "You should be able to hold a conversation throughout.",
        "Progress by FREQUENCY, not load: one block daily, then two blocks at least six "
        "hours apart. Load only creeps up as bodyweight support naturally reduces.",
    ],
    checks=[
        "Feet on the floor for all ten hangs.",
        "Breathing completely normal. If you are bracing, it is too heavy.",
        "No pump, no fatigue, nothing sore the next morning.",
    ],
    mistakes=[
        "Turning it into a max session because it feels too light. This is the one thing "
        "that breaks the protocol.",
        "Doing it twice a day with less than six hours between blocks.",
        "Chasing load. Frequency is the progression variable here, not weight.",
    ],
    illus=None,
    illus_note="No openly-licensed frame shows a feet-on density hang. Generate from the "
               "prompt.",
    prompt=prompt(
        panels=[
            "Climber standing beneath a wall-mounted hangboard with BOTH FEET FLAT ON THE "
            "FLOOR, knees slightly bent, hands on a small edge, arms nearly straight, body "
            "upright and completely relaxed. He is taking only part of his weight through "
            "his hands. His expression and posture are calm and unstrained. Side view, the "
            "loaded feet clearly visible.",
            "A simple diagrammatic TIMELINE in ink and burnt orange: a horizontal bar ten "
            "minutes long divided into 10 short segments labelled 10s separated by long "
            "segments labelled 50s, with the orange label 'x10' beneath. No human figure.",
        ],
        equipment="A plain wall-mounted hangboard in simple outline and a plain floor line. "
                  "Panel 2 is a pure diagram.",
        angles="THE FEET ARE FLAT ON THE FLOOR AND OBVIOUSLY CARRYING WEIGHT. This is the "
               "defining feature of the exercise and the thing that separates it from every "
               "other hang in the book. Posture relaxed and upright, shoulders not strained.",
        arrows="An orange '40%' label with a downward arrow through the arms, and a "
               "second orange arrow at the feet labelled '60%', showing how the load is "
               "split. No strain lines anywhere on the figure.",
        extra="The mood of panel 1 must read as EASY and casual, in deliberate contrast to "
              "the max hang illustration. That contrast is instructional.",
    ),
)

CONTENT["limit-boulder"] = E(
    steps_setup=[
        "Fully warm. This comes after the warm-up, never at the start and never at the end.",
        "Pick two or three problems that are GENUINELY HARD for you: four to six moves, "
        "ideally steep ground with small holds.",
        "Choose problems that expose you, not ones that suit you. The value is in the "
        "positions you are bad at.",
        "A good target is a problem you could do in one to four tries on a good day.",
    ],
    steps_exec=[
        "ONE FULL ATTEMPT per set. Commit to it completely.",
        "Then THREE MINUTES OF REAL REST. Sit down. Breathe. Do not fiddle with your phone "
        "under the board and call it rest.",
        "Six to eight maximal attempts total across the session.",
        "Stop the moment quality drops. Six maximal attempts beats twelve tired ones, and "
        "tired attempts train the wrong motor pattern.",
        "Progress by choosing HARDER PROBLEMS, not by adding attempts.",
    ],
    checks=[
        "Every attempt is at genuine maximum intent.",
        "You are resting long enough that each attempt feels fresh.",
        "The problems are exposing a weakness rather than confirming a strength.",
    ],
    mistakes=[
        "Cutting rest to three attempts in five minutes, which turns a power session into "
        "a mediocre endurance session.",
        "Continuing once quality drops.",
        "Choosing problems that suit you. Comfortable projects are a different, easier "
        "session wearing this one's name.",
    ],
    illus=None,
    illus_note="No openly-licensed frame shows limit bouldering. Generate from the prompt.",
    prompt=prompt(
        panels=[
            "Climber mid-move on a steeply overhanging bouldering wall, body tensioned "
            "hard: one hand latching a small crimp high above, the other hand pulling on a "
            "low hold, hips pulled IN CLOSE to the wall, one foot pressing on a small "
            "foothold and the other toe-hooking, back straight, whole body engaged. "
            "Side-on three-quarter view. Draw the wall as a plain overhanging plane with "
            "simple geometric holds, no texture, no gym background.",
            "The same climber SEATED on a plain crash pad below the wall, elbows on knees, "
            "head up, breathing and resting between attempts, hands loose and open.",
        ],
        equipment="A plain overhanging climbing wall drawn as one clean angled plane with "
                  "simple geometric holds. A plain rectangular crash pad. Nothing else.",
        angles="Panel 1: hips close to the wall, arms not fully extended, body under "
               "obvious tension, both feet actively engaged. Panel 2: completely relaxed "
               "posture, shoulders down, hands open.",
        arrows="An orange '1 attempt' label above panel 1 and an orange '3 min' label "
               "above panel 2, with a circular orange arrow between them showing the cycle.",
        extra="The contrast between maximal effort and genuine full rest is the "
              "instructional point of this pair.",
    ),
)

CONTENT["campus-ladders"] = E(
    steps_setup=[
        "GATED. This exercise stays locked until your two-arm 20mm hang is at least 130 "
        "percent of bodyweight AND you have had four clear weeks with no finger or elbow "
        "pain. Until then the app substitutes recruitment pulls, which give most of the "
        "benefit at a fraction of the risk.",
        "LARGE RUNGS ONLY. Small rungs multiply the injury risk and add nothing.",
        "Fully warm, AFTER the limit boulders, never at the end of a session.",
        "Only two hand positions are safe on rungs: a full open hang, or the chisel "
        "half-crimp. Nothing else.",
    ],
    steps_exec=[
        "Match both hands on rung 1.",
        "Move one hand up to rung 3. Catch it in a controlled position with the shoulder "
        "ENGAGED, never hanging loose in the socket.",
        "Move the other hand up to rung 5.",
        "Come down under control. That is one ladder, and one ladder is one set.",
        "Rest three full minutes. Four to five sets, never more.",
        "STOP THE EXERCISE the moment a catch feels sloppy. Not the set: the exercise.",
        "Progress by adding a rung span (1-4-7) before adding sets.",
    ],
    checks=[
        "Shoulders stay engaged and pulled down through every catch.",
        "Every catch is controlled. A catch you barely hold is the one that injures you.",
        "You stop while it still feels good.",
    ],
    mistakes=[
        "Campusing tired. Every campus injury happens on the set someone should not have "
        "done.",
        "Campusing on small rungs.",
        "Hanging loose into the shoulder sockets on the catch.",
        "Doing it because it looks impressive rather than because a test says you need it.",
    ],
    illus=None,
    illus_note="No openly-licensed frame shows campus board work. Generate from the prompt.",
    prompt=prompt(
        panels=[
            "START. Climber hanging from a steeply overhanging campus board with BOTH hands "
            "matched on the same large rung, arms slightly bent, shoulders pulled DOWN and "
            "engaged, feet hanging free with legs straight and still. Side view. Draw the "
            "campus board as a plain overhanging panel with a ladder of evenly spaced "
            "horizontal rungs, numbered 1 to 7 in small burnt-orange figures up the side.",
            "MID LADDER. The same climber with one hand still on rung 1 and the other hand "
            "having moved up and caught rung 3, body extended, shoulder of the high arm "
            "clearly ENGAGED and pulled down, not hanging loose.",
            "TOP. The same climber with one hand on rung 3 and the other having caught rung "
            "5, body extended upward, both shoulders engaged.",
        ],
        equipment="A plain overhanging campus board panel with evenly spaced horizontal "
                  "rungs, drawn in simple outline. Nothing else.",
        angles="Elbows NEVER fully locked straight in any panel: always a slight bend. "
               "Shoulders depressed and engaged in every panel, with a visible gap between "
               "ear and shoulder. Legs straight, together and still, never kicking.",
        arrows="Burnt-orange rung numbers 1 to 7 running up the side of the board. Orange "
               "arrows tracing each hand's path: 1 to 3 in panel 2, 3 to 5 in panel 3. A "
               "small orange arrow at each shoulder pointing DOWN, marking engagement.",
        extra="Three stages of one ladder, read left to right. Same figure, same board, "
              "same scale.",
    ),
)

CONTENT["recruitment-pulls"] = E(
    steps_setup=[
        "You need an edge that CANNOT MOVE: a block fixed to a solid anchor, a loading pin "
        "bottomed out, or a hangboard edge with your feet planted and a weight belt "
        "anchored to the floor.",
        "Set the grip you want to train, half-crimp or open, before you start pulling.",
        "Elbow slightly bent, shoulder packed down, body braced.",
        "This is the substitute the app gives you while the campus gate is closed, and it "
        "gives most of the benefit at a fraction of the risk.",
    ],
    steps_exec=[
        "Build to MAXIMUM FORCE AS FAST AS YOU CAN. Full effort from the first half-second.",
        "Hold that maximal pull for five seconds.",
        "Release, rest 120 to 150 seconds. Four to five sets.",
        "INTENT IS THE TRAINING VARIABLE, not duration and not load. Contact strength is "
        "how FAST you reach force, not how much you eventually reach.",
        "Progress by measuring peak force on a gauge, or by using a heavier block.",
    ],
    checks=[
        "The first half-second is maximal. If you ease into it, you have trained the wrong "
        "quality.",
        "The grip position holds for the full five seconds.",
        "You are fresh. Maximal intent is simply not available when fatigued.",
    ],
    mistakes=[
        "Easing into the pull, which trains maximum strength rather than rate of force "
        "development.",
        "Doing these fatigued.",
        "Treating the five seconds as the target. The first half-second is the target.",
    ],
    illus=None,
    illus_note="No openly-licensed frame exists. Generate from the prompt.",
    prompt=prompt(
        panels=[
            "Climber standing with BOTH FEET FLAT AND BRACED on the floor, gripping a small "
            "edge block attached by a short chain or strap to a heavy immovable anchor at "
            "floor level. He is pulling upward with maximal effort: elbow slightly bent, "
            "shoulder packed down and back, back straight, whole body braced and rigid, "
            "clear tension through the trunk and legs. The block does NOT move. Side view.",
            "A large anatomical close-up of the hand on the edge in a half-crimp: middle "
            "knuckles bent to about 90 degrees, fingertip joints flat, thumb off and "
            "resting alongside. Four fingers, anatomically exact.",
            "A simple diagram in ink and burnt orange: a force-over-time graph with time on "
            "the horizontal axis and force on the vertical. One steep orange curve rising "
            "almost vertically to a plateau, labelled 'correct'. A second grey curve rising "
            "slowly and gradually to the same plateau, labelled with a small X. No figure.",
        ],
        equipment="A small edge block on a short chain, a heavy plain anchor block or floor "
                  "plate. Panel 3 is a pure diagram.",
        angles="Panel 1: elbow slightly bent, shoulder depressed, spine neutral, whole body "
               "braced. The anchor is immovable, so nothing is being lifted.",
        arrows="A thick orange upward arrow at the hand in panel 1 with the label 'MAX, "
               "from the first half-second'. In panel 3 the steepness of the orange curve "
               "versus the grey one is the entire message.",
        extra="Panel 3 is what makes this exercise understandable: it is about how fast "
              "force arrives, not how much. Keep the graph flat and schematic.",
    ),
)

CONTENT["explosive-pullup"] = E(
    steps_setup=[
        "Dead hang from the bar, overhand grip, shoulder width.",
        "Engage the shoulders BEFORE the pull starts: blades down and back. A pull that "
        "starts from a loose shoulder is how shoulders get hurt at speed.",
        "Body rigid: ribs down, glutes on, legs still.",
    ],
    steps_exec=[
        "Pull AS FAST AS YOU PHYSICALLY CAN, aiming to bring the chest to the bar.",
        "Lower under control. The descent is not the exercise but it is not a free drop "
        "either.",
        "Reset fully at the bottom: full dead hang, shoulders re-engaged, body still.",
        "THREE REPS MEANS THREE MAXIMAL-SPEED REPS. The moment speed drops, the set is "
        "finished, even at rep two.",
        "Rest 150 seconds. Three sets.",
        "Progress: chest to bar, then hands leaving the bar at the top, then a small added "
        "load.",
    ],
    checks=[
        "Speed, not height, is the measure. A fast three-quarter rep beats a slow full one "
        "here.",
        "No swing. The speed comes from the pull, not from a kip.",
        "Shoulders engaged before every rep starts.",
    ],
    mistakes=[
        "Grinding out slow reps once speed has gone, which trains a different quality "
        "entirely.",
        "Using a swing to generate the speed.",
        "Doing these at the end of a session when the nervous system is flat.",
    ],
    illus=("pull-up", [1, 2, 3]),
    illus_note="Stock frames show the pull-up path. The speed, which is the whole point, "
               "is drawn from the prompt.",
    prompt=prompt(
        panels=[
            "BOTTOM. Climber in a dead hang from a horizontal bar, overhand grip, arms "
            "completely straight but SHOULDERS ALREADY ENGAGED and pulled down, body rigid "
            "and vertical, legs straight and still. Side view.",
            "EXPLOSIVE PULL. The same figure driving upward at maximum speed, elbows bent "
            "past 90 degrees, chest rising toward the bar, body still rigid and vertical "
            "with no kip or swing. Convey speed with clean burnt-orange motion lines behind "
            "the torso, not with a blurred or distorted body.",
            "TOP. The same figure at the peak with the CHEST level with the bar, elbows "
            "pulled down beside the ribs, body still vertical and controlled.",
        ],
        equipment="A plain horizontal bar. Nothing else.",
        angles="The body stays vertical and rigid in all three panels with no hip kick and "
               "no leg swing. Shoulders depressed throughout, including in panel 1.",
        arrows="Straight burnt-orange speed lines trailing below the torso in panel 2. A "
               "thick orange upward arrow beside the body labelled 'MAX SPEED'. A dashed "
               "orange vertical reference line through all three panels showing the body "
               "does not swing off the line.",
    ),
)

CONTENT["ring-toehook"] = E(
    steps_setup=[
        "Rings set at roughly head height.",
        "A low bar, or the ring straps themselves, positioned where you can hook both heels "
        "over it.",
        "Take the rings, then hook BOTH HEELS over the bar or straps so you are suspended "
        "between hands and feet.",
        "Shoulders packed down before you load the position.",
    ],
    steps_exec=[
        "Pull with the HANDS AND THE FEET AT THE SAME TIME to bring the body into a "
        "horizontal line.",
        "The heels actively pull toward you while the hands pull the rings toward the hips. "
        "This opposing pull is the whole exercise.",
        "Hold the horizontal line, hips UP, body straight.",
        "For reps, move slowly between a lower and a horizontal position rather than "
        "bouncing.",
        "Eight reps or holds. Progress: longer holds, then a straighter body, then one arm "
        "on the rings.",
    ],
    checks=[
        "The hips stay up. A dropped hip means the feet have stopped pulling.",
        "You feel this across the whole posterior chain and the trunk, not just the arms.",
        "This is the tension climbing actually asks for: pulling with the feet while the "
        "hands hold.",
    ],
    mistakes=[
        "Letting the hips drop, which unloads the toe hook and turns it into a hang.",
        "Relying on the arms and forgetting the feet are meant to be pulling.",
        "Setting the rings too low, which removes the tension requirement.",
    ],
    illus=None,
    illus_note="No openly-licensed frame shows a ring toe-hook. Generate from the prompt.",
    prompt=prompt(
        panels=[
            "Climber suspended horizontally face-up between two gymnastic rings held in his "
            "hands above and slightly behind his shoulders, and a low horizontal bar over "
            "which BOTH HEELS ARE HOOKED. The body is held in a straight horizontal line "
            "from shoulders to heels, hips UP and level with the shoulders, arms bent and "
            "pulling the rings in toward the hips. Side view, full profile.",
            "A close-up of the HEEL HOOK: the back of the heel and the Achilles pressing "
            "over the top of the bar, toes pointed back and down, ankle actively flexed to "
            "grip. Show clearly that the heel, not the toes, is doing the hooking.",
        ],
        equipment="Two gymnastic rings on plain straps, and one plain low horizontal bar. "
                  "Nothing else.",
        angles="The body is HORIZONTAL with the hips level with the shoulders, no sag. "
               "Shoulders packed down. Elbows bent, rings drawn toward the hips rather than "
               "held out at arm's length.",
        arrows="An orange arrow at the heels pointing back toward the body, and an orange "
               "arrow at the hands pointing toward the hips, showing the two opposing "
               "pulls that create the tension. A dashed orange horizontal line through the "
               "body showing the required straight line.",
    ),
)

CONTENT["trx-ytw"] = E(
    steps_setup=[
        "TRX or rings at roughly chest height.",
        "Take a handle in each hand, arms straight, and lean BACK so your weight is on the "
        "straps.",
        "Body rigid from heels to head. Walk the feet forward until you feel real "
        "resistance, but stay light: the angle sets the load and you want this easy.",
    ],
    steps_exec=[
        "Y, 10 reps. Keeping the arms STRAIGHT, pull yourself up by raising both arms into "
        "a wide overhead Y, thumbs up. Lower under control.",
        "T, 10 reps. Arms straight, pull out to the sides into a T, squeezing the shoulder "
        "blades together.",
        "W, 10 reps. Bend the elbows and pull them back and down close to the ribs, "
        "forearms angled up, so the arms form a W.",
        "Two rounds, 45 seconds between.",
        "Progress by walking the feet forward to steepen the angle. Never to failure.",
    ],
    checks=[
        "No shrugging. Shoulders stay down and away from the ears in all three positions.",
        "The body stays a rigid plank. The hips do not sag or pike.",
        "Slow and precise beats heavy. This is scapular control, not a back workout.",
    ],
    mistakes=[
        "Shrugging, which swaps the scapular stabilisers for the traps.",
        "Steepening the angle until it becomes a row.",
        "Bending the arms on the Y and the T, which does the same thing.",
    ],
    illus=("prone-t-raise", [1, 2]),
    illus_note="Stock frames show the T position prone. The suspended Y, T and W are drawn "
               "from the prompt.",
    prompt=prompt(
        panels=[
            "Y. Climber leaning back with straight body and straight arms, holding two "
            "suspension-trainer handles, arms raised overhead in a wide Y shape, thumbs up, "
            "shoulders DOWN and not shrugged, body one rigid line from heels to head at "
            "roughly 45 degrees to the floor. Front three-quarter view.",
            "T. The same suspended lean, arms straight and pulled out horizontally to both "
            "sides forming a T, shoulder blades squeezed together.",
            "W. The same suspended lean, but with the elbows bent and pulled back and DOWN "
            "close to the ribs, forearms angled upward and outward, arms forming a W shape.",
        ],
        equipment="A suspension trainer drawn as two plain straps with simple handles, "
                  "descending from off the top of the frame. Nothing else.",
        angles="The body is one rigid straight line from heels to head in ALL THREE panels, "
               "with absolutely no hip sag. Shoulders depressed, never shrugged. Arms "
               "straight in panels 1 and 2, bent only in panel 3.",
        arrows="A dashed orange straight line through the body in every panel showing the "
               "plank. A small orange downward arrow at each shoulder in every panel "
               "reinforcing that the shoulders stay down.",
        extra="Three positions of one circuit, read left to right. Same figure, same "
              "straps, same body angle in all three.",
    ),
)

CONTENT["pullup-strength-endurance"] = E(
    steps_setup=[
        "Bar or rings. Overhand grip, shoulder width.",
        "Full dead hang to start. Shoulders engaged before the first pull.",
        "Pick a load and a rep count that leaves two or three reps in reserve at the end of "
        "each set. RPE 7 to 8.",
    ],
    steps_exec=[
        "Eight controlled reps, full range: chin clearly over the bar at the top, arms "
        "completely straight at the bottom.",
        "No kipping and no bouncing out of the bottom.",
        "STOP TWO OR THREE REPS SHORT OF FAILURE on every set. This is deliberately not a "
        "max effort.",
        "Rest 120 seconds. Four sets.",
        "Progress: add a rep per set up to twelve, then add load and drop back to eight.",
    ],
    checks=[
        "Full range on every rep, including the last one of the last set.",
        "You finish each set knowing you had more.",
        "This is the bridge between a heavy single and a thirty-move route.",
    ],
    mistakes=[
        "Taking every set to failure, which wrecks the rest of the session and trains "
        "fatigue rather than capacity.",
        "Shortening the range as the sets go on.",
        "Kipping once it gets hard.",
    ],
    illus=("pull-up", [1, 2, 3]),
    illus_note=None,
    prompt=prompt(
        panels=[
            "BOTTOM. Climber in a full dead hang from a horizontal bar, overhand grip at "
            "shoulder width, arms COMPLETELY straight, shoulders engaged and pulled down, "
            "body vertical and still, legs straight with ankles crossed. Side view.",
            "TOP. The same figure pulled up with the CHIN CLEARLY ABOVE the bar, elbows "
            "driven down beside the ribs, shoulder blades depressed and retracted, body "
            "still vertical with no kip or swing.",
        ],
        equipment="A plain horizontal bar. Nothing else.",
        angles="Panel 1: elbows fully locked straight, this full extension is the "
               "checkpoint. Panel 2: chin above bar height. Body vertical in both, no hip "
               "kick, no knees swinging forward.",
        arrows="A dashed orange vertical reference line through the body in both panels "
               "showing there is no swing. An orange bracket at the side spanning the "
               "distance between the two positions, labelled 'full range'.",
    ),
)

CONTENT["kb-overhead-press"] = E(
    steps_setup=[
        "Kettlebell racked at the shoulder: bell resting on the back of the forearm, elbow "
        "tucked in close to the ribs, WRIST STRAIGHT and not bent back.",
        "Feet shoulder width. Ribs pulled DOWN, glutes lightly squeezed. This rib position "
        "stops you pressing by leaning back.",
        "Free hand out to the side for balance.",
    ],
    steps_exec=[
        "Press the bell straight overhead. The path curves slightly out and then back in "
        "over the head, not straight up in front of your face.",
        "Finish with the BICEPS BESIDE THE EAR and the shoulder ACTIVELY PUSHING UP at the "
        "top. That last push is the range climbers lose.",
        "Lower under control back to the rack position.",
        "Eight reps, then swap sides. Rest 90 seconds. Three sets per side.",
        "Progress: add reps to twelve, then move to a half-kneeling or single-leg stance so "
        "the trunk has to work harder.",
    ],
    checks=[
        "Ribs stay down. If you are leaning back to press, the weight is too heavy.",
        "The arm finishes fully vertical with the biceps by the ear.",
        "The wrist stays straight throughout, never bent back under the bell.",
    ],
    mistakes=[
        "Leaning back to press, which converts an overhead press into a standing incline "
        "press and skips the range you came for.",
        "Stopping short of full overhead.",
        "Flared ribs, which is the same fault as leaning back seen from the front.",
    ],
    illus=("standing-dumbbell-press", [1, 2]),
    illus_note=None,
    prompt=prompt(
        panels=[
            "RACK. Climber standing, feet shoulder width, holding a single kettlebell in "
            "the RACK position at the right shoulder: the bell resting against the back of "
            "the forearm, elbow tucked down close to the ribs, wrist STRAIGHT, forearm "
            "vertical. Free arm out to the side for balance. Ribs pulled down, torso "
            "vertical. Front three-quarter view.",
            "LOCKOUT. The same figure with the kettlebell pressed fully overhead, arm "
            "completely straight and vertical, BICEPS BESIDE THE EAR, shoulder actively "
            "pushed up, wrist straight and stacked directly over the elbow and shoulder. "
            "The torso is still VERTICAL with no backward lean and the ribs are still down.",
            "INCORRECT. The same lockout attempt but with the torso LEANING BACK and the "
            "lower ribs flared forward, the arm not truly vertical. This is the common "
            "fault.",
        ],
        equipment="A single plain kettlebell drawn in simple outline. Nothing else.",
        angles="Panel 2: the wrist, elbow and shoulder stack in one vertical line, biceps "
               "touching the ear, spine VERTICAL. Panel 3 differs from panel 2 only by the "
               "backward lean and the rib flare.",
        arrows="A dashed orange vertical line running from the bell down through the wrist, "
               "elbow, shoulder and hip in panel 2, showing the stack. An orange upward "
               "arrow at the shoulder in panel 2 marking the active reach. An orange X in "
               "the corner of panel 3 with a small orange arc highlighting the flared ribs.",
    ),
)

CONTENT["ring-dips"] = E(
    steps_setup=[
        "PUSH-UPS: hands under the shoulders, body one straight line from heels to crown.",
        "RING PUSH-UPS: rings set just above floor height, shoulders packed down, body a "
        "rigid plank.",
        "RING DIPS: rings at hip height. Support yourself with arms locked, shoulders "
        "pressed DOWN away from the ears, ribs down, legs straight and together.",
        "Move up the variation ladder before you add any weight. Range before load on a "
        "pattern you have barely trained.",
    ],
    steps_exec=[
        "Lower with the elbows tracking BACK at about 45 degrees from the ribs, never "
        "flared out to 90.",
        "PUSH-UPS: chest to the floor. RINGS: chest to ring height.",
        "DIPS: lower only to the point where the SHOULDER STAYS PACKED. A deep dip loads "
        "the front of the shoulder hard and the extra range is not worth having.",
        "Press to full lockout. On rings, finish each rep by TURNING THE RINGS OUT until "
        "the palms face forward. That turnout is the stability work.",
        "Ten reps, three sets, 90 seconds rest.",
    ],
    checks=[
        "One straight line from heels to crown on the push-up variants.",
        "Shoulders stay down and packed at the bottom of every dip.",
        "Rings turned out at the top of every ring rep.",
    ],
    mistakes=[
        "Hips sagging on the push-up variants.",
        "Elbows flaring to 90 degrees.",
        "On dips, dropping below the point where the shoulder stays packed.",
        "Chasing the harder ring variation before the easier one is clean.",
    ],
    illus=("dip", [1, 2]),
    illus_note="Stock frames show the bar dip. The ring turnout is drawn from the prompt.",
    prompt=prompt(
        panels=[
            "RING SUPPORT, TOP. Climber supporting himself on two gymnastic rings at hip "
            "height, arms COMPLETELY straight and locked, shoulders pressed DOWN away from "
            "the ears, ribs down, body vertical, legs straight and together below him. The "
            "RINGS ARE TURNED OUT so the palms face forward. Side view.",
            "BOTTOM. The same figure lowered until the upper arms are roughly parallel to "
            "the floor and the chest is at ring height, elbows tracking BACK at about 45 "
            "degrees close to the ribs, shoulders still packed DOWN and not shrugged up "
            "toward the ears. He has not dropped deeper than this.",
            "CLOSE-UP OF THE TURNOUT: one hand gripping a ring at lockout with the palm "
            "rotated to face FORWARD, and beside it a greyed-out version with the palm "
            "facing inward marked with a small orange X.",
        ],
        equipment="Two gymnastic rings on plain straps descending from off the top of the "
                  "frame. Nothing else.",
        angles="Shoulders DEPRESSED in both panels 1 and 2, never shrugged. In panel 2 the "
               "upper arm is roughly horizontal and no lower: this is a deliberately "
               "limited depth. Elbows at 45 degrees from the ribs, not flared to 90.",
        arrows="An orange downward arrow at each shoulder in both panels marking "
               "depression. An orange rotational arc at the wrist in panel 1 showing the "
               "turnout. A dashed orange horizontal line at the bottom of panel 2 labelled "
               "'stop here', marking the depth limit.",
    ),
)

CONTENT["goblet-squat"] = E(
    steps_setup=[
        "Feet shoulder width, toes turned slightly out.",
        "Hold the kettlebell at the chest BY THE HORNS, elbows pointing down and tucked "
        "inside the knees. The bell at the chest is the counterweight that lets you stay "
        "upright.",
        "Bodyweight only until the depth is honest.",
        "Heels stiff: if the ankles are tight, park the heels on a 2cm plate.",
    ],
    steps_exec=[
        "Big breath in at the top and brace the trunk.",
        "Sit DOWN between the hips rather than back, keeping the chest tall.",
        "Descend until the HIP CREASE PASSES BELOW THE KNEE. That is the depth, and it is "
        "not negotiable for the exercise to be worth doing.",
        "Keep the heels planted flat the whole way down.",
        "Drive up through the WHOLE FOOT, exhaling on the way up.",
        "Ten reps, two sets, 90 seconds rest.",
        "Progress: two clean sets of twelve at full depth, then a 3 second pause in the "
        "hole, then the heaviest bell in the gym. Legs recover fast, so this is the one "
        "place in the programme you can be impatient.",
    ],
    checks=[
        "Hip crease below the knee on every rep.",
        "Heels flat on the floor throughout.",
        "Knees tracking out over the toes, not collapsing inward.",
        "Lower back stays long, not rounded at the bottom.",
    ],
    mistakes=[
        "Cutting depth to move weight, which is the whole reason the movement stops working.",
        "Heels lifting. Put them on a small plate rather than shortening the range.",
        "Knees collapsing inward.",
        "Rounding the lower back at the bottom.",
    ],
    illus=("goblet-squat", [1, 2, 3]),
    illus_note=None,
    prompt=prompt(
        panels=[
            "TOP. Climber standing upright, feet shoulder width with toes turned slightly "
            "out, holding a kettlebell at chest height by its horns with both hands, elbows "
            "pointing down. Torso tall and vertical. Front three-quarter view.",
            "BOTTOM. The same figure in a deep squat with the HIP CREASE CLEARLY BELOW THE "
            "KNEE, heels FLAT on the floor, chest tall and upright, elbows tucked inside "
            "the knees, lower back long and not rounded, knees tracking out over the toes.",
            "FRONT VIEW. The same bottom position seen from directly in front, showing both "
            "knees tracking OUT over the second toes, hips level, feet flat.",
        ],
        equipment="A single plain kettlebell drawn in simple outline. Nothing else.",
        angles="Panel 2: the hip crease must be drawn visibly LOWER than the top of the "
               "knee, heels flat, torso close to vertical. Panel 3: knees over toes, not "
               "caved inward.",
        arrows="A dashed orange horizontal line at the hip crease and a second at the top "
               "of the knee in panel 2, with a small orange arrow showing the hip line is "
               "below the knee line. An orange arrow pressing down through the whole foot. "
               "In panel 3, a faint greyed inward-collapsed knee drawn behind, marked with "
               "a small orange X.",
    ),
)

CONTENT["russian-twist"] = E(
    steps_setup=[
        "Sit on the mat, knees bent, torso leaning back to roughly 45 degrees.",
        "FEET ON THE FLOOR to start. Lift them only once the rotation is controlled.",
        "Chest tall, LOWER BACK LONG rather than rounded. This posture is what makes the "
        "exercise work.",
        "Hands together at the chest, or holding the bell once the movement is clean.",
    ],
    steps_exec=[
        "Rotate the RIBCAGE to one side until the hands pass outside the hip.",
        "Rotate to the other side. Left plus right is TWO reps.",
        "Move slowly enough that the turn comes from the trunk and the arms are just along "
        "for the ride.",
        "Sixteen reps, two sets, 60 seconds rest.",
        "Progress: feet down until sixteen controlled reps are easy, then feet up, then "
        "hold the bell.",
    ],
    checks=[
        "The ribcage genuinely turns. If only the arms swing, nothing is being trained.",
        "The lower back stays long, not rounded and collapsed.",
        "Even count left and right.",
    ],
    mistakes=[
        "Swinging the arms while the ribcage stays still, which trains nothing at all.",
        "Rounding the lower back and grinding the reps out fast. This should look controlled.",
        "Going heavy before the movement is clean.",
    ],
    illus=("russian-twist", [1, 2, 3]),
    illus_note=None,
    prompt=prompt(
        panels=[
            "CENTRE. Climber seated on a mat, knees bent, feet flat on the floor, torso "
            "leaning back to about 45 degrees with the LOWER BACK LONG and not rounded, "
            "chest tall, both hands clasped together in front of the sternum. Front "
            "three-quarter view.",
            "ROTATED LEFT. The same seated position with the RIBCAGE turned to the left so "
            "the clasped hands have travelled past the outside of the left hip, shoulders "
            "turned with the ribcage, hips staying relatively square.",
            "ROTATED RIGHT, FEET UP. The harder variation: the same seated position with "
            "BOTH FEET LIFTED off the floor, shins roughly parallel to the ground, ribcage "
            "turned to the right and hands past the right hip.",
        ],
        equipment="A plain exercise mat. Optionally a small kettlebell held in both hands "
                  "in panel 3. Nothing else.",
        angles="The torso leans back at about 45 degrees in all panels with the lumbar "
               "spine LONG, never collapsed into a C-shape. In panels 2 and 3 the shoulders "
               "and ribcage have clearly rotated together, not just the arms.",
        arrows="An orange curved arrow at the RIBCAGE, not at the hands, showing that the "
               "rotation originates in the trunk. A faint greyed version of arms swinging "
               "alone with a static ribcage, marked with a small orange X, drawn in the "
               "corner of panel 2.",
    ),
)

# ---- TEST block ------------------------------------------------------------
# ASSESS is a test session, not a training session. The instructions differ in
# kind: repeatability matters more than effort, and the protocol is the result.

CONTENT["test-max-hang"] = E(
    steps_setup=[
        "Fully rested. Not the day after a hard session, and not at the end of one.",
        "IDENTICAL SETUP EVERY TEST: same edge, same board, same grip, same shoulder "
        "position, same time of day if you can manage it.",
        "Full warm-up including progressive finger loading.",
        "Have the weights laid out so you are not improvising between attempts.",
    ],
    steps_exec=[
        "Start clearly below your expected max. Hang ten seconds in a half-crimp on 20mm.",
        "Rest three minutes. Add 3 to 5kg. Hang ten seconds again.",
        "Repeat, working up in 3 to 5kg jumps with three minutes between every attempt.",
        "STOP AT THE FIRST FAILED 10 SECONDS and record the last successful load.",
        "Calculate: (bodyweight + added) / bodyweight x 100. At 62kg bodyweight: 128 "
        "percent is +17kg, 134 percent is +21kg, 140 percent is +25kg.",
        "Record it. This number opens the campus gate at 130 percent and sets your training "
        "loads for the next block.",
    ],
    checks=[
        "A test only works if it is repeatable. Change nothing between tests except your "
        "training.",
        "Every attempt is a genuine half-crimp. A hang that degrades into a drag is not a "
        "result.",
        "Ten seconds means ten seconds, not eight and a bit.",
    ],
    mistakes=[
        "Testing tired, which produces a low number you then train off for eight weeks.",
        "Changing edge size between tests and comparing the numbers anyway.",
        "Taking too many attempts. Every attempt fatigues the next one.",
    ],
    illus=None,
    illus_note="See MAX HANG for the grip illustration. Generate the test-specific frame "
               "from the prompt.",
    prompt=prompt(
        panels=[
            "Climber hanging from a wall-mounted hangboard on a 20mm edge in a half-crimp, "
            "wearing a weight belt with two plates hanging between his legs on a short "
            "strap, arms slightly bent, shoulders packed down, body straight and still. "
            "Side view.",
            "A simple diagram in ink and burnt orange: a vertical ladder of five rungs, "
            "each labelled with an increasing added weight, the lowest three marked with an "
            "orange tick and the top one marked with an orange X, and an orange bracket "
            "pointing at the highest ticked rung labelled 'record this'. No human figure.",
        ],
        equipment="A plain wall-mounted hangboard with a 20mm edge, a simple weight belt "
                  "with round plates. Panel 2 is a pure diagram.",
        angles="Half-crimp: middle knuckles near 90 degrees, fingertip joints flat, thumb "
               "off. Elbows slightly bent, shoulders depressed, body still.",
        arrows="An orange '10s' label beside panel 1 and an orange '3 min rest' label "
               "between the rungs in panel 2.",
        extra="Panel 2 explains the stepping protocol: work up, stop at the first failure, "
              "record the last success. Keep it flat and schematic.",
    ),
)

CONTENT["test-weighted-pullup"] = E(
    steps_setup=[
        "Dead hang start, weight on a belt.",
        "Fully rested, fully warm.",
        "A 5RM is safer than a true single and almost as informative.",
    ],
    steps_exec=[
        "Warm up with progressively heavier sets of five, well short of failure.",
        "Perform five STRICT reps: chin clearly over the bar, full extension at the bottom "
        "of every rep.",
        "Rest three minutes. Add weight. Repeat.",
        "Continue until five reps is no longer clean. Record the heaviest clean set of five.",
        "Estimate: 1RM = 5RM load x 1.15. Record as a percentage of bodyweight including "
        "your own weight. The Lattice male standard is 165 percent.",
    ],
    checks=[
        "Every rep starts from a genuine dead hang with straight arms.",
        "No kipping. A kipped rep does not count and skews the number.",
        "Under 165 percent total usually means pulling strength is still your limiter.",
    ],
    mistakes=[
        "Counting reps that did not start from a dead hang.",
        "Testing at the end of a session.",
        "Taking so many working sets that the last one is fatigue-limited rather than "
        "strength-limited.",
    ],
    illus=("weighted-pull-up", [1, 3]),
    illus_note=None,
    prompt=prompt(
        panels=[
            "BOTTOM. Climber in a full dead hang from a horizontal bar, arms COMPLETELY "
            "straight, wearing a simple weight belt with two round plates hanging between "
            "the legs on a short strap, body vertical and still. Side view.",
            "TOP. The same figure pulled up with the CHIN CLEARLY ABOVE the bar, elbows "
            "down beside the ribs, body still vertical, no kip and no swing.",
        ],
        equipment="A plain horizontal bar and a simple weight belt with round plates. "
                  "Nothing else.",
        angles="Panel 1: full elbow lockout, this is the checkpoint that makes the rep "
               "count. Panel 2: chin above bar height. Vertical body in both.",
        arrows="A dashed orange vertical line through the body in both panels showing no "
               "swing. An orange bracket at the side labelled 'every rep starts here' "
               "pointing at the straight arms in panel 1.",
    ),
)

CONTENT["test-lockoff"] = E(
    steps_setup=[
        "Bar, overhand grip. Timer visible.",
        "Pull up to 90 degrees of elbow flexion on ONE arm.",
        "Rest the free hand LIGHTLY on the working wrist. It rests. It does not grip and it "
        "does not pull.",
    ],
    steps_exec=[
        "Hold the 90 degree position. Start the clock.",
        "Hold until the elbow angle OPENS PAST 90 degrees. That is the end of the test, not "
        "when you drop off.",
        "Record the seconds.",
        "Rest two minutes, then test the other side.",
        "NOTE THE DIFFERENCE between sides. Solid is 10 seconds. Strong is 15 seconds.",
    ],
    checks=[
        "The assisting hand is genuinely passive.",
        "The test ends at 90 degrees, not at failure.",
        "A large left-right gap is worth training out. Climbers accumulate asymmetry "
        "without noticing.",
    ],
    mistakes=[
        "Pulling with the assisting hand, which invalidates the result and hides the "
        "asymmetry you are testing for.",
        "Counting the seconds spent sinking below 90 degrees.",
        "Only testing the strong side.",
    ],
    illus=None,
    illus_note="No openly-licensed frame shows an assisted one-arm lock-off. Generate from "
               "the prompt.",
    prompt=prompt(
        panels=[
            "Climber hanging from a horizontal bar by ONE ARM, that elbow bent to exactly "
            "90 degrees so the upper arm is horizontal and the forearm vertical. The FREE "
            "HAND rests lightly on the working WRIST, fingers open and clearly not gripping. "
            "Shoulder of the working arm packed DOWN, body still and vertical, legs straight "
            "with ankles crossed. Front view.",
            "The same figure at the moment of FAILURE: the elbow angle has opened past 90 "
            "degrees toward 120, the body has dropped, marking the end of the test.",
        ],
        equipment="A plain horizontal bar. Nothing else.",
        angles="Panel 1: elbow EXACTLY 90 degrees, upper arm horizontal, forearm vertical, "
               "working shoulder depressed. Panel 2: elbow clearly more open than 90.",
        arrows="A burnt-orange 90-degree angle arc at the elbow in panel 1 with the figure "
               "'90' beside it, and a wider arc in panel 2 marked 'test ends'. A small "
               "orange arrow pointing at the free hand in panel 1 labelled 'rests only'.",
    ),
)

CONTENT["test-front-lever"] = E(
    steps_setup=[
        "Straight arms on a bar. Shoulders depressed.",
        "Choose your hardest CLEAN progression: tuck, advanced tuck, one-leg, straddle, "
        "or full.",
        "Have someone watch your lower back, or film it from the side.",
    ],
    steps_exec=[
        "Pull into the position with straight arms and hold.",
        "Hold to FAILURE OF POSITION, not failure of grip.",
        "THE MOMENT THE LOWER BACK ARCHES, THE TEST IS OVER. Arching is how people fake "
        "this hold and it is why untested front lever times are meaningless.",
        "Record both the progression AND the seconds. A twelve second advanced tuck is a "
        "different result from a twelve second straddle.",
    ],
    checks=[
        "Flat lower back for every recorded second.",
        "Elbows locked straight throughout.",
        "The recorded time contains no arched seconds.",
    ],
    mistakes=[
        "Recording a time that included five arched seconds.",
        "Testing a progression above the one you can actually hold clean.",
        "Letting the grip end the test when the position failed ten seconds earlier.",
    ],
    illus=None,
    illus_note="See FRONT LEVER for the progression ladder. Generate the pass/fail frame "
               "from the prompt.",
    prompt=prompt(
        panels=[
            "VALID. Climber holding a straddle front lever from a horizontal bar: arms "
            "completely straight, body horizontal and parallel to the floor, legs straight "
            "and split wide, LOWER BACK FLAT. Side view, full profile.",
            "INVALID. The same climber in the same position but with the LOWER BACK CLEARLY "
            "ARCHED and the hips sagging below the line of the shoulders. This is the "
            "moment the test ends.",
        ],
        equipment="A plain horizontal bar. Nothing else.",
        angles="The ONLY difference between the two panels is the spine: flat and "
               "horizontal in panel 1, arched with dropped hips in panel 2. Elbows straight "
               "in both. Exaggerate the difference so it reads instantly.",
        arrows="A dashed orange straight horizontal line through the body in panel 1 "
               "showing the flat line, and the same line in panel 2 with the body visibly "
               "falling away from it. An orange tick in the corner of panel 1 and an orange "
               "X in the corner of panel 2 with the label 'test ends here'.",
    ),
)

CONTENT["test-hip-mobility"] = E(
    steps_setup=[
        "FOOT RAISE: stand next to a wall with a tape measure to hand. Stand tall with the "
        "torso upright.",
        "STRADDLE: clear floor, tape measure.",
        "Warm and loose, but this is a measurement, not a stretching session.",
    ],
    steps_exec=[
        "FOOT RAISE. Raise one foot as high as possible with the hip FLEXED, ABDUCTED AND "
        "EXTERNALLY ROTATED, knee bent, as if placing a high outside foot on the wall.",
        "Keep the torso UPRIGHT. Leaning away inflates the number and tests nothing.",
        "Measure floor to heel in centimetres. Both sides. Average is about 74cm.",
        "STRADDLE. Sit into a maximal straddle with the legs STRAIGHT and the feet FLAT, "
        "not rolled forward.",
        "Measure the distance from the pubic bone to the floor. Record it.",
    ],
    checks=[
        "The torso stays upright on the foot raise.",
        "Both sides measured, and the difference noted.",
        "The straddle has straight legs and vertical feet.",
    ],
    mistakes=[
        "Leaning the torso away to fake height.",
        "Not testing both sides, which hides an asymmetry.",
        "Bending the knees in the straddle.",
    ],
    illus=("butterfly-stretch", [1]),
    illus_note="Stock frame shows a seated hip-open position. The two test positions are "
               "drawn from the prompt.",
    prompt=prompt(
        panels=[
            "FOOT RAISE TEST. Climber standing beside a plain flat wall with his TORSO "
            "UPRIGHT and vertical, one foot raised high against the wall with the hip "
            "flexed, turned out and opened to the side, knee bent outward, as if placing a "
            "high outside foot. A simple vertical measuring tape runs up the wall with an "
            "orange marker at the height of the raised HEEL. Front three-quarter view.",
            "STRADDLE TEST. The same climber seated on the floor in a maximal straddle: "
            "legs straight and split as wide as possible, knees locked, feet upright and "
            "flat rather than rolled forward, torso upright. Viewed from directly above.",
        ],
        equipment="A plain flat wall with a simple vertical measuring tape in panel 1. A "
                  "plain floor in panel 2. Nothing else.",
        angles="Panel 1: the torso is VERTICAL, not leaning away from the wall. The raised "
               "hip is simultaneously flexed, abducted and externally rotated. Panel 2: "
               "both knees locked straight, feet vertical.",
        arrows="An orange horizontal marker line at the raised heel in panel 1 with an "
               "orange bracket down to the floor labelled 'measure here'. A faint greyed "
               "figure leaning away from the wall behind panel 1, marked with a small "
               "orange X. In panel 2, an orange bracket between the pubic bone and the "
               "floor line.",
    ),
)
