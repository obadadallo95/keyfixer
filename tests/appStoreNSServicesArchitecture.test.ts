import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('macOS App Store NSServices Architecture & Safety', () => {
  const servicesSwift = readFileSync('src-tauri/native/KeyFixerServices.swift', 'utf8');
  const servicesRust = readFileSync('src-tauri/src/pro/inline_fix_nsservices.rs', 'utf8');
  const infoPlist = readFileSync('src-tauri/Info.plist', 'utf8');
  const entitlements = readFileSync('src-tauri/Entitlements.plist', 'utf8');
  const cargoToml = readFileSync('src-tauri/Cargo.toml', 'utf8');
  const proBridge = readFileSync('src-tauri/src/pro_bridge.rs', 'utf8');

  it('declares NSServices fixSelectedText in Info.plist with ~@k key equivalent', () => {
    expect(infoPlist).toContain('<key>NSServices</key>');
    expect(infoPlist).toContain('<string>fixSelectedText</string>');
    expect(infoPlist).toContain('<string>~@k</string>');
    expect(infoPlist).toContain('<string>Fix Layout with KeyFixer</string>');
    expect(infoPlist).toContain('<string>public.utf8-plain-text</string>');
  });

  it('maintains strict App Sandbox in Entitlements.plist', () => {
    expect(entitlements).toContain('<key>com.apple.security.app-sandbox</key>');
    expect(entitlements).toContain('<true/>');
  });

  it('contains zero Accessibility or PostEvent APIs in App Store NSServices engine', () => {
    expect(servicesSwift).not.toContain('CGEventPost');
    expect(servicesSwift).not.toContain('CGRequestPostEventAccess');
    expect(servicesSwift).not.toContain('CGPreflightPostEventAccess');
    expect(servicesSwift).not.toContain('AXIsProcessTrusted');
    expect(servicesSwift).not.toContain('NSPasteboard.general');

    expect(servicesRust).not.toContain('CGEventPost');
    expect(servicesRust).not.toContain('CGRequestPostEventAccess');
    expect(servicesRust).not.toContain('CGPreflightPostEventAccess');
    expect(servicesRust).not.toContain('AXIsProcessTrusted');
  });

  it('reads and writes exclusively to the dedicated service pasteboard', () => {
    expect(servicesSwift).toContain('fixSelectedText(');
    expect(servicesSwift).toContain('_ pboard: NSPasteboard');
    expect(servicesSwift).toContain('pboard.string(forType: .string)');
    expect(servicesSwift).toContain('pboard.setString(converted, forType: .string)');
    expect(servicesSwift).not.toContain('NSPasteboard.general');
  });

  it('implements strict charging rules (zero charge for empty or untransformed input)', () => {
    expect(servicesSwift).toContain('!text.isEmpty');
    expect(servicesSwift).toContain('canExecuteCallback');
    expect(servicesSwift).toContain('converted == text');
    expect(servicesSwift).toContain('onFixSucceededCallback?()');
  });

  it('defines clean appstore vs direct feature separation', () => {
    expect(cargoToml).toContain('appstore = ["pro"]');
    expect(cargoToml).toContain('direct = ["pro"]');

    expect(proBridge).toContain('#[cfg(all(feature = "appstore", target_os = "macos"))]');
    expect(proBridge).toContain('#[path = "pro/inline_fix_nsservices.rs"]');
    expect(proBridge).toContain('#[cfg(all(not(feature = "appstore"), feature = "pro", target_os = "macos"))]');
    expect(proBridge).toContain('#[path = "pro/inline_fix_direct.rs"]');
  });

  it('implements dynamic ⌥⌘K ownership based on entitlement state', () => {
    expect(servicesRust).toContain('pub fn sync_global_shortcut_state(app: &AppHandle)');
    expect(servicesRust).toContain('guard.can_attempt_instant_fix()');
    expect(servicesRust).toContain('global_sc.unregister(keyfixer_shortcut)');
    expect(servicesRust).toContain('global_sc.register(keyfixer_shortcut)');
    expect(proBridge).toContain('pub fn sync_global_shortcut_state');
  });
});
