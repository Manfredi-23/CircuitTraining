import SwiftUI
import WidgetKit

// The extension's entry point. It hosts one thing: the rest countdown Live
// Activity. There is no home-screen widget.
@main
struct RestTimerWidgetBundle: WidgetBundle {
    var body: some Widget {
        RestTimerWidgetLiveActivity()
    }
}
