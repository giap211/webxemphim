#!/usr/bin/env bash
set -euo pipefail

export CARGO_HOME="${CARGO_HOME:-$HOME/.cargo}"
export RUSTUP_HOME="${RUSTUP_HOME:-$HOME/.rustup}"

if [ ! -x "$CARGO_HOME/bin/rustup" ]; then
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | env CARGO_HOME="$CARGO_HOME" RUSTUP_HOME="$RUSTUP_HOME" sh -s -- -y --profile minimal
fi

export PATH="$CARGO_HOME/bin:$PATH"
rustup target add wasm32-unknown-unknown

if ! command -v trunk >/dev/null 2>&1; then
  cargo install trunk --locked --version 0.21.14
fi

trunk build --release --dist-dir dist
