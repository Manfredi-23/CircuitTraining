import Capacitor

// The app's own bridge view controller. It exists for one reason: plugins
// that live in the app target, rather than in an npm package, are not found by
// Capacitor's automatic discovery and must be registered by hand.
// Main.storyboard points at this class instead of CAPBridgeViewController.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(RestActivityPlugin())
        bridge?.registerPluginInstance(HealthPlugin())
    }
}
