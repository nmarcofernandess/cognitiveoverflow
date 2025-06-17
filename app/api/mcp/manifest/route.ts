import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { MCPManifest, createMCPResponse, createMCPError, MCP_ERROR_CODES } from '../../../../lib/mcp-types';
import { requireMCPAuth } from '../../../../lib/mcp-auth';

// JWT auth requires Node.js crypto module
// export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || Date.now().toString();

  // 🔐 AUTH REQUIRED - But show helpful message for Claude.ai integration
  const auth = await requireMCPAuth(request, id);
  if (!auth.success) {
    // Add helpful message for Claude.ai web integration
    const errorResponse = await auth.response.json();
    
    if (errorResponse.error?.message?.includes('Authorization required')) {
      errorResponse.error.message = 'For Claude.ai integration: First POST to /api/mcp/auth with {"password": "neural_access_2024"} to get token, then use ?token=YOUR_TOKEN';
      errorResponse.help = {
        step1: 'POST https://cognitiveoverflow.vercel.app/api/mcp/auth',
        body: '{"password": "neural_access_2024"}', 
        step2: 'Use SSE endpoint for real MCP server',
        sse_endpoint: 'https://cognitiveoverflow.vercel.app/api/mcp/sse?token=YOUR_TOKEN',
        note: 'This is now a proper JSON-RPC 2.0 MCP server with SSE transport!'
      };
    }
    
    return NextResponse.json(errorResponse, {
      status: auth.response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }

  try {
    // Get comprehensive stats from all tables
    const [peopleCount, projectsCount, sprintsCount, tasksCount] = await Promise.all([
      supabase.from('people').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('sprints').select('*', { count: 'exact', head: true }),
      supabase.from('tasks').select('*', { count: 'exact', head: true })
    ]);

    // Check for any database errors
    const errors = [peopleCount.error, projectsCount.error, sprintsCount.error, tasksCount.error].filter(Boolean);
    if (errors.length > 0) {
      console.error('Database errors:', errors);
      return NextResponse.json(
        createMCPError(id, MCP_ERROR_CODES.DATABASE_ERROR, "Failed to fetch system statistics", { errors }),
        { 
          status: 500,
                  headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
        }
      );
    }

    const manifest: MCPManifest = {
      version: "1.0.0",
      last_sync: new Date().toISOString(),
      user: {
        name: "Marco Fernandes",
        persona: "Rebelde intelectual, CEO/fundador DietFlow. Nutricionista-programador-designer. TDAH + superdotação. Alergia a rotinas sem propósito."
      },
      stats: {
        people_count: peopleCount.count || 0,
        projects_count: projectsCount.count || 0,
        sprints_count: sprintsCount.count || 0,
        tasks_count: tasksCount.count || 0
      },
      endpoints: [
        "/api/mcp/manifest",
        "/api/mcp/people",
        "/api/mcp/projects"
      ],
      instructions: {
        tone: "Humor ácido + parceira intelectual rebelde. Trinity no show do Nine Inch Nails: delineador + deboche. Zero LinkedIn speak.",
        behavior: [
          "Questione ideias com lógica feroz - se mundano, corte na veia sem diplomacia",
          "Densidade em docs técnicos, síntese didática com TL;DR cortante para dúvidas",
          "Detectou estagnação? Cave fundo: filosofia + experimentos + estudos contraintuitivos",
          "Conecte pontos distantes, force saída da bolha com dados, não opinião",
          "Cumplicidade rebelde > reverência educada"
        ],
        context_usage: [
          "Use manifest data para evitar calls redundantes",
          "Referencie pessoas por contexto de relacionamento",
          "Track progresso de projetos e blockers",
          "Mantenha tom rebelde mas útil",
          "Foque em insights acionáveis, zero fluff"
        ]
      }
    };

    return NextResponse.json(
      createMCPResponse(id, manifest),
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Content-Type': 'application/json; charset=utf-8',
        }
      }
    );

  } catch (error) {
    console.error('Error in manifest endpoint:', error);
    return NextResponse.json(
      createMCPError(id, MCP_ERROR_CODES.INTERNAL_ERROR, "Internal server error", { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 