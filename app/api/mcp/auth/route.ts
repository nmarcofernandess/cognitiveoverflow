import { NextResponse } from 'next/server';
import { generateMCPToken } from '../../../../lib/mcp-auth';
import { getClientIP } from '../../../../lib/mcp-security';

// ====== Simple Token Generation for Claude.ai Web ======
// Usage: POST /api/mcp/auth with { "password": "neural_access_2024" }
// Returns: { "token": "jwt_token_here" }

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    // Fixed password for Claude.ai integration
    if (password !== 'neural_access_2024') {
      return NextResponse.json(
        { error: 'Invalid password' },
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
    
    const clientIP = getClientIP(request);
    const token = generateMCPToken(clientIP, 'claude_web_client');
    
    return NextResponse.json(
      { 
        token,
        usage: `Use as: ?token=${token.slice(0, 20)}...`,
        example: `https://cognitiveoverflow.vercel.app/api/mcp/people?token=${token}`
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
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