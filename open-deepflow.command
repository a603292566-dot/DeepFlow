#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$ROOT_DIR/build/macos/DeepFlow.app"
CODEX_NODE_DIR="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin"

if ! command -v node >/dev/null 2>&1 && [ -x "$CODEX_NODE_DIR/node" ]; then
  export PATH="$CODEX_NODE_DIR:$PATH"
fi

bash "$ROOT_DIR/scripts/build-macos-app.sh"

open "$APP_DIR" || "$APP_DIR/Contents/MacOS/DeepFlow"
