# mesh-fist-of-five

[![Live](https://img.shields.io/badge/live-baditaflorin.github.io%2Fmesh--fist--of--five-3DA9FC?style=flat-square)](https://baditaflorin.github.io/mesh-fist-of-five/)
[![Version](https://img.shields.io/github/package-json/v/baditaflorin/mesh-fist-of-five?style=flat-square&color=3DA9FC)](https://github.com/baditaflorin/mesh-fist-of-five/blob/main/package.json)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![No backend](https://img.shields.io/badge/backend-none-0a0d12?style=flat-square)](docs/adr/0001-deployment-mode.md)

> Silent group consensus. Everyone shows 1–5 at the same time; the aggregate is a bar chart with no names attached.

**Live:** https://baditaflorin.github.io/mesh-fist-of-five/

Open the link on every phone in the room. Tap **Connect**. Now there are five huge cells across the bottom of the screen. Pick one. Change your mind any time. Above the cells, a live bar chart shows how many phones are on each number — but never **who**.

When you want a fresh question, anyone taps **Reset round**.

## How it works

- Each phone joins a shared **Yjs** room over **y-webrtc** (self-hosted signaling + TURN).
- Votes live in `Y.Map<peerId, { value: 1..5, ts }>` named `"votes"` — one entry per peer, last-write-wins per peer.
- The bar chart is computed locally by reducing the map values; no leader, no server, no smoothing.
- **Reset round** is `map.clear()` inside a `transact`. Anyone in the room can press it. ([ADR 0003](docs/adr/0003-reset-is-permissive.md))
- The `peerId` is the Yjs awareness `clientID`, regenerated on every page load — no stable identity is stored anywhere.

## Privacy threat model

See [docs/privacy.md](docs/privacy.md). The short version: a peer in the room sees the value you currently picked. They do not see a name, a stable ID, or any history beyond the current map snapshot.

## Architecture

- **Mode A** — pure GitHub Pages, zero backend at runtime.
- **WebRTC** — Yjs + y-webrtc with self-hosted signaling and TURN, overridable from the Settings drawer.

## Run it locally

```bash
git clone https://github.com/baditaflorin/mesh-fist-of-five.git
cd mesh-fist-of-five
npm install
npm run dev
```

## Self-hosted infrastructure

| Repo                                                                   | Endpoint                               | Role                      |
| ---------------------------------------------------------------------- | -------------------------------------- | ------------------------- |
| [signaling-server](https://github.com/baditaflorin/signaling-server)   | `wss://turn.0docker.com/ws`            | y-webrtc protocol fan-out |
| [turn-token-server](https://github.com/baditaflorin/turn-token-server) | `https://turn.0docker.com/credentials` | HMAC TURN creds           |
| [coturn-hetzner](https://github.com/baditaflorin/coturn-hetzner)       | `turn:turn.0docker.com:3479`           | TURN relay                |

Override either endpoint in the Settings drawer to point at your own.

## Settings (in-app)

- **Room ID** — phones must share one to see each other.
- **Show as faces** — render 😟😐🙂😊🤩 instead of 1–5.
- **Signaling URL** / **TURN credentials URL** — override the defaults.

## ADRs

- [0001 — Deployment mode](docs/adr/0001-deployment-mode.md)
- [0002 — Per-peer last-write-wins vs immutable Y.Array of votes](docs/adr/0002-vote-data-model.md)
- [0003 — Reset is permissive (no host role)](docs/adr/0003-reset-is-permissive.md)
- [0010 — GitHub Pages publishing](docs/adr/0010-pages-publishing.md)

## License

[MIT](LICENSE) © 2026 Florin Badita
