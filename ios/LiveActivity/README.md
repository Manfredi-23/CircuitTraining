# Rest timer Live Activity — widget extension sources

These three files are the source of the `RestTimerWidget` extension, which
draws the rest countdown on the lock screen and in the Dynamic Island.

They live here rather than in `ios/App/RestTimerWidget/` because the target
itself is created in Xcode (File > New > Target > Widget Extension), and
creating a target into a folder that already exists is unreliable. After
creating it, copy these over the template:

    cp ios/LiveActivity/*.swift ios/App/RestTimerWidget/

The files match the template's own names, so every file Xcode generated is
replaced and nothing is left dangling. Full walkthrough in CLAUDE.md under iOS.

`RestActivityAttributes` is defined twice on purpose: once here and once in
`ios/App/App/RestActivityPlugin.swift`. Keep the two identical.
