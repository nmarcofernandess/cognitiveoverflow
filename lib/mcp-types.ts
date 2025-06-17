import { Person, PersonNote, Project, Sprint, Task, SprintNote } from './supabase';

// ====== MCP Core Types ======
export interface MCPRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: any;
}

export interface MCPResponse<T> {
  jsonrpc: "2.0";
  id: string | number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface MCPError {
  code: number;
  message: string;
  data?: any;
}

// ====== MCP Authentication Types ======
export interface MCPTokenClaims {
  sub: string; // user_id (marco)
  iat: number; // issued at
  exp: number; // expires in 7 days
  scope: string[]; // ["read", "write"] - futuro
  client_id?: string; // identificação do cliente
  ip?: string; // IP do cliente para rate limiting
}

export interface MCPAuthRequest {
  password: string;
  client_id?: string;
}

export interface MCPAuthResponse {
  token: string;
  expires_in: number; // seconds
  token_type: "Bearer";
  issued_at: string;
  scope: string[];
}

export interface MCPValidationResult {
  isValid: boolean;
  claims?: MCPTokenClaims;
  error?: string;
  rateLimitExceeded?: boolean;
}

// ====== Rate Limiting Types ======
export interface RateLimitState {
  requests: number;
  lastReset: number;
  blacklisted?: boolean;
  failedAttempts?: number;
}

export interface RateLimitConfig {
  windowMs: number; // janela de tempo em ms
  maxRequests: number; // max requests na janela
  maxFailedAttempts: number; // max tentativas falhadas antes de blacklist
  blacklistDuration: number; // duração do blacklist em ms
}

// ====== MCP Manifest Types ======
export interface MCPManifest {
  version: string;
  last_sync: string;
  user: {
    name: string;
    persona: string;
  };
  stats: {
    people_count: number;
    projects_count: number;
    sprints_count: number;
    tasks_count: number;
  };
  endpoints: string[];
  instructions: {
    tone: string;
    behavior: string[];
    context_usage: string[];
  };
}

// ====== Extended People Types ======
export interface MCPPerson extends Person {
  notes_count: number;
  notes?: PersonNote[];
  last_interaction?: string;
}

export interface MCPPeopleQuery {
  relation?: string;
  limit?: number;
  include_notes?: boolean;
  search?: string;
}

export interface MCPPeopleResponse {
  people: MCPPerson[];
  total_count: number;
  filters_applied: MCPPeopleQuery;
}

// ====== Extended Projects Types ======
export interface MCPProject extends Project {
  sprint_count: number;
  total_tasks: number;
  active_sprints: number;
  sprints?: MCPSprint[];
  completion_rate?: number;
}

export interface MCPSprint extends Sprint {
  task_count: number;
  completed_tasks: number;
  project_name: string;
  tasks?: Task[];
  notes?: SprintNote[];
  progress_percentage: number;
}

export interface MCPProjectsQuery {
  status?: 'active' | 'completed' | 'archived';
  include_sprints?: boolean;
  include_tasks?: boolean;
  limit?: number;
  search?: string;
}

export interface MCPProjectsResponse {
  projects: MCPProject[];
  total_count: number;
  filters_applied: MCPProjectsQuery;
}

// ====== Error Codes ======
export const MCP_ERROR_CODES = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  DATABASE_ERROR: -32001,
  NOT_FOUND: -32002,
  UNAUTHORIZED: -32003,
  RATE_LIMITED: -32004,
  TOKEN_EXPIRED: -32005,
  INVALID_TOKEN: -32006
} as const;

// ====== Helper Functions ======
export function createMCPResponse<T>(id: string | number, result: T): MCPResponse<T> {
  return {
    jsonrpc: "2.0",
    id,
    result
  };
}

export function createMCPError(id: string | number, code: number, message: string, data?: any): MCPResponse<never> {
  return {
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message,
      data
    }
  };
} 