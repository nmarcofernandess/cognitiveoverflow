import { NextResponse } from 'next/server';
import { 
  MCPAuthRequest, 
  MCPAuthResponse, 
  createMCPResponse, 
  createMCPError, 
  MCP_ERROR_CODES 
} from '../../../../lib/mcp-types';
import { 
  verifyMasterPassword, 
  checkRateLimit, 
  recordFailedAttempt,
  clearFailedAttempts,
  getClientIP, 
  logSecurityEvent, 
  generateClientId,
  RATE_LIMIT_CONFIGS 
} from '../../../../lib/mcp-security';
import { generateMCPToken } from '../../../../lib/mcp-auth';

// JWT requires Node.js crypto module, can't use edge runtime
// export const runtime = 'edge';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || Date.now().toString();
  const clientIP = getClientIP(request);

  try {
    // 1. Rate limiting check para auth attempts
    const rateLimit = checkRateLimit(`auth_${clientIP}`, RATE_LIMIT_CONFIGS.AUTH);
    
    if (!rateLimit.allowed) {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        event: 'rate_limit',
        ip: clientIP,
        details: { 
          reason: 'Auth rate limit exceeded', 
          state: rateLimit.state,
          endpoint: '/api/mcp/auth'
        }
      });
      
      return NextResponse.json(
        createMCPError(id, MCP_ERROR_CODES.RATE_LIMITED, "Too many authentication attempts", {
          retry_after: RATE_LIMIT_CONFIGS.AUTH.windowMs / 1000,
          blacklisted: rateLimit.state.blacklisted
        }),
        { 
          status: 429,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Retry-After': String(RATE_LIMIT_CONFIGS.AUTH.windowMs / 1000),
          }
        }
      );
    }

    // 2. Parse request body
    let body: MCPAuthRequest;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        createMCPError(id, MCP_ERROR_CODES.PARSE_ERROR, "Invalid JSON body"),
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      );
    }

    // 3. Validate required fields
    if (!body.password) {
      return NextResponse.json(
        createMCPError(id, MCP_ERROR_CODES.INVALID_PARAMS, "Password is required"),
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      );
    }

    // 4. Verify master password
    logSecurityEvent({
      timestamp: new Date().toISOString(),
      event: 'auth_attempt',
      ip: clientIP,
      details: { 
        client_id: body.client_id,
        endpoint: '/api/mcp/auth'
      }
    });

    if (!verifyMasterPassword(body.password)) {
      // Record failed attempt
      recordFailedAttempt(clientIP, RATE_LIMIT_CONFIGS.AUTH);
      
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        event: 'auth_failure',
        ip: clientIP,
        details: { 
          reason: 'Invalid password',
          client_id: body.client_id
        }
      });
      
      return NextResponse.json(
        createMCPError(id, MCP_ERROR_CODES.UNAUTHORIZED, "Invalid credentials"),
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      );
    }

    // 5. Generate client ID if not provided
    const clientId = body.client_id || generateClientId();

    // 6. Generate JWT token
    const token = generateMCPToken(clientIP, clientId);
    const expiresIn = 7 * 24 * 60 * 60; // 7 days in seconds
    const issuedAt = new Date().toISOString();

    // 7. Clear any failed attempts for this IP
    clearFailedAttempts(clientIP);

    // 8. Success response
    const authResponse: MCPAuthResponse = {
      token,
      expires_in: expiresIn,
      token_type: "Bearer",
      issued_at: issuedAt,
      scope: ["read"] // futuro: scope dinâmico
    };

    logSecurityEvent({
      timestamp: new Date().toISOString(),
      event: 'auth_success',
      ip: clientIP,
      identifier: clientId,
      details: { 
        expires_in: expiresIn,
        scope: ["read"]
      }
    });

    return NextResponse.json(
      createMCPResponse(id, authResponse),
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Content-Type': 'application/json',
        }
      }
    );

  } catch (error) {
    console.error('Error in auth endpoint:', error);
    
    logSecurityEvent({
      timestamp: new Date().toISOString(),
      event: 'auth_failure',
      ip: clientIP,
      details: { 
        error: error instanceof Error ? error.message : 'Unknown error',
        endpoint: '/api/mcp/auth'
      }
    });
    
    return NextResponse.json(
      createMCPError(id, MCP_ERROR_CODES.INTERNAL_ERROR, "Internal server error", { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 