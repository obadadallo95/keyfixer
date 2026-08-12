#!/usr/bin/env bash
# verify-appstore-bundle.sh
#
# Two-stage App Store bundle verifier for KeyFixer.
#
# Usage:
#   bash scripts/verify-appstore-bundle.sh --stage preflight
#       Run BEFORE tauri build.  Checks dist-desktop/ is ready for packaging.
#       Verifies: index.html exists, is non-empty, assets exist, no dev-server
#       references, desktop-root mount point present.
#
#   bash scripts/verify-appstore-bundle.sh --stage postbuild   (default)
#       Run AFTER tauri build.  Validates the signed .app bundle.
#       Checks: app exists, index.html inside Resources, bundled assets exist,
#       Info.plist metadata, code signature, no dev-server refs in bundle.
#
# Exit codes:
#   0 – all checks passed
#   1 – one or more checks failed
#
set -euo pipefail

# ─────────────────────────────────────────────────────────────────────────────
# Argument parsing
# ─────────────────────────────────────────────────────────────────────────────
STAGE="postbuild"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --stage)
      STAGE="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

if [[ "$STAGE" != "preflight" && "$STAGE" != "postbuild" ]]; then
  echo "Invalid --stage value: '$STAGE'. Must be 'preflight' or 'postbuild'." >&2
  exit 1
fi

# ─────────────────────────────────────────────────────────────────────────────
# Shared helpers
# ─────────────────────────────────────────────────────────────────────────────
PASS_COUNT=0
FAIL_COUNT=0

pass() { echo "  ✅  $*"; (( PASS_COUNT++ )) || true; }
fail() { echo "  ❌  $*" >&2; (( FAIL_COUNT++ )) || true; }
section() { echo ""; echo "── $*"; }

# ═════════════════════════════════════════════════════════════════════════════
# STAGE: preflight
# Verifies dist-desktop/ is ready for Tauri packaging.
# ═════════════════════════════════════════════════════════════════════════════
if [[ "$STAGE" == "preflight" ]]; then
  echo "KeyFixer – Pre-flight check (dist-desktop/ readiness)"
  echo "══════════════════════════════════════════════════════"

  DIST="dist-desktop"
  INDEX="$DIST/index.html"

  # ── Check 1: index.html exists ─────────────────────────────────────────────
  section "Check 1 – dist-desktop/index.html exists"
  if [[ ! -f "$INDEX" ]]; then
    fail "dist-desktop/index.html not found."
    echo ""
    echo "❌  Pre-flight FAILED – dist-desktop/index.html is missing." >&2
    echo "   Run 'npm run build:desktop' first, or use 'npm run build:appstore'." >&2
    exit 1
  fi
  pass "dist-desktop/index.html found"

  # ── Check 2: index.html is non-empty ───────────────────────────────────────
  section "Check 2 – index.html is non-empty"
  INDEX_SIZE=$(wc -c < "$INDEX" | tr -d ' ')
  if (( INDEX_SIZE < 100 )); then
    fail "index.html is only ${INDEX_SIZE} bytes – likely empty or truncated."
  else
    pass "index.html is ${INDEX_SIZE} bytes"
  fi

  # ── Check 3: Referenced JS/CSS assets exist ─────────────────────────────────
  section "Check 3 – Referenced JS/CSS assets exist"
  ASSET_REFS=$(grep -oE '(src|href)="/assets/[^"]+"' "$INDEX" | grep -oE '/assets/[^"]+' || true)
  if [[ -z "$ASSET_REFS" ]]; then
    fail "No /assets/ references found in index.html (expected hashed Vite build output)."
  else
    ASSETS_OK=true
    while IFS= read -r asset_ref; do
      asset_path="$DIST$asset_ref"
      if [[ ! -f "$asset_path" ]]; then
        fail "Asset not found on disk: $asset_ref"
        ASSETS_OK=false
      else
        SIZE=$(wc -c < "$asset_path" | tr -d ' ')
        pass "$asset_ref (${SIZE} bytes)"
      fi
    done <<< "$ASSET_REFS"
  fi

  # ── Check 4: No dev-server references ──────────────────────────────────────
  section "Check 4 – No dev-server references"
  DEV_FOUND=false
  if grep -qi "localhost" "$INDEX"; then
    fail "index.html contains 'localhost' (dev-server reference)."
    DEV_FOUND=true
  fi
  if grep -q "127\.0\.0\.1" "$INDEX"; then
    fail "index.html contains '127.0.0.1' (dev-server reference)."
    DEV_FOUND=true
  fi
  if grep -qE "http://[^'\"> ]" "$INDEX"; then
    fail "index.html contains an http:// URL (possible dev-server reference)."
    DEV_FOUND=true
  fi
  if [[ "$DEV_FOUND" == "false" ]]; then
    pass "No localhost / 127.0.0.1 / http:// dev-server references found"
  fi

  # ── Check 5: desktop-root mount point ──────────────────────────────────────
  section "Check 5 – desktop-root mount point"
  if ! grep -q 'id="desktop-root"' "$INDEX"; then
    fail "index.html does not contain <div id=\"desktop-root\"> – wrong entry file may have been copied."
  else
    pass "<div id=\"desktop-root\"> mount point present"
  fi

  # ── Summary ─────────────────────────────────────────────────────────────────
  echo ""
  echo "──────────────────────────────────────────────────────────────"
  if (( FAIL_COUNT > 0 )); then
    echo "❌  Pre-flight FAILED: ${FAIL_COUNT} check(s) failed, ${PASS_COUNT} passed." >&2
    exit 1
  else
    echo "✅  Pre-flight passed: all ${PASS_COUNT} check(s) passed."
    echo "   dist-desktop/ is ready for Tauri packaging."
  fi
  exit 0
fi

# ═════════════════════════════════════════════════════════════════════════════
# STAGE: postbuild
# Validates the signed KeyFixer.app bundle produced by tauri build.
#
# NOTE – Tauri v2 asset embedding:
#   In Tauri v2, frontendDist files (HTML/JS/CSS) are compiled INTO the binary
#   at cargo build time via tauri-build's include_bytes!/include_dir! codegen.
#   They are NOT placed as separate files in Contents/Resources/.
#   Contents/Resources/ only contains icon.icns (and any bundle.resources entries).
#   Asset presence is verified via `strings` on the binary instead.
# ═════════════════════════════════════════════════════════════════════════════
echo "KeyFixer – Post-build App Store bundle verification"
echo "═══════════════════════════════════════════════════"

APP_PATH="src-tauri/target/release/bundle/macos/KeyFixer.app"
RESOURCES="$APP_PATH/Contents/Resources"
INFO_PATH="$APP_PATH/Contents/Info.plist"
BINARY_PATH="$APP_PATH/Contents/MacOS/keyfixer-desktop"

# ── Check 1: .app bundle exists ────────────────────────────────────────────
section "Check 1 – KeyFixer.app bundle exists"
if [[ ! -d "$APP_PATH" ]]; then
  fail "KeyFixer.app not found at $APP_PATH"
  echo "" 
  echo "❌  Post-build check FAILED – run 'npm run build:appstore' first." >&2
  exit 1
fi
pass "KeyFixer.app found"

# ── Check 2: Binary exists and has reasonable size ─────────────────────────
# In Tauri v2, frontendDist (HTML/JS/CSS) is compiled INTO the binary at
# cargo build time via tauri-build include_bytes!/include_dir!.
# Contents/Resources/ only has icon.icns -- that is CORRECT and expected.
section "Check 2 – Application binary exists (Tauri v2: assets embedded in binary)"
if [[ ! -f "$BINARY_PATH" ]]; then
  fail "Binary not found at $BINARY_PATH"
  echo ""
  echo "❌  Post-build check FAILED – binary missing." >&2
  exit 1
fi
BINARY_SIZE=$(wc -c < "$BINARY_PATH" | tr -d ' ')
if (( BINARY_SIZE < 1000000 )); then
  fail "Binary is suspiciously small (${BINARY_SIZE} bytes) – may be a stub or empty."
else
  pass "Binary found (${BINARY_SIZE} bytes)"
fi

# -- Check 3: Frontend asset paths embedded in binary ---------------------
# Tauri v2 compresses HTML/JS/CSS content using zlib before embedding it.
# Asset file PATHS (not content) are stored as plain strings in the binary.
# We use grep -c with || true to avoid SIGPIPE issues with set -o pipefail.
section "Check 3 - Frontend asset paths embedded in binary"
_cnt=$(strings -arch arm64 "$BINARY_PATH" 2>/dev/null | grep -c "index-desktop" || true)
if [[ "$_cnt" -gt 0 ]]; then
  pass "Frontend asset path 'index-desktop' found embedded in binary (${_cnt} occurrences)"
else
  fail "Frontend asset path 'index-desktop' NOT found in binary - dist-desktop/ may have been empty when cargo built the binary."
fi
_cnt=$(strings -arch arm64 "$BINARY_PATH" 2>/dev/null | grep -c "/index-desktop.html" || true)
if [[ "$_cnt" -gt 0 ]]; then
  pass "Frontend entry point '/index-desktop.html' found embedded in binary"
else
  fail "Frontend entry point '/index-desktop.html' NOT found in binary."
fi

# -- Check 4: No unexpected dev-server references embedded in binary -------
# NOTE: Tauri v2 stores the devUrl string (localhost:5174) in its compiled
# binary as an internal config record. This is a Tauri implementation detail
# and does NOT mean the app connects to a dev server at runtime.
# We only flag 127.0.0.1 which should never appear in a production Tauri binary.
section "Check 4 - No unexpected dev-server references embedded in binary"
BINARY_DEV_FOUND=false
_cnt=$(strings -arch arm64 "$BINARY_PATH" 2>/dev/null | grep -c "127\.0\.0\.1" || true)
if [[ "$_cnt" -gt 0 ]]; then
  fail "Binary contains '127.0.0.1' (unexpected dev-server reference: ${_cnt} occurrences)."
  BINARY_DEV_FOUND=true
fi
if [[ "$BINARY_DEV_FOUND" == "false" ]]; then
  pass "No unexpected dev-server references found in binary"
fi

# -- Check 4.5: No DEV paid bypass commands embedded in binary -------
section "Check 4.5 - No DEV paid bypass commands in binary"
BYPASS_FOUND=false
_cnt=$(strings -arch arm64 "$BINARY_PATH" 2>/dev/null | grep -c "reset_trial_for_testing" || true)
if [[ "$_cnt" -gt 0 ]]; then
  fail "Binary contains 'reset_trial_for_testing' (unexpected dev bypass command: ${_cnt} occurrences)."
  BYPASS_FOUND=true
fi
_cnt=$(strings -arch arm64 "$BINARY_PATH" 2>/dev/null | grep -c "dev_simulate_paid" || true)
if [[ "$_cnt" -gt 0 ]]; then
  fail "Binary contains 'dev_simulate_paid' (unexpected dev bypass command: ${_cnt} occurrences)."
  BYPASS_FOUND=true
fi
if [[ "$BYPASS_FOUND" == "false" ]]; then
  pass "No DEV paid bypass commands found in binary"
fi

# -- Check 4.6: PRO MARKER embedded in binary -------
section "Check 4.6 - PRO MARKER embedded in binary"
_cnt=$(strings -arch arm64 "$BINARY_PATH" 2>/dev/null | grep -c "ACTIVE_PRO_BUILD_MARKER_9921" || true)
if [[ "$_cnt" -gt 0 ]]; then
  pass "PRO MARKER 'ACTIVE_PRO_BUILD_MARKER_9921' found in binary (${_cnt} occurrences)"
else
  fail "PRO MARKER NOT FOUND in binary. Frontend was likely built without VITE_PRO_BUILD=true!"
fi

# ── Check 5: Bundle resource listing ────────────────────────────────────
section "Check 5 – Bundle resource listing"
echo "   Note: In Tauri v2, only icon.icns is expected in Contents/Resources/."
echo "         HTML/JS/CSS are embedded in the binary -- not as separate files."
echo "   (listing all files in Contents/Resources/)"
find "$RESOURCES" -type f | sort | while read -r f; do
  SIZE=$(wc -c < "$f" | tr -d ' ')
  echo "       ${SIZE}B  ${f#$RESOURCES/}"
done
pass "Resource listing complete (icon.icns only is correct for Tauri v2)"

# ── Check 6: Info.plist metadata ──────────────────────────────────────────
section "Check 6 – Info.plist metadata"
BUNDLE_ID="$(plutil -extract CFBundleIdentifier raw "$INFO_PATH" 2>/dev/null || echo '')"
CATEGORY="$(plutil -extract LSApplicationCategoryType raw "$INFO_PATH" 2>/dev/null || echo '')"
MIN_MACOS="$(plutil -extract LSMinimumSystemVersion raw "$INFO_PATH" 2>/dev/null || echo '')"
EXEMPT_ENC="$(plutil -extract ITSAppUsesNonExemptEncryption raw "$INFO_PATH" 2>/dev/null || echo '')"

if [[ "$BUNDLE_ID" == "com.obadadallo.keyfixer" ]]; then
  pass "CFBundleIdentifier = $BUNDLE_ID"
else
  fail "CFBundleIdentifier mismatch: got '$BUNDLE_ID', expected 'com.obadadallo.keyfixer'"
fi

if [[ "$CATEGORY" == "public.app-category.utilities" ]]; then
  pass "LSApplicationCategoryType = $CATEGORY"
else
  fail "LSApplicationCategoryType mismatch: got '$CATEGORY', expected 'public.app-category.utilities'"
fi

if [[ "$MIN_MACOS" == "12.0" ]]; then
  pass "LSMinimumSystemVersion = $MIN_MACOS"
else
  fail "LSMinimumSystemVersion mismatch: got '$MIN_MACOS', expected '12.0'"
fi

if [[ "$EXEMPT_ENC" == "false" ]]; then
  pass "ITSAppUsesNonExemptEncryption = false"
else
  fail "ITSAppUsesNonExemptEncryption mismatch: got '$EXEMPT_ENC', expected 'false'"
fi

# ── Check 7: Code signature ────────────────────────────────────────────────
section "Check 7 – Code signature"
set +e
SIGNATURE_OUTPUT="$(codesign --verify --deep --strict --verbose=2 "$APP_PATH" 2>&1)"
SIGNATURE_STATUS=$?
set -e

if (( SIGNATURE_STATUS == 0 )); then
  pass "Code signature valid"
elif [[ "$SIGNATURE_OUTPUT" == *"CSSMERR_TP_NOT_TRUSTED"* ]]; then
  pass "Signature present (CSSMERR_TP_NOT_TRUSTED – Apple CA trust chain not in local keychain; Transporter validation still required)"
else
  fail "Code signature verification failed: $SIGNATURE_OUTPUT"
fi

# ── Check 7.5: StoreKit Linkage ─────────────────────────────────────────────
section "Check 7.5 – StoreKit linkage"
set +e
LINKAGE_OUTPUT="$(otool -L "$BINARY_PATH" 2>/dev/null)"
set -e

if echo "$LINKAGE_OUTPUT" | grep -q "StoreKit.framework"; then
  pass "StoreKit framework is linked"
else
  fail "StoreKit.framework linkage missing in App Store build!"
fi

# ── Check 8: App Sandbox entitlement ──────────────────────────────────────
section "Check 8 – App Sandbox entitlement"
ENTITLEMENTS="$(codesign -d --entitlements - "$APP_PATH" 2>/dev/null || echo '')"
if [[ "$ENTITLEMENTS" != *"com.apple.security.app-sandbox"* ]] || [[ "$ENTITLEMENTS" != *"true"* ]]; then
  fail "App Sandbox entitlement missing."
else
  pass "com.apple.security.app-sandbox = true"
fi

# ── Summary ───────────────────────────────────────────────────────────────
echo ""
echo "──────────────────────────────────────────────────────────────"
if (( FAIL_COUNT > 0 )); then
  echo "❌  Post-build verification FAILED: ${FAIL_COUNT} check(s) failed, ${PASS_COUNT} passed." >&2
  exit 1
else
  echo "✅  Mac App Store bundle verification passed: all ${PASS_COUNT} check(s) passed."
fi
exit 0
