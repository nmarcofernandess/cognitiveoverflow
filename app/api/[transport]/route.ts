import { z } from 'zod';
import { createMcpHandler } from '@vercel/mcp-adapter';
import { supabase } from '../../../lib/supabase';

const handler = createMcpHandler(
  (server) => {
    // Basic test tool
    server.tool(
      'roll_dice',
      'Rolls an N-sided die',
      { sides: z.number().int().min(2) },
      async ({ sides }) => {
        const value = 1 + Math.floor(Math.random() * sides);
        return {
          content: [{ type: 'text', text: `🎲 You rolled a ${value}!` }],
        };
      },
    );

    // Neural System test
    server.tool(
      'hello_neural',
      'Test Neural System connection',
      {},
      async () => {
        return {
          content: [{
            type: 'text',
            text: '🧠 Marco! Neural System MCP Server is working with official Vercel adapter and correct [transport] routing!'
          }]
        };
      }
    );

    // Overview tool with Supabase
    server.tool(
      'get_overview',
      'Get Neural System overview',
      {},
      async () => {
        try {
          // Count people
          const { count: peopleCount } = await supabase
            .from('people')
            .select('*', { count: 'exact', head: true });
          
          // Count projects  
          const { count: projectsCount } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true });
          
          // Get primary user
          const { data: primaryUser } = await supabase
            .from('people')
            .select('name, relation')
            .eq('is_primary_user', true)
            .single();
          
          return {
            content: [{
              type: 'text',
              text: `**🧠 Neural System Overview**\n\n` +
                    `**Statistics:**\n` +
                    `• People: ${peopleCount || 0}\n` +
                    `• Projects: ${projectsCount || 0}\n\n` +
                    `**Primary User:** ${primaryUser?.name || 'Not set'} (${primaryUser?.relation || 'Unknown'})\n\n` +
                    `✅ **SUCCESS: Official @vercel/mcp-adapter with [transport] routing is working!**`
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `❌ Database error: ${error instanceof Error ? error.message : String(error)}`
            }]
          };
        }
      }
    );
  },
  {},
  { basePath: '/api' },
);

export { handler as GET, handler as POST, handler as DELETE }; 