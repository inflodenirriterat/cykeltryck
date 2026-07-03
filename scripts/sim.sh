#!/bin/bash
# Bygger webben, synkar iOS-projektet och kör appen i iOS-simulatorn.
# Användning: npm run sim [enhetsnamn]
# Exempel:    npm run sim "iPhone 17 Pro"   (standard om inget anges)
set -euo pipefail

DEVICE_NAME="${1:-iPhone 17 Pro}"
BUNDLE_ID="app.bikepressure"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

echo "==> Bygger webben"
npm run build

echo "==> Synkar iOS"
npx cap copy ios

SIM_ID=$(xcrun simctl list devices available | grep -F "$DEVICE_NAME (" | head -1 | sed -E 's/.*\(([0-9A-F-]+)\).*/\1/')

if [ -z "$SIM_ID" ]; then
  echo "Hittade ingen simulator som matchar \"$DEVICE_NAME\". Tillgängliga enheter:"
  xcrun simctl list devices available
  exit 1
fi

echo "==> Använder simulator: $DEVICE_NAME ($SIM_ID)"

if ! xcrun simctl list devices | grep "$SIM_ID" | grep -q "Booted"; then
  open -a Simulator --args -CurrentDeviceUDID "$SIM_ID"
  xcrun simctl bootstatus "$SIM_ID" -b
fi

echo "==> Bygger för simulator (kan ta en stund)"
BUILD_LOG=$(mktemp)
if ! xcodebuild -project "$ROOT_DIR/ios/App/App.xcodeproj" -scheme App -configuration Debug \
    -sdk iphonesimulator -derivedDataPath "$ROOT_DIR/ios/App/build" \
    -destination "platform=iOS Simulator,id=$SIM_ID" build > "$BUILD_LOG" 2>&1; then
  echo "Bygget misslyckades. Sista raderna:"
  tail -40 "$BUILD_LOG"
  exit 1
fi

APP_PATH="$ROOT_DIR/ios/App/build/Build/Products/Debug-iphonesimulator/App.app"

echo "==> Installerar och startar appen"
xcrun simctl install "$SIM_ID" "$APP_PATH"
xcrun simctl launch "$SIM_ID" "$BUNDLE_ID"
open -a Simulator

echo "==> Klart"
