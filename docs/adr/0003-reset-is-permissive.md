---
status: accepted
date: 2026-05-12
---

# 0003 — Reset is permissive (no host role)

## Context

The aggregate persists in Yjs until someone clears it. Real meetings need a "next question" affordance. The obvious shapes are:

- **Host-only reset** — designate the first joiner, only they can press the button.
- **Quorum reset** — half the room must agree.
- **Permissive reset** — anyone can press it, any time.

## Decision

**Anyone can press "Reset round."** No host election, no quorum, no confirmation dialog beyond a single tap.

## Consequences

- **Pros.** Matches the spirit of a quick informal consensus tool. No moderator overhead. No first-joiner-leaves-the-room failure mode. The button is a single Yjs `Map.clear()` inside a transact, so the implementation is two lines.
- **Cons.** Someone could spam the reset button and prevent any vote from settling. Accepted: in a real room of humans this would be obvious behaviour and the group would tell them to stop. Online, the tool is not for adversarial settings; the room is composed of people who already trust each other enough to be discussing a proposal.
- **Audit.** No log of who pressed reset. By design — there is no peer identity to log against.

## Alternatives considered

- **Host-only reset.** Rejected. Hosts disconnect. Hosts leave the meeting. Hosts misjudge timing. The complexity-to-value ratio is poor for a one-question tool.
- **N-of-M agreement to reset.** Rejected. Coordinating a reset vote in itself requires the reset behaviour. Recursive.
- **Auto-reset on quiet for 60 s.** Rejected. Surprises people who were still thinking.
