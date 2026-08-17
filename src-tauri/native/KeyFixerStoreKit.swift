import Foundation
import StoreKit

// ── Constants ─────────────────────────────────────────────────────────────────

public let KEYFIXER_PRO_LIFETIME_PRODUCT_ID = "com.obadadallo.keyfixer.pro.lifetime"

// ── Models (matches TypeScript StoreProduct, StoreEntitlement, PurchaseResult) ─

public struct StoreProductModel: Codable {
    public let id: String
    public let displayName: String
    public let displayPrice: String
    public let isAvailable: Bool

    public init(id: String, displayName: String, displayPrice: String, isAvailable: Bool) {
        self.id = id
        self.displayName = displayName
        self.displayPrice = displayPrice
        self.isAvailable = isAvailable
    }
}

public struct StoreEntitlementModel: Codable {
    public let paid: Bool
    public let productId: String?
    public let purchaseDate: String?
    public let revocationDate: String?
    public let verificationStatus: String

    public init(
        paid: Bool,
        productId: String?,
        purchaseDate: String?,
        revocationDate: String?,
        verificationStatus: String
    ) {
        self.paid = paid
        self.productId = productId
        self.purchaseDate = purchaseDate
        self.revocationDate = revocationDate
        self.verificationStatus = verificationStatus
    }

    public static var notPurchased: StoreEntitlementModel {
        StoreEntitlementModel(
            paid: false,
            productId: nil,
            purchaseDate: nil,
            revocationDate: nil,
            verificationStatus: "NOT_PURCHASED"
        )
    }
}

public struct PurchaseResultModel: Codable {
    public let status: String // "SUCCESS", "CANCELLED", "PENDING", "FAILED"
    public let errorMessage: String?

    public init(status: String, errorMessage: String? = nil) {
        self.status = status
        self.errorMessage = errorMessage
    }
}

public struct RestorePurchasesResultModel: Codable {
    public let status: String // "RESTORED", "NOT_FOUND", "FAILED"
    public let entitlement: StoreEntitlementModel
    public let errorMessage: String?

    public init(status: String, entitlement: StoreEntitlementModel, errorMessage: String? = nil) {
        self.status = status
        self.entitlement = entitlement
        self.errorMessage = errorMessage
    }
}

// ── ISO 8601 Formatter ────────────────────────────────────────────────────────

private let isoFormatter: ISO8601DateFormatter = {
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    return formatter
}()

// ── StoreKit 2 Manager ────────────────────────────────────────────────────────

@available(macOS 12.0, *)
public final class KeyFixerStoreKitManager: @unchecked Sendable {
    public static let shared = KeyFixerStoreKitManager()

    private var updateListenerTask: Task<Void, Never>?
    private var onUpdateCallback: (@convention(c) (Bool) -> Void)?
    private let lock = NSLock()

    private init() {}

    deinit {
        updateListenerTask?.cancel()
    }

    // ── Persistent Transaction Updates Listener ───────────────────────────────
    public func startTransactionListener(callback: (@convention(c) (Bool) -> Void)? = nil) {
        lock.lock()
        if let cb = callback {
            self.onUpdateCallback = cb
        }
        let isAlreadyStarted = (updateListenerTask != nil)
        lock.unlock()

        if isAlreadyStarted { return }

        updateListenerTask = Task(priority: .background) { [weak self] in
            guard let self = self else { return }

            // Startup Reconciliation: Reconcile against StoreKit authority immediately on launch
            let initialEntitlement = await self.refreshProEntitlement()
            self.notifyUpdate(isPaid: initialEntitlement.paid)

            for await result in Transaction.updates {
                switch result {
                case .verified(let transaction):
                    if transaction.productID == KEYFIXER_PRO_LIFETIME_PRODUCT_ID {
                        // Reconcile current entitlement against StoreKit authority
                        let updatedEntitlement = await self.refreshProEntitlement()
                        self.notifyUpdate(isPaid: updatedEntitlement.paid)
                        if updatedEntitlement.paid {
                            await transaction.finish()
                        }
                    }

                case .unverified(let transaction, let error):
                    NSLog("[KeyFixer StoreKit] Unverified transaction in updates for %@: %@", transaction.productID, error.localizedDescription)
                    let updatedEntitlement = await self.refreshProEntitlement()
                    self.notifyUpdate(isPaid: updatedEntitlement.paid)
                }
            }
        }
    }

    private func notifyUpdate(isPaid: Bool) {
        lock.lock()
        let cb = self.onUpdateCallback
        lock.unlock()
        cb?(isPaid)
    }

    // ── Authoritative Entitlement Reconciliation ───────────────────────────────
    public func refreshProEntitlement() async -> StoreEntitlementModel {
        var verifiedEntitlement: StoreEntitlementModel? = nil
        var hasUnverified = false

        for await result in Transaction.currentEntitlements {
            switch result {
            case .verified(let transaction):
                if transaction.productID == KEYFIXER_PRO_LIFETIME_PRODUCT_ID {
                    let pDate = isoFormatter.string(from: transaction.purchaseDate)
                    if let rDate = transaction.revocationDate {
                        // Revoked / refunded transaction: paid = false
                        return StoreEntitlementModel(
                            paid: false,
                            productId: transaction.productID,
                            purchaseDate: pDate,
                            revocationDate: isoFormatter.string(from: rDate),
                            verificationStatus: "REVOKED"
                        )
                    } else {
                        // Verified active non-consumable: paid = true
                        verifiedEntitlement = StoreEntitlementModel(
                            paid: true,
                            productId: transaction.productID,
                            purchaseDate: pDate,
                            revocationDate: nil,
                            verificationStatus: "VERIFIED"
                        )
                    }
                }

            case .unverified(let transaction, let error):
                if transaction.productID == KEYFIXER_PRO_LIFETIME_PRODUCT_ID {
                    NSLog("[KeyFixer StoreKit] Unverified entitlement detected: %@", error.localizedDescription)
                    hasUnverified = true
                }
            }
        }

        if let entitlement = verifiedEntitlement {
            return entitlement
        }

        if hasUnverified {
            return StoreEntitlementModel(
                paid: false,
                productId: KEYFIXER_PRO_LIFETIME_PRODUCT_ID,
                purchaseDate: nil,
                revocationDate: nil,
                verificationStatus: "UNVERIFIED"
            )
        }

        return StoreEntitlementModel.notPurchased
    }

    public func checkCurrentEntitlement() async -> StoreEntitlementModel {
        return await refreshProEntitlement()
    }

    // ── Load Product Metadata ─────────────────────────────────────────────────
    public func loadProduct() async -> StoreProductModel? {
        do {
            let products = try await Product.products(for: [KEYFIXER_PRO_LIFETIME_PRODUCT_ID])
            guard let product = products.first else {
                return StoreProductModel(
                    id: KEYFIXER_PRO_LIFETIME_PRODUCT_ID,
                    displayName: "KeyFixer Pro Lifetime",
                    displayPrice: "",
                    isAvailable: false
                )
            }
            return StoreProductModel(
                id: product.id,
                displayName: product.displayName.isEmpty ? "KeyFixer Pro Lifetime" : product.displayName,
                displayPrice: product.displayPrice,
                isAvailable: true
            )
        } catch {
            NSLog("[KeyFixer StoreKit] Failed to load product: %@", error.localizedDescription)
            return StoreProductModel(
                id: KEYFIXER_PRO_LIFETIME_PRODUCT_ID,
                displayName: "KeyFixer Pro Lifetime",
                displayPrice: "",
                isAvailable: false
            )
        }
    }

    // ── Restore Purchases ─────────────────────────────────────────────────────
    public func restorePurchases() async -> RestorePurchasesResultModel {
        do {
            try await AppStore.sync()
            let entitlement = await refreshProEntitlement()
            notifyUpdate(isPaid: entitlement.paid)
            if entitlement.paid && entitlement.verificationStatus == "VERIFIED" {
                return RestorePurchasesResultModel(
                    status: "RESTORED",
                    entitlement: entitlement,
                    errorMessage: nil
                )
            } else {
                return RestorePurchasesResultModel(
                    status: "NOT_FOUND",
                    entitlement: entitlement,
                    errorMessage: nil
                )
            }
        } catch {
            NSLog("[KeyFixer StoreKit] AppStore.sync() error: %@", error.localizedDescription)
            let currentEntitlement = await refreshProEntitlement()
            // IMPORTANT: Do NOT force downgrade if sync throws! Preserve verified entitlement.
            return RestorePurchasesResultModel(
                status: "FAILED",
                entitlement: currentEntitlement,
                errorMessage: "AppStore.sync failed"
            )
        }
    }

    // ── Real Purchase Flow (TASK 9B) ──────────────────────────────────────────
    public func purchasePro() async -> PurchaseResultModel {
        do {
            let products = try await Product.products(for: [KEYFIXER_PRO_LIFETIME_PRODUCT_ID])
            guard let product = products.first else {
                return PurchaseResultModel(status: "FAILED", errorMessage: "Product unavailable in StoreKit")
            }

            let result = try await product.purchase()
            switch result {
            case .success(let verification):
                switch verification {
                case .verified(let transaction):
                    // 1. Confirm productID matches exactly
                    guard transaction.productID == KEYFIXER_PRO_LIFETIME_PRODUCT_ID else {
                        return PurchaseResultModel(status: "FAILED", errorMessage: "Product ID mismatch")
                    }
                    // 2. Ensure transaction is not revoked
                    guard transaction.revocationDate == nil else {
                        notifyUpdate(isPaid: false)
                        return PurchaseResultModel(status: "FAILED", errorMessage: "Transaction is revoked")
                    }
                    // 3. Update normalized StoreEntitlement & unlock Pro in native runtime first
                    notifyUpdate(isPaid: true)
                    // 4. ONLY THEN call transaction.finish() after successful delivery
                    await transaction.finish()
                    return PurchaseResultModel(status: "SUCCESS")

                case .unverified(let transaction, let error):
                    // Unverified transaction: never unlock Pro and never finish blindly
                    NSLog("[KeyFixer StoreKit] Unverified purchase for %@: %@", transaction.productID, error.localizedDescription)
                    return PurchaseResultModel(status: "FAILED", errorMessage: "Transaction signature unverified")
                }

            case .userCancelled:
                return PurchaseResultModel(status: "CANCELLED")

            case .pending:
                return PurchaseResultModel(status: "PENDING")

            @unknown default:
                return PurchaseResultModel(status: "FAILED", errorMessage: "Unknown purchase outcome")
            }
        } catch {
            NSLog("[KeyFixer StoreKit] Purchase exception: %@", error.localizedDescription)
            return PurchaseResultModel(status: "FAILED", errorMessage: error.localizedDescription)
        }
    }
}

// ── C-ABI FFI Exports (Bridging Swift to Rust) ────────────────────────────────

@_cdecl("keyfixer_storekit_init_listener")
public func keyfixer_storekit_init_listener(callback: @escaping @convention(c) (Bool) -> Void) {
    if #available(macOS 12.0, *) {
        KeyFixerStoreKitManager.shared.startTransactionListener(callback: callback)
    }
}

@_cdecl("keyfixer_storekit_get_entitlement_json")
public func keyfixer_storekit_get_entitlement_json() -> UnsafePointer<CChar>? {
    guard #available(macOS 12.0, *) else {
        return makeCString(from: StoreEntitlementModel.notPurchased)
    }

    let semaphore = DispatchSemaphore(value: 0)
    var resultModel: StoreEntitlementModel = .notPurchased

    Task {
        resultModel = await KeyFixerStoreKitManager.shared.checkCurrentEntitlement()
        semaphore.signal()
    }

    _ = semaphore.wait(timeout: .now() + 5.0)
    return makeCString(from: resultModel)
}

@_cdecl("keyfixer_storekit_load_product_json")
public func keyfixer_storekit_load_product_json() -> UnsafePointer<CChar>? {
    guard #available(macOS 12.0, *) else {
        let fallback = StoreProductModel(
            id: KEYFIXER_PRO_LIFETIME_PRODUCT_ID,
            displayName: "KeyFixer Pro Lifetime",
            displayPrice: "",
            isAvailable: false
        )
        return makeCString(from: fallback)
    }

    let semaphore = DispatchSemaphore(value: 0)
    var resultModel: StoreProductModel?

    Task {
        resultModel = await KeyFixerStoreKitManager.shared.loadProduct()
        semaphore.signal()
    }

    _ = semaphore.wait(timeout: .now() + 5.0)
    let finalModel = resultModel ?? StoreProductModel(
        id: KEYFIXER_PRO_LIFETIME_PRODUCT_ID,
        displayName: "KeyFixer Pro Lifetime",
        displayPrice: "",
        isAvailable: false
    )
    return makeCString(from: finalModel)
}

@_cdecl("keyfixer_storekit_restore_purchases_json")
public func keyfixer_storekit_restore_purchases_json() -> UnsafePointer<CChar>? {
    guard #available(macOS 12.0, *) else {
        let fallback = RestorePurchasesResultModel(
            status: "NOT_FOUND",
            entitlement: StoreEntitlementModel.notPurchased,
            errorMessage: nil
        )
        return makeCString(from: fallback)
    }

    let semaphore = DispatchSemaphore(value: 0)
    var resultModel = RestorePurchasesResultModel(
        status: "FAILED",
        entitlement: .notPurchased,
        errorMessage: "Timeout"
    )

    Task {
        resultModel = await KeyFixerStoreKitManager.shared.restorePurchases()
        semaphore.signal()
    }

    _ = semaphore.wait(timeout: .now() + 15.0)
    return makeCString(from: resultModel)
}

@_cdecl("keyfixer_storekit_purchase_pro_async")
public func keyfixer_storekit_purchase_pro_async(
    context: UnsafeMutableRawPointer?,
    callback: @escaping @convention(c) (UnsafeMutableRawPointer?, UnsafePointer<CChar>?) -> Void
) {
    guard #available(macOS 12.0, *) else {
        let err = makeCString(from: PurchaseResultModel(status: "FAILED", errorMessage: "StoreKit 2 requires macOS 12.0+"))
        callback(context, err)
        return
    }

    Task { @MainActor in
        let result = await KeyFixerStoreKitManager.shared.purchasePro()
        let jsonPtr = makeCString(from: result)
        callback(context, jsonPtr)
    }
}

@_cdecl("keyfixer_storekit_free_string")
public func keyfixer_storekit_free_string(ptr: UnsafePointer<CChar>?) {
    guard let ptr = ptr else { return }
    free(UnsafeMutableRawPointer(mutating: ptr))
}

private func makeCString<T: Encodable>(from model: T) -> UnsafePointer<CChar>? {
    guard let data = try? JSONEncoder().encode(model),
          let string = String(data: data, encoding: .utf8),
          let ptr = strdup(string) else {
        return nil
    }
    return UnsafePointer(ptr)
}
