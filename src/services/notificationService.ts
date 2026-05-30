type MessageCallback = (data: Record<string, unknown>) => void;
type ConnectionCallback = (connected: boolean) => void;
type GiveUpCallback = () => void;

const RETRY_DELAYS = [5000, 15000, 30000, 60000, 60000];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class NotificationService {
  private socket: WebSocket | null = null;
  private onMessage: MessageCallback | null = null;
  private onConnectionChange: ConnectionCallback | null = null;
  private onGiveUp: GiveUpCallback | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private retryIndex = 0;

  public connect(
    onMessage: MessageCallback,
    onConnectionChange: ConnectionCallback,
    onGiveUp?: GiveUpCallback,
  ) {
    this.onMessage = onMessage;
    this.onConnectionChange = onConnectionChange;
    this.onGiveUp = onGiveUp ?? null;
    this.retryIndex = 0;
    this.open();
  }

  public reconnect() {
    if (!this.onMessage || !this.onConnectionChange) return;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.retryIndex = 0;
    this.open();
  }

  private open() {
    if (typeof window === "undefined") return;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.open(), { once: true });
      return;
    }

    const rawUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!rawUrl) return;
    const wsUrl = rawUrl.replace(/^http(s?):\/\//, (_match, secure: string) => `ws${secure}://`);
    const url = `${wsUrl}/ws/notifications`;

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.retryIndex = 0;
      this.onConnectionChange?.(true);
    };

    this.socket.onmessage = (event) => {
      try {
        const raw: unknown = JSON.parse(event.data);
        if (isRecord(raw)) {
          this.onMessage?.(raw);
        }
      } catch {
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
    if (!this.onMessage || !this.onConnectionChange) return;

    if (this.retryIndex >= RETRY_DELAYS.length) {
      this.onGiveUp?.();
      return;
    }

    const delay = RETRY_DELAYS[this.retryIndex] ?? 60000;
    this.retryIndex += 1;
    this.reconnectTimeout = setTimeout(() => this.open(), delay);
  }

  public disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.onGiveUp = null;
    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
    }
  }
}
