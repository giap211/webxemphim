# webxemphim — Rust + WebAssembly

The web client is rebuilt with Rust, Leptos CSR and WebAssembly. Existing Vercel API routes remain the movie-data layer and image proxy.

## Local development
Install Rust, then run `rustup target add wasm32-unknown-unknown`, `cargo install trunk`, and `trunk serve`.

## Production
Run `bash scripts/build.sh`. Trunk writes the static client to `dist/`; Vercel keeps the existing `/api/*` functions available.

## Structure
- `src/main.rs`: Leptos UI, catalogue, search, detail and episode player.
- `styles.css`: responsive dark interface with Liquid Glass-inspired dock and purple accents.
- `api/`: existing movie data and image proxy functions.
