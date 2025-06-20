import { z } from 'zod';
import { createMcpHandler } from '@vercel/mcp-adapter';

const ENTITY_TYPES = ['person', 'project', 'sprint', 'task', 'memory', 'note'] as const;
const NOTE_PARENT_TYPES = ['person', 'project', 'sprint'] as const;

const handler = createMcpHandler(
  (server) => {
    // Tool 1: get_manifest - Complete system overview with all IDs
    server.tool(
      'get_manifest',
      'Get complete system overview with all entities, IDs, and metadata. Use this first to get all IDs for subsequent operations.',
      {},
      async () => {
        const { supabase } = await import('../../../lib/supabase');
        
        try {
          const [
            { data: customInstructions },
            { data: primaryUser },
            { data: allPeople },
            { data: allProjects },
            { data: allSprints },
            { data: allTasks },
            { data: allMemories },
            { count: notesCount }
          ] = await Promise.all([
            supabase.from('custom_instructions').select('*').single(),
            supabase.from('people').select('*').eq('is_primary_user', true).single(),
            supabase.from('people').select('id, name, slug, relation, tldr, is_primary_user, person_notes(count)').order('is_primary_user', { ascending: false }),
            supabase.from('projects').select('id, name, slug, tldr, is_default_project, is_protected, sprints(count), project_notes(count)'),
            supabase.from('sprints').select('id, name, slug, status, project_id, projects!inner(name), tasks(count), sprint_notes(count)'),
            supabase.from('tasks').select('id, title, status, priority, sprint_id, sprints!inner(name, project_id, projects!inner(name))'),
            supabase.from('memory').select('id, title, tags'),
            supabase.from('person_notes').select('*', { count: 'exact', head: true })
          ]);

          const manifest = {
            version: "2.0-minimal",
            timestamp: new Date().toISOString(),
            
            primary_user: {
              id: primaryUser?.id,
              name: primaryUser?.name || "Not set",
              tldr: primaryUser?.tldr || "No summary"
            },
            
            ai_config: {
              behavior: customInstructions?.behavior_description?.substring(0, 200) || "Not configured",
              mcp_instructions: customInstructions?.mcp_context_instructions || "Use get_manifest first, then operate directly with IDs"
            },
            
            stats: {
              people: allPeople?.length || 0,
              projects: allProjects?.length || 0,
              sprints: allSprints?.length || 0,
              tasks: allTasks?.length || 0,
              memories: allMemories?.length || 0,
              notes: notesCount || 0
            },
            
            entities: {
              people: (allPeople || []).map(p => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                relation: p.relation,
                tldr: p.tldr,
                is_primary: p.is_primary_user,
                notes_count: p.person_notes?.[0]?.count || 0
              })),
              
              projects: (allProjects || []).map(p => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                tldr: p.tldr,
                is_default: p.is_default_project,
                is_protected: p.is_protected,
                sprints_count: p.sprints?.[0]?.count || 0,
                notes_count: p.project_notes?.[0]?.count || 0
              })),
              
              sprints: (allSprints || []).map(s => ({
                id: s.id,
                name: s.name,
                slug: s.slug,
                status: s.status || 'active',
                project_id: s.project_id,
                project_name: s.projects.name,
                tasks_count: s.tasks?.[0]?.count || 0,
                notes_count: s.sprint_notes?.[0]?.count || 0
              })),
              
              tasks: (allTasks || []).map(t => ({
                id: t.id,
                title: t.title,
                status: t.status || 'todo',
                priority: t.priority,
                sprint_id: t.sprint_id,
                sprint_name: t.sprints.name,
                project_id: t.sprints.project_id,
                project_name: t.sprints.projects.name
              })),
              
              memories: (allMemories || []).map(m => ({
                id: m.id,
                title: m.title,
                tags: m.tags || []
              }))
            },
            
            protected: {
              people: (allPeople || []).filter(p => p.is_primary_user).map(p => p.name),
              projects: (allProjects || []).filter(p => p.is_protected).map(p => p.name)
            },
            
            defaults: {
              knowledge_project_id: (allProjects || []).find(p => p.is_default_project)?.id
            }
          };

          return {
            content: [{
              type: "json",
              data: manifest
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `❌ Error loading manifest: ${error instanceof Error ? error.message : String(error)}`
            }]
          };
        }
      }
    );

    // Tool 2: get - Universal get by entity type and ID
    server.tool(
      'get',
      'Get detailed information about any entity by type and ID. Always use IDs from get_manifest.',
      {
        entity_type: z.enum(ENTITY_TYPES),
        id: z.string()
      },
      async ({ entity_type, id }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        try {
          let data: any;
          let error: any;
          
          switch (entity_type) {
            case 'person':
              ({ data, error } = await supabase
                .from('people')
                .select('*, person_notes(*)')
                .eq('id', id)
                .single());
              break;
              
            case 'project':
              ({ data, error } = await supabase
                .from('projects')
                .select(`
                  *,
                  sprints(id, name, slug, status, tasks(count), sprint_notes(count)),
                  project_notes(*)
                `)
                .eq('id', id)
                .single());
              break;
              
            case 'sprint':
              ({ data, error } = await supabase
                .from('sprints')
                .select(`
                  *,
                  projects!inner(name),
                  tasks(*),
                  sprint_notes(*)
                `)
                .eq('id', id)
                .single());
              break;
              
            case 'task':
              ({ data, error } = await supabase
                .from('tasks')
                .select(`
                  *,
                  sprints!inner(name, projects!inner(name))
                `)
                .eq('id', id)
                .single());
              break;
              
            case 'memory':
              ({ data, error } = await supabase
                .from('memory')
                .select('*')
                .eq('id', id)
                .single());
              break;
              
            case 'note':
              for (const table of ['person_notes', 'project_notes', 'sprint_notes']) {
                const result = await supabase
                  .from(table)
                  .select('*')
                  .eq('id', id)
                  .single();
                  
                if (result.data) {
                  data = { ...result.data, note_type: table.replace('_notes', '') };
                  break;
                }
              }
              if (!data) error = { message: 'Note not found' };
              break;
          }
          
          if (error || !data) {
            return {
              content: [{
                type: 'text',
                text: `❌ ${entity_type} not found: No ${entity_type} with ID ${id}`
              }]
            };
          }
          
          return {
            content: [{
              type: "json",
              data: { entity_type, ...data }
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `❌ Error getting ${entity_type}: ${error instanceof Error ? error.message : String(error)}`
            }]
          };
        }
      }
    );

    // Tool 3: create - Universal create for any entity type
    server.tool(
      'create',
      'Create a new entity of any type. For notes, include parent_type and parent_id in data.',
      {
        entity_type: z.enum(ENTITY_TYPES),
        data: z.object({
          name: z.string().optional(),
          title: z.string().optional(),
          content: z.string().optional(),
          relation: z.string().optional(),
          tldr: z.string().optional(),
          slug: z.string().optional(),
          description: z.string().optional(),
          tags: z.array(z.string()).optional(),
          status: z.string().optional(),
          priority: z.enum(['low', 'medium', 'high']).optional(),
          parent_type: z.enum(NOTE_PARENT_TYPES).optional(),
          parent_id: z.string().optional(),
          project_id: z.string().optional(),
          sprint_id: z.string().optional()
        })
      },
      async ({ entity_type, data }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        try {
          let result: any;
          let error: any;
          
          switch (entity_type) {
            case 'person':
              ({ data: result, error } = await supabase
                .from('people')
                .insert([{
                  name: data.name,
                  relation: data.relation,
                  tldr: data.tldr,
                  slug: data.slug
                }])
                .select()
                .single());
              break;
              
            case 'project':
              ({ data: result, error } = await supabase
                .from('projects')
                .insert([{
                  name: data.name,
                  tldr: data.tldr,
                  slug: data.slug
                }])
                .select()
                .single());
              break;
              
            case 'sprint':
              ({ data: result, error } = await supabase
                .from('sprints')
                .insert([{
                  project_id: data.project_id,
                  name: data.name,
                  tldr: data.tldr,
                  slug: data.slug,
                  status: data.status
                }])
                .select()
                .single());
              break;
              
            case 'task':
              const priorityMap = { low: 1, medium: 3, high: 5 };
              ({ data: result, error } = await supabase
                .from('tasks')
                .insert([{
                  sprint_id: data.sprint_id,
                  title: data.title,
                  description: data.description,
                  priority: data.priority ? priorityMap[data.priority] : 3,
                  status: data.status
                }])
                .select()
                .single());
              break;
              
            case 'memory':
              ({ data: result, error } = await supabase
                .from('memory')
                .insert([{
                  title: data.title,
                  content: data.content,
                  tags: data.tags || []
                }])
                .select()
                .single());
              break;
              
            case 'note':
              if (!data.parent_type || !data.parent_id) {
                return {
                  content: [{
                    type: 'text',
                    text: '❌ Invalid parameters: Notes require parent_type and parent_id'
                  }]
                };
              }
              
              const table = `${data.parent_type}_notes`;
              ({ data: result, error } = await supabase
                .from(table)
                .insert([{
                  [`${data.parent_type}_id`]: data.parent_id,
                  title: data.title,
                  content: data.content,
                  tags: data.tags || []
                }])
                .select()
                .single());
              break;
          }
          
          if (error) {
            if (error.code === '23505') {
              return {
                content: [{
                  type: 'text',
                  text: `❌ Duplicate entry: ${entity_type} with this name or slug already exists`
                }]
              };
            }
            throw error;
          }
          
          return {
            content: [{
              type: 'text',
              text: `✅ Created ${entity_type}: ${result.name || result.title || 'Success'} (ID: ${result.id})`
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `❌ Error creating ${entity_type}: ${error instanceof Error ? error.message : String(error)}`
            }]
          };
        }
      }
    );

    // Tool 4: update - Universal update for any entity type
    server.tool(
      'update',
      'Update any entity by type and ID. Only include fields to update in data.',
      {
        entity_type: z.enum(ENTITY_TYPES),
        id: z.string(),
        data: z.object({
          name: z.string().optional(),
          title: z.string().optional(),
          content: z.string().optional(),
          relation: z.string().optional(),
          tldr: z.string().optional(),
          slug: z.string().optional(),
          description: z.string().optional(),
          tags: z.array(z.string()).optional(),
          status: z.string().optional(),
          priority: z.enum(['low', 'medium', 'high']).optional()
        })
      },
      async ({ entity_type, id, data }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        try {
          let table: string;
          let updateData: any = {};
          
          switch (entity_type) {
            case 'person':
              table = 'people';
              if (data.name !== undefined) updateData.name = data.name;
              if (data.relation !== undefined) updateData.relation = data.relation;
              if (data.tldr !== undefined) updateData.tldr = data.tldr;
              if (data.slug !== undefined) updateData.slug = data.slug;
              break;
              
            case 'project':
              table = 'projects';
              if (data.name !== undefined) updateData.name = data.name;
              if (data.tldr !== undefined) updateData.tldr = data.tldr;
              if (data.slug !== undefined) updateData.slug = data.slug;
              break;
              
            case 'sprint':
              table = 'sprints';
              if (data.name !== undefined) updateData.name = data.name;
              if (data.tldr !== undefined) updateData.tldr = data.tldr;
              if (data.slug !== undefined) updateData.slug = data.slug;
              if (data.status !== undefined) updateData.status = data.status;
              break;
              
            case 'task':
              table = 'tasks';
              if (data.title !== undefined) updateData.title = data.title;
              if (data.description !== undefined) updateData.description = data.description;
              if (data.status !== undefined) {
                updateData.status = data.status;
                if (data.status === 'completed') {
                  updateData.completed_at = new Date().toISOString();
                } else {
                  updateData.completed_at = null;
                }
              }
              if (data.priority !== undefined) {
                const priorityMap = { low: 1, medium: 3, high: 5 };
                updateData.priority = priorityMap[data.priority];
              }
              break;
              
            case 'memory':
              table = 'memory';
              if (data.title !== undefined) updateData.title = data.title;
              if (data.content !== undefined) updateData.content = data.content;
              if (data.tags !== undefined) updateData.tags = data.tags;
              break;
              
            case 'note':
              for (const noteTable of ['person_notes', 'project_notes', 'sprint_notes']) {
                const check = await supabase
                  .from(noteTable)
                  .select('id')
                  .eq('id', id)
                  .single();
                  
                if (check.data) {
                  table = noteTable;
                  break;
                }
              }
              if (!table!) {
                return {
                  content: [{
                    type: 'text',
                    text: `❌ Note not found: No note with ID ${id}`
                  }]
                };
              }
              if (data.title !== undefined) updateData.title = data.title;
              if (data.content !== undefined) updateData.content = data.content;
              if (data.tags !== undefined) updateData.tags = data.tags;
              break;
              
            default:
              return {
                content: [{
                  type: 'text',
                  text: `❌ Invalid entity type: ${entity_type}`
                }]
              };
          }
          
          const { data: result, error } = await supabase
            .from(table!)
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
            
          if (error) {
            if (error.code === '23505') {
              return {
                content: [{
                  type: 'text',
                  text: '❌ Duplicate entry: Name or slug already exists'
                }]
              };
            }
            throw error;
          }
          
          return {
            content: [{
              type: 'text',
              text: `✅ Updated ${entity_type}: ${result.name || result.title || 'Success'}`
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `❌ Error updating ${entity_type}: ${error instanceof Error ? error.message : String(error)}`
            }]
          };
        }
      }
    );

    // Tool 5: delete - Universal delete for any entity type
    server.tool(
      'delete',
      'Delete any entity by type and ID. Checks for protected entities.',
      {
        entity_type: z.enum(ENTITY_TYPES),
        id: z.string()
      },
      async ({ entity_type, id }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        try {
          let table: string;
          let name: string = 'Unknown';
          
          switch (entity_type) {
            case 'person':
              table = 'people';
              const { data: person } = await supabase
                .from(table)
                .select('name, is_primary_user')
                .eq('id', id)
                .single();
                
              if (person?.is_primary_user) {
                return {
                  content: [{
                    type: 'text',
                    text: `⚠️ Cannot delete: Primary user "${person.name}" is protected`
                  }]
                };
              }
              name = person?.name || name;
              break;
              
            case 'project':
              table = 'projects';
              const { data: project } = await supabase
                .from(table)
                .select('name, is_protected')
                .eq('id', id)
                .single();
                
              if (project?.is_protected) {
                return {
                  content: [{
                    type: 'text',
                    text: `⚠️ Cannot delete: Project "${project.name}" is protected`
                  }]
                };
              }
              name = project?.name || name;
              break;
              
            case 'sprint':
              table = 'sprints';
              const { data: sprint } = await supabase
                .from(table)
                .select('name')
                .eq('id', id)
                .single();
              name = sprint?.name || name;
              break;
              
            case 'task':
              table = 'tasks';
              const { data: task } = await supabase
                .from(table)
                .select('title')
                .eq('id', id)
                .single();
              name = task?.title || name;
              break;
              
            case 'memory':
              table = 'memory';
              const { data: memory } = await supabase
                .from(table)
                .select('title')
                .eq('id', id)
                .single();
              name = memory?.title || name;
              break;
              
            case 'note':
              for (const noteTable of ['person_notes', 'project_notes', 'sprint_notes']) {
                const check = await supabase
                  .from(noteTable)
                  .select('title')
                  .eq('id', id)
                  .single();
                  
                if (check.data) {
                  table = noteTable;
                  name = check.data.title || name;
                  break;
                }
              }
              if (!table!) {
                return {
                  content: [{
                    type: 'text',
                    text: `❌ Note not found: No note with ID ${id}`
                  }]
                };
              }
              break;
              
            default:
              return {
                content: [{
                  type: 'text',
                  text: `❌ Invalid entity type: ${entity_type}`
                }]
              };
          }
          
          const { error } = await supabase
            .from(table!)
            .delete()
            .eq('id', id);
            
          if (error) throw error;
          
          const cascadeInfo = entity_type === 'project' ? ' (all sprints, tasks and notes deleted)' :
                            entity_type === 'sprint' ? ' (all tasks and notes deleted)' : '';
          
          return {
            content: [{
              type: 'text',
              text: `✅ Deleted ${entity_type}: ${name}${cascadeInfo}`
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `❌ Error deleting ${entity_type}: ${error instanceof Error ? error.message : String(error)}`
            }]
          };
        }
      }
    );

    // Tool 6: search - Universal search across entities
    server.tool(
      'search',
      'Search for entities by content, tags, or filters. Returns matching items with previews.',
      {
        query: z.string().optional(),
        tags: z.array(z.string()).optional(),
        entity_type: z.enum(['all', 'note', 'memory', 'task']).default('all'),
        filters: z.object({
          status: z.string().optional(),
          priority: z.enum(['low', 'medium', 'high']).optional(),
          project_id: z.string().optional(),
          sprint_id: z.string().optional()
        }).optional(),
        limit: z.number().default(20)
      },
      async ({ query, tags, entity_type, filters, limit }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const results = [];
        
        if ((entity_type === 'all' || entity_type === 'memory') && (query || tags)) {
          let q = supabase.from('memory').select('*');
          if (query) q = q.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
          if (tags?.length) q = q.overlaps('tags', tags);
          const { data } = await q.limit(limit);
          results.push(...(data || []).map(item => ({
            type: 'memory',
            id: item.id,
            title: item.title,
            tags: item.tags,
            preview: item.content?.substring(0, 150) + '...'
          })));
        }
        
        if ((entity_type === 'all' || entity_type === 'note') && (query || tags)) {
          for (const table of ['person_notes', 'project_notes', 'sprint_notes']) {
            let q = supabase.from(table).select('*');
            if (query) q = q.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
            if (tags?.length) q = q.overlaps('tags', tags);
            const { data } = await q.limit(limit);
            results.push(...(data || []).map(item => ({
              type: `${table.replace('_notes', '')}_note`,
              id: item.id,
              title: item.title,
              tags: item.tags,
              preview: item.content?.substring(0, 150) + '...'
            })));
          }
        }
        
        if ((entity_type === 'all' || entity_type === 'task') && (query || filters)) {
          let q = supabase.from('tasks').select('*, sprints!inner(name, project_id)');
          if (query) q = q.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
          if (filters?.status) q = q.eq('status', filters.status);
          if (filters?.priority) {
            const priorityMap = { low: 1, medium: 3, high: 5 };
            q = q.eq('priority', priorityMap[filters.priority]);
          }
          if (filters?.project_id) q = q.eq('sprints.project_id', filters.project_id);
          if (filters?.sprint_id) q = q.eq('sprint_id', filters.sprint_id);
          const { data } = await q.limit(limit);
          results.push(...(data || []).map(item => ({
            type: 'task',
            id: item.id,
            title: item.title,
            status: item.status,
            sprint_name: item.sprints.name,
            preview: item.description?.substring(0, 150) || 'No description'
          })));
        }
        
        results.sort((a, b) => a.title.localeCompare(b.title));
        const limitedResults = results.slice(0, limit);
        
        return {
          content: [{
            type: 'text',
            text: limitedResults.length === 0 
              ? 'No results found'
              : `Found ${limitedResults.length} results:\n\n${limitedResults.map(r => 
                  `• [${r.type}] ${r.title}\n  ID: ${r.id}\n  ${r.tags ? `Tags: ${r.tags.join(', ')}\n  ` : ''}Preview: ${r.preview}`
                ).join('\n\n')}`
          }]
        };
      }
    );

    // Tool 7: list_tasks - Essential for complex task filtering
    server.tool(
      'list_tasks',
      'List tasks with advanced filters. Use when manifest data is not enough.',
      {
        project_id: z.string().optional(),
        sprint_id: z.string().optional(),
        status: z.string().optional(),
        priority: z.enum(['low', 'medium', 'high']).optional(),
        limit: z.number().default(50)
      },
      async ({ project_id, sprint_id, status, priority, limit }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        let query = supabase
          .from('tasks')
          .select(`
            *,
            sprints!inner(
              name,
              project_id,
              projects!inner(name)
            )
          `);
          
        if (sprint_id) query = query.eq('sprint_id', sprint_id);
        if (project_id) query = query.eq('sprints.project_id', project_id);
        if (status) query = query.eq('status', status);
        if (priority) {
          const priorityMap = { low: 1, medium: 3, high: 5 };
          query = query.eq('priority', priorityMap[priority]);
        }
        
        query = query.limit(limit).order('created_at', { ascending: false });
        
        const { data, error } = await query;
        if (error) throw error;
        
        const tasks = (data || []).map(t => {
          const priorityMap: any = { 1: 'low', 3: 'medium', 5: 'high' };
          return {
            id: t.id,
            title: t.title,
            status: t.status || 'todo',
            priority: priorityMap[t.priority] || 'medium',
            project: t.sprints.projects.name,
            sprint: t.sprints.name
          };
        });
        
        return {
          content: [{
            type: 'json',
            data: { tasks, count: tasks.length }
          }]
        };
      }
    );

    // Tool 8: create_knowledge_note - Convenience shortcut
    server.tool(
      'create_knowledge_note',
      'Quick way to add a note to the default Knowledge project',
      {
        title: z.string(),
        content: z.string(),
        tags: z.array(z.string()).optional()
      },
      async ({ title, content, tags }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const { data: defaultProject } = await supabase
          .from('projects')
          .select('id, name')
          .eq('is_default_project', true)
          .single();
          
        if (!defaultProject) {
          return {
            content: [{
              type: 'text',
              text: '❌ Default project not found: Knowledge project is not configured'
            }]
          };
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
            type: 'text',
            text: `✅ Created knowledge note: ${title} in ${defaultProject.name}`
          }]
        };
      }
    );

    // Tool 9: update_instructions - Update AI behavior
    server.tool(
      'update_instructions',
      'Update AI behavior description and MCP usage instructions',
      {
        behavior_description: z.string().optional(),
        mcp_context_instructions: z.string().optional()
      },
      async ({ behavior_description, mcp_context_instructions }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        const { data: primaryUser } = await supabase
          .from('people')
          .select('id')
          .eq('is_primary_user', true)
          .single();
          
        if (!primaryUser) {
          return {
            content: [{
              type: 'text',
              text: '❌ Primary user not found: Cannot update instructions without a primary user'
            }]
          };
        }
        
        const updateData: any = { updated_at: new Date().toISOString() };
        if (behavior_description !== undefined) updateData.behavior_description = behavior_description;
        if (mcp_context_instructions !== undefined) updateData.mcp_context_instructions = mcp_context_instructions;
        
        const { error } = await supabase
          .from('custom_instructions')
          .update(updateData)
          .eq('user_id', primaryUser.id);
          
        if (error) throw error;
        
        return {
          content: [{
            type: 'text',
            text: '✅ Updated AI instructions successfully'
          }]
        };
      }
    );

    // Tool 10: navigate - Hierarchical navigation
    server.tool(
      'navigate',
      'Navigate between related entities. Get children or parent relationships.',
      {
        from_type: z.enum(['project', 'sprint', 'person']),
        from_id: z.string(),
        to_type: z.enum(['sprints', 'tasks', 'notes', 'parent'])
      },
      async ({ from_type, from_id, to_type }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        try {
          let results: any[] = [];
          
          if (from_type === 'project' && to_type === 'sprints') {
            const { data } = await supabase
              .from('sprints')
              .select('id, name, slug, status, tasks(count), sprint_notes(count)')
              .eq('project_id', from_id)
              .order('created_at', { ascending: false });
            results = data || [];
            
          } else if (from_type === 'sprint' && to_type === 'tasks') {
            const { data } = await supabase
              .from('tasks')
              .select('id, title, status, priority, description')
              .eq('sprint_id', from_id)
              .order('created_at', { ascending: false });
            results = data || [];
            
          } else if (from_type === 'sprint' && to_type === 'parent') {
            const { data } = await supabase
              .from('sprints')
              .select('project_id, projects!inner(id, name, slug)')
              .eq('id', from_id)
              .single();
            if (data) results = [data.projects];
            
          } else if (to_type === 'notes') {
            const table = `${from_type}_notes`;
            const { data } = await supabase
              .from(table)
              .select('id, title, tags, created_at')
              .eq(`${from_type}_id`, from_id)
              .order('created_at', { ascending: false });
            results = data || [];
            
          } else {
            return {
              content: [{
                type: 'text',
                text: `❌ Invalid navigation: Cannot navigate from ${from_type} to ${to_type}`
              }]
            };
          }
          
          return {
            content: [{
              type: 'json',
              data: {
                from: { type: from_type, id: from_id },
                to: { type: to_type, count: results.length },
                results
              }
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `❌ Navigation error: ${error instanceof Error ? error.message : String(error)}`
            }]
          };
        }
      }
    );
  },
  {},
  { basePath: '/api' }
);

export { handler as GET, handler as POST, handler as DELETE };