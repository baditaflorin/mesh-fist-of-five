---
status: accepted
date: 2026-05-12
---

# 0002 — Per-peer last-write-wins vs immutable Y.Array of votes

## Context

Each phone needs to publish a single 1–5 value and update it freely (people change their minds mid-discussion). The aggregation surface — a bar chart with five bars — is purely a count over current values; no history is shown.

Two natural Yjs shapes:

- `Y.Array<{ peerId, value, ts }>` — append a new entry on every change. History is durable; aggregation must filter to the latest entry per peer.
- `Y.Map<peerId, { value, ts }>` — one entry per peer, in-place overwrite on change. No history; aggregation is trivial.

## Decision

Use `Y.Map<peerId, VoteEntry>("votes")`, keyed by the Yjs awareness `clientID` (as a string).

## Consequences

- **Pros.** O(1) update on mind-change. The map's size is bounded by the number of live peers, never grows with vote churn. Aggregation is `for (const v of map.values()) counts[v.value-1]++`. Reset is `map.clear()` inside a `transact`, which fires one observer event instead of N.
- **Cons.** `clientID` is **unstable across page reloads**. A peer who refreshes the tab loses their vote and shows up in the next round as a new peer. Accepted because (a) the tool is for in-the-moment gauges, not long-running polls, and (b) the alternative — generate and persist a UUID in `localStorage` — would let a closed-tab user "still be voting," which is worse semantics than losing the vote on reload.
- **Privacy.** No name field. The map key is opaque (a session-only integer). An observer cannot tie a row back to a person without out-of-band info.

## Alternatives considered

- **`Y.Array` of immutable votes** with reducer over latest-per-peer. Rejected — unbounded growth in a long-lived room, awkward to clear without iterating, and the durability buys nothing because nobody reads vote history.
- **Persistent UUID in `localStorage`.** Rejected because (a) it makes a closed-tab peer "still in the room voting," (b) it lets a single browser carry their vote across rooms unless namespaced carefully, and (c) stable peer identity is a privacy regression that the design explicitly avoids.
