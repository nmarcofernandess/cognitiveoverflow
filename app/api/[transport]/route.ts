import { z } from 'zod';
import { createMcpHandler } from '@vercel/mcp-adapter';

const ENTITY_TYPES = ['person', 'project', 'sprint', 'task', 'memory', 'note'] as const;
const NOTE_PARENT_TYPES = ['person', 'project', 'sprint'] as const;

// 🔧 MCP Utils - Centralized helpers
const PRIORITY_MAP = { low: 1, medium: 3, high: 5 } as const;
const PRIORITY_REVERSE_MAP = { 1: 'low', 3: 'medium', 5: 'high' } as const;

function formatSupabaseError(error: any): string {
  if (!error) return 'Unknown error';
  
  // Check if it's a standard Error instance
  if (error instanceof Error) {
    return error.message;
  }
  
  // Handle Supabase error objects
  if (typeof error === 'object') {
    // Try common Supabase error properties
    if (error.message) return error.message;
    if (error.error_description) return error.error_description;
    if (error.details) return error.details;
    if (error.hint) return error.hint;
    
    // Try to stringify the object properly
    try {
      return JSON.stringify(error);
    } catch {
      return 'Complex error object';
    }
  }
  
  // Fallback to string conversion
  return String(error);
}

function isDuplicateError(error: any): boolean {
  return error?.code === '23505' || 
         error?.message?.includes('duplicate') ||
         error?.message?.includes('unique_violation');
}

function safeCount(countObj: any): number {
  return countObj?.[0]?.count || 0;
}

function isValidUUID(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  
  // Trim whitespace and normalize
  const cleanStr = str.trim().toLowerCase();
  
  // More flexible UUID regex - accepts standard UUIDs
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  
  return uuidRegex.test(cleanStr);
}

const handler = createMcpHandler(
  (server) => {
    // Tool 1: get_manifest - Complete system overview with all IDs
    server.tool(
      'get_manifest',
      '[readOnly] Retrieve full manifest of the system: people, projects, sprints, tasks, memories and notes (IDs, counts, metadata). MUST be called first so the AI discovers available IDs for later operations.',
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
            supabase.from('people').select('id, name, relation, tldr, is_primary_user, person_notes(count)').order('is_primary_user', { ascending: false }),
            supabase.from('projects').select('id, name, tldr, is_default_project, is_protected, sprints(count), project_notes(count)'),
            supabase.from('sprints').select('id, name, status, project_id, projects!inner(name), tasks(count), sprint_notes(count)'),
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
              people: (allPeople || []).map((p: any) => ({
                id: p.id,
                name: p.name,
                relation: p.relation,
                tldr: p.tldr,
                is_primary: p.is_primary_user,
                notes_count: safeCount(p.person_notes)
              })),
              
              projects: (allProjects || []).map((p: any) => ({
                id: p.id,
                name: p.name,
                tldr: p.tldr,
                is_default: p.is_default_project,
                is_protected: p.is_protected,
                sprints_count: safeCount(p.sprints),
                notes_count: safeCount(p.project_notes)
              })),
              
              sprints: (allSprints || []).map((s: any) => ({
                id: s.id,
                name: s.name,
                status: s.status || 'active',
                project_id: s.project_id,
                project_name: s.projects.name,
                tasks_count: safeCount(s.tasks),
                notes_count: safeCount(s.sprint_notes)
              })),
              
              tasks: (allTasks || []).map((t: any) => ({
                id: t.id,
                title: t.title,
                status: t.status || 'todo',
                priority: t.priority,
                sprint_id: t.sprint_id,
                sprint_name: t.sprints.name,
                project_id: t.sprints.project_id,
                project_name: t.sprints.projects.name
              })),
              
              memories: (allMemories || []).map((m: any) => ({
                id: m.id,
                title: m.title,
                tags: m.tags || []
              }))
            },
            
            protected: {
              people: (allPeople || []).filter((p: any) => p.is_primary_user).map((p: any) => p.name),
              projects: (allProjects || []).filter((p: any) => p.is_protected).map((p: any) => p.name)
            },
            
            defaults: {
              knowledge_project_id: (allProjects || []).find((p: any) => p.is_default_project)?.id
            }
          };

          return {
            content: [{
              type: "text",
              text: `**Neural System Manifest v${manifest.version}**\n\n` +
                    `Generated: ${manifest.timestamp}\n\n` +
                    `**System Overview:**\n` +
                    `• People: ${manifest.stats.people}\n` +
                    `• Projects: ${manifest.stats.projects}\n` +
                    `• Sprints: ${manifest.stats.sprints}\n` +
                    `• Tasks: ${manifest.stats.tasks}\n` +
                    `• Memories: ${manifest.stats.memories}\n` +
                    `• Notes: ${manifest.stats.notes}\n\n` +
                    `**Entities Available:**\n` +
                    JSON.stringify(manifest, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `❌ Error loading manifest: ${formatSupabaseError(error)}`
            }]
          };
        }
      }
    );

    // Tool 2: get - Universal get by entity type and ID(s)
    server.tool(
      'get',
      '[readOnly] Fetch entity(s) by type and ID(s) (from manifest). Single ID returns detailed object, array of IDs returns bulk results. Returns all fields plus related notes, sprints or project context.',
      {
        entity_type: z.enum(ENTITY_TYPES),
        id: z.union([z.string(), z.array(z.string())])
      },
      async ({ entity_type, id }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        try {
          const isBulk = Array.isArray(id);
          const ids = isBulk ? id : [id];
          
          // Validate UUIDs and separate valid from invalid
          const validIds = ids.filter(isValidUUID);
          const invalidIds = ids.filter(id => !isValidUUID(id));
          
          let data: any;
          let error: any;
          
          // If no valid IDs, return early
          if (validIds.length === 0) {
            return {
              content: [{
                type: 'text',
                text: `❌ Invalid IDs: All provided IDs have invalid UUID format: ${invalidIds.join(', ')}`
              }]
            };
          }
          
          switch (entity_type) {
            case 'person':
              ({ data, error } = await supabase
                .from('people')
                .select('*, person_notes(*)')
                .in('id', validIds));
              break;
              
            case 'project':
              ({ data, error } = await supabase
                .from('projects')
                .select(`
                  *,
                  sprints(id, name, status, tasks(count), sprint_notes(count)),
                  project_notes(*)
                `)
                .in('id', validIds));
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
                .in('id', validIds));
              break;
              
            case 'task':
              ({ data, error } = await supabase
                .from('tasks')
                .select(`
                  *,
                  sprints!inner(name, projects!inner(name))
                `)
                .in('id', validIds));
              break;
              
            case 'memory':
              ({ data, error } = await supabase
                .from('memory')
                .select('*')
                .in('id', validIds));
              break;
              
            case 'note':
              data = [];
              for (const table of ['person_notes', 'project_notes', 'sprint_notes']) {
                const result = await supabase
                  .from(table)
                  .select('*')
                  .in('id', validIds);
                  
                if (result.data && result.data.length > 0) {
                  const notesWithType = result.data.map(note => ({ 
                    ...note, 
                    note_type: table.replace('_notes', '') 
                  }));
                  data.push(...notesWithType);
                }
              }
              if (data.length === 0) error = { message: 'No notes found' };
              break;
          }
          
          if (error) {
            const notFoundIds = isBulk ? id : [id];
            return {
              content: [{
                type: 'text',
                text: `❌ Error: ${formatSupabaseError(error)}`
              }]
            };
          }
          
          if (!data) {
            const notFoundIds = isBulk ? id : [id];
            return {
              content: [{
                type: 'text',
                text: `❌ ${entity_type} not found: No ${entity_type}${isBulk ? 's' : ''} with ID${isBulk ? 's' : ''} ${notFoundIds.join(', ')}`
              }]
            };
          }
          
          // Ensure data is array for bulk operations
          if (!Array.isArray(data)) {
            data = [data];
          }
          
          // For bulk operations, handle empty results differently
          if (isBulk && data.length === 0) {
            return {
              content: [{
                type: 'text',
                text: `❌ ${entity_type} not found: No ${entity_type}s found with IDs: ${ids.join(', ')}`
              }]
            };
          }
          
          // Handle single vs bulk response
          if (!isBulk) {
            const singleResult = Array.isArray(data) ? data[0] : data;
            if (!singleResult) {
              return {
                content: [{
                  type: 'text',
                  text: `❌ ${entity_type} not found: No ${entity_type} with ID ${id}`
                }]
              };
            }
            return {
              content: [{
                type: "text",
                text: `**${entity_type.toUpperCase()} Details:**\n\n` +
                      JSON.stringify({ entity_type, ...singleResult }, null, 2)
              }]
            };
          } else {
            // Bulk response - check for partial results
            const foundIds = data.map((item: any) => item.id);
            const missingValidIds = validIds.filter(reqId => !foundIds.includes(reqId));
            
            let responseText = `✅ Found ${data.length}/${ids.length} ${entity_type}${data.length !== 1 ? 's' : ''}:\n\n`;
            
            // Add summary for each found item
            data.forEach((item: any, index: number) => {
              const name = item.name || item.title || 'Unnamed';
              responseText += `${index + 1}. **${name}** (${item.id})\n`;
              if (item.person_notes?.length) responseText += `   - ${item.person_notes.length} notes\n`;
              if (item.sprints?.length) responseText += `   - ${item.sprints.length} sprints\n`;
              if (item.tasks?.length) responseText += `   - ${item.tasks.length} tasks\n`;
              if (item.project_notes?.length) responseText += `   - ${item.project_notes.length} project notes\n`;
              if (item.sprint_notes?.length) responseText += `   - ${item.sprint_notes.length} sprint notes\n`;
              if (item.tags?.length) responseText += `   - Tags: ${item.tags.join(', ')}\n`;
            });
            
            // Report missing valid IDs
            if (missingValidIds.length > 0) {
              responseText += `\n⚠️ Not found (valid UUIDs): ${missingValidIds.join(', ')}`;
            }
            
            // Report invalid IDs  
            if (invalidIds.length > 0) {
              responseText += `\n❌ Invalid UUID format: ${invalidIds.join(', ')}`;
            }
            
            return {
              content: [{
                type: "text",
                text: responseText
              }]
            };
          }
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
      '[idempotent] Create a new entity (person, project, sprint, task, memory or note). Notes require `parent_type` and `parent_id`.',
      {
        entity_type: z.enum(ENTITY_TYPES),
        data: z.object({
          name: z.string().optional(),
          title: z.string().optional(),
          content: z.string().optional(),
          relation: z.string().optional(),
          tldr: z.string().optional(),
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
                  tldr: data.tldr
                }])
                .select()
                .single());
              break;
              
            case 'project':
              ({ data: result, error } = await supabase
                .from('projects')
                .insert([{
                  name: data.name,
                  tldr: data.tldr
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
                  status: data.status
                }])
                .select()
                .single());
              break;
              
            case 'task':
              ({ data: result, error } = await supabase
                .from('tasks')
                .insert([{
                  sprint_id: data.sprint_id,
                  title: data.title,
                  description: data.description,
                  priority: data.priority ? PRIORITY_MAP[data.priority] : 3,
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
            if (isDuplicateError(error)) {
              return {
                content: [{
                  type: 'text',
                  text: `❌ Duplicate entry: ${entity_type} with this name already exists`
                }]
              };
            }
            return {
              content: [{
                type: 'text',
                text: `❌ Error creating ${entity_type}: ${formatSupabaseError(error)}`
              }]
            };
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
              text: `❌ Error creating ${entity_type}: ${formatSupabaseError(error)}`
            }]
          };
        }
      }
    );

    // Tool 4: update - Universal update for any entity type
    server.tool(
      'update',
      '[idempotent] Update an existing entity by ID. Supply only the fields to change (e.g. title, status, tags).',
      {
        entity_type: z.enum(ENTITY_TYPES),
        id: z.string(),
        data: z.object({
          name: z.string().optional(),
          title: z.string().optional(),
          content: z.string().optional(),
          relation: z.string().optional(),
          tldr: z.string().optional(),
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
              break;
              
            case 'project':
              table = 'projects';
              if (data.name !== undefined) updateData.name = data.name;
              if (data.tldr !== undefined) updateData.tldr = data.tldr;
              break;
              
            case 'sprint':
              table = 'sprints';
              if (data.name !== undefined) updateData.name = data.name;
              if (data.tldr !== undefined) updateData.tldr = data.tldr;
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
                updateData.priority = PRIORITY_MAP[data.priority];
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
            if (isDuplicateError(error)) {
              return {
                content: [{
                  type: 'text',
                  text: '❌ Duplicate entry: Name already exists'
                }]
              };
            }
            return {
              content: [{
                type: 'text',
                text: `❌ Error updating ${entity_type}: ${formatSupabaseError(error)}`
              }]
            };
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
              text: `❌ Error updating ${entity_type}: ${formatSupabaseError(error)}`
            }]
          };
        }
      }
    );

    // Tool 5: delete - Universal delete for any entity type
    server.tool(
      'delete',
      '[destructive] Permanently delete entity(s) by ID(s) (people, projects, sprints, tasks, memories, notes). Protected items (primary user, default project) are blocked. Supports bulk deletion with array of IDs.',
      {
        entity_type: z.enum(ENTITY_TYPES),
        id: z.union([z.string(), z.array(z.string())])
      },
      async ({ entity_type, id }) => {
        const { supabase } = await import('../../../lib/supabase');
        
        try {
          const isBulk = Array.isArray(id);
          const ids = isBulk ? id : [id];
          
          // Validate UUIDs and separate valid from invalid (improved version)
          const validIds = ids.filter(isValidUUID);
          const invalidIds = ids.filter(id => !isValidUUID(id));
          
          // If no valid IDs, return early
          if (validIds.length === 0) {
            return {
              content: [{
                type: 'text',
                text: `❌ Invalid IDs: All provided IDs have invalid UUID format: ${invalidIds.join(', ')}`
              }]
            };
          }
          
          let table: string;
          const deletedItems: string[] = [];
          const protectedItems: string[] = [];
          const failedItems: string[] = [];
          
          // Pre-validation for protected items
          if (entity_type === 'person') {
            table = 'people';
            const { data: people } = await supabase
              .from(table)
              .select('id, name, is_primary_user')
              .in('id', validIds);
              
            if (people) {
              for (const person of people) {
                if (person.is_primary_user) {
                  protectedItems.push(`${person.name} (primary user)`);
                } else {
                  deletedItems.push(person.name || person.id);
                }
              }
            }
          } else if (entity_type === 'project') {
            table = 'projects';
            const { data: projects } = await supabase
              .from(table)
              .select('id, name, is_protected')
              .in('id', validIds);
              
            if (projects) {
              for (const project of projects) {
                if (project.is_protected) {
                  protectedItems.push(`${project.name} (protected)`);
                } else {
                  deletedItems.push(project.name || project.id);
                }
              }
            }
          } else {
            // For other entity types, get names/titles for better feedback
            switch (entity_type) {
              case 'sprint':
                table = 'sprints';
                const { data: sprints } = await supabase
                  .from(table)
                  .select('id, name')
                  .in('id', validIds);
                if (sprints) deletedItems.push(...sprints.map(s => s.name || s.id));
                break;
                
              case 'task':
                table = 'tasks';
                const { data: tasks } = await supabase
                  .from(table)
                  .select('id, title')
                  .in('id', validIds);
                if (tasks) deletedItems.push(...tasks.map(t => t.title || t.id));
                break;
                
              case 'memory':
                table = 'memory';
                const { data: memories } = await supabase
                  .from(table)
                  .select('id, title')
                  .in('id', validIds);
                if (memories) deletedItems.push(...memories.map(m => m.title || m.id));
                break;
                
              case 'note':
                const noteResults: any[] = [];
                for (const noteTable of ['person_notes', 'project_notes', 'sprint_notes']) {
                  const result = await supabase
                    .from(noteTable)
                    .select('id, title')
                    .in('id', validIds);
                    
                  if (result.data && result.data.length > 0) {
                    table = noteTable; // Use last found table for deletion
                    noteResults.push(...result.data);
                  }
                }
                if (noteResults.length > 0) {
                  deletedItems.push(...noteResults.map(n => n.title || n.id));
                } else if (!isBulk) {
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
          }
          
          // If all items are protected, return early
          if (protectedItems.length > 0 && deletedItems.length === 0) {
            let responseText = `⚠️ Cannot delete protected ${entity_type}${protectedItems.length > 1 ? 's' : ''}: ${protectedItems.join(', ')}`;
            
            // Still report invalid IDs even when everything is protected
            if (invalidIds.length > 0) {
              responseText += `\n❌ Invalid UUID format: ${invalidIds.join(', ')}`;
            }
            
            return {
              content: [{
                type: 'text',
                text: responseText
              }]
            };
          }
          
          // Perform deletion for non-protected items
          if (deletedItems.length > 0) {
            const allowedIds = validIds.filter(reqId => {
              // Filter out protected item IDs  
              if (entity_type === 'person') {
                return !protectedItems.some(item => item.includes('primary user'));
              } else if (entity_type === 'project') {
                return !protectedItems.some(item => item.includes('protected'));
              }
              return true;
            });
            
            if (entity_type === 'note') {
              // Handle note deletion across multiple tables
              let deletedCount = 0;
              for (const noteTable of ['person_notes', 'project_notes', 'sprint_notes']) {
                const { error } = await supabase
                  .from(noteTable)
                  .delete()
                  .in('id', allowedIds);
                  
                if (!error) {
                  // Count would require separate query, so we'll estimate based on success
                  deletedCount += allowedIds.length;
                }
              }
            } else {
              const { error } = await supabase
                .from(table!)
                .delete()
                .in('id', allowedIds);
                
              if (error) {
                return {
                  content: [{
                    type: 'text',
                    text: `❌ Error deleting ${entity_type}: ${formatSupabaseError(error)}`
                  }]
                };
              }
            }
          }
          
          // Build response message
          let responseText = '';
          const cascadeInfo = entity_type === 'project' ? ' (all sprints, tasks and notes deleted)' :
                            entity_type === 'sprint' ? ' (all tasks and notes deleted)' : '';
          
          if (deletedItems.length > 0) {
            responseText = `✅ Deleted ${deletedItems.length} ${entity_type}${deletedItems.length > 1 ? 's' : ''}`;
            if (!isBulk || deletedItems.length <= 3) {
              responseText += `: ${deletedItems.join(', ')}`;
            }
            responseText += cascadeInfo;
          }
          
          if (protectedItems.length > 0) {
            if (responseText) responseText += '\n';
            responseText += `⚠️ Skipped ${protectedItems.length} protected ${entity_type}${protectedItems.length > 1 ? 's' : ''}: ${protectedItems.join(', ')}`;
          }
          
          if (!responseText) {
            responseText = `❌ No ${entity_type}s found to delete with provided ID${isBulk ? 's' : ''}: ${validIds.join(', ')}`;
          }
          
          // Report invalid IDs if any
          if (invalidIds.length > 0) {
            if (responseText) responseText += '\n';
            responseText += `❌ Invalid UUID format: ${invalidIds.join(', ')}`;
          }
          
          return {
            content: [{
              type: 'text',
              text: responseText
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
      '[readOnly] Search memories, notes and tasks by text query or tags, with optional status/priority filters. Returns up to `limit` previews.',
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
        
        const results: any[] = [];
        
        if ((entity_type === 'all' || entity_type === 'memory') && (query || tags)) {
          let q = supabase.from('memory').select('*');
          if (query) q = q.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
          if (tags?.length) q = q.overlaps('tags', tags);
          const { data } = await q.limit(limit);
          results.push(...(data || []).map((item: any) => ({
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
            results.push(...(data || []).map((item: any) => ({
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
            q = q.eq('priority', PRIORITY_MAP[filters.priority]);
          }
          if (filters?.project_id) q = q.eq('sprints.project_id', filters.project_id);
          if (filters?.sprint_id) q = q.eq('sprint_id', filters.sprint_id);
          const { data } = await q.limit(limit);
          results.push(...(data || []).map((item: any) => ({
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
              : `Found ${limitedResults.length} results:\n\n${limitedResults.map((r: any) => 
                  `• [${r.type}] ${r.title}\n  ID: ${r.id}\n  ${r.tags ? `Tags: ${r.tags.join(', ')}\n  ` : ''}Preview: ${r.preview}`
                ).join('\n\n')}`
          }]
        };
      }
    );

    // Tool 7: list_tasks - Essential for complex task filtering
    server.tool(
      'list_tasks',
      '[readOnly] List tasks across projects or sprints with optional `status`, `priority` or `limit`. Includes project & sprint names.',
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
        if (project_id) {
          // More robust project filtering - use filter instead of eq for nested fields
          query = query.filter('sprints.project_id', 'eq', project_id);
        }
        if (status) query = query.eq('status', status);
        if (priority) {
          query = query.eq('priority', PRIORITY_MAP[priority]);
        }
        
        query = query.limit(limit).order('created_at', { ascending: false });
        
        const { data, error } = await query;
        if (error) {
          return {
            content: [{
              type: 'text',
              text: `❌ Error listing tasks: ${formatSupabaseError(error)}`
            }]
          };
        }
        
        const tasks = (data || []).map((t: any) => {
          return {
            id: t.id,
            title: t.title,
            status: t.status || 'todo',
            priority: PRIORITY_REVERSE_MAP[t.priority as keyof typeof PRIORITY_REVERSE_MAP] || 'medium',
            project: t.sprints.projects.name,
            sprint: t.sprints.name
          };
        });
        
        return {
          content: [{
            type: 'text',
            text: `**Found ${tasks.length} tasks:**\n\n` +
                  JSON.stringify({ tasks, count: tasks.length }, null, 2)
          }]
        };
      }
    );

    // Tool 8: create_knowledge_note - Convenience shortcut
    server.tool(
      'create_knowledge_note',
      '[idempotent] Shortcut: create a new note directly in the default "Knowledge" project (title, content, tags).',
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
          
        if (error) {
          return {
            content: [{
              type: 'text',
              text: `❌ Error creating knowledge note: ${formatSupabaseError(error)}`
            }]
          };
        }
        
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
      '[idempotent] Modify the AI\'s persona and MCP usage guidance stored in `custom_instructions` (behavior_description, mcp_context_instructions).',
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
          
        if (error) {
          return {
            content: [{
              type: 'text',
              text: `❌ Error updating instructions: ${formatSupabaseError(error)}`
            }]
          };
        }
        
        return {
          content: [{
            type: 'text',
            text: '✅ Updated AI instructions successfully'
          }]
        };
      }
    );

    // Tool 10: get_related_entities - Hierarchical navigation
    server.tool(
      'get_related_entities',
      '[readOnly] Fetch related items: project → sprints, sprint → tasks or parent project, any → notes.',
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
              .select('id, name, status, tasks(count), sprint_notes(count)')
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
              .select('project_id, projects!inner(id, name)')
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
              type: 'text',
              text: `**Navigation: ${from_type} → ${to_type}**\n\n` +
                    `Found ${results.length} items:\n\n` +
                    JSON.stringify({
                      from: { type: from_type, id: from_id },
                      to: { type: to_type, count: results.length },
                      results
                    }, null, 2)
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `❌ Navigation error: ${formatSupabaseError(error)}`
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