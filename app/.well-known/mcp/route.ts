import { NextResponse } from 'next/server';

// MCP Server Discovery Endpoint
// Following MCP 2025-03-26 specification

export async function GET() {
  const discoveryInfo = {
    version: "2025-03-26",
    servers: [
      {
        name: "neural-system",
        description: "Marco's Neural System - Rebellious AI with CRUD for people, projects, and tasks",
        url: "https://cognitiveoverflow.vercel.app/api/mcp",
        transport: "http",
        capabilities: {
          tools: {
            listChanged: true
          },
          resources: {
            subscribe: true,
            listChanged: true  
          },
          prompts: {
            listChanged: true
          },
          logging: {}
        }
      }
    ]
  };

  return NextResponse.json(discoveryInfo, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 