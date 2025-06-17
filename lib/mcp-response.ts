// Substituir JSON-RPC por REST simples
export interface SimpleResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  meta?: {
    query_time_ms?: number;
  };
}

// Helper simples
export function successResponse<T>(data: T, queryTimeMs?: number): SimpleResponse<T> {
  return { 
    data, 
    ...(queryTimeMs && { meta: { query_time_ms: queryTimeMs } })
  };
}

export function errorResponse(message: string, code?: string): SimpleResponse<never> {
  return { error: { message, code } };
}

// For backward compatibility with existing code
export interface MCPSimpleResponse<T> extends SimpleResponse<T> {} 