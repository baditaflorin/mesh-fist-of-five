export const appConfig = {
  appName: "mesh-fist-of-five",
  storagePrefix: "mesh-fist-of-five",
  description:
    "Silent group consensus. Everyone shows 1–5 at the same time; the aggregate is a bar chart with no names attached.",
  accentHex: "#3DA9FC",
  version: __APP_VERSION__,
  commit: __GIT_COMMIT__,
  repositoryUrl: "https://github.com/baditaflorin/mesh-fist-of-five",
  pagesUrl: "https://baditaflorin.github.io/mesh-fist-of-five/",
  signalingUrl:
    (import.meta.env.VITE_WEBRTC_SIGNALING as string | undefined) ?? "wss://turn.0docker.com/ws",
  turnTokenUrl:
    (import.meta.env.VITE_TURN_TOKEN_URL as string | undefined) ??
    "https://turn.0docker.com/credentials",
  paypalUrl: "https://www.paypal.com/paypalme/florinbadita",
} as const;
