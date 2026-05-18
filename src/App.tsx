import { useEffect, useState } from "react";
import { MeshShell } from "@baditaflorin/mesh-common";
import { FistOfFive } from "./features/fistoffive/FistOfFive";
import { SettingsExtras } from "./features/settings/SettingsExtras";
import { appConfig } from "./shared/config";

const STORAGE = {
  room: `${appConfig.storagePrefix}:room`,
  faces: `${appConfig.storagePrefix}:faces`,
};

function readString(key: string, fallback: string): string {
  return localStorage.getItem(key) ?? fallback;
}
function readBool(key: string, fallback: boolean): boolean {
  const raw = localStorage.getItem(key);
  return raw === null ? fallback : raw === "1";
}

export function App() {
  const [roomId, setRoomId] = useState(() => readString(STORAGE.room, "default"));
  const [showAsFaces, setShowAsFaces] = useState(() => readBool(STORAGE.faces, false));

  useEffect(() => {
    localStorage.setItem(STORAGE.room, roomId);
  }, [roomId]);
  useEffect(() => {
    localStorage.setItem(STORAGE.faces, showAsFaces ? "1" : "0");
  }, [showAsFaces]);

  return (
    <MeshShell
      config={appConfig}
      roomId={roomId}
      onRoomChange={setRoomId}
      settingsExtras={
        <SettingsExtras showAsFaces={showAsFaces} onShowAsFacesChange={setShowAsFaces} />
      }
    >
      <FistOfFive roomId={roomId} showAsFaces={showAsFaces} />
    </MeshShell>
  );
}
