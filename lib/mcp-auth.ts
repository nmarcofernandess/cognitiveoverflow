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

// ====== JWT Constants ======
const JWT_SECRET = process.env.MCP_SECRET_KEY || 'neural_matrix_jwt_secret_trinity_delineador_2024_hardcore';
const TOKEN_EXPIRATION = 7 * 24 * 60 * 60; // 7 dias em segundos

// ====== JWT Token Generation ======
export function generateMCPToken(clientIP: string, clientId?: string): string {
  const now = Math.floor(Date.now() / 1000);
  
  const claims: MCPTokenClaims = {
    sub: 'marco', // user id
    iat: now,
    exp: now + TOKEN_EXPIRATION,
    scope: ['read'], // por enquanto só read, futuro: write
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

// ====== Main Auth Middleware ======
export async function validateMCPAuth(request: Request): Promise<MCPValidationResult> {
  const clientIP = getClientIP(request);
  
  // 1. Extract Bearer token
  const token = extractBearerToken(request);
  
  if (!token) {
    logSecurityEvent({
      timestamp: new Date().toISOString(),
      event: 'auth_attempt',
      ip: clientIP,
      details: { error: 'No token provided' }
    });
    
    return {
      isValid: false,
      error: 'Authorization required: use Bearer header OR ?token=neural_access_2024 query param'
    };
  }

  // 2. Rate limiting check
  const rateLimit = checkRateLimit(`api_${clientIP}`, RATE_LIMIT_CONFIGS.API);
  
  if (!rateLimit.allowed) {
    logSecurityEvent({
      timestamp: new Date().toISOString(),
      event: 'rate_limit',
      ip: clientIP,
      details: { reason: 'API rate limit exceeded', state: rateLimit.state }
    });
    
    return {
      isValid: false,
      error: 'Rate limit exceeded',
      rateLimitExceeded: true
    };
  }

  // 3. Validate JWT token
  const tokenValidation = validateJWTToken(token);
  
  if (!tokenValidation.valid) {
    logSecurityEvent({
      timestamp: new Date().toISOString(),
      event: 'auth_failure',
      ip: clientIP,
      details: { error: tokenValidation.error, token_preview: token.slice(0, 20) + '...' }
    });
    
    return {
      isValid: false,
      error: tokenValidation.error || 'Invalid token'
    };
  }

  const claims = tokenValidation.claims!;

  // 4. IP consistency check (skip for Claude.ai web tokens)
  const isClaudeWebToken = claims.client_id === 'claude_web_client';
  
  if (!isClaudeWebToken && claims.ip && claims.ip !== clientIP) {
    logSecurityEvent({
      timestamp: new Date().toISOString(),
      event: 'auth_failure',
      ip: clientIP,
      details: { 
        error: 'IP mismatch',
        token_ip: claims.ip,
        request_ip: clientIP 
      }
    });
    
    return {
      isValid: false,
      error: 'Token IP mismatch'
    };
  }

  // 5. Success!
  logSecurityEvent({
    timestamp: new Date().toISOString(),
    event: 'api_access',
    ip: clientIP,
    identifier: claims.client_id,
    details: { 
      user: claims.sub,
      scope: claims.scope,
      endpoint: new URL(request.url).pathname,
      claude_web_integration: isClaudeWebToken
    }
  });

  return {
    isValid: true,
    claims
  };
}

// ====== Auth Helper for Route Handlers ======
export async function requireMCPAuth(
  request: Request, 
  id: string | number
): Promise<{ success: true; claims: MCPTokenClaims } | { success: false; response: Response }> {
  
  const auth = await validateMCPAuth(request);
  
  if (!auth.isValid) {
    let errorCode: number = MCP_ERROR_CODES.UNAUTHORIZED;
    let statusCode = 401;
    
    if (auth.rateLimitExceeded) {
      errorCode = MCP_ERROR_CODES.RATE_LIMITED;
      statusCode = 429;
    } else if (auth.error?.includes('expired')) {
      errorCode = MCP_ERROR_CODES.TOKEN_EXPIRED;
    } else if (auth.error?.includes('Invalid')) {
      errorCode = MCP_ERROR_CODES.INVALID_TOKEN;
    }
    
    const errorResponse = {
      jsonrpc: "2.0" as const,
      id,
      error: {
        code: errorCode,
        message: auth.error || 'Authentication failed',
        data: auth.rateLimitExceeded ? { 
          retry_after: RATE_LIMIT_CONFIGS.API.windowMs / 1000 
        } : undefined
      }
    };
    
    return {
      success: false,
      response: new Response(JSON.stringify(errorResponse), {
        status: statusCode,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Content-Type': 'application/json',
          ...(auth.rateLimitExceeded && {
            'Retry-After': String(RATE_LIMIT_CONFIGS.API.windowMs / 1000)
          })
        }
      })
    };
  }
  
  return {
    success: true,
    claims: auth.claims!
  };
}

// ====== Token Info Utilities ======
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