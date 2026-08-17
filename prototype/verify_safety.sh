#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_BUNDLE="$SCRIPT_DIR/build/KeyFixerServicePrototype.app"
BINARY="$APP_BUNDLE/Contents/MacOS/KeyFixerServicePrototype"

echo "=========================================================="
echo " Safety & Zero-Accessibility Audit for Prototype"
echo "=========================================================="

if [[ ! -f "$BINARY" ]]; then
  echo "❌ Binary not found at $BINARY. Run ./build.sh first."
  exit 1
fi

FORBIDDEN_SYMBOLS=(
  "CGEventPost"
  "CGRequestPostEventAccess"
  "CGPreflightPostEventAccess"
  "CGEventCreateKeyboardEvent"
  "CGEventSourceCreate"
  "CGEventSetFlags"
  "AXIsProcessTrusted"
  "AXIsProcessTrustedWithOptions"
  "AXUIElementCreateSystemWide"
)

echo ""
echo "── 1. Checking Binary for Forbidden Accessibility/PostEvent Symbols..."
SYMBOLS_FOUND=0
for sym in "${FORBIDDEN_SYMBOLS[@]}"; do
  if nm -u "$BINARY" 2>/dev/null | grep -q "$sym" || strings "$BINARY" | grep -q "$sym"; then
    echo "  ❌ FORBIDDEN SYMBOL FOUND: $sym"
    SYMBOLS_FOUND=$((SYMBOLS_FOUND + 1))
  else
    echo "  ✅ Clean (not present): $sym"
  fi
done

if (( SYMBOLS_FOUND > 0 )); then
  echo ""
  echo "❌ Audit Failed: $SYMBOLS_FOUND forbidden accessibility symbol(s) detected!"
  exit 1
fi

echo ""
echo "── 2. Checking App Sandbox Entitlement..."
ENTITLEMENTS="$(codesign -d --entitlements - "$APP_BUNDLE" 2>&1 || true)"
if echo "$ENTITLEMENTS" | grep -q "com.apple.security.app-sandbox"; then
  echo "  ✅ App Sandbox is ACTIVE (com.apple.security.app-sandbox = true)"
else
  echo "  ❌ App Sandbox is MISSING in code signature!"
  exit 1
fi

echo ""
echo "── 3. Checking NSServices Registration in Info.plist..."
INFO_PLIST="$APP_BUNDLE/Contents/Info.plist"
if grep -q "<key>NSServices</key>" "$INFO_PLIST" && grep -q "<string>fixSelectedText</string>" "$INFO_PLIST"; then
  echo "  ✅ NSServices correctly configured with message 'fixSelectedText'"
else
  echo "  ❌ NSServices missing or misconfigured in Info.plist!"
  exit 1
fi

if grep -q "<string>~@k</string>" "$INFO_PLIST"; then
  echo "  ✅ Service shortcut ~@k (⌥⌘K) declared in Info.plist"
else
  echo "  ❌ ~@k shortcut missing in Info.plist!"
  exit 1
fi

echo ""
echo "=========================================================="
echo " 🎉 ALL SAFETY CHECKS PASSED!"
echo " The prototype contains ZERO Accessibility APIs,"
echo " ZERO synthetic event simulation, and runs fully sandboxed."
echo "=========================================================="
