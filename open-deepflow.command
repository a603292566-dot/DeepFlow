#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$ROOT_DIR/build/macos/DeepFlow.app"

bash "$ROOT_DIR/scripts/build-macos-app.sh"

open "$APP_DIR"
