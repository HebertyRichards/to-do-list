import { parseApiError } from "@/lib/api-error";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  body?: unknown;
  headers?: Record<string, string>;
  cache?: RequestCache;
}

function createHttp(cookieHeader?: string) {
  async function request<T>(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<T> {
    const base = process.env.API_URL;
    const url = `${base}${path}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    if (cookieHeader) headers["cookie"] = cookieHeader;

    const res = await fetch(url, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: options.cache || "no-store",
    });

    if (!res.ok) throw await parseApiError(res);
    if (res.status === 204) return undefined as T;
    return res.json();
  }

  return {
    get: <T>(path: string, opts?: RequestOptions) => request<T>("GET", path, opts),
    post: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>("POST", path, { ...opts, body }),
    put: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>("PUT", path, { ...opts, body }),
    patch: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>("PATCH", path, { ...opts, body }),
    delete: <T>(path: string, opts?: RequestOptions) => request<T>("DELETE", path, opts),
  };
}

export type Http = ReturnType<typeof createHttp>;
export { createHttp };
