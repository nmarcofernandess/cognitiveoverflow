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
  interaction_frequency?: number;
  relationship_health?: 'active' | 'stale' | 'dormant';
  tags_used?: string[];
}

export interface MCPPeopleQuery {
  relation?: string;
  limit?: number;
  include_notes?: boolean | 'latest' | 'count';
  search?: string;
  updated_since?: string;
  last_interaction?: string;
  has_notes?: boolean;
  sort?: 'newest' | 'oldest' | 'name' | 'interaction' | 'notes_count';
  tags?: string;
  relation_type?: 'family' | 'work' | 'friends' | 'professional';
  relationship_health?: 'active' | 'stale' | 'dormant';
}

export interface MCPPeopleResponse {
  people: MCPPerson[];
  total_count: number;
  filters_applied: MCPPeopleQuery;
  performance?: {
    query_time_ms: number;
    cached: boolean;
  };
}

// ====== People Search Types ======
export interface MCPPeopleSearchQuery {
  q: string;
  fields?: string[];
  fuzzy?: boolean;
  limit?: number;
  include_notes?: boolean | 'highlights';
  min_score?: number;
}

export interface MCPSearchHighlight {
  field: string;
  snippet: string;
  score: number;
}

export interface MCPPersonSearchResult extends MCPPerson {
  search_score: number;
  highlights: MCPSearchHighlight[];
}

export interface MCPPeopleSearchResponse {
  results: MCPPersonSearchResult[];
  total_count: number;
  query: MCPPeopleSearchQuery;
  search_time_ms: number;
}

// ====== People Full Profile Types ======
export interface MCPPersonFull extends MCPPerson {
  notes: PersonNote[];
  stats: {
    notes_count: number;
    first_interaction: string;
    last_interaction: string;
    interaction_frequency: number;
    tags_used: string[];
    avg_notes_per_month: number;
    days_since_last_contact: number;
  };
  timeline: Array<{
    date: string;
    type: 'note_added' | 'person_updated' | 'person_created';
    title: string;
    summary: string;
    tags?: string[];
  }>;
  relationships?: {
    health: 'active' | 'stale' | 'dormant';
    health_reason: string;
    suggested_actions: string[];
  };
}

export interface MCPPersonFullResponse {
  person: MCPPersonFull;
  query_time_ms: number;
}

// ====== People Analytics Types ======
export interface MCPPeopleAnalytics {
  total_people: number;
  by_relation: Record<string, number>;
  by_relation_type: {
    family: number;
    work: number;
    friends: number;
    professional: number;
    other: number;
  };
  interaction_summary: {
    last_7_days: number;
    last_30_days: number;
    last_90_days: number;
    never_contacted: number;
    total_interactions: number;
  };
  top_tags: Array<{
    tag: string;
    count: number;
    people_count: number;
  }>;
  relationship_health: {
    active: number;
    stale: number;
    dormant: number;
  };
  monthly_activity: Array<{
    month: string;
    notes_count: number;
    people_contacted: number;
  }>;
  insights: {
    most_active_relationship: string;
    longest_without_contact: string;
    most_used_tags: string[];
    suggested_contacts: string[];
  };
}

export interface MCPPeopleAnalyticsResponse {
  analytics: MCPPeopleAnalytics;
  generated_at: string;
  query_time_ms: number;
}

// ====== Extended Projects Types ======
export interface MCPProject extends Project {
  sprint_count: number;
  total_tasks: number;
  active_sprints: number;
  sprints?: MCPSprint[];
  completion_rate?: number;
  health_score?: number;
  project_health?: 'healthy' | 'needs_attention' | 'stale' | 'blocked';
  days_since_activity?: number;
  blocked_tasks_count?: number;
  next_suggested_actions?: string[];
  last_activity?: string;
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
  health?: 'healthy' | 'needs_attention' | 'stale' | 'blocked';
  last_activity?: string;
  completion_rate_min?: number;
  completion_rate_max?: number;
  has_active_sprints?: boolean;
  priority_level?: 'low' | 'medium' | 'high' | 'urgent';
  sort?: 'newest' | 'activity' | 'completion' | 'urgency' | 'name' | 'health';
  include_blockers?: boolean;
  team_member?: string;
}

export interface MCPProjectsResponse {
  projects: MCPProject[];
  total_count: number;
  filters_applied: MCPProjectsQuery;
  performance?: {
    query_time_ms: number;
    health_calculated: boolean;
  };
}

// ====== Active Projects Types ======
export interface MCPActiveProject {
  project: MCPProject;
  active_sprints: MCPSprint[];
  urgent_tasks: Array<Task & {
    sprint_name: string;
    days_pending: number;
  }>;
  blockers: Array<{
    task_id: string;
    task_title: string;
    blocker_reason: string;
    suggested_action: string;
    priority: number;
  }>;
  health_score: number;
  needs_attention: boolean;
  next_actions: string[];
}

export interface MCPActiveProjectsResponse {
  active_projects: MCPActiveProject[];
  summary: {
    total_active_projects: number;
    total_active_sprints: number;
    total_pending_tasks: number;
    urgent_tasks_count: number;
    blocked_tasks_count: number;
    average_health_score: number;
  };
  insights: string[];
}

// ====== Projects Search Types ======
export interface MCPProjectsSearchQuery {
  q: string;
  fields?: string[];
  fuzzy?: boolean;
  include_sprints?: boolean;
  include_tasks?: boolean;
  include_blockers?: boolean;
  limit?: number;
  min_score?: number;
}

export interface MCPProjectSearchResult extends MCPProject {
  search_score: number;
  highlights: Array<{
    field: string;
    snippet: string;
    score: number;
  }>;
  matched_sprints?: Array<MCPSprint & {
    search_score: number;
    highlights: Array<{
      field: string;
      snippet: string;
    }>;
  }>;
}

export interface MCPProjectsSearchResponse {
  results: MCPProjectSearchResult[];
  total_count: number;
  query: MCPProjectsSearchQuery;
  search_time_ms: number;
}

// ====== Cross-Project Tasks Types ======
export interface MCPTasksQuery {
  status?: 'pending' | 'in_progress' | 'completed';
  priority_min?: number;
  priority_max?: number;
  assigned_to?: string;
  due_date?: string;
  project_id?: string;
  sprint_id?: string;
  blocked?: boolean;
  days_pending_min?: number;
  sort?: 'priority' | 'created' | 'due_date' | 'project' | 'urgency';
  limit?: number;
}

export interface MCPTaskWithContext extends Task {
  project_name: string;
  project_id: string;
  sprint_name: string;
  sprint_id: string;
  context_path: string;
  is_blocked: boolean;
  blocker_reason?: string;
  days_pending: number;
  urgency_score: number;
  estimated_effort?: string;
  suggested_actions?: string[];
}

export interface MCPTasksResponse {
  tasks: MCPTaskWithContext[];
  summary: {
    total_tasks: number;
    by_status: Record<string, number>;
    by_priority: Record<string, number>;
    by_project: Record<string, number>;
    blocked_tasks: number;
    urgent_tasks: number;
  };
  performance?: {
    query_time_ms: number;
  };
}

// ====== Projects Analytics Types ======
export interface MCPProjectsAnalytics {
  overview: {
    total_projects: number;
    active_projects: number;
    completed_projects: number;
    archived_projects: number;
    total_sprints: number;
    active_sprints: number;
    total_tasks: number;
    overall_completion_rate: number;
  };
  
  productivity: {
    tasks_completed_last_7d: number;
    tasks_completed_last_30d: number;
    avg_tasks_per_week: number;
    completion_velocity: Array<{
      week: string;
      completed_tasks: number;
      completion_rate: number;
    }>;
  };
  
  projects_health: Array<{
    project_name: string;
    project_id: string;
    health_score: number;
    status: 'healthy' | 'needs_attention' | 'stale' | 'blocked';
    last_activity: string;
    completion_rate: number;
    active_sprints: number;
    pending_tasks: number;
    blocked_tasks: number;
    suggested_actions: string[];
  }>;
  
  insights: {
    most_productive_project: string;
    longest_stale_project: string;
    highest_priority_tasks: Array<{
      task_title: string;
      project_name: string;
      priority: number;
      days_pending: number;
    }>;
    completion_trends: {
      trend: 'improving' | 'declining' | 'stable';
      change_percentage: number;
      period: string;
    };
    recommendations: string[];
  };
}

export interface MCPProjectsAnalyticsResponse {
  analytics: MCPProjectsAnalytics;
  generated_at: string;
  query_time_ms: number;
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