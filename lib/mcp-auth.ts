import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { 
  MCPTokenClaims, 
  MCPValidationResult, 
  MCP_ERROR_CODES 
} from './mcp-types';
import { 
  checkRateLimit, 
  getClientIP, 
  logSecurityEvent, 
  RATE_LIMIT_CONFIGS,
  isTokenExpired 
} from './mcp-security';

// ====== Constants ======
const JWT_SECRET = process.env.MCP_SECRET_KEY || 'neural_matrix_jwt_secret_trinity_delineador_2024_hardcore';
const TOKEN_EXPIRATION = 7 * 24 * 60 * 60; // 7 dias em segundos
const API_KEY = process.env.NEURAL_API_KEY || 'neural_2024_simple';

// ====== API Key Validation (Simples) ======
export function validateApiKey(request: Request): boolean {
  const apiKey = request.headers.get('X-API-Key');
  return apiKey === API_KEY;
}

// ====== JWT Token Generation ======
export function generateMCPToken(clientIP: string, clientId?: string): string {
  const now = Math.floor(Date.now() / 1000);
  
  const claims: MCPTokenClaims = {
    sub: 'marco', // user id
    iat: now,
    exp: now + TOKEN_EXPIRATION,
    scope: ['read', 'write'], // Agora inclui write
    client_id: clientId,
    // Only include IP for non-Claude.ai tokens (strict security for local)
    ...(clientId !== 'claude_web_client' && { ip: clientIP })
  };

  return jwt.sign(claims, JWT_SECRET, { algorithm: 'HS256' });
}

// ====== JWT Token Validation ======
export function validateJWTToken(token: string): { valid: boolean; claims?: MCPTokenClaims; error?: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as MCPTokenClaims;
    
    // Double-check expiration
    if (isTokenExpired(decoded.exp)) {
      return { valid: false, error: 'Token expired' };
    }
    
    return { valid: true, claims: decoded };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: 'Token expired' };
    } else if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, error: 'Invalid token' };
    } else {
      return { valid: false, error: 'Token validation failed' };
    }
  }
}

// ====== Bearer Token OR Query Param Extraction ======
export function extractBearerToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  
  // Method 1: Bearer token (local MCP)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7); // Remove "Bearer "
  }
  
  // Method 2: Query parameter token (Claude.ai web)
  const url = new URL(request.url);
  const queryToken = url.searchParams.get('token');
  
  if (queryToken) {
    return queryToken;
  }
  
  return null;
}

// ====== Unified Auth Validation ======
export function validateMCPAuth(request: Request): boolean {
  // Para Claude: Bearer token
  if (request.headers.get('Authorization')?.startsWith('Bearer ')) {
    return validateJWTToken(extractBearerToken(request)!).valid;
  }
  
  // Para Frontend: API Key
  return validateApiKey(request);
}

// ====== Legacy Auth Middleware (manter compatibilidade) ======
export async function requireMCPAuth(
  request: Request, 
  id: string | number
): Promise<{ success: true; claims?: MCPTokenClaims } | { success: false; response: Response }> {
  
  const clientIP = getClientIP(request);
  
  // Verificar rate limiting primeiro
  const rateLimit = checkRateLimit(`api_${clientIP}`, RATE_LIMIT_CONFIGS.API);
  
  if (!rateLimit.allowed) {
    return {
      success: false,
      response: new Response(
        JSON.stringify({ error: { message: 'Rate limit exceeded', code: 'RATE_LIMITED' } }),
        { 
          status: 429,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      )
    };
  }

  // Tentar autenticação
  if (!validateMCPAuth(request)) {
    logSecurityEvent({
      timestamp: new Date().toISOString(),
      event: 'auth_failure',
      ip: clientIP,
      details: { endpoint: new URL(request.url).pathname }
    });

    return {
      success: false,
      response: new Response(
        JSON.stringify({ error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } }),
        { 
          status: 401,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      )
    };
  }

  // Log sucesso
  logSecurityEvent({
    timestamp: new Date().toISOString(),
    event: 'api_access',
    ip: clientIP,
    details: { 
      endpoint: new URL(request.url).pathname,
      auth_method: request.headers.get('Authorization') ? 'jwt' : 'api_key'
    }
  });

  // Tentar extrair claims do JWT se disponível
  const token = extractBearerToken(request);
  let claims: MCPTokenClaims | undefined;
  
  if (token) {
    const validation = validateJWTToken(token);
    if (validation.valid) {
      claims = validation.claims;
    }
  }

  return { success: true, claims };
}

// ====== Token Info Helper ======
export function getTokenInfo(token: string): { valid: boolean; claims?: any; timeLeft?: number } {
  const validation = validateJWTToken(token);
  
  if (!validation.valid || !validation.claims) {
    return { valid: false };
  }

  const now = Math.floor(Date.now() / 1000);
  const timeLeft = validation.claims.exp - now;

  return {
    valid: true,
    claims: validation.claims,
    timeLeft
  };
} 