import AppKit
import Foundation

final class AppDelegate: NSObject, NSApplicationDelegate {
    let provider = ServiceProvider()
    var statusItem: NSStatusItem?

    func applicationDidFinishLaunching(_ notification: Notification) {
        // Register the service provider instance with the NSApplication runtime
        NSApplication.shared.servicesProvider = provider
        
        // Force the macOS pasteboard server (pbs) to update its service table immediately
        NSUpdateDynamicServices()

        // Create a minimal menu bar item so the user knows the prototype is running
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        if let button = statusItem?.button {
            button.title = "⚡ KeyFixer (NSServices Prototype)"
        }

        let menu = NSMenu()
        menu.addItem(NSMenuItem(title: "KeyFixer NSServices Prototype (Sandboxed)", action: nil, keyEquivalent: ""))
        menu.addItem(NSMenuItem.separator())
        menu.addItem(NSMenuItem(title: "Shortcut: ⌥⌘K (or Services menu)", action: nil, keyEquivalent: ""))
        menu.addItem(NSMenuItem.separator())
        menu.addItem(NSMenuItem(title: "Quit Prototype", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q"))
        statusItem?.menu = menu

        NSLog("[KeyFixer Prototype] KeyFixerServicePrototype is running in sandboxed mode.")
        NSLog("[KeyFixer Prototype] Service provider registered: NSApplication.shared.servicesProvider")
        NSLog("[KeyFixer Prototype] Service name: 'Fix Layout with KeyFixer'")
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.run()
