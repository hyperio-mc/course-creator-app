/**
 * Hyper-Micro API Client
 *
 * Client for interacting with the hyper-micro backend service.
 *
 * @module src/lib/hyper-micro
 */

const HYPER_MICRO_URL = process.env.NEXT_PUBLIC_HYPER_MICRO_URL || '/proxy/hypermicro';
const HYPER_MICRO_KEY = process.env.NEXT_PUBLIC_HYPER_MICRO_KEY || '';

/**
 * API Response type
 */
export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

/**
 * Check if URL is a proxy base URL (relative path)
 */
function isProxyBaseUrl(url: string): boolean {
  return url.startsWith('/') || url.startsWith('./');
}

/**
 * Resolve the API URL based on proxy configuration
 */
function resolveOnHyperProxyBaseUrl(url: string): string {
  if (isProxyBaseUrl(url)) {
    return url;
  }
  return url;
}

/**
 * Make an authenticated request to the hyper-micro API
 */
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const baseUrl = resolveOnHyperProxyBaseUrl(HYPER_MICRO_URL);
  const url = `${baseUrl}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (HYPER_MICRO_KEY && !isProxyBaseUrl(baseUrl)) {
    headers['Authorization'] = `Bearer ${HYPER_MICRO_KEY}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { ok: false, error: errorText || response.statusText };
    }

    const data = await response.json();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}

/**
 * Data API for document operations
 */
export const dataApi = {
  async createDatabase(name: string): Promise<ApiResponse<void>> {
    return request<void>(`/api/dbs/${name}`, { method: 'POST' });
  },

  async deleteDatabase(name: string): Promise<ApiResponse<void>> {
    return request<void>(`/api/dbs/${name}`, { method: 'DELETE' });
  },

  async listDatabases(): Promise<ApiResponse<string[]>> {
    return request<string[]>('/api/dbs');
  },

  async createDocument<T = Record<string, unknown>>(
    db: string,
    key: string,
    data: T
  ): Promise<ApiResponse<T>> {
    return request<T>(`/api/dbs/${db}/${key}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getDocument<T = Record<string, unknown>>(
    db: string,
    key: string
  ): Promise<ApiResponse<T>> {
    return request<T>(`/api/dbs/${db}/${key}`);
  },

  async updateDocument<T = Record<string, unknown>>(
    db: string,
    key: string,
    data: Partial<T>
  ): Promise<ApiResponse<T>> {
    return request<T>(`/api/dbs/${db}/${key}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteDocument(
    db: string,
    key: string
  ): Promise<ApiResponse<void>> {
    return request<void>(`/api/dbs/${db}/${key}`, { method: 'DELETE' });
  },

  async listDocuments<T = Record<string, unknown>>(
    db: string
  ): Promise<ApiResponse<T[]>> {
    return request<T[]>(`/api/dbs/${db}`);
  },
};