import type { WindowState } from "../store/windowManagerStore";

// ---- Message protocol ----

export type TabChannelMessage =
  | { type: "TAB_PING"; senderId: string }
  | { type: "TAB_PONG"; senderId: string }
  | {
      type: "WINDOW_NEAR_EDGE";
      senderId: string;
      edge: "left" | "right";
      windowId: string;
    }
  | { type: "WINDOW_LEFT_EDGE"; senderId: string; windowId: string }
  | {
      type: "TRANSFER_WINDOW";
      senderId: string;
      edge: "left" | "right";
      windowState: WindowState;
    };

// ---- Module state ----

const CHANNEL_NAME = "portfolio-window-manager";
const HEARTBEAT_INTERVAL = 3000;
const PEER_TIMEOUT = 6000;

let channel: BroadcastChannel | null = null;
let tabId = "";
let lastPeerSeen = 0;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

type Listener = (msg: TabChannelMessage) => void;
const listeners = new Map<string, Set<Listener>>();

// ---- Public API ----

export function initTabChannel(): void {
  if (channel) return;

  tabId =
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  channel = new BroadcastChannel(CHANNEL_NAME);

  channel.onmessage = (e: MessageEvent<TabChannelMessage>) => {
    const msg = e.data;
    if (!msg || msg.senderId === tabId) return; // ignore own messages

    // Handle peer detection
    if (msg.type === "TAB_PING") {
      postMessage({ type: "TAB_PONG" });
      lastPeerSeen = Date.now();
      return;
    }
    if (msg.type === "TAB_PONG") {
      lastPeerSeen = Date.now();
      return;
    }

    // Dispatch to listeners
    const set = listeners.get(msg.type);
    if (set) {
      set.forEach((fn) => fn(msg));
    }
  };

  // Initial ping + heartbeat
  postMessage({ type: "TAB_PING" });
  heartbeatTimer = setInterval(() => {
    postMessage({ type: "TAB_PING" });
  }, HEARTBEAT_INTERVAL);
}

export function destroyTabChannel(): void {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  if (channel) {
    channel.close();
    channel = null;
  }
  listeners.clear();
  lastPeerSeen = 0;
}

export function getTabId(): string {
  return tabId;
}

export function hasPeerTab(): boolean {
  return Date.now() - lastPeerSeen < PEER_TIMEOUT;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function postMessage(msg: Record<string, any> & { type: string }): void {
  if (!channel) return;
  channel.postMessage({ ...msg, senderId: tabId });
}

export function onMessage(
  type: TabChannelMessage["type"],
  handler: Listener
): () => void {
  let set = listeners.get(type);
  if (!set) {
    set = new Set();
    listeners.set(type, set);
  }
  set.add(handler);

  return () => {
    set!.delete(handler);
    if (set!.size === 0) listeners.delete(type);
  };
}
