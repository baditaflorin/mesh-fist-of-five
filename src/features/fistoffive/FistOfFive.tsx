import { useEffect, useMemo, useState } from "react";
import { createRoomSync } from "../sync/yjsRoom";
import { maybeFetchTurnCredentials } from "../sync/iceConfig";

type Vote = 1 | 2 | 3 | 4 | 5;
type VoteEntry = { value: Vote; ts: number };

type Props = {
  roomId: string;
  showAsFaces: boolean;
};

const FACES = ["😟", "😐", "🙂", "😊", "🤩"] as const;

export function FistOfFive({ roomId, showAsFaces }: Props) {
  const [armed, setArmed] = useState(false);
  const [tick, setTick] = useState(0);

  const mesh = useMemo(() => {
    if (!armed) return null;
    const room = createRoomSync(roomId);
    const votes = room.doc.getMap<VoteEntry>("votes");
    return { room, votes };
  }, [armed, roomId]);

  useEffect(() => {
    if (!armed) return undefined;
    void maybeFetchTurnCredentials();
    return undefined;
  }, [armed]);

  useEffect(() => {
    return () => {
      mesh?.room.provider?.destroy();
    };
  }, [mesh]);

  useEffect(() => {
    if (!mesh) return undefined;
    const onChange = () => setTick((t) => t + 1);
    mesh.votes.observe(onChange);
    const awareness = (
      mesh.room.provider as unknown as {
        awareness?: {
          on: (e: string, h: () => void) => void;
          off: (e: string, h: () => void) => void;
        };
      } | null
    )?.awareness;
    awareness?.on("change", onChange);
    return () => {
      mesh.votes.unobserve(onChange);
      awareness?.off("change", onChange);
    };
  }, [mesh]);

  const myKey = mesh?.room.peerId ?? "";
  const myVote = mesh ? (mesh.votes.get(myKey)?.value ?? null) : null;

  const counts: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  let totalVotes = 0;
  if (mesh) {
    mesh.votes.forEach((v) => {
      if (v && v.value >= 1 && v.value <= 5) {
        const idx = v.value - 1;
        counts[idx] = (counts[idx] ?? 0) + 1;
        totalVotes++;
      }
    });
  }

  // present-count = total Yjs peers including me
  const awareness = (
    mesh?.room.provider as unknown as {
      awareness?: { getStates: () => Map<number, unknown> };
    } | null
  )?.awareness;
  const presentCount = awareness ? awareness.getStates().size : mesh ? 1 : 0;

  void tick;

  const castVote = (v: Vote) => {
    if (!mesh) return;
    mesh.votes.set(myKey, { value: v, ts: Date.now() });
  };

  const resetRound = () => {
    if (!mesh) return;
    mesh.room.doc.transact(() => {
      mesh.votes.clear();
    });
  };

  if (!armed) {
    return (
      <div className="fistoffive-arm">
        <h1>mesh-fist-of-five</h1>
        <p>
          Silent group consensus. Everyone holds up 1–5 fingers at the same time. The aggregate
          shows as a bar chart; names are never shown. Tap to join the same room.
        </p>
        <button type="button" className="fistoffive-arm-button" onClick={() => setArmed(true)}>
          Connect
        </button>
        <p className="fistoffive-hint">
          Room <code>{roomId}</code> · {showAsFaces ? "face mode" : "number mode"}
        </p>
      </div>
    );
  }

  const maxCount = Math.max(1, ...counts);

  return (
    <div className="fistoffive-stage">
      <div className="fistoffive-hud">
        <span>
          {totalVotes} / {presentCount} voted
        </span>
      </div>

      <div className="fistoffive-chart" role="group" aria-label="Vote distribution">
        {counts.map((c, i) => {
          const label = showAsFaces ? FACES[i] : String(i + 1);
          const pct = Math.round((c / maxCount) * 100);
          return (
            <div key={i} className="fistoffive-bar-col">
              <div className="fistoffive-bar-track">
                <div
                  className="fistoffive-bar-fill"
                  style={{ height: `${pct}%` }}
                  aria-hidden="true"
                />
              </div>
              <div className="fistoffive-bar-label">
                <span className="fistoffive-bar-face">{label}</span>
                <span className="fistoffive-bar-count">{c}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="fistoffive-cells">
        {([1, 2, 3, 4, 5] as Vote[]).map((v) => (
          <button
            key={v}
            type="button"
            className={`fistoffive-cell${myVote === v ? " fistoffive-cell-mine" : ""}`}
            onClick={() => castVote(v)}
          >
            {showAsFaces ? FACES[v - 1] : v}
          </button>
        ))}
      </div>

      <button type="button" className="fistoffive-reset" onClick={resetRound}>
        Reset round
      </button>
    </div>
  );
}
