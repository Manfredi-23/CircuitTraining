import Foundation
import HealthKit
import Capacitor

// HealthPlugin — reads sleep, HRV, resting heart rate, body mass, climbing
// workouts and outdoor workouts (hikes, runs, rides, swims, yoga, ski tours)
// from Apple Health, and writes finished sessions back as workouts.
//
// A local plugin like RestActivityPlugin, registered by MainViewController.
// The web side calls it through registerPlugin('Health') in
// src/native/health.ts. Everything resolves quietly when Health is not
// available (iPad, simulator without data, permission refused): HealthKit
// never says whether read access was refused, it simply returns no samples,
// and the app treats no samples as "no data".
//
// Requires the HealthKit capability on the App target (Signing & Capabilities
// > + HealthKit) and the two usage strings in Info.plist.

@objc(HealthPlugin)
public class HealthPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "HealthPlugin"
    public let jsName = "Health"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "query", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "saveWorkout", returnType: CAPPluginReturnPromise),
    ]

    private let store = HKHealthStore()

    private var readTypes: Set<HKObjectType> {
        var types: Set<HKObjectType> = [HKObjectType.workoutType()]
        if let t = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) { types.insert(t) }
        if let t = HKObjectType.quantityType(forIdentifier: .heartRateVariabilitySDNN) { types.insert(t) }
        if let t = HKObjectType.quantityType(forIdentifier: .restingHeartRate) { types.insert(t) }
        if let t = HKObjectType.quantityType(forIdentifier: .bodyMass) { types.insert(t) }
        return types
    }

    private var writeTypes: Set<HKSampleType> {
        return [HKObjectType.workoutType()]
    }

    /// Whether Health exists here, and whether the permission sheet has been
    /// answered: HealthKit only reports that for types the app writes, so the
    /// workout type stands in for the whole sheet.
    @objc func isAvailable(_ call: CAPPluginCall) {
        let available = HKHealthStore.isHealthDataAvailable()
        var sheet = "unavailable"
        if available {
            switch store.authorizationStatus(for: HKObjectType.workoutType()) {
            case .notDetermined: sheet = "notDetermined"
            case .sharingDenied: sheet = "denied"
            case .sharingAuthorized: sheet = "authorized"
            @unknown default: sheet = "unknown"
            }
        }
        call.resolve(["available": available, "sheet": sheet])
    }

    /// Raises the permission sheet. The error text goes back to the web side,
    /// so a missing capability or entitlement shows up on the phone as what it is.
    @objc func requestAuthorization(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else {
            call.resolve(["completed": false, "error": "Health data is not available on this device."])
            return
        }
        store.requestAuthorization(toShare: writeTypes, read: readTypes) { success, error in
            call.resolve(["completed": success, "error": error?.localizedDescription ?? ""])
        }
    }

    /// Everything the app reads, for the last `days` days, in one call.
    @objc func query(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else {
            call.resolve(["sleep": [], "hrv": [], "restingHR": [], "bodyMass": [], "climbs": [], "outdoor": []])
            return
        }
        let days = call.getInt("days") ?? 30
        let end = Date()
        let start = Calendar.current.date(byAdding: .day, value: -days, to: Calendar.current.startOfDay(for: end)) ?? end

        let group = DispatchGroup()
        var result: [String: Any] = [:]
        let lock = NSLock()
        var errors: [String] = []
        func put(_ key: String, _ value: Any) {
            lock.lock(); result[key] = value; lock.unlock()
        }
        func fail(_ key: String, _ error: Error?) {
            guard let error = error else { return }
            lock.lock(); errors.append("\(key): \(error.localizedDescription)"); lock.unlock()
        }

        group.enter()
        querySleep(start: start, end: end) { put("sleep", $0); fail("sleep", $1); group.leave() }

        group.enter()
        dailyAverage(.heartRateVariabilitySDNN, unit: HKUnit.secondUnit(with: .milli), start: start, end: end) {
            put("hrv", $0); fail("hrv", $1); group.leave()
        }

        group.enter()
        dailyAverage(.restingHeartRate, unit: HKUnit.count().unitDivided(by: .minute()), start: start, end: end) {
            put("restingHR", $0); fail("restingHR", $1); group.leave()
        }

        group.enter()
        queryBodyMass(start: start, end: end) { put("bodyMass", $0); fail("bodyMass", $1); group.leave() }

        group.enter()
        queryClimbs(start: start, end: end) { put("climbs", $0); fail("climbs", $1); group.leave() }

        group.enter()
        queryOutdoor(start: start, end: end) { put("outdoor", $0); fail("outdoor", $1); group.leave() }

        group.notify(queue: .main) {
            result["errors"] = errors
            call.resolve(result)
        }
    }

    /// A finished session as a workout, so Fitness and the rings count it.
    @objc func saveWorkout(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable(),
              let startMs = call.getDouble("start"),
              let endMs = call.getDouble("end") else {
            call.resolve(["saved": false])
            return
        }
        let start = Date(timeIntervalSince1970: startMs / 1000)
        let end = Date(timeIntervalSince1970: endMs / 1000)
        guard end > start else {
            call.resolve(["saved": false])
            return
        }
        let activity: HKWorkoutActivityType
        switch call.getString("activity") ?? "strength" {
        case "core": activity = .coreTraining
        case "climbing": activity = .climbing
        case "functional": activity = .functionalStrengthTraining
        default: activity = .traditionalStrengthTraining
        }

        let config = HKWorkoutConfiguration()
        config.activityType = activity
        config.locationType = .indoor
        let builder = HKWorkoutBuilder(healthStore: store, configuration: config, device: .local())
        builder.beginCollection(withStart: start) { began, _ in
            guard began else { call.resolve(["saved": false]); return }
            var metadata: [String: Any] = [HKMetadataKeyIndoorWorkout: true]
            if let title = call.getString("title") { metadata["7BitSession"] = title }
            builder.addMetadata(metadata) { _, _ in
                builder.endCollection(withEnd: end) { ended, _ in
                    guard ended else { call.resolve(["saved": false]); return }
                    builder.finishWorkout { workout, _ in
                        call.resolve(["saved": workout != nil])
                    }
                }
            }
        }
    }

    // MARK: - Queries

    private static let dayFormatter: DateFormatter = {
        let f = DateFormatter()
        f.calendar = Calendar(identifier: .gregorian)
        f.locale = Locale(identifier: "en_US_POSIX")
        f.timeZone = .current
        f.dateFormat = "yyyy-MM-dd"
        return f
    }()

    private func day(_ date: Date) -> String {
        return Self.dayFormatter.string(from: date)
    }

    /// Minutes asleep per night. A night belongs to the day you wake up on, so
    /// samples are grouped by the date of their end, shifted back six hours to
    /// keep a nap after noon from opening a new night at midnight.
    private func querySleep(start: Date, end: Date, done: @escaping ([[String: Any]], Error?) -> Void) {
        guard let type = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) else { done([], nil); return }
        let predicate = HKQuery.predicateForSamples(withStart: start, end: end, options: [])
        let q = HKSampleQuery(sampleType: type, predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: nil) { _, samples, error in
            var asleep: [String: Double] = [:]
            var deep: [String: Double] = [:]
            var rem: [String: Double] = [:]
            for case let s as HKCategorySample in samples ?? [] {
                let minutes = s.endDate.timeIntervalSince(s.startDate) / 60
                let night = self.day(s.endDate.addingTimeInterval(6 * 3600))
                if self.isAsleep(s.value) {
                    asleep[night, default: 0] += minutes
                }
                if #available(iOS 16.0, *) {
                    if s.value == HKCategoryValueSleepAnalysis.asleepDeep.rawValue { deep[night, default: 0] += minutes }
                    if s.value == HKCategoryValueSleepAnalysis.asleepREM.rawValue { rem[night, default: 0] += minutes }
                }
            }
            let rows: [[String: Any]] = asleep.keys.sorted().map { night in
                var row: [String: Any] = ["date": night, "asleepMin": Int(asleep[night] ?? 0)]
                if let d = deep[night] { row["deepMin"] = Int(d) }
                if let r = rem[night] { row["remMin"] = Int(r) }
                return row
            }
            done(rows, error)
        }
        store.execute(q)
    }

    private func isAsleep(_ value: Int) -> Bool {
        if #available(iOS 16.0, *) {
            return HKCategoryValueSleepAnalysis.allAsleepValues.map { $0.rawValue }.contains(value)
        }
        return value == HKCategoryValueSleepAnalysis.asleep.rawValue
    }

    private func dailyAverage(
        _ id: HKQuantityTypeIdentifier, unit: HKUnit, start: Date, end: Date,
        done: @escaping ([[String: Any]], Error?) -> Void
    ) {
        guard let type = HKObjectType.quantityType(forIdentifier: id) else { done([], nil); return }
        let predicate = HKQuery.predicateForSamples(withStart: start, end: end, options: [])
        let anchor = Calendar.current.startOfDay(for: start)
        let q = HKStatisticsCollectionQuery(
            quantityType: type, quantitySamplePredicate: predicate,
            options: .discreteAverage, anchorDate: anchor, intervalComponents: DateComponents(day: 1)
        )
        q.initialResultsHandler = { _, collection, error in
            var rows: [[String: Any]] = []
            collection?.enumerateStatistics(from: start, to: end) { stats, _ in
                if let avg = stats.averageQuantity() {
                    rows.append(["date": self.day(stats.startDate), "value": avg.doubleValue(for: unit)])
                }
            }
            done(rows, error)
        }
        store.execute(q)
    }

    private func queryBodyMass(start: Date, end: Date, done: @escaping ([[String: Any]], Error?) -> Void) {
        guard let type = HKObjectType.quantityType(forIdentifier: .bodyMass) else { done([], nil); return }
        let predicate = HKQuery.predicateForSamples(withStart: start, end: end, options: [])
        let sort = [NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: true)]
        let q = HKSampleQuery(sampleType: type, predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: sort) { _, samples, error in
            // Last reading of each day.
            var byDay: [String: Double] = [:]
            for case let s as HKQuantitySample in samples ?? [] {
                byDay[self.day(s.startDate)] = s.quantity.doubleValue(for: .gramUnit(with: .kilo))
            }
            done(byDay.keys.sorted().map { ["date": $0, "kg": byDay[$0]!] }, error)
        }
        store.execute(q)
    }

    private func queryClimbs(start: Date, end: Date, done: @escaping ([[String: Any]], Error?) -> Void) {
        let predicate = NSCompoundPredicate(andPredicateWithSubpredicates: [
            HKQuery.predicateForSamples(withStart: start, end: end, options: []),
            HKQuery.predicateForWorkouts(with: .climbing),
        ])
        let q = HKSampleQuery(sampleType: HKObjectType.workoutType(), predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: nil) { _, samples, error in
            let rows: [[String: Any]] = (samples ?? []).compactMap { sample in
                guard let w = sample as? HKWorkout else { return nil }
                // Our own sessions written back as climbing never exist, but skip
                // anything this app wrote, so nothing round-trips.
                if w.sourceRevision.source.bundleIdentifier == Bundle.main.bundleIdentifier { return nil }
                return [
                    "id": w.uuid.uuidString,
                    "date": self.day(w.startDate),
                    "minutes": Int(w.duration / 60),
                ]
            }
            done(rows, error)
        }
        store.execute(q)
    }

    /// Outdoor workouts the activity log knows, as the web side names them.
    /// Elevation comes from the workout's metadata when the watch recorded it.
    private func queryOutdoor(start: Date, end: Date, done: @escaping ([[String: Any]], Error?) -> Void) {
        let kinds: [HKWorkoutActivityType: String] = [
            .hiking: "HIKE", .running: "RUN", .cycling: "BIKE", .swimming: "SWIM", .yoga: "YOGA",
            .crossCountrySkiing: "SKITOUR", .snowSports: "SKITOUR",
        ]
        let predicate = NSCompoundPredicate(andPredicateWithSubpredicates: [
            HKQuery.predicateForSamples(withStart: start, end: end, options: []),
            NSCompoundPredicate(orPredicateWithSubpredicates: kinds.keys.map { HKQuery.predicateForWorkouts(with: $0) }),
        ])
        let q = HKSampleQuery(sampleType: HKObjectType.workoutType(), predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: nil) { _, samples, error in
            let rows: [[String: Any]] = (samples ?? []).compactMap { sample in
                guard let w = sample as? HKWorkout, let type = kinds[w.workoutActivityType] else { return nil }
                if w.sourceRevision.source.bundleIdentifier == Bundle.main.bundleIdentifier { return nil }
                var row: [String: Any] = [
                    "id": w.uuid.uuidString,
                    "date": self.day(w.startDate),
                    "type": type,
                    "minutes": Int(w.duration / 60),
                ]
                if let km = w.totalDistance?.doubleValue(for: .meterUnit(with: .kilo)) { row["km"] = km }
                if let up = w.metadata?[HKMetadataKeyElevationAscended] as? HKQuantity { row["upM"] = up.doubleValue(for: .meter()) }
                return row
            }
            done(rows, error)
        }
        store.execute(q)
    }
}
