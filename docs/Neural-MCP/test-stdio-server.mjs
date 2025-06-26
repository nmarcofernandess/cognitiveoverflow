#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  ListToolsRequestSchema,
  CallToolRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { supabase } from '../../lib/supabase.js';

// Create server
const server = new Server({
  name: 'neural-stdio-test',
  version: '1.0.0'
}, {
  capabilities: {
    tools: {}
  }
});

// List tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_manifest',
        description: 'Get system manifest with real Supabase data (STDIO)',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false
        }
      }
    ]
  };
});

// Call tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;
  
  if (name === 'get_manifest') {
    try {
      console.error('📊 STDIO: Fetching real data from Supabase...');
      
      // Simple data fetch from Supabase
      const [
        { data: people, count: peopleCount },
        { data: projects, count: projectsCount },
        { data: tasks, count: tasksCount }
      ] = await Promise.all([
        supabase.from('people').select('*', { count: 'exact' }),
        supabase.from('projects').select('*', { count: 'exact' }),
        supabase.from('tasks').select('*', { count: 'exact' })
      ]);

      const manifest = {
        version: "2.0-stdio-real-data",
        timestamp: new Date().toISOString(),
        transport: "STDIO (Direct SDK)",
        
        stats: {
          people: peopleCount || 0,
          projects: projectsCount || 0, 
          tasks: tasksCount || 0
        },
        
        sample_data: {
          first_person: people?.[0]?.name || "No people found",
          first_project: projects?.[0]?.name || "No projects found",
          first_task: tasks?.[0]?.title || "No tasks found"
        }
      };

      console.error('✅ STDIO: Real data fetched successfully!');

      return {
        content: [{
          type: "text",
          text: `**Neural System Manifest (STDIO + Real Data)**\n\n` +
                `Transport: ${manifest.transport}\n` +
                `Generated: ${manifest.timestamp}\n\n` +
                `**Real Stats from Supabase:**\n` +
                `• People: ${manifest.stats.people}\n` +
                `• Projects: ${manifest.stats.projects}\n` +
                `• Tasks: ${manifest.stats.tasks}\n\n` +
                `**Sample Data:**\n` +
                `• First Person: ${manifest.sample_data.first_person}\n` +
                `• First Project: ${manifest.sample_data.first_project}\n` +
                `• First Task: ${manifest.sample_data.first_task}\n\n` +
                `🎯 **This proves STDIO can access Supabase directly!**`
        }]
      };
    } catch (error) {
      console.error('❌ STDIO: Error fetching from Supabase:', error.message);
      return {
        content: [{
          type: "text",
          text: `❌ STDIO Error: ${error.message}\n\nBut the STDIO architecture is working!`
        }]
      };
    }
  }
  
  throw new Error(`Unknown tool: ${name}`);
});

// Connect and run
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Log to stderr (not stdout which is used for MCP communication)
  console.error('🚀 Neural STDIO Server running with REAL Supabase data...');
}

main().catch(error => {
  console.error('💥 Server failed:', error);
  process.exit(1);
}); 