import bcrypt from 'bcryptjs';
import { RateLimitState, RateLimitConfig } from './mcp-types';

// In-memory storage para rate limiting (em produção usar Redis)
const rateLimitStore = new Map<string, RateLimitState>();
const authAttemptStore = new Map<string, RateLimitState>();

// ====== Rate Limiting Configs ======
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  AUTH: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 5, // 5 tentativas por minuto
    maxFailedAttempts: 10, // 10 falhas em 5 minutos = blacklist
    blacklistDuration: 5 * 60 * 1000 // 5 minutos de blacklist
  },
  API: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 100, // 100 requests por minuto por token
    maxFailedAttempts: 50, // limite alto para API
    blacklistDuration: 60 * 1000 // 1 minuto de blacklist
  }
};

// ====== Password Security ======
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function verifyMasterPassword(password: string): boolean {
  const masterPassword = process.env.MCP_MASTER_PASSWORD || 'neural_access_2024';
  return password === masterPassword;
}

// ====== Rate Limiting Functions ======
export function checkRateLimit(
  identifier: string, 
  config: RateLimitConfig,
  store: Map<string, RateLimitState> = rateLimitStore
): { allowed: boolean; state: RateLimitState } {
  const now = Date.now();
  const current = store.get(identifier) || {
    requests: 0,
    lastReset: now,
    blacklisted: false,
    failedAttempts: 0
  };

  // Check se está blacklisted
  if (current.blacklisted) {
    const blacklistEnd = current.lastReset + config.blacklistDuration;
    if (now < blacklistEnd) {
      return { allowed: false, state: current };
    } else {
      // Remove blacklist
      current.blacklisted = false;
      current.failedAttempts = 0;
      current.requests = 0;
      current.lastReset = now;
    }
  }

  // Reset window se necessário
  if (now - current.lastReset >= config.windowMs) {
    current.requests = 0;
    current.lastReset = now;
  }

  // Check limite
  if (current.requests >= config.maxRequests) {
    return { allowed: false, state: current };
  }

  // Incrementa requests
  current.requests++;
  store.set(identifier, current);

  return { allowed: true, state: current };
}

export function recordFailedAttempt(
  identifier: string,
  config: RateLimitConfig,
  store: Map<string, RateLimitState> = authAttemptStore
): void {
  const now = Date.now();
  const current = store.get(identifier) || {
    requests: 0,
    lastReset: now,
    blacklisted: false,
    failedAttempts: 0
  };

  current.failedAttempts = (current.failedAttempts || 0) + 1;

  // Blacklist se muitas tentativas falhadas
  if (current.failedAttempts >= config.maxFailedAttempts) {
    current.blacklisted = true;
    current.lastReset = now;
    console.warn(`🚨 IP ${identifier} blacklisted for ${config.maxFailedAttempts} failed auth attempts`);
  }

  store.set(identifier, current);
}

export function clearFailedAttempts(identifier: string): void {
  authAttemptStore.delete(identifier);
}

// ====== IP Utilities ======
export function getClientIP(request: Request): string {
  // Try different headers para get real IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback
  return 'unknown';
}

// ====== Security Logging ======
export interface SecurityLogEvent {
  timestamp: string;
  event: 'auth_attempt' | 'auth_success' | 'auth_failure' | 'rate_limit' | 'blacklist' | 'api_access';
  ip: string;
  identifier?: string;
  details?: any;
}

export function logSecurityEvent(event: SecurityLogEvent): void {
  const logEntry = {
    ...event,
    timestamp: new Date().toISOString()
  };
  
  // Em desenvolvimento, só console.log
  // Em produção, enviar para logging service
  console.log(`🔐 MCP Security:`, JSON.stringify(logEntry, null, 2));
}

// ====== Token Utilities ======
export function generateClientId(): string {
  return `mcp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function isTokenExpired(exp: number): boolean {
  return Date.now() >= exp * 1000;
}

// ====== Cleanup Functions ======
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  
  // Cleanup rate limit store
  rateLimitStore.forEach((state, key) => {
    if (now - state.lastReset > RATE_LIMIT_CONFIGS.API.windowMs * 2) {
      rateLimitStore.delete(key);
    }
  });
  
  // Cleanup auth attempt store
  authAttemptStore.forEach((state, key) => {
    if (now - state.lastReset > RATE_LIMIT_CONFIGS.AUTH.blacklistDuration * 2) {
      authAttemptStore.delete(key);
    }
  });
}

// Auto cleanup a cada 5 minutos
setInterval(cleanupExpiredEntries, 5 * 60 * 1000); 