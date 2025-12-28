import { io, Socket } from "socket.io-client";
import type { Incident } from "@/types/incident";

type WebSocketCallbacks = {
  onNewIncident?: (incident: Incident) => void;
  onUpdateIncident?: (incident: Incident) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
};

class WebSocketService {
  private socket: Socket | null = null;
  private url: string;
  private callbacks: WebSocketCallbacks = {};

  constructor(baseUrl: string) {
    this.url = baseUrl;
  }

  connect(token: string, callbacks: WebSocketCallbacks = {}) {
    // Always disconnect existing connection to reconnect with new token
    if (this.socket) {
      this.socket.disconnect();
      this.socket.removeAllListeners();
      this.socket = null;
    }

    this.callbacks = callbacks;

    console.log("🔌 Attempting Socket.IO connection...");

    this.socket = io(this.url, {
      transports: ["websocket"],
      auth: {
        token: token,
      },
      withCredentials: true,
      autoConnect: true,
      timeout: 5000,
    });

    this.socket.on("connect", () => {
      console.log("✅ Socket.IO connected", this.socket?.id);
      this.callbacks.onConnect?.();
    });

    this.socket.on("disconnect", (reason) => {
      console.log("🔌 Socket.IO disconnected:", reason);
      this.callbacks.onDisconnect?.();
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Socket.IO connection error:", error.message);
      this.callbacks.onError?.(error as any);
    });

    this.socket.on("incident_new", (data: Incident | { data: Incident }) => {
      const incident = (data as any).data || data;
      if (incident && incident.id && incident.severity) {
        console.log("🆕 New incident received:", incident);
        this.callbacks.onNewIncident?.(incident as Incident);
      }
    });

    this.socket.on("incident_update", (data: Incident | { data: Incident }) => {
      const incident = (data as any).data || data;
      if (incident && incident.id && incident.severity) {
        console.log("🔄 Incident update received:", incident);
        this.callbacks.onNewIncident?.(incident as Incident);
      }
    });

    this.socket.onAny((eventName, ...args) => {
      if (
        eventName !== "connect" &&
        eventName !== "disconnect" &&
        eventName !== "connect_error"
      ) {
        const data = args[0];
        if (data && typeof data === "object") {
          const incident = (data as any).data || data;
          if (
            incident &&
            incident.id &&
            incident.severity &&
            incident.category
          ) {
            if (
              eventName.includes("new") ||
              eventName.includes("incident_new")
            ) {
              this.callbacks.onNewIncident?.(incident as Incident);
            } else if (
              eventName.includes("update") ||
              eventName.includes("incident_update")
            ) {
              this.callbacks.onNewIncident?.(incident as Incident);
            }
          }
        }
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket.removeAllListeners();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getReadyState(): number | null {
    if (!this.socket) return null;
    return this.socket.connected ? 1 : 0;
  }
}

// Create singleton instance
const WS_BASE_URL = "https://incident-platform.azurewebsites.net";
export const websocketService = new WebSocketService(WS_BASE_URL);
