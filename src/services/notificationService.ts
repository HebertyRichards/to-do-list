type MessageCallback = (data: Record<string, unknown>) => void;
type ConnectionCallback = (connected: boolean) => void;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class NotificationService {
  private socket: WebSocket | null = null;
  private onMessage: MessageCallback | null = null;
  private onConnectionChange: ConnectionCallback | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  public connect(onMessage: MessageCallback, onConnectionChange: ConnectionCallback) {
    this.onMessage = onMessage;
    this.onConnectionChange = onConnectionChange;

    if (typeof window === "undefined") return;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.connect(onMessage, onConnectionChange), { once: true });
      return;
    }

    const rawUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!rawUrl) return;
    const wsUrl = rawUrl.replace(/^http(s?):\/\//, (_match, secure: string) => `ws${secure}://`);
    const url = `${wsUrl}/ws/notifications`;

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.onConnectionChange?.(true);
    };

    this.socket.onmessage = (event) => {
      try {
        const raw: unknown = JSON.parse(event.data);
        if (isRecord(raw)) {
          this.onMessage?.(raw);
        }
      } catch {
        // ignora payloads malformados
      }
    };

    this.socket.onclose = () => {
      this.onConnectionChange?.(false);
      this.scheduleReconnect();
    };

    this.socket.onerror = () => {
      this.socket?.close();
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    const onMessage = this.onMessage;
    const onConnectionChange = this.onConnectionChange;
    if (!onMessage || !onConnectionChange) return;
    this.reconnectTimeout = setTimeout(() => {
      this.connect(onMessage, onConnectionChange);
    }, 5000);
  }

  public disconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
    }
  }
}
