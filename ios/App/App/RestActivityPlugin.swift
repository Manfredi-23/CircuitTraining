import Foundation
import ActivityKit
import Capacitor

// RestActivityPlugin — starts and ends the rest-timer Live Activity.
//
// There is no first-party Capacitor plugin for ActivityKit, so this one lives
// in the app target and is registered by MainViewController. The web side calls
// it through registerPlugin('RestActivity') in src/native/native.ts.
//
// The countdown itself is drawn by the RestTimerWidget extension. The app only
// hands over the deadline: Text(timerInterval:) ticks on its own in the
// extension, so the countdown keeps running while this app is suspended.

/// Must match the copy in ios/LiveActivity/RestTimerWidgetLiveActivity.swift
/// field for field. ActivityKit pairs the app's activity with the widget's UI
/// by this type's name and its encoded shape.
@available(iOS 16.1, *)
struct RestActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        /// When rest ends. The widget counts down to it.
        var endsAt: Date
        /// What is waiting, e.g. "Kettlebell Swing - set 2/2".
        var next: String
    }

    var title: String
}

@objc(RestActivityPlugin)
public class RestActivityPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "RestActivityPlugin"
    public let jsName = "RestActivity"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "end", returnType: CAPPluginReturnPromise),
    ]

    @objc func start(_ call: CAPPluginCall) {
        // 16.2 for ActivityContent and staleDate. Older phones still get the
        // notification, so this resolves rather than rejects.
        guard #available(iOS 16.2, *) else {
            call.resolve(["started": false])
            return
        }
        guard let endsAtMs = call.getDouble("endsAt") else {
            call.reject("endsAt is required")
            return
        }
        // Switched off in Settings > 7Bit > Live Activities.
        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            call.resolve(["started": false])
            return
        }

        let endsAt = Date(timeIntervalSince1970: endsAtMs / 1000)
        let state = RestActivityAttributes.ContentState(
            endsAt: endsAt,
            next: call.getString("next") ?? ""
        )
        let attributes = RestActivityAttributes(title: call.getString("title") ?? "Rest")

        Task {
            // One rest at a time. A new rest replaces whatever is showing.
            await Self.endAll()
            do {
                // staleDate flips the widget to "GO" at the deadline even though
                // the app is asleep and cannot tell it to.
                _ = try Activity.request(
                    attributes: attributes,
                    content: ActivityContent(state: state, staleDate: endsAt),
                    pushType: nil
                )
                call.resolve(["started": true])
            } catch {
                call.resolve(["started": false])
            }
        }
    }

    @objc func end(_ call: CAPPluginCall) {
        guard #available(iOS 16.2, *) else {
            call.resolve()
            return
        }
        Task {
            await Self.endAll()
            call.resolve()
        }
    }

    @available(iOS 16.2, *)
    private static func endAll() async {
        for activity in Activity<RestActivityAttributes>.activities {
            await activity.end(nil, dismissalPolicy: .immediate)
        }
    }
}
