import SwiftUI
import WidgetKit

// The extension's entry point. It hosts the rest countdown Live Activity and
// the TodayWidget (today's session, finger recovery countdown).
@main
struct RestTimerWidgetBundle: WidgetBundle {
    var body: some Widget {
        RestTimerWidgetLiveActivity()
        TodayWidget()
    }
}
