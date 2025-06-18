import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createMcpHandler } from '@vercel/mcp-adapter';
import { supabase } from '../../../lib/supabase';

// ====== MCP OFICIAL VERCEL - Neural System Server V2 ======
// Using @vercel/mcp-adapter for optimal performance and compatibility

// Create the MCP handler using Vercel's official adapter
const mcpHandler = createMcpHandler(
  (server) => {
    console.log("🧠 Initializing Neural System MCP Server V2 (Vercel Adapter)");

    // ====== PEOPLE MANAGEMENT TOOLS ======
    
    server.tool(
      'list_people',
      'List all people in Marco\'s network with optional filters',
      {
        relation: z.string().optional().describe('Filter by relationship type'),
        limit: z.number().int().min(1).max(100).default(20).describe('Max number of results'),
        search: z.string().optional().describe('Search by name')
      },
      async ({ relation, limit = 20, search }) => {
        console.log("🔧 V2 Tool call: list_people", { relation, limit, search });
        
        let query = supabase.from('people').select('*');
        
        if (relation) {
          query = query.eq('relation', relation);
        }
        if (search) {
          query = query.ilike('name', `%${search}%`);
        }
        
        query = query.limit(limit).order('created_at', { ascending: false });
        
        const { data, error } = await query;
        if (error) throw new Error(`Database error: ${error.message}`);
        
        return {
          content: [
            {
              type: "text",
              text: `Found ${data.length} people in Marco's network:\n\n${data.map(p => `• ${p.name} (${p.relation})`).join('\n')}`
            }
          ]
        };
      }
    );

    server.tool(
      'get_person',
      'Get detailed information about a specific person',
      {
        id: z.string().describe('Person ID')
      },
      async ({ id }) => {
        console.log("🔧 V2 Tool call: get_person", { id });
        
        const { data, error } = await supabase
          .from('people')
          .select('*, person_notes(*)')
          .eq('id', id)
          .single();
          
        if (error) throw new Error(`Database error: ${error.message}`);
        if (!data) throw new Error('Person not found');
        
        return {
          content: [
            {
              type: "text", 
              text: `**${data.name}**\n\nRelationship: ${data.relation}\nTLDR: ${data.tldr || 'No summary'}\nEmail: ${data.email || 'Not provided'}\n\nNotes: ${data.person_notes?.length || 0} notes available`
            }
          ]
        };
      }
    );

    server.tool(
      'create_person',
      'Add a new person to Marco\'s network',
      {
        name: z.string().describe('Person\'s name'),
        relation: z.string().describe('Relationship to Marco'),
        tldr: z.string().optional().describe('Brief description'),
        email: z.string().optional().describe('Email address')
      },
      async ({ name, relation, tldr, email }) => {
        console.log("🔧 V2 Tool call: create_person", { name, relation });
        
        const { data, error } = await supabase
          .from('people')
          .insert([{ name, relation, tldr, email }])
          .select()
          .single();
          
        if (error) throw new Error(`Database error: ${error.message}`);
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Added ${data.name} to Marco's network as ${data.relation}`
            }
          ]
        };
      }
    );

    server.tool(
      'list_projects',
      'List all projects with optional filters',
      {
        status: z.string().optional().describe('Filter by status'),
        limit: z.number().int().min(1).max(100).default(20).describe('Max results')
      },
      async ({ status, limit = 20 }) => {
        console.log("🔧 V2 Tool call: list_projects", { status, limit });
        
        let query = supabase.from('projects').select(`
          *,
          sprints(id)
        `);
        
        if (status) {
          query = query.eq('status', status);
        }
        
        query = query.limit(limit).order('created_at', { ascending: false });
        
        const { data, error } = await query;
        if (error) throw new Error(`Database error: ${error.message}`);
        
        return {
          content: [
            {
              type: "text",
              text: `Found ${data.length} projects:\n\n${data.map(p => {
                const sprintCount = (p as any).sprints?.length || 0;
                return `• ${p.name} (${sprintCount} sprints)`;
              }).join('\n')}`
            }
          ]
        };
      }
    );

    server.tool(
      'get_memory',
      'Get memory entries with optional filtering by tags',
      {
        limit: z.number().int().min(1).max(100).default(50).describe('Max number of entries'),
        tags: z.array(z.string()).optional().describe('Filter by tags')
      },
      async ({ limit = 50, tags }) => {
        console.log("🔧 V2 Tool call: get_memory", { limit, tags });
        
        let query = supabase.from('memory').select('*');
        
        if (tags && tags.length > 0) {
          query = query.contains('tags', tags);
        }
        
        query = query.limit(limit).order('created_at', { ascending: false });
        
        const { data, error } = await query;
        if (error) throw new Error(`Database error: ${error.message}`);
        
        return {
          content: [
            {
              type: "text",
              text: `Found ${data.length} memory entries:\n\n${data.map(m => `• ${m.title} (${m.tags?.join(', ') || 'no tags'})`).join('\n')}`
            }
          ]
        };
      }
    );

    server.tool(
      'test_connection',
      'Test MCP server connection and show system status',
      {},
      async () => {
        console.log("🔧 V2 Tool call: test_connection");
        
        // Get system stats
        const [peopleCount, projectsCount, memoryCount] = await Promise.all([
          supabase.from('people').select('*', { count: 'exact', head: true }),
          supabase.from('projects').select('*', { count: 'exact', head: true }),
          supabase.from('memory').select('*', { count: 'exact', head: true })
        ]);

        return {
          content: [
            {
              type: "text",
              text: `🧠 **Neural System MCP V2 Connected!**\n\n✅ Using @vercel/mcp-adapter\n✅ Database: ${peopleCount.count} people, ${projectsCount.count} projects, ${memoryCount.count} memories\n✅ Server: Vercel optimized\n✅ Protocol: JSON-RPC 2.0\n\n**Ready for AI integration!**`
            }
          ]
        };
      }
    );
    
  },
  {
    // MCP Server configuration
    serverInfo: {
      name: 'neural-system-v2',
      version: '2.0.0'
    }
  }
);

// Custom auth wrapper
async function authWrapper(request: NextRequest) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const authHeader = request.headers.get('Authorization');
  
  console.log("🔐 V2 Auth check:", { token: !!token, authHeader: !!authHeader });
  
  // Development bypass
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // Token validation
  if (token === 'neural_access_2024' || authHeader === 'Bearer neural_access_2024') {
    return true;
  }
  
  return false;
}

// Export handlers with auth check
export async function GET(request: NextRequest) {
  if (!await authWrapper(request)) {
    return new Response('Unauthorized', { status: 401 });
  }
  return mcpHandler(request);
}

export async function POST(request: NextRequest) {
  if (!await authWrapper(request)) {
    return new Response('Unauthorized', { status: 401 });
  }
  return mcpHandler(request);
}

export async function DELETE(request: NextRequest) {
  if (!await authWrapper(request)) {
    return new Response('Unauthorized', { status: 401 });
  }
  return mcpHandler(request);
}

export async function OPTIONS(request: NextRequest) {
  return mcpHandler(request);
} 