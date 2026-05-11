## Privacy threat model — mesh-fist-of-five

## What other peers in the same room can see

- For each phone currently in the room, the single value (1–5) it has chosen, and a `ts` timestamp of when it was set.
- Yjs awareness `clientID` — a 32-bit random integer regenerated on every page load. Not stable across reloads. Not tied to a human name, email, IP, or anything else.

That is the entire payload. There are no names, no avatars, no chat, no history. Re-loading the page generates a fresh `clientID`, so even sessions on the same physical phone are not linkable from the app's data.

## What stays local

- Your `roomId` and the "show as faces" toggle live in `localStorage` under the `mesh-fist-of-five:*` namespace. They never leave your device.

## What the signaling server sees

`signaling-server` (source at https://github.com/baditaflorin/signaling-server) sees:

- The room name (`mesh-fist-of-five:<roomId>`).
- Encrypted SDP offer/answer blobs.
- The IP address of the WebSocket connection.

It does **not** see vote values — those flow peer-to-peer over WebRTC DataChannel.

## What the TURN server sees

`coturn-hetzner` relays encrypted DTLS-SRTP / DataChannel bytes for peers behind symmetric NATs. It sees IP addresses of relayed peers; it cannot decrypt the payload.

## Permissions asked

None. No camera, mic, motion, or notification permissions are requested.

## What's NOT in the threat model

- **Sybil voting.** A user with two devices can vote twice. Acceptable — the tool is for informal team gauges, not elections.
- **Anonymity within the room.** A peer in the room with traffic-correlation tools could associate a `clientID` with an IP address. The tool does not aim to defeat this; rooms are assumed to be among people who know each other.
