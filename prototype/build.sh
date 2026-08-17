#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROTOTYPE_DIR="$SCRIPT_DIR/KeyFixerServicePrototype"
BUILD_DIR="$SCRIPT_DIR/build"
APP_BUNDLE="$BUILD_DIR/KeyFixerServicePrototype.app"
MACOS_DIR="$APP_BUNDLE/Contents/MacOS"
RESOURCES_DIR="$APP_BUNDLE/Contents/Resources"

echo "=========================================================="
echo " Building KeyFixer NSServices Prototype (Phase 1)"
echo "=========================================================="

rm -rf "$BUILD_DIR"
mkdir -p "$MACOS_DIR" "$RESOURCES_DIR"

# 1. Run Automated Swift Unit Tests
echo ""
echo "── Step 1: Running Automated Converter & Pasteboard Tests..."
swiftc \
  "$PROTOTYPE_DIR/Sources/KeyFixerConverter.swift" \
  "$PROTOTYPE_DIR/Sources/ServiceProvider.swift" \
  "$PROTOTYPE_DIR/Tests/ConverterTests.swift" \
  -o "$BUILD_DIR/test_runner"
"$BUILD_DIR/test_runner"
rm "$BUILD_DIR/test_runner"

# 2. Compile AppKit Main Binary
echo ""
echo "── Step 2: Compiling AppKit NSServices Binary..."
swiftc -O \
  "$PROTOTYPE_DIR/Sources/KeyFixerConverter.swift" \
  "$PROTOTYPE_DIR/Sources/ServiceProvider.swift" \
  "$PROTOTYPE_DIR/Sources/main.swift" \
  -o "$MACOS_DIR/KeyFixerServicePrototype" \
  -target arm64-apple-macosx12.0

# 3. Copy Info.plist
echo ""
echo "── Step 3: Packaging .app Bundle..."
cp "$PROTOTYPE_DIR/Info.plist" "$APP_BUNDLE/Contents/Info.plist"

# 4. Code Sign with App Sandbox Entitlements
echo ""
echo "── Step 4: Code Signing with App Sandbox..."
codesign --force --sign - \
  --entitlements "$PROTOTYPE_DIR/Entitlements.plist" \
  "$APP_BUNDLE"

echo ""
echo "=========================================================="
echo " ✅ Prototype Build Succeeded!"
echo " App location: $APP_BUNDLE"
echo "=========================================================="
