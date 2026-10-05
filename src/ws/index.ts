import { DurableObject } from "cloudflare:workers";
import { Hono, type Context } from "hono";

type Bindings = {
  GAME_ROOMS: DurableObjectNamespace;
};

const MAX_PLAYERS_PER_ROOM = 16;
const MAX_MESSAGE_BYTES = 36000;
const MAX_AVATAR_BYTES = 32 * 1024 * 1024;
const MAX_AVATAR_CHUNKS = 2048;
const MIN_STATE_INTERVAL_MS = 20;
const MAX_COORDINATE = 10000000;
const MAX_SPEED = 10000;
const MOTION_MODES = new Set(["idle", "run", "start1", "start2", "stop1", "stop2"]);

const ws0 = new Hono<{ Bindings: Bindings }>();

const connectToRoom = async (c: Context<{ Bindings: Bindings }>) => {
  const request = c.req.raw;
  if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
    return new Response("WebSocket upgrade required", {
      status: 426,
      headers: { Upgrade: "websocket" },
    });
  }

  const url = new URL(request.url);
  const origin = request.headers.get("Origin");
  if (origin) {
    try {
      if (new URL(origin).host !== url.host) {
        return new Response("Origin not allowed", { status: 403 });
      }
    } catch {
      return new Response("Invalid origin", { status: 403 });
    }
  }

  const roomCode = String(c.req.param("roomId") || url.searchParams.get("room") || "").toUpperCase();
  if (!/^[A-HJ-NP-Z2-9]{6,10}$/.test(roomCode)) {
    return new Response("Invalid room code", { status: 400 });
  }

  const gameRooms = c.env.GAME_ROOMS;
  const roomId = gameRooms.idFromName(roomCode);
  return gameRooms.get(roomId).fetch(request);
};

// The room path is the primary endpoint; keep the query form working for older clients.
ws0.get("/:roomId", connectToRoom);
ws0.get("/", connectToRoom);

type PlayerState = {
  position: number[];
  rotation: number[];
  velocity: number[];
  modelScale: number;
  maneuverActive: boolean;
  aiming: boolean;
  traveling: boolean;
  motion: string;
  motionTime: number;
  motionSpeed: number;
  motionLoop: boolean;
  motionPlaying: boolean;
};

type PlayerAttachment = {
  joined: boolean;
  playerId: string;
  name: string;
  sequence: number;
  state: PlayerState | null;
  lastStateAt: number;
};

export class GameRoom extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      return new Response("WebSocket upgrade required", { status: 426 });
    }

    const [client, server] = Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({
      joined: false,
      playerId: "",
      name: "Player",
      sequence: -1,
      state: null,
      lastStateAt: 0,
    } satisfies PlayerAttachment);
    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketMessage(socket: WebSocket, message: string | ArrayBuffer): void {
    const attachment = this.readAttachment(socket);
    if (!attachment) {
      this.closeSocket(socket, 1011, "Invalid session");
      return;
    }

    const text = typeof message === "string" ? message : new TextDecoder().decode(message);
    if (new TextEncoder().encode(text).byteLength > MAX_MESSAGE_BYTES) {
      this.sendError(socket, "メッセージが大きすぎます", 1009);
      return;
    }

    let payload: any;
    try {
      payload = JSON.parse(text);
    } catch {
      this.sendError(socket, "JSON形式のメッセージが必要です", 1007);
      return;
    }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      this.sendError(socket, "メッセージ形式が正しくありません", 1007);
      return;
    }

    if (payload.type === "hello") {
      this.join(socket, attachment, payload);
      return;
    }
    if (payload.type === "leave") {
      this.removePlayer(socket, attachment);
      this.closeSocket(socket, 1000, "left room");
      return;
    }
    if (payload.type === "state") {
      this.relayState(socket, attachment, payload);
      return;
    }
    if (payload.type === "avatarRequest") {
      this.relayAvatarRequest(attachment, payload);
      return;
    }
    if (["avatarUrl", "avatarStart", "avatarChunk", "avatarEnd", "avatarError"].includes(payload.type)) {
      this.relayAvatarMessage(attachment, payload);
      return;
    }
    this.sendError(socket, "未対応のメッセージです", 1008);
  }

  webSocketClose(socket: WebSocket): void {
    this.removePlayer(socket, this.readAttachment(socket));
  }

  webSocketError(socket: WebSocket): void {
    this.removePlayer(socket, this.readAttachment(socket));
  }

  private readAttachment(socket: WebSocket): PlayerAttachment | null {
    try {
      return socket.deserializeAttachment() as PlayerAttachment | null;
    } catch {
      return null;
    }
  }

  private join(socket: WebSocket, attachment: PlayerAttachment, payload: any): void {
    if (attachment.joined) {
      this.sendError(socket, "すでに部屋に参加しています", 1008);
      return;
    }

    const connected = this.ctx.getWebSockets()
      .map((peer) => ({ socket: peer, attachment: this.readAttachment(peer) }))
      .filter((peer) => peer.attachment?.joined);
    if (connected.length >= MAX_PLAYERS_PER_ROOM) {
      this.sendJson(socket, { type: "error", message: "この部屋は満員です（最大16人）" });
      this.closeSocket(socket, 1013, "room full");
      return;
    }

    const name = String(payload.name || "Player")
      .replace(/[\u0000-\u001f\u007f]/g, "")
      .trim()
      .slice(0, 20) || "Player";
    const player: PlayerAttachment = {
      joined: true,
      playerId: crypto.randomUUID(),
      name,
      sequence: -1,
      state: null,
      lastStateAt: 0,
    };
    socket.serializeAttachment(player);
    const players = connected.map(({ attachment: peer }) => ({
      playerId: peer!.playerId,
      name: peer!.name,
      sequence: peer!.sequence,
      state: peer!.state,
    }));
    this.sendJson(socket, { type: "welcome", playerId: player.playerId, players });
    this.broadcast({
      type: "playerJoined",
      player: { playerId: player.playerId, name: player.name },
    }, socket);
  }

  private relayState(socket: WebSocket, attachment: PlayerAttachment, payload: any): void {
    if (!attachment.joined) {
      this.sendError(socket, "先に部屋へ参加してください", 1008);
      return;
    }
    if (!Number.isSafeInteger(payload.sequence) || payload.sequence <= attachment.sequence) return;

    const now = Date.now();
    if (now - attachment.lastStateAt < MIN_STATE_INTERVAL_MS) return;
    const state = this.normalizeState(payload.state);
    if (!state) return;

    attachment.sequence = payload.sequence;
    attachment.state = state;
    attachment.lastStateAt = now;
    socket.serializeAttachment(attachment);
    this.broadcast({
      type: "state",
      playerId: attachment.playerId,
      name: attachment.name,
      sequence: attachment.sequence,
      state,
    }, socket);
  }

  private normalizeState(value: any): PlayerState | null {
    if (!value || typeof value !== "object") return null;
    const position = this.vector(value.position, 3, MAX_COORDINATE);
    const rotation = this.vector(value.rotation, 4, 2);
    const velocity = this.vector(value.velocity, 3, MAX_SPEED);
    if (!position || !rotation || !velocity) return null;
    const modelScale = value.modelScale == null ? 1 : Number(value.modelScale);
    if (!Number.isFinite(modelScale) || modelScale < 0.0001 || modelScale > 100) return null;
    const length = Math.hypot(rotation[0], rotation[1], rotation[2], rotation[3]);
    if (length < 1e-6) return null;
    const requestedMotion = typeof value.motion === "string" ? value.motion.toLowerCase() : "idle";
    const motionTime = value.motionTime == null ? 0 : Number(value.motionTime);
    const motionSpeed = value.motionSpeed == null ? 1 : Number(value.motionSpeed);
    if (!Number.isFinite(motionTime) || !Number.isFinite(motionSpeed)) return null;
    const motion = MOTION_MODES.has(requestedMotion) ? requestedMotion : "idle";
    return {
      position,
      rotation: rotation.map((part) => part / length),
      velocity,
      modelScale,
      maneuverActive: value.maneuverActive === true,
      aiming: value.aiming === true,
      traveling: value.traveling === true,
      motion,
      motionTime: Math.max(0, Math.min(600, motionTime)),
      motionSpeed: Math.max(0, Math.min(16, motionSpeed)),
      motionLoop: typeof value.motionLoop === "boolean"
        ? value.motionLoop
        : motion === "idle" || motion === "run",
      motionPlaying: value.motionPlaying !== false,
    };
  }

  private relayAvatarRequest(attachment: PlayerAttachment, payload: any): void {
    if (!attachment.joined) return;
    const targetPlayerId = String(payload.targetPlayerId || "");
    if (!targetPlayerId || targetPlayerId === attachment.playerId) return;
    const target = this.findPlayerSocket(targetPlayerId);
    if (target) this.sendJson(target, { type: "avatarRequest", playerId: attachment.playerId });
  }

  private relayAvatarMessage(attachment: PlayerAttachment, payload: any): void {
    if (!attachment.joined) return;
    const targetPlayerId = String(payload.targetPlayerId || "");
    const target = targetPlayerId && targetPlayerId !== attachment.playerId
      ? this.findPlayerSocket(targetPlayerId)
      : null;
    if (!target) return;

    const type = payload.type;
    const message: Record<string, unknown> = { type, fromPlayerId: attachment.playerId };
    if (type === "avatarUrl") {
      const url = String(payload.url || "");
      if (url.length > 2048) return;
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return;
      } catch {
        return;
      }
      message.url = url;
      message.fileName = String(payload.fileName || "model.pmx").slice(0, 160);
    } else if (type === "avatarStart") {
      const totalBytes = Number(payload.totalBytes);
      const totalChunks = Number(payload.totalChunks);
      const transferId = String(payload.transferId || "");
      if (!/^[0-9a-f-]{36}$/i.test(transferId)
        || !Number.isSafeInteger(totalBytes) || totalBytes <= 0 || totalBytes > MAX_AVATAR_BYTES
        || !Number.isSafeInteger(totalChunks) || totalChunks <= 0 || totalChunks > MAX_AVATAR_CHUNKS) return;
      message.transferId = transferId;
      message.totalBytes = totalBytes;
      message.totalChunks = totalChunks;
      message.fileName = String(payload.fileName || "model.zip").slice(0, 160);
      message.pmxPath = String(payload.pmxPath || "model.pmx").slice(0, 240);
    } else if (type === "avatarChunk") {
      const transferId = String(payload.transferId || "");
      const index = Number(payload.index);
      const data = String(payload.data || "");
      if (!/^[0-9a-f-]{36}$/i.test(transferId)
        || !Number.isSafeInteger(index) || index < 0 || index >= MAX_AVATAR_CHUNKS
        || data.length === 0 || data.length > 25000 || !/^[A-Za-z0-9+/]+={0,2}$/.test(data)) return;
      message.transferId = transferId;
      message.index = index;
      message.data = data;
    } else if (type === "avatarEnd") {
      const transferId = String(payload.transferId || "");
      if (!/^[0-9a-f-]{36}$/i.test(transferId)) return;
      message.transferId = transferId;
    } else if (type === "avatarError") {
      message.message = String(payload.message || "キャラクターモデルを共有できませんでした").slice(0, 200);
    }
    this.sendJson(target, message);
  }

  private findPlayerSocket(playerId: string): WebSocket | null {
    for (const peer of this.ctx.getWebSockets()) {
      const attachment = this.readAttachment(peer);
      if (attachment?.joined && attachment.playerId === playerId) return peer;
    }
    return null;
  }

  private vector(value: any, length: number, limit: number): number[] | null {
    if (!Array.isArray(value) || value.length !== length) return null;
    const result = value.map(Number);
    if (!result.every((part) => Number.isFinite(part) && Math.abs(part) <= limit)) return null;
    return result;
  }

  private removePlayer(socket: WebSocket, attachment: PlayerAttachment | null): void {
    if (!attachment?.joined) return;
    attachment.joined = false;
    try {
      socket.serializeAttachment(attachment);
    } catch {
      // The socket may already be gone after a transport error.
    }
    this.broadcast({ type: "playerLeft", playerId: attachment.playerId }, socket);
  }

  private broadcast(payload: unknown, exceptSocket: WebSocket | null = null): void {
    const data = JSON.stringify(payload);
    for (const peer of this.ctx.getWebSockets()) {
      if (peer === exceptSocket) continue;
      const attachment = this.readAttachment(peer);
      if (!attachment?.joined) continue;
      try {
        peer.send(data);
      } catch {
        this.removePlayer(peer, attachment);
      }
    }
  }

  private sendJson(socket: WebSocket, payload: unknown): void {
    try {
      socket.send(JSON.stringify(payload));
    } catch {
      this.closeSocket(socket, 1011, "send failed");
    }
  }

  private sendError(socket: WebSocket, message: string, closeCode: number | null = null): void {
    this.sendJson(socket, { type: "error", message });
    if (closeCode) this.closeSocket(socket, closeCode, "invalid message");
  }

  private closeSocket(socket: WebSocket, code: number, reason: string): void {
    try {
      socket.close(code, reason);
    } catch {
      // The connection may already be closed.
    }
  }
}

export default ws0;
