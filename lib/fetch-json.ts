export type JsonFetchError = Error & {
  status?: number;
  responseBody?: string;
};

export async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const contentType = response.headers.get('content-type') || '';
  const rawText = await response.text();

  if (!rawText) {
    if (!response.ok) {
      const error = new Error(`Request failed with status ${response.status}`) as JsonFetchError;
      error.status = response.status;
      throw error;
    }
    return undefined as T;
  }

  const trimmed = rawText.trim();
  const looksLikeJson = contentType.includes('application/json') || trimmed.startsWith('{') || trimmed.startsWith('[');

  if (!looksLikeJson) {
    const message = `Expected JSON but received ${contentType || 'unknown content type'} from ${String(input)}.`;
    const error = new Error(message) as JsonFetchError;
    error.status = response.status;
    error.responseBody = rawText.slice(0, 500);
    throw error;
  }

  try {
    const data = JSON.parse(trimmed) as T;
    if (!response.ok) {
      const error = new Error(
        typeof data === 'object' && data && 'error' in data && typeof (data as any).error === 'string'
          ? (data as any).error
          : `Request failed with status ${response.status}`
      ) as JsonFetchError;
      error.status = response.status;
      error.responseBody = rawText.slice(0, 500);
      throw error;
    }
    return data;
  } catch (parseError) {
    const message = `Invalid JSON returned from ${String(input)}. This usually means the server returned an HTML page instead of API data.`;
    const error = new Error(message) as JsonFetchError;
    error.status = response.status;
    error.responseBody = rawText.slice(0, 500);
    throw error;
  }
}
