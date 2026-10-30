export interface HttpClientPort {
  get<T>(url: string, config?: Record<string, unknown>): Promise<T>;
  post<T>(
    url: string,
    body?: unknown,
    config?: Record<string, unknown>,
  ): Promise<T>;
  put<T>(
    url: string,
    body?: unknown,
    config?: Record<string, unknown>,
  ): Promise<T>;
  patch<T>(
    url: string,
    body?: unknown,
    config?: Record<string, unknown>,
  ): Promise<T>;
  delete<T>(url: string, config?: Record<string, unknown>): Promise<T>;
}
