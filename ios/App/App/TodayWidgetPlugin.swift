import Foundation
import WidgetKit
import Capacitor

// TodayWidgetPlugin — hands the TodayWidget its snapshot.
//
// The app computes today's session and the finger countdown
// (src/core/widget.ts) and passes them here as JSON. They are written to the
// App Group the widget extension reads, and the widget's timeline is reloaded.
// Registered by MainViewController, like the other local plugins.
//
// Needs the App Groups capability (group.com.sevenbit.circuittraining) on the
// App and RestTimerWidgetExtension targets. Without it UserDefaults falls back
// to an unshared store and the widget keeps its placeholder: nothing fails.

@objc(TodayWidgetPlugin)
public class TodayWidgetPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "TodayWidgetPlugin"
    public let jsName = "TodayWidget"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "update", returnType: CAPPluginReturnPromise),
    ]

    /// Must match todayWidgetGroup / todayWidgetKey in TodayWidget.swift.
    private let group = "group.com.sevenbit.circuittraining"
    private let key = "todayWidget"

    @objc func update(_ call: CAPPluginCall) {
        guard let json = call.getString("json"), let data = json.data(using: .utf8),
              let defaults = UserDefaults(suiteName: group) else {
            call.resolve(["updated": false])
            return
        }
        // Skip the reload when nothing changed: WidgetKit budgets reloads.
        if defaults.data(forKey: key) == data {
            call.resolve(["updated": false])
            return
        }
        defaults.set(data, forKey: key)
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadTimelines(ofKind: "TodayWidget")
        }
        call.resolve(["updated": true])
    }
}
