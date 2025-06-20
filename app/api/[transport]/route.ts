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
              text: `**${data.name}**\n\nRelationship: ${data.relation}\nTLDR: ${data.tldr || 'No summary'}\n\nNotes: ${(data as any).person_notes?.length || 0} notes available`
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
        tldr: z.string().optional()
      },
      async ({ name, relation, tldr }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const { data, error } = await supabase
          .from('people')
          .insert([{ name, relation, tldr }])
          .select()
          .single();
          
        if (error) throw error;
        
        // 🛡️ ARRAY SAFETY - Supabase single() still returns in array context
        const row = data;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Person #${row.id} (${name}) added as ${relation}`
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
        tldr: z.string().optional()
      },
      async ({ id, name, relation, tldr }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (relation !== undefined) updateData.relation = relation;
        if (tldr !== undefined) updateData.tldr = tldr;
        
        const { data, error } = await supabase
          .from('people')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        
        // 🛡️ ARRAY SAFETY
        const row = data;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Person #${row.id} information updated successfully`
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
              text: `✅ Removed person from Marco\'s network`
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
        
        // 🛡️ ARRAY SAFETY
        const row = data;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Note #${row.id} "${title}" added to person`
            }
          ]
        };
      }
    );

    // ====== PROJECT MANAGEMENT TOOLS ======
    
    // Tool 7: get_project
    server.tool(
      'get_project',
      'Get detailed project information with all sprints and tasks',
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
              tldr,
              status,
              tasks(count),
              sprint_notes(count)
            ),
            project_notes (
              id,
              title,
              content,
              tags,
              created_at
            )
          `)
          .eq('id', id)
          .single();
          
        if (error) throw error;
        if (!data) throw new Error('Project not found');
        
        const sprints = (data as any).sprints || [];
        const projectNotes = (data as any).project_notes || [];
        
        const sprintsText = sprints.map((s: any) => {
          const taskCount = s.tasks?.[0]?.count || 0;
          const noteCount = s.sprint_notes?.[0]?.count || 0;
          return `  • **${s.name}** (${s.status || 'active'})\n    TLDR: ${s.tldr || 'No description'}\n    Tasks: ${taskCount} | Notes: ${noteCount}`;
        }).join('\n\n');
        
        const projectNotesText = projectNotes.map((n: any) => `  • ${n.title}`).join('\n');
        
        const totalTasks = sprints.reduce((sum: number, s: any) => sum + (s.tasks?.[0]?.count || 0), 0);
        
        return {
          content: [
            {
              type: "text",
              text: `**${data.name}**\n\nTLDR: ${data.tldr || 'No summary'}\nTotal Sprints: ${sprints.length} | Total Tasks: ${totalTasks}\nProject Notes: ${projectNotes.length}\n\n**Sprints:**\n${sprintsText || '  No sprints'}\n\n**Project Notes:**\n${projectNotesText || '  No notes'}`
            }
          ]
        };
      }
    );

    // Tool 8: create_project
    server.tool(
      'create_project',
      'Create a new project',
      {
        name: z.string(),
        tldr: z.string().optional()
      },
      async ({ name, tldr }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const { data, error } = await supabase
          .from('projects')
          .insert([{ name, tldr }])
          .select()
          .single();
          
        if (error) throw error;
        
        // 🛡️ ARRAY SAFETY
        const row = data;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Project #${row.id} "${name}" created successfully`
            }
          ]
        };
      }
    );

    // Tool 9: update_project
    server.tool(
      'update_project',
      'Update project information',
      {
        id: z.string(),
        name: z.string().optional(),
        tldr: z.string().optional()
      },
      async ({ id, name, tldr }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (tldr !== undefined) updateData.tldr = tldr;
        
        const { data, error } = await supabase
          .from('projects')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        
        // 🛡️ ARRAY SAFETY
        const row = data;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Project #${row.id} information updated successfully`
            }
          ]
        };
      }
    );

    // Tool 10: delete_project
    server.tool(
      'delete_project',
      'Delete a project and all associated data',
      {
        id: z.string()
      },
      async ({ id }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        // ✅ VERIFICAR SE É PROTEGIDO
        const { data: project } = await supabase
          .from('projects')
          .select('name, is_protected')
          .eq('id', id)
          .single();
          
        if (project?.is_protected) {
          throw new Error(`Cannot delete protected project "${project.name}"`);
        }
        
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

    // Tool 11: create_sprint
    server.tool(
      'create_sprint',
      'Create a new sprint',
      {
        project_id: z.string(),
        name: z.string(),
        tldr: z.string().optional()
      },
      async ({ project_id, name, tldr }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const { data, error } = await supabase
          .from('sprints')
          .insert([{ project_id, name, tldr }])
          .select()
          .single();
          
        if (error) throw error;
        
        // 🛡️ ARRAY SAFETY
        const row = data;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Sprint #${row.id} "${name}" created successfully`
            }
          ]
        };
      }
    );

    // Tool 12: get_sprint
    server.tool(
      'get_sprint',
      'Get detailed sprint information with all tasks and notes',
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
              text: `**${data.name}**\n\nProject: ${(data as any).projects.name}\nTLDR: ${data.tldr || 'No summary'}\nProgress: ${progress}% (${completedTasks}/${tasks.length} tasks)\n\n**Tasks:**\n${tasksText || '  No tasks'}\n\n**Notes:**\n${notesText || '  No notes'}`
            }
          ]
        };
      }
    );

    // Tool 13: update_sprint
    server.tool(
      'update_sprint',
      'Update sprint information',
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
          .from('sprints')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        
        // 🛡️ ARRAY SAFETY
        const row = data;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Sprint #${row.id} information updated successfully`
            }
          ]
        };
      }
    );

    // Tool 14: delete_sprint
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

    // Tool 15: create_task
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
        
        // Convert string priority to number (compatible with Supabase)
        const priorityMap: { [key: string]: number } = {
          'low': 1,
          'medium': 3,
          'high': 5
        };
        const numericPriority = priorityMap[priority] || 3;
        
        const { data, error } = await supabase
          .from('tasks')
          .insert([{ sprint_id, title, description, priority: numericPriority }])
          .select()
          .single();
          
        if (error) throw error;
        
        // 🛡️ ARRAY SAFETY
        const row = data;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Task #${row.id} "${title}" created successfully`
            }
          ]
        };
      }
    );

    // Tool 16: get_task
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

    // Tool 17: update_task
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
        if (priority !== undefined) {
          // Convert string priority to number (compatible with Supabase)
          const priorityMap: { [key: string]: number } = {
            'low': 1,
            'medium': 3,
            'high': 5
          };
          updateData.priority = priorityMap[priority] || 3;
        }
        
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
        
        // 🛡️ ARRAY SAFETY
        const row = data;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Task #${row.id} information updated successfully`
            }
          ]
        };
      }
    );

    // Tool 18: delete_task
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

    // ====== NOTES MANAGEMENT TOOLS ======
    
    // Tool 19: update_note
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
        
        // 🛡️ ARRAY SAFETY
        const row = data;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Person note #${row.id} updated successfully`
            }
          ]
        };
      }
    );

    // Tool 20: delete_note
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

    // Tool 21: create_sprint_note
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
        
        // 🛡️ ARRAY SAFETY
        const row = data;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Sprint note #${row.id} "${title}" added successfully`
            }
          ]
        };
      }
    );

    // Tool 22: update_sprint_note
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
        
        // 🛡️ ARRAY SAFETY
        const row = data;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Sprint note #${row.id} updated successfully`
            }
          ]
        };
      }
    );

    // Tool 23: delete_sprint_note
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

    // ====== PROJECT NOTES MANAGEMENT TOOLS ======
    
    // Tool 24: create_project_note
    server.tool(
      'create_project_note',
      'Add a note directly to a project',
      {
        project_id: z.string(),
        title: z.string(),
        content: z.string(),
        tags: z.array(z.string()).optional()
      },
      async ({ project_id, title, content, tags }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const { data, error } = await supabase
          .from('project_notes')
          .insert([{
            project_id,
            title,
            content,
            tags: tags || []
          }])
          .select()
          .single();
          
        if (error) throw error;
        
        return {
          content: [{
            type: "text",
            text: `✅ Project note #${data.id} "${title}" added successfully`
          }]
        };
      }
    );

    // Tool 25: update_project_note
    server.tool(
      'update_project_note',
      'Update a project note',
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
          .from('project_notes')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        
        return {
          content: [{
            type: "text",
            text: `✅ Project note #${data.id} updated successfully`
          }]
        };
      }
    );

    // Tool 26: delete_project_note
    server.tool(
      'delete_project_note',
      'Delete a project note',
      {
        id: z.string()
      },
      async ({ id }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const { error } = await supabase
          .from('project_notes')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        return {
          content: [{
            type: "text",
            text: `✅ Deleted project note successfully`
          }]
        };
      }
    );

    // Tool 27: create_knowledge_note
    server.tool(
      'create_knowledge_note',
      'Add a note to the default Knowledge project (convenience tool)',
      {
        title: z.string(),
        content: z.string(),
        tags: z.array(z.string()).optional()
      },
      async ({ title, content, tags }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        // Buscar o projeto padrão
        const { data: defaultProject } = await supabase
          .from('projects')
          .select('id')
          .eq('is_default_project', true)
          .single();
          
        if (!defaultProject) {
          throw new Error('Default project not found');
        }
        
        const { data, error } = await supabase
          .from('project_notes')
          .insert([{
            project_id: defaultProject.id,
            title,
            content,
            tags: tags || []
          }])
          .select()
          .single();
          
        if (error) throw error;
        
        return {
          content: [{
            type: "text",
            text: `✅ Knowledge note #${data.id} "${title}" added to Conhecimento Geral`
          }]
        };
      }
    );

    // ====== MEMORY MANAGEMENT TOOLS ======
    
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
        
        // 🛡️ ARRAY SAFETY
        const row = data;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Memory #${row.id} "${title}" created successfully`
            }
          ]
        };
      }
    );

    // Tool 25: update_memory
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
        
        // 🛡️ ARRAY SAFETY
        const row = data;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Memory #${row.id} information updated successfully`
            }
          ]
        };
      }
    );

    // Tool 26: delete_memory
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

    // ====== SEARCH & DISCOVERY TOOLS ======

    // 🚀 UNIVERSAL Tool 27: search_by_tags
    server.tool(
      'search_by_tags',
      'Search entities by tags with advanced filtering',
      {
        include: z.string(), // "ai,productivity" - tags que DEVEM aparecer
        exclude: z.string().optional(), // "deprecated,old" - tags que NÃO podem aparecer
        entity: z.enum(['memory', 'person_note', 'sprint_note']).optional(), // filtrar por tipo
        parent_id: z.string().optional(), // person_id, sprint_id para filtrar contexto
        mode: z.enum(['meta', 'detail']).default('meta') // meta = só id+title, detail = id+title+preview
      },
      async ({ include, exclude, entity, parent_id, mode }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const includeArr = include.split(',').map(tag => tag.trim()).filter(Boolean);
        const excludeArr = exclude ? exclude.split(',').map(tag => tag.trim()).filter(Boolean) : [];
        
        // 🚀 PARALLEL QUERIES para melhor performance
        const promises = [];
        
        // Query memories (se não filtrou por entity ou se entity = memory)
        if (!entity || entity === 'memory') {
          let q = supabase.from('memory').select('id, title, tags, content, created_at')
            .overlaps('tags', includeArr);
          if (excludeArr.length > 0) q = q.not('tags', 'overlaps', excludeArr);
          promises.push(q.then(({ data }) => ({ type: 'memory', data: data || [] })));
        } else {
          promises.push(Promise.resolve({ type: 'memory', data: [] }));
        }
        
        // Query person_notes (se não filtrou por entity ou se entity = person_note)
        if (!entity || entity === 'person_note') {
          let q = supabase.from('person_notes').select('id, title, tags, content, created_at, person_id, people(name)')
            .overlaps('tags', includeArr);
          if (excludeArr.length > 0) q = q.not('tags', 'overlaps', excludeArr);
          if (parent_id) q = q.eq('person_id', parent_id);
          promises.push(q.then(({ data }) => ({ type: 'person_note', data: data || [] })));
        } else {
          promises.push(Promise.resolve({ type: 'person_note', data: [] }));
        }
        
        // Query sprint_notes (se não filtrou por entity ou se entity = sprint_note)
        if (!entity || entity === 'sprint_note') {
          let q = supabase.from('sprint_notes').select('id, title, tags, content, created_at, sprint_id, sprints(name)')
            .overlaps('tags', includeArr);
          if (excludeArr.length > 0) q = q.not('tags', 'overlaps', excludeArr);
          if (parent_id) q = q.eq('sprint_id', parent_id);
          promises.push(q.then(({ data }) => ({ type: 'sprint_note', data: data || [] })));
        } else {
          promises.push(Promise.resolve({ type: 'sprint_note', data: [] }));
        }
        
        // 🔥 Executar todas as queries em paralelo
        const [memoryResult, personNotesResult, sprintNotesResult] = await Promise.all(promises);
        
        let results = [];
        
        // Processar memories
        results.push(...memoryResult.data.map((item: any) => ({
          type: 'memory',
          id: item.id,
          title: item.title,
          tags: item.tags,
          created_at: item.created_at,
          ...(mode === 'detail' && { preview: item.content.substring(0, 120) + '...' })
        })));
        
        // Processar person_notes
        results.push(...personNotesResult.data.map((item: any) => ({
          type: 'person_note' as const,
          id: item.id,
          title: item.title,
          tags: item.tags,
          parent_name: item.people?.name || 'Unknown Person',
          parent_id: item.person_id,
          created_at: item.created_at,
          ...(mode === 'detail' && { preview: item.content.substring(0, 120) + '...' })
        })));
        
        // Processar sprint_notes
        results.push(...sprintNotesResult.data.map((item: any) => ({
          type: 'sprint_note' as const,
          id: item.id,
          title: item.title,
          tags: item.tags,
          parent_name: item.sprints?.name || 'Unknown Sprint',
          parent_id: item.sprint_id,
          created_at: item.created_at,
          ...(mode === 'detail' && { preview: item.content.substring(0, 120) + '...' })
        })));
        
        // Ordenar por mais recente (created_at)
        results.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        // 🛡️ Proteção contra resultado vazio
        if (results.length === 0) {
          return {
            content: [{
              type: "text",
              text: `No items found with tags [${includeArr.join(', ')}]${excludeArr.length ? ` excluding [${excludeArr.join(', ')}]` : ''}${entity ? ` in ${entity}` : ''}.`
            }]
          };
        }
        
        return {
          content: [{
            type: "text",
            text: `Found ${results.length} items with tags [${includeArr.join(', ')}]${excludeArr.length ? ` excluding [${excludeArr.join(', ')}]` : ''}:\n\n${
              results.map((item: any) => {
                const parentInfo = item.parent_name ? ` (${item.parent_name})` : '';
                const preview = mode === 'detail' && item.preview ? `\n  Preview: ${item.preview}` : '';
                return `• **${item.title}** [${item.type}]${parentInfo}\n  ID: ${item.id}\n  Tags: ${item.tags?.join(', ') || 'None'}${preview}`;
              }).join('\n\n')
            }`
          }]
        };
      }
    );

    // 🎯 UNIVERSAL Tool 28: bulk_get
    server.tool(
      'bulk_get',
      'Fetch multiple entities of the same type by IDs or get all of a type',
      {
        entity: z.enum(['memory', 'person_note', 'sprint_note']),
        ids: z.array(z.string()).optional() // Se não fornecer IDs, retorna todos da entidade
      },
      async ({ entity, ids }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const tableMap = {
          memory: 'memory',
          person_note: 'person_notes', 
          sprint_note: 'sprint_notes'
        };
        
        const table = tableMap[entity];
        let query = supabase.from(table).select('*');
        
        if (ids && ids.length > 0) {
          // 🛡️ Buscar IDs específicos (máximo 100 para evitar overflow do Postgres)
          const safeIds = ids.slice(0, 100);
          query = query.in('id', safeIds);
        } else {
          // Buscar todos (ordenados por mais recente)
          query = query.order('created_at', { ascending: false });
        }
        
        const { data, error } = await query;
        if (error) throw error;
        
        // 🛡️ Proteção contra resultado vazio
        if (!data || data.length === 0) {
          return {
            content: [{
              type: "text",
              text: `No ${entity.replace('_', ' ')} found.`
            }]
          };
        }
        
        // 🚀 Formatação estruturada para melhor handling pelo Claude
        const items = data.map((item: any) => {
          const baseItem = {
            id: item.id,
            title: item.title,
            content: item.content,
            tags: item.tags || [],
            created_at: item.created_at
          };
          
          if (entity === 'person_note') {
            return { ...baseItem, person_id: item.person_id };
          } else if (entity === 'sprint_note') {
            return { ...baseItem, sprint_id: item.sprint_id };
          }
          
          return baseItem;
        });
        
        return {
          content: [{
            type: "text",
            text: `Found ${data.length} ${entity.replace('_', ' ')}(s):\n\n${
              items.map((item: any) => {
                const parentId = item.person_id ? `\n  Person ID: ${item.person_id}` : 
                                item.sprint_id ? `\n  Sprint ID: ${item.sprint_id}` : '';
                return `• **${item.title}** [ID: ${item.id}]${parentId}\n  Tags: ${item.tags?.join(', ') || 'None'}\n  Content: ${item.content}\n  Created: ${item.created_at}`;
              }).join('\n\n')
            }`
          }]
        };
      }
    );

    // 🚀 TURBINADO Tool 29: get_manifest 
    server.tool(
      'get_manifest',
      'Get complete Neural System manifest with content index for direct navigation',
      {},
      async () => {
        const { supabase } = await import('../../../lib/supabase');
        
        try {
          // Parallel queries for maximum performance
          const [
            { data: customInstructions },
            { data: primaryUser },
            { count: peopleCount },
            { count: projectsCount },
            { count: sprintsCount },
            { count: tasksCount },
            { count: memoriesCount },
            { count: notesCount },
            
            // 🔥 NOVO: Content indices for direct navigation
            { data: allPeople },
            { data: allProjects },
            { data: allSprints },
            { data: allTasks },
            { data: allMemories },
            { data: allNotes }
          ] = await Promise.all([
            // Metadata queries
            supabase.from('custom_instructions').select('*').single(),
            supabase.from('people').select('name, tldr').eq('is_primary_user', true).single(),
            supabase.from('people').select('*', { count: 'exact', head: true }),
            supabase.from('projects').select('*', { count: 'exact', head: true }),
            supabase.from('sprints').select('*', { count: 'exact', head: true }),
            supabase.from('tasks').select('*', { count: 'exact', head: true }),
            supabase.from('memory').select('*', { count: 'exact', head: true }),
            supabase.from('person_notes').select('*', { count: 'exact', head: true }),
            
            // 🔥 Content indices (metadata only for navigation)
            supabase.from('people').select(`
              id, name, relation,
              person_notes(count)
            `).order('is_primary_user', { ascending: false }).order('created_at', { ascending: false }),
            
            supabase.from('projects').select(`
              id, name,
              sprints(count),
              tasks:sprints(tasks(count))
            `).order('created_at', { ascending: false }),
            
            supabase.from('sprints').select(`
              id, name,
              projects!inner(name),
              tasks(count),
              sprint_notes(count)
            `).order('created_at', { ascending: false }),
            
            supabase.from('tasks').select(`
              id, title, status,
              sprints!inner(name, projects!inner(name))
            `).order('created_at', { ascending: false }),
            
            supabase.from('memory').select('id, title, tags').order('created_at', { ascending: false }),
            
            supabase.from('person_notes').select(`
              id, title,
              people!inner(name)
            `).order('created_at', { ascending: false })
          ]);

          // Process content indices
          const peopleIndex = (allPeople || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            relation: p.relation,
            notes_count: p.person_notes?.[0]?.count || 0
          }));

          const projectsIndex = (allProjects || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            sprints_count: p.sprints?.[0]?.count || 0,
            tasks_total: p.tasks?.reduce((sum: number, s: any) => sum + (s.tasks?.[0]?.count || 0), 0) || 0
          }));

          const sprintsIndex = (allSprints || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            project_name: s.projects?.name || 'Unknown',
            tasks_count: s.tasks?.[0]?.count || 0,
            notes_count: s.sprint_notes?.[0]?.count || 0
          }));

          const tasksIndex = (allTasks || []).map((t: any) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            project_name: t.sprints?.projects?.name || 'Unknown',
            sprint_name: t.sprints?.name || 'Unknown'
          }));

          const memoriesIndex = (allMemories || []).map((m: any) => ({
            id: m.id,
            title: m.title,
            tags: m.tags || []
          }));

          const notesIndex = (allNotes || []).map((n: any) => ({
            id: n.id,
            title: n.title,
            parent_type: 'person' as const,
            parent_name: n.people?.name || 'Unknown'
          }));

          const manifest = {
            // System metadata
            version: "2.0",
            last_sync: new Date().toISOString(),
            
            // AI configuration
            ai_config: {
              primary_user: primaryUser?.name || "Marco Fernandes",
              persona: customInstructions?.behavior_description || "CEO DietFlow, rebelde intelectual",
              memory_count: memoriesCount || 0
            },
            
            // MCP instructions
            mcp_instructions: customInstructions?.mcp_context_instructions || "Sistema de conhecimento pessoal Neural",
            
            // System statistics
            stats: {
              people_count: peopleCount || 0,
              projects_count: projectsCount || 0,
              sprints_count: sprintsCount || 0,
              tasks_count: tasksCount || 0,
              notes_count: notesCount || 0,
              memories_count: memoriesCount || 0
            },
            
            // 🔥 CONTENT INDEX for direct navigation
            content_index: {
              all_people: peopleIndex,
              all_projects: projectsIndex,
              all_sprints: sprintsIndex,
              all_tasks: tasksIndex,
              all_memories: memoriesIndex,
              all_notes: notesIndex
            }
          };

          // Format for optimal AI consumption
          const peopleText = peopleIndex.slice(0, 10).map(p => `• ${p.name} (${p.relation}) - ${p.notes_count} notes [ID: ${p.id}]`).join('\n');
          const projectsText = projectsIndex.slice(0, 10).map(p => `• ${p.name} - ${p.sprints_count} sprints, ${p.tasks_total} tasks [ID: ${p.id}]`).join('\n');
          const sprintsText = sprintsIndex.slice(0, 10).map(s => `• ${s.name} (${s.project_name}) - ${s.tasks_count} tasks, ${s.notes_count} notes [ID: ${s.id}]`).join('\n');
          const tasksText = tasksIndex.slice(0, 10).map(t => `• ${t.title} (${t.status}) - ${t.project_name}/${t.sprint_name} [ID: ${t.id}]`).join('\n');
          const memoriesText = memoriesIndex.slice(0, 10).map(m => `• ${m.title} ${m.tags.length > 0 ? `[${m.tags.join(', ')}]` : ''} [ID: ${m.id}]`).join('\n');

          return {
            content: [{
              type: "text",
              text: `**🧠 NEURAL SYSTEM MANIFEST v2.0**\n\n` +
                    `**🎯 AI Configuration:**\n` +
                    `• Primary User: ${manifest.ai_config.primary_user}\n` +
                    `• User TL;DR: ${primaryUser?.tldr || 'Not set'}\n` +
                    `• AI Persona: ${manifest.ai_config.persona.substring(0, 200)}...\n` +
                    `• Memory Count: ${manifest.ai_config.memory_count}\n\n` +
                    `**⚙️ MCP Instructions:**\n${manifest.mcp_instructions}\n\n` +
                    `**📊 System Statistics:**\n` +
                    `• People: ${manifest.stats.people_count}\n` +
                    `• Projects: ${manifest.stats.projects_count}\n` +
                    `• Sprints: ${manifest.stats.sprints_count}\n` +
                    `• Tasks: ${manifest.stats.tasks_count}\n` +
                    `• Notes: ${manifest.stats.notes_count}\n` +
                    `• Memories: ${manifest.stats.memories_count}\n\n` +
                    `**🔍 CONTENT INDEX (Direct Navigation):**\n\n` +
                    `**👥 People (${peopleIndex.length}):**\n${peopleText || '  No people found'}\n\n` +
                    `**📊 Projects (${projectsIndex.length}):**\n${projectsText || '  No projects found'}\n\n` +
                    `**🏃‍♂️ Sprints (${sprintsIndex.length}):**\n${sprintsText || '  No sprints found'}\n\n` +
                    `**✅ Tasks (${tasksIndex.length}):**\n${tasksText || '  No tasks found'}\n\n` +
                    `**🧠 Memories (${memoriesIndex.length}):**\n${memoriesText || '  No memories found'}\n\n` +
                    `**💡 Navigation Tips:**\n` +
                    `• Use get_person(id), get_project(id), get_sprint(id), get_task(id) for details\n` +
                    `• Use search_by_tags({ include: "tag1,tag2" }) for universal search across memories, person notes, and sprint notes\n` +
                    `• All IDs are provided for direct access without listing\n\n` +
                    `**🕐 Last Sync:** ${manifest.last_sync}`
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `❌ Error loading Neural System manifest: ${error instanceof Error ? error.message : String(error)}`
            }]
          };
        }
      }
    );

    // Tool 30: update_custom_instructions
    server.tool(
      'update_custom_instructions',
      'Update AI behavior and MCP context instructions',
      {
        behavior_description: z.string().optional(),
        mcp_context_instructions: z.string().optional()
      },
      async ({ behavior_description, mcp_context_instructions }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const updateData: any = {};
        if (behavior_description !== undefined) updateData.behavior_description = behavior_description;
        if (mcp_context_instructions !== undefined) updateData.mcp_context_instructions = mcp_context_instructions;
        
        updateData.updated_at = new Date().toISOString();
        
        const { error } = await supabase
          .from('custom_instructions')
          .update(updateData)
          .eq('user_id', '48ff8f29-3bee-4aa0-83ae-927ff8dde816'); // Marco's ID
          
        if (error) throw error;
        
        return {
          content: [
            {
              type: "text",
              text: `✅ Updated Neural System instructions`
            }
          ]
        };
      }
    );
  },
  {},
  { basePath: '/api' },
);

export { handler as GET, handler as POST, handler as DELETE };