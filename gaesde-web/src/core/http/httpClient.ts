import { env } from '../config/env';

export class ApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(
    status: number,
    payload: unknown,
    message: string,
  ) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

type RequestOptions = RequestInit & {
  timeoutMs?: number;
  authToken?: string | null;
};

export class HttpClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      options.timeoutMs ?? env.requestTimeoutMs,
    );

    try {
      const headers = new Headers(options.headers ?? {});
      // Only set Content-Type to JSON if body exists and is not FormData
      if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
      }
      if (options.authToken) {
        headers.set('Authorization', `Bearer ${options.authToken}`);
      }

      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      const isJson = response.headers
        .get('content-type')
        ?.includes('application/json');
      const payload = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        const message =
          (typeof payload === 'object' && payload !== null && 'message' in payload
            ? String((payload as Record<string, unknown>).message)
            : response.statusText) || 'Request failed';
        throw new ApiError(response.status, payload, message);
      }

      return payload as T;
    } finally {
      clearTimeout(timeout);
    }
  }
}
