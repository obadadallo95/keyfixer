#!/usr/bin/env bash
set -euo pipefail

app_path="src-tauri/target/release/bundle/macos/KeyFixer.app"
info_path="$app_path/Contents/Info.plist"

test -d "$app_path"

set +e
signature_output="$(codesign --verify --deep --strict --verbose=2 "$app_path" 2>&1)"
signature_status=$?
set -e

if (( signature_status != 0 )); then
  if [[ "$signature_output" == *"CSSMERR_TP_NOT_TRUSTED"* ]]; then
    echo "Warning: the local Keychain cannot build the Apple certificate trust chain." >&2
    echo "Transporter/App Store Connect validation remains required for the upload package." >&2
  else
    echo "$signature_output" >&2
    exit "$signature_status"
  fi
fi

bundle_id="$(plutil -extract CFBundleIdentifier raw "$info_path")"
category="$(plutil -extract LSApplicationCategoryType raw "$info_path")"
minimum_macos="$(plutil -extract LSMinimumSystemVersion raw "$info_path")"
uses_non_exempt_encryption="$(plutil -extract ITSAppUsesNonExemptEncryption raw "$info_path")"
entitlements="$(codesign -d --entitlements - "$app_path" 2>/dev/null)"

test "$bundle_id" = "com.obadadallo.keyfixer"
test "$category" = "public.app-category.utilities"
test "$minimum_macos" = "12.0"
test "$uses_non_exempt_encryption" = "false"

if [[ "$entitlements" != *"com.apple.security.app-sandbox"* ]] || [[ "$entitlements" != *"true"* ]]; then
  echo "App Sandbox entitlement is missing." >&2
  exit 1
fi

echo "Mac App Store bundle verification passed."
