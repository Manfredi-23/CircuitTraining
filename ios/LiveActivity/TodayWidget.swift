import SwiftUI
import WidgetKit

// TodayWidget — today's session and the finger recovery countdown, on the
// home screen (small) and the lock screen (rectangular, inline).
//
// The widget runs no training logic. The app writes a snapshot to the shared
// App Group (TodayWidgetPlugin.swift, src/core/widget.ts) whenever its state
// changes and asks WidgetKit to reload. The countdown then ticks on its own
// with Text(_:style: .relative), and a timeline entry at the ready moment
// flips it to READY. A snapshot from an earlier day is not trusted: it asks
// for the app to be opened instead.
//
// Needs the App Groups capability with group.com.sevenbit.circuittraining on
// both the App and RestTimerWidgetExtension targets. Without it the widget
// shows its placeholder.

let todayWidgetGroup = "group.com.sevenbit.circuittraining"
let todayWidgetKey = "todayWidget"

struct TodaySnapshot: Codable {
    var session: String
    var reason: String
    var block: String
    var fingersReadyAt: Double?
    var updatedAt: Double
}

struct TodayEntry: TimelineEntry {
    let date: Date
    let snapshot: TodaySnapshot?

    var fingersReady: Date? {
        guard let ms = snapshot?.fingersReadyAt else { return nil }
        let d = Date(timeIntervalSince1970: ms / 1000)
        return d > date ? d : nil
    }

    /// The snapshot is about the day it was written.
    var isCurrent: Bool {
        guard let s = snapshot else { return false }
        return Calendar.current.isDate(Date(timeIntervalSince1970: s.updatedAt / 1000), inSameDayAs: date)
    }
}

struct TodayProvider: TimelineProvider {
    func placeholder(in context: Context) -> TodayEntry {
        TodayEntry(date: Date(), snapshot: TodaySnapshot(
            session: "DAILY 01 FRONT CORE", reason: "Next in the DAILY rotation.",
            block: "BUILD WEEK 1 OF 3", fingersReadyAt: nil, updatedAt: Date().timeIntervalSince1970 * 1000))
    }

    func getSnapshot(in context: Context, completion: @escaping (TodayEntry) -> Void) {
        completion(context.isPreview ? placeholder(in: context) : TodayEntry(date: Date(), snapshot: Self.read()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<TodayEntry>) -> Void) {
        let now = Date()
        let snapshot = Self.read()
        var entries = [TodayEntry(date: now, snapshot: snapshot)]
        if let ms = snapshot?.fingersReadyAt {
            let ready = Date(timeIntervalSince1970: ms / 1000)
            if ready > now { entries.append(TodayEntry(date: ready, snapshot: snapshot)) }
        }
        // Midnight: yesterday's recommendation is no longer today's.
        let midnight = Calendar.current.startOfDay(for: now.addingTimeInterval(86400))
        entries.append(TodayEntry(date: midnight, snapshot: snapshot))
        entries.sort { $0.date < $1.date }
        completion(Timeline(entries: entries, policy: .after(midnight)))
    }

    static func read() -> TodaySnapshot? {
        guard let defaults = UserDefaults(suiteName: todayWidgetGroup),
              let data = defaults.data(forKey: todayWidgetKey) else { return nil }
        return try? JSONDecoder().decode(TodaySnapshot.self, from: data)
    }
}

private let ink = Color(red: 24 / 255, green: 22 / 255, blue: 16 / 255)
private let accent = Color(red: 230 / 255, green: 77 / 255, blue: 25 / 255)
private let parchment = Color(red: 228 / 255, green: 226 / 255, blue: 221 / 255)

struct TodayWidgetView: View {
    @Environment(\.widgetFamily) var family
    let entry: TodayEntry

    var body: some View {
        switch family {
        case .accessoryInline:
            inline
        case .accessoryRectangular:
            rectangular
        default:
            small
        }
    }

    private var session: String {
        entry.isCurrent ? (entry.snapshot?.session ?? "") : "OPEN 7BIT"
    }

    @ViewBuilder private var fingersLine: some View {
        if let ready = entry.fingersReady {
            HStack(spacing: 4) {
                Text("FINGERS")
                Text(ready, style: .relative)
            }
        } else {
            Text("FINGERS READY")
        }
    }

    private var inline: some View {
        if let ready = entry.fingersReady {
            return Text("Fingers in \(ready, style: .relative)")
        }
        return Text(entry.isCurrent ? (entry.snapshot?.session ?? "7BIT") : "Open 7Bit")
    }

    private var rectangular: some View {
        VStack(alignment: .leading, spacing: 1) {
            Text(session).font(.system(.headline, design: .monospaced)).lineLimit(1).minimumScaleFactor(0.7)
            if entry.isCurrent, let reason = entry.snapshot?.reason {
                Text(reason).font(.system(.caption2, design: .monospaced)).lineLimit(1)
            }
            fingersLine.font(.system(.caption2, design: .monospaced))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var small: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("7BIT · TODAY")
                .font(.system(size: 10, weight: .bold, design: .monospaced))
                .foregroundColor(accent)
            Text(session)
                .font(.system(size: 15, weight: .bold, design: .monospaced))
                .foregroundColor(ink)
                .lineLimit(3)
                .minimumScaleFactor(0.7)
            if entry.isCurrent, let reason = entry.snapshot?.reason {
                Text(reason)
                    .font(.system(size: 10, design: .monospaced))
                    .foregroundColor(ink.opacity(0.6))
                    .lineLimit(2)
            }
            Spacer(minLength: 0)
            fingersLine
                .font(.system(size: 10, weight: .bold, design: .monospaced))
                .foregroundColor(entry.fingersReady == nil ? ink : accent)
            if let block = entry.snapshot?.block {
                Text(block)
                    .font(.system(size: 9, design: .monospaced))
                    .foregroundColor(ink.opacity(0.5))
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .widgetBackground(parchment)
    }
}

private extension View {
    /// iOS 17 asks for containerBackground; 16.2 still uses a plain background.
    @ViewBuilder func widgetBackground(_ color: Color) -> some View {
        if #available(iOS 17.0, *) {
            self.containerBackground(color, for: .widget)
        } else {
            self.padding().background(color)
        }
    }
}

struct TodayWidget: Widget {
    let kind = "TodayWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TodayProvider()) { entry in
            TodayWidgetView(entry: entry)
        }
        .configurationDisplayName("7Bit Today")
        .description("Today's session and when the fingers are ready.")
        .supportedFamilies([.systemSmall, .accessoryRectangular, .accessoryInline])
    }
}
