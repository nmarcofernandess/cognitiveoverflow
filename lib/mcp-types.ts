import { Person, PersonNote, Project, Sprint, Task, SprintNote } from './supabase';

// ====== MCP Core Types (Simplificados) ======

// ✅ MANTER: Autenticação básica
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

// ✅ MANTER: Rate limiting básico
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

// ✅ MANTER: Manifest simplificado
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

// ====== Extended People Types (SIMPLIFICADOS) ======
export interface MCPPerson extends Person {
  notes_count: number;
  notes?: PersonNote[];
  last_interaction?: string; // Simples timestamp
}

export interface MCPPeopleQuery {
  relation?: string;
  limit?: number;
  include_notes?: boolean | 'latest' | 'count';
  search?: string;
  updated_since?: string;
  sort?: 'newest' | 'oldest' | 'name';
}

export interface MCPPeopleResponse {
  people: MCPPerson[];
  total_count: number;
  filters_applied: MCPPeopleQuery;
}

// ====== Projects Types (SIMPLIFICADOS) ======
export interface MCPProject extends Project {
  sprint_count: number;
  total_tasks: number;
  active_sprints: number;
  sprints?: MCPSprint[];
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
  sort?: 'newest' | 'activity' | 'name';
}

export interface MCPProjectsResponse {
  projects: MCPProject[];
  total_count: number;
  filters_applied: MCPProjectsQuery;
}

// ====== Tasks Types (SIMPLIFICADOS) ======
export interface MCPTasksQuery {
  status?: 'pending' | 'in_progress' | 'completed';
  priority_min?: number;
  priority_max?: number;
  project_id?: string;
  sprint_id?: string;
  sort?: 'priority' | 'created' | 'due_date' | 'project';
  limit?: number;
}

export interface MCPTaskWithContext extends Task {
  project_name: string;
  project_id: string;
  sprint_name: string;
  sprint_id: string;
  context_path: string;
  days_pending: number;
}

export interface MCPTasksResponse {
  tasks: MCPTaskWithContext[];
  summary: {
    total_tasks: number;
    by_status: Record<string, number>;
    by_priority: Record<string, number>;
    by_project: Record<string, number>;
  };
}

// ====== Error Codes (Essenciais) ======
export const MCP_ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  RATE_LIMITED: 429,
  DATABASE_ERROR: 500,
  TOKEN_EXPIRED: 401,
  INVALID_TOKEN: 401,
} as const;

// ====== Legacy Support (para não quebrar código existente) ======
// Manter funções existentes mas simplificadas
export function createMCPResponse<T>(id: string | number, result: T): { data: T } {
  return { data: result };
}

export function createMCPError(id: string | number, code: number, message: string, data?: any): { error: { message: string; code: number; data?: any } } {
  return { error: { message, code, data } };
} 