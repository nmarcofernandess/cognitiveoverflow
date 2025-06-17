import { useState, useCallback } from 'react';

const API_KEY = 'neural_2024_simple';
const BASE_URL = '/api/mcp';

export function useMCPClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async (
    endpoint: string,
    options?: RequestInit
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Request failed');
      }

      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    get: (endpoint: string) => request(endpoint),
    post: (endpoint: string, data: any) => 
      request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
    put: (endpoint: string, data: any) => 
      request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (endpoint: string) => 
      request(endpoint, { method: 'DELETE' }),
  };
} 