#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$ROOT_DIR/build/macos"
APP_DIR="$BUILD_DIR/DeepFlow.app"
CONTENTS_DIR="$APP_DIR/Contents"
MACOS_DIR="$CONTENTS_DIR/MacOS"
RESOURCES_DIR="$CONTENTS_DIR/Resources"
WEB_DIR="$RESOURCES_DIR/DeepFlowWeb"

rm -rf "$APP_DIR"
mkdir -p "$MACOS_DIR" "$WEB_DIR"

cp "$ROOT_DIR/macos/Info.plist" "$CONTENTS_DIR/Info.plist"
printf 'APPL????' > "$CONTENTS_DIR/PkgInfo"
node "$ROOT_DIR/scripts/build-desktop-html.mjs" "$WEB_DIR/index.html"

export CLANG_MODULE_CACHE_PATH="$BUILD_DIR/module-cache"
mkdir -p "$CLANG_MODULE_CACHE_PATH"

xcrun clang \
  -fobjc-arc \
  "$ROOT_DIR/macos/DeepFlowApp.m" \
  -o "$MACOS_DIR/DeepFlow" \
  -framework Cocoa \
  -framework WebKit

chmod +x "$MACOS_DIR/DeepFlow"

if command -v codesign >/dev/null 2>&1; then
  codesign --force --deep --sign - "$APP_DIR" >/dev/null 2>&1 || true
fi

echo "$APP_DIR"
