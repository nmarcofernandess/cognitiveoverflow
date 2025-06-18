import { z } from 'zod';
import { createMcpHandler } from '@vercel/mcp-adapter';

const handler = createMcpHandler(
  (server) => {
    // ====== PEOPLE MANAGEMENT TOOLS ======
    
    // Tool 1: list_people
    server.tool(
      'list_people',
      'List all people in Marco\'s network with optional filters',
      {
        relation: z.string().optional(),
        limit: z.number().default(20),
        search: z.string().optional()
      },
      async ({ relation, limit, search }) => {
        // Dynamic import to avoid build-time issues
        const { supabase } = await import('../../../lib/supabase');
        
        let query = supabase.from('people').select('*');
        
        if (relation) {
          query = query.eq('relation', relation);
        }
        if (search) {
          query = query.ilike('name', `%${search}%`);
        }
        
        query = query.limit(limit || 20);
        
        const { data, error } = await query;
        if (error) throw error;
        
        return {
          content: [
            {
              type: "text",
              text: `Found ${data.length} people in Marco's network:\n\n${data.map((p: any) => `• ${p.name} (${p.relation})`).join('\n')}`
            }
          ]
        };
      }
    );

    // Tool 2: get_person
    server.tool(
      'get_person',
      'Get detailed information about a specific person',
      {
        id: z.string()
      },
      async ({ id }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const { data, error } = await supabase
          .from('people')
          .select('*, person_notes(*)')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        if (!data) throw new Error('Person not found');
        
        return {
          content: [
            {
              type: "text", 
              text: `**${data.name}**\n\nRelationship: ${data.relation}\nTLDR: ${data.tldr || 'No summary'}\nEmail: ${data.email || 'Not provided'}\n\nNotes: ${(data as any).person_notes?.length || 0} notes available`
            }
          ]
        };
      }
    );

    // Tool 3: create_person
    server.tool(
      'create_person',
      'Add a new person to Marco\'s network',
      {
        name: z.string(),
        relation: z.string(),
        tldr: z.string().optional(),
        email: z.string().optional()
      },
      async ({ name, relation, tldr, email }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const { data, error } = await supabase
          .from('people')
          .insert([{ name, relation, tldr, email }])
          .select()
          .single();
          
        if (error) throw error;
        
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

    // Tool 4: update_person
    server.tool(
      'update_person',
      'Update information about an existing person',
      {
        id: z.string(),
        name: z.string().optional(),
        relation: z.string().optional(),
        tldr: z.string().optional(),
        email: z.string().optional()
      },
      async ({ id, name, relation, tldr, email }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (relation !== undefined) updateData.relation = relation;
        if (tldr !== undefined) updateData.tldr = tldr;
        if (email !== undefined) updateData.email = email;
        
        const { data, error } = await supabase
          .from('people')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Updated ${data.name}'s information`
            }
          ]
        };
      }
    );

    // Tool 5: delete_person
    server.tool(
      'delete_person',
      'Remove a person from Marco\'s network',
      {
        id: z.string()
      },
      async ({ id }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const { error } = await supabase
          .from('people')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Removed person from Marco's network`
            }
          ]
        };
      }
    );

    // Tool 6: add_note
    server.tool(
      'add_note',
      'Add a note about a person',
      {
        person_id: z.string(),
        title: z.string(),
        content: z.string()
      },
      async ({ person_id, title, content }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const { data, error } = await supabase
          .from('person_notes')
          .insert([{
            person_id,
            title,
            content,
            tags: []
          }])
          .select()
          .single();
          
        if (error) throw error;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Added note "${data.title}" to person`
            }
          ]
        };
      }
    );

    // ====== PROJECT MANAGEMENT TOOLS ======
    
    // Tool 7: list_projects
    server.tool(
      'list_projects',
      'List all projects with optional filters',
      {
        status: z.string().optional(),
        limit: z.number().default(20)
      },
      async ({ status, limit }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        let query = supabase.from('projects').select(`
          *,
          sprints!inner(
            id,
            name,
            tasks(count)
          )
        `);
        
        if (status) {
          query = query.eq('status', status);
        }
        
        query = query.limit(limit || 20);
        
        const { data, error } = await query;
        if (error) throw error;
        
        const projectsText = data.map((p: any) => {
          const sprints = p.sprints || [];
          const totalTasks = sprints.reduce((sum: number, s: any) => sum + (s.tasks?.[0]?.count || 0), 0);
          return `• **${p.name}** (${p.status ?? 'active'})\n  TLDR: ${p.tldr || 'No summary'}\n  Sprints: ${sprints.length} | Tasks: ${totalTasks}`;
        }).join('\n\n');
        
        return {
          content: [
            {
              type: "text",
              text: `Found ${data.length} projects:\n\n${projectsText}`
            }
          ]
        };
      }
    );

    // Tool 8: get_project
    server.tool(
      'get_project',
      'Get detailed project information',
      {
        id: z.string()
      },
      async ({ id }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            sprints (
              id,
              name,
              description,
              status,
              tasks(count),
              sprint_notes(count)
            )
          `)
          .eq('id', id)
          .single();
          
        if (error) throw error;
        if (!data) throw new Error('Project not found');
        
        const sprints = (data as any).sprints || [];
        const sprintsText = sprints.map((s: any) => {
          const taskCount = s.tasks?.[0]?.count || 0;
          const noteCount = s.sprint_notes?.[0]?.count || 0;
          return `  • **${s.name}** (${s.status || 'active'})\n    TLDR: ${s.description || 'No description'}\n    Tasks: ${taskCount} | Notes: ${noteCount}`;
        }).join('\n\n');
        
        const totalTasks = sprints.reduce((sum: number, s: any) => sum + (s.tasks?.[0]?.count || 0), 0);
        
        return {
          content: [
            {
              type: "text",
              text: `**${data.name}**\n\nStatus: ${data.status || 'active'}\nTLDR: ${data.tldr || 'No summary'}\nTotal Sprints: ${sprints.length} | Total Tasks: ${totalTasks}\n\n**Sprints:**\n${sprintsText || '  No sprints'}`
            }
          ]
        };
      }
    );

    // Tool 9: create_project
    server.tool(
      'create_project',
      'Create a new project',
      {
        name: z.string(),
        tldr: z.string().optional(),
        status: z.string().default('active')
      },
      async ({ name, tldr, status }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const { data, error } = await supabase
          .from('projects')
          .insert([{ name, tldr, status }])
          .select()
          .single();
          
        if (error) throw error;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Created project "${data.name}"`
            }
          ]
        };
      }
    );

    // Tool 10: update_project
    server.tool(
      'update_project',
      'Update project information',
      {
        id: z.string(),
        name: z.string().optional(),
        tldr: z.string().optional(),
        status: z.string().optional()
      },
      async ({ id, name, tldr, status }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (tldr !== undefined) updateData.tldr = tldr;
        if (status !== undefined) updateData.status = status;
        
        const { data, error } = await supabase
          .from('projects')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Updated project "${data.name}"`
            }
          ]
        };
      }
    );

    // Tool 11: delete_project
    server.tool(
      'delete_project',
      'Delete a project and all associated data',
      {
        id: z.string()
      },
      async ({ id }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Deleted project and all associated data`
            }
          ]
        };
      }
    );

    // ====== SPRINT MANAGEMENT TOOLS ======
    
    // Tool 12: list_sprints
    server.tool(
      'list_sprints',
      'List sprints for a project',
      {
        project_id: z.string(),
        status: z.string().optional()
      },
      async ({ project_id, status }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        let query = supabase.from('sprints').select('*').eq('project_id', project_id);
        
        if (status) {
          query = query.eq('status', status);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        
        return {
          content: [
            {
              type: "text",
              text: `Found ${data.length} sprints:\n\n${data.map((s: any) => `• ${s.name} (${s.status || 'active'})`).join('\n')}`
            }
          ]
        };
      }
    );

    // Tool 13: create_sprint
    server.tool(
      'create_sprint',
      'Create a new sprint',
      {
        project_id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        start_date: z.string().optional(),
        end_date: z.string().optional()
      },
      async ({ project_id, name, description, start_date, end_date }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const { data, error } = await supabase
          .from('sprints')
          .insert([{ project_id, name, description, start_date, end_date }])
          .select()
          .single();
          
        if (error) throw error;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Created sprint "${data.name}"`
            }
          ]
        };
      }
    );

    // Tool 14: get_sprint
    server.tool(
      'get_sprint',
      'Get detailed sprint information with tasks and notes',
      {
        id: z.string()
      },
      async ({ id }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const { data, error } = await supabase
          .from('sprints')
          .select(`
            *,
            projects!inner (
              id,
              name
            ),
            tasks (*),
            sprint_notes (*)
          `)
          .eq('id', id)
          .single();
          
        if (error) throw error;
        if (!data) throw new Error('Sprint not found');
        
        const tasks = (data as any).tasks || [];
        const notes = (data as any).sprint_notes || [];
        const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
        const progress = tasks.length ? Math.round(completedTasks / tasks.length * 100) : 0;
        
        const tasksText = tasks.map((t: any) => `  • ${t.title} (${t.status || 'todo'})`).join('\n');
        const notesText = notes.map((n: any) => `  • ${n.title}`).join('\n');
        
        return {
          content: [
            {
              type: "text",
              text: `**${data.name}**\n\nProject: ${(data as any).projects.name}\nDescription: ${data.description || 'No description'}\nProgress: ${progress}% (${completedTasks}/${tasks.length} tasks)\n\n**Tasks:**\n${tasksText || '  No tasks'}\n\n**Notes:**\n${notesText || '  No notes'}`
            }
          ]
        };
      }
    );

    // Tool 15: update_sprint
    server.tool(
      'update_sprint',
      'Update sprint information',
      {
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        status: z.string().optional(),
        start_date: z.string().optional(),
        end_date: z.string().optional()
      },
      async ({ id, name, description, status, start_date, end_date }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (status !== undefined) updateData.status = status;
        if (start_date !== undefined) updateData.start_date = start_date;
        if (end_date !== undefined) updateData.end_date = end_date;
        
        const { data, error } = await supabase
          .from('sprints')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Updated sprint "${data.name}"`
            }
          ]
        };
      }
    );

    // Tool 16: delete_sprint
    server.tool(
      'delete_sprint',
      'Delete a sprint and all associated tasks',
      {
        id: z.string()
      },
      async ({ id }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const { error } = await supabase
          .from('sprints')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Deleted sprint and all associated tasks`
            }
          ]
        };
      }
    );

    // ====== TASK MANAGEMENT TOOLS ======
    
    // Tool 17: list_tasks
    server.tool(
      'list_tasks',
      'List tasks for a sprint with optional status filter',
      {
        sprint_id: z.string(),
        status: z.string().optional()
      },
      async ({ sprint_id, status }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        let query = supabase.from('tasks').select('*').eq('sprint_id', sprint_id);
        
        if (status) {
          query = query.eq('status', status);
        }
        
        query = query.order('priority', { ascending: false });
        
        const { data, error } = await query;
        if (error) throw error;
        
        const tasksText = data.map((t: any) => {
          const priority = t.priority ? ` [${t.priority}]` : '';
          const description = t.description ? `\n    ${t.description}` : '';
          return `• **${t.title}** (${t.status || 'todo'})${priority}${description}`;
        }).join('\n\n');
        
        const statusCounts = data.reduce((acc: any, t: any) => {
          const taskStatus = t.status || 'todo';
          acc[taskStatus] = (acc[taskStatus] || 0) + 1;
          return acc;
        }, {});
        
        const statusText = Object.entries(statusCounts)
          .map(([status, count]) => `${status}: ${count}`)
          .join(' | ');
        
        return {
          content: [
            {
              type: "text",
              text: `Found ${data.length} tasks (${statusText}):\n\n${tasksText || 'No tasks found'}`
            }
          ]
        };
      }
    );

    // Tool 18: create_task
    server.tool(
      'create_task',
      'Create a new task',
      {
        sprint_id: z.string(),
        title: z.string(),
        description: z.string().optional(),
        priority: z.string().default('medium')
      },
      async ({ sprint_id, title, description, priority }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const { data, error } = await supabase
          .from('tasks')
          .insert([{ sprint_id, title, description, priority }])
          .select()
          .single();
          
        if (error) throw error;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Created task "${data.title}"`
            }
          ]
        };
      }
    );

    // Tool 19: get_task
    server.tool(
      'get_task',
      'Get detailed task information with context',
      {
        id: z.string()
      },
      async ({ id }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const { data, error } = await supabase
          .from('tasks')
          .select(`
            *,
            sprints!inner (
              id,
              name,
              projects!inner (
                id,
                name
              )
            )
          `)
          .eq('id', id)
          .single();
          
        if (error) throw error;
        if (!data) throw new Error('Task not found');
        
        return {
          content: [
            {
              type: "text",
              text: `**${data.title}**\n\nProject: ${(data as any).sprints.projects.name}\nSprint: ${(data as any).sprints.name}\nStatus: ${data.status || 'todo'}\nPriority: ${data.priority || 'medium'}\nDescription: ${data.description || 'No description'}\nCreated: ${new Date(data.created_at).toLocaleDateString()}`
            }
          ]
        };
      }
    );

    // Tool 20: update_task
    server.tool(
      'update_task',
      'Update task information',
      {
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.string().optional(),
        priority: z.string().optional()
      },
      async ({ id, title, description, status, priority }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (status !== undefined) updateData.status = status;
        if (priority !== undefined) updateData.priority = priority;
        
        // Set completed_at if status changed to completed
        if (status === 'completed') {
          updateData.completed_at = new Date().toISOString();
        }
        
        // Clear completed_at if status changed away from completed
        if (status && status !== 'completed') {
          updateData.completed_at = null;
        }
        
        const { data, error } = await supabase
          .from('tasks')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Updated task "${data.title}"`
            }
          ]
        };
      }
    );

    // Tool 21: delete_task
    server.tool(
      'delete_task',
      'Delete a task',
      {
        id: z.string()
      },
      async ({ id }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Deleted task`
            }
          ]
        };
      }
    );

    // ====== SPRINT NOTES MANAGEMENT TOOLS ======
    
    // Tool 22: create_sprint_note
    server.tool(
      'create_sprint_note',
      'Add a note to a sprint',
      {
        sprint_id: z.string(),
        title: z.string(),
        content: z.string()
      },
      async ({ sprint_id, title, content }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const { data, error } = await supabase
          .from('sprint_notes')
          .insert([{
            sprint_id,
            title,
            content
          }])
          .select()
          .single();
          
        if (error) throw error;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Added note "${data.title}" to sprint`
            }
          ]
        };
      }
    );

    // Tool 23: update_sprint_note
    server.tool(
      'update_sprint_note',
      'Update a sprint note',
      {
        id: z.string(),
        title: z.string().optional(),
        content: z.string().optional()
      },
      async ({ id, title, content }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        
        const { data, error } = await supabase
          .from('sprint_notes')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Updated sprint note "${data.title}"`
            }
          ]
        };
      }
    );

    // Tool 24: delete_sprint_note
    server.tool(
      'delete_sprint_note',
      'Delete a sprint note',
      {
        id: z.string()
      },
      async ({ id }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const { error } = await supabase
          .from('sprint_notes')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Deleted sprint note`
            }
          ]
        };
      }
    );

    // ====== PERSON NOTES MANAGEMENT TOOLS ======
    
    // Tool 25: update_note
    server.tool(
      'update_note',
      'Update a person note',
      {
        id: z.string(),
        title: z.string().optional(),
        content: z.string().optional()
      },
      async ({ id, title, content }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        
        const { data, error } = await supabase
          .from('person_notes')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Updated person note "${data.title}"`
            }
          ]
        };
      }
    );

    // Tool 26: delete_note
    server.tool(
      'delete_note',
      'Delete a person note',
      {
        id: z.string()
      },
      async ({ id }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const { error } = await supabase
          .from('person_notes')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Deleted person note`
            }
          ]
        };
      }
    );

    // ====== MEMORY MANAGEMENT TOOLS ======
    
    // Tool 27: get_memory
    server.tool(
      'get_memory',
      'Get memory entries with optional filtering by tags',
      {
        limit: z.number().default(50),
        tags: z.array(z.string()).optional()
      },
      async ({ limit, tags }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        let query = supabase.from('memory').select('*');
        
        if (tags && Array.isArray(tags)) {
          query = query.overlaps('tags', tags);
        }
        
        query = query
          .order('created_at', { ascending: false })
          .limit(limit || 50);
          
        const { data, error } = await query;
        if (error) throw error;
        
        return {
          content: [
            {
              type: "text",
              text: data.length > 0 
                ? `Memory entries (${data.length}):\n\n${data.map((m: any) => 
                    `• **${m.title}**\n  ${m.content.substring(0, 200)}...${m.tags ? `\n  Tags: ${m.tags.join(', ')}` : ''}`
                  ).join('\n\n')}`
                : "No memory entries found"
            }
          ]
        };
      }
    );

    // Tool 28: create_memory
    server.tool(
      'create_memory',
      'Create a new memory entry',
      {
        title: z.string(),
        content: z.string(),
        tags: z.array(z.string()).optional()
      },
      async ({ title, content, tags }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const { data, error } = await supabase
          .from('memory')
          .insert([{
            title,
            content,
            tags: tags || null
          }])
          .select()
          .single();
          
        if (error) throw error;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Created memory "${data.title}"`
            }
          ]
        };
      }
    );

    // Tool 29: update_memory
    server.tool(
      'update_memory',
      'Update an existing memory entry',
      {
        id: z.string(),
        title: z.string().optional(),
        content: z.string().optional(),
        tags: z.array(z.string()).optional()
      },
      async ({ id, title, content, tags }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (tags !== undefined) updateData.tags = tags;
        
        const { data, error } = await supabase
          .from('memory')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Updated memory "${data.title}"`
            }
          ]
        };
      }
    );

    // Tool 30: delete_memory
    server.tool(
      'delete_memory',
      'Delete a memory entry',
      {
        id: z.string()
      },
      async ({ id }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const { error } = await supabase
          .from('memory')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Deleted memory`
            }
          ]
        };
      }
    );

    // Tool 31: get_custom_instructions
    server.tool(
      'get_custom_instructions',
      'Get complete custom instructions and system configuration',
      {},
      async () => {
        const { supabase } = await import('../../../lib/supabase');
        
        const { data: instructions, error: instructionsError } = await supabase
          .from('custom_instructions')
          .select('*')
          .single();
          
        if (instructionsError) throw instructionsError;

        const { data: marco, error: marcoError } = await supabase
          .from('people')
          .select('name, tldr')
          .eq('is_primary_user', true)
          .single();
          
        if (marcoError) throw marcoError;

        const { count: memoryCount, error: memoryError } = await supabase
          .from('memory')
          .select('*', { count: 'exact', head: true });
          
        if (memoryError) throw memoryError;
        
        return {
          content: [
            {
              type: "text",
              text: `**Custom Instructions:**\n\n**Primary User:** ${marco.name}\n**User TLDR:** ${marco.tldr || 'Not set'}\n\n**AI Behavior:**\n${instructions.behavior_description}\n\n**MCP Instructions:**\n${instructions.mcp_context_instructions}\n\n**Memory System:** ${memoryCount || 0} memories available`
            }
          ]
        };
      }
    );

    // Keep existing tools for backward compatibility
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

    server.tool(
      'get_overview',
      'Get Neural System overview',
      {},
      async () => {
        try {
          const { supabase } = await import('../../../lib/supabase');
          
          const { count: peopleCount } = await supabase
            .from('people')
            .select('*', { count: 'exact', head: true });
          
          const { count: projectsCount } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true });
          
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
                    `✅ **SUCCESS: Official @vercel/mcp-adapter with [transport] routing is working!**\n\n` +
                    `🔧 **Neural Tools Available:** 31 complete tools migrated successfully`
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