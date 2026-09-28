import ActivityKit
import SwiftUI
import WidgetKit

// The rest countdown on the lock screen and in the Dynamic Island.
//
// The app starts it through RestActivityPlugin with the moment rest ends, and
// never updates it again. Text(timerInterval:) counts down on its own, and the
// staleDate the app sets flips it to GO at the deadline, so the countdown stays
// right while the app itself is suspended.

/// Must match RestActivityAttributes in ios/App/App/RestActivityPlugin.swift
/// field for field. ActivityKit pairs the two by type name and encoded shape.
struct RestActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var endsAt: Date
        var next: String
    }

    var title: String
}

// House colours: ink, accent, parchment.
private let ink = Color(red: 0x18 / 255, green: 0x16 / 255, blue: 0x10 / 255)
private let accent = Color(red: 0xE6 / 255, green: 0x4D / 255, blue: 0x19 / 255)
private let parchment = Color(red: 0xE4 / 255, green: 0xE2 / 255, blue: 0xDD / 255)

struct RestTimerWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: RestActivityAttributes.self) { context in
            LockScreenRestView(context: context)
                .activityBackgroundTint(parchment)
                .activitySystemActionForegroundColor(ink)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Text(isOver(context) ? "GO" : "REST")
                        .font(.system(.headline, design: .monospaced).weight(.bold))
                        .foregroundColor(accent)
                        .padding(.leading, 4)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    RestCountdown(context: context)
                        .font(.system(.title, design: .monospaced).weight(.bold))
                        .padding(.trailing, 4)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text(context.state.next)
                        .font(.system(.footnote, design: .monospaced))
                        .lineLimit(1)
                }
            } compactLeading: {
                Text("REST")
                    .font(.system(.caption2, design: .monospaced).weight(.bold))
                    .foregroundColor(accent)
            } compactTrailing: {
                RestCountdown(context: context)
                    .font(.system(.caption, design: .monospaced).weight(.bold))
                    .frame(maxWidth: 44)
            } minimal: {
                RestCountdown(context: context)
                    .font(.system(.caption2, design: .monospaced).weight(.bold))
            }
        }
    }
}

private func isOver(_ context: ActivityViewContext<RestActivityAttributes>) -> Bool {
    context.isStale || context.state.endsAt <= Date()
}

/// m:ss counting down to the end of rest, then GO.
private struct RestCountdown: View {
    let context: ActivityViewContext<RestActivityAttributes>

    var body: some View {
        if isOver(context) {
            Text("GO").foregroundColor(accent)
        } else {
            // The range must not be inverted, which the isOver check guarantees.
            Text(timerInterval: Date()...context.state.endsAt, countsDown: true)
                .monospacedDigit()
                .multilineTextAlignment(.trailing)
        }
    }
}

private struct LockScreenRestView: View {
    let context: ActivityViewContext<RestActivityAttributes>

    var body: some View {
        HStack(alignment: .center) {
            VStack(alignment: .leading, spacing: 4) {
                Text(isOver(context) ? "REST OVER" : "REST")
                    .font(.system(.caption, design: .monospaced).weight(.bold))
                    .foregroundColor(accent)
                Text(context.state.next)
                    .font(.system(.subheadline, design: .monospaced))
                    .foregroundColor(ink)
                    .lineLimit(1)
            }
            Spacer()
            RestCountdown(context: context)
                .font(.system(size: 36, weight: .bold, design: .monospaced))
                .foregroundColor(ink)
        }
        .padding(16)
    }
}
