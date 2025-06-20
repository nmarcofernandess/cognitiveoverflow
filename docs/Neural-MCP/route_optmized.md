import { z } from 'zod';
import { createMcpHandler } from '@vercel/mcp-adapter';

const identifierSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  slug: z.string().optional()
}).refine(data => data.id || data.name || data.slug, {
  message: "At least one identifier (id, name, or slug) is required"
});

async function resolveEntityId(
  table: string,
  identifier: { id?: string; name?: string; slug?: string },
  parentField?: string,
  parentValue?: string
): Promise<string | null> {
  const { supabase } = await import('../../../../lib/supabase');
  
  if (identifier.id) {
    const { data } = await supabase.from(table).select('id').eq('id', identifier.id).single();
    return data?.id || null;
  }
  
  let query = supabase.from(table).select('id');
  
  if (identifier.slug) {
    query = query.eq('slug', identifier.slug);
  } else if (identifier.name) {
    query = query.eq('name', identifier.name);
  } else {
    return null;
  }
  
  if (parentField && parentValue) {
    query = query.eq(parentField, parentValue);
  }
  
  const { data } = await query.single();
  return data?.id || null;
}

function formatError(type: string, details: string, suggestions?: string[]): any {
  const suggestionText = suggestions?.length ? `\nSuggestions: ${suggestions.join(', ')}` : '';
  return {
    content: [{
      type: "text",
      text: `❌ ${type}: ${details}${suggestionText}`
    }]
  };
}

function formatSuccess(action: string, entity: string, details?: string): any {
  return {
    content: [{
      type: "text",
      text: `✅ ${action} ${entity}${details ? `: ${details}` : ''}`
    }]
  };
}

function formatWarning(action: string, details: string): any {
  return {
    content: [{
      type: "text",
      text: `⚠️ ${action}: ${details}`
    }]
  };
}

const handler = createMcpHandler(
  (server) => {
    // ====== PEOPLE MANAGEMENT ======
    
    server.tool(
      'list_people',
      'List people in the network with filters and pagination',
      {
        relation: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
        mode: z.enum(['meta', 'full']).default('meta')
      },
      async ({ relation, search, limit, offset, mode }) => {
        const { supabase } = await import('../../../../lib/supabase');
        
        let query = supabase.from('people').select('*, person_notes(count)', { count: 'exact' });
        
        if (relation) query = query.eq('relation', relation);
        if (search) query = query.ilike('name', `%${search}%`);
        
        query = query.range(offset, offset + limit - 1).order('is_primary_user', { ascending: false }).order('name');
        
        const { data, error, count } = await query;
        if (error) throw error;
        
        const people = data || [];
        const hasMore = (count || 0) > offset + limit;
        
        if (mode === 'meta') {
          const text = people.map(p => 
            `• ${p.name} (${p.relation})${p.is_primary_user ? ' [PRIMARY]' : ''} - ${p.person_notes?.[0]?.count || 0} notes`
          ).join('\n');
          
          return {
            content: [{
              type: "text",
              text: `Found ${count} people${search ? ` matching "${search}"` : ''}${relation ? ` in ${relation}` : ''}:\n\n${text}${hasMore ? `\n\n(Showing ${offset + 1}-${offset + people.length} of ${count})` : ''}`
            }]
          };
        }
        
        const details = people.map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          relation: p.relation,
          tldr: p.tldr,
          is_primary_user: p.is_primary_user,
          notes_count: p.person_notes?.[0]?.count || 0
        }));
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ people: details, total: count, has_more: hasMore }, null, 2)
          }]
        };
      }
    );

    server.tool(
      'get_person',
      'Get detailed information about a person including notes',
      {
        person_id: z.string().optional(),
        person_name: z.string().optional(),
        person_slug: z.string().optional()
      },
      async (args) => {
        const personId = await resolveEntityId('people', {
          id: args.person_id,
          name: args.person_name,
          slug: args.person_slug
        });
        
        if (!personId) {
          return formatError('Person not found', `No person matches the provided identifier`, ['Check list_people for available people']);
        }
        
        const { supabase } = await import('../../../../lib/supabase');
        const { data, error } = await supabase
          .from('people')
          .select('*, person_notes(*)')
          .eq('id', personId)
          .single();
          
        if (error || !data) {
          return formatError('Person not found', `Person with ID ${personId} not found`);
        }
        
        const notes = (data.person_notes || []).map((n: any) => 
          `  • ${n.title} [${n.id}]\n    Tags: ${n.tags?.join(', ') || 'none'}`
        ).join('\n\n');
        
        return {
          content: [{
            type: "text",
            text: `**${data.name}**${data.is_primary_user ? ' [PRIMARY USER]' : ''}\n\n` +
                  `ID: ${data.id}\n` +
                  `Slug: ${data.slug || 'not set'}\n` +
                  `Relation: ${data.relation}\n` +
                  `TL;DR: ${data.tldr || 'No summary'}\n\n` +
                  `**Notes (${data.person_notes?.length || 0}):**\n${notes || '  No notes yet'}`
          }]
        };
      }
    );

    server.tool(
      'create_person',
      'Create a new person in the network',
      {
        name: z.string(),
        relation: z.string(),
        tldr: z.string().optional(),
        slug: z.string().optional()
      },
      async ({ name, relation, tldr, slug }) => {
        const { supabase } = await import('../../../../lib/supabase');
        
        const { data, error } = await supabase
          .from('people')
          .insert([{ name, relation, tldr, slug }])
          .select()
          .single();
          
        if (error) {
          if (error.code === '23505') {
            return formatError('Duplicate entry', `Person with name "${name}" or slug "${slug}" already exists`);
          }
          throw error;
        }
        
        return formatSuccess('Created person', name, `ID: ${data.id}`);
      }
    );

    server.tool(
      'update_person',
      'Update person information',
      {
        person_id: z.string().optional(),
        person_name: z.string().optional(),
        person_slug: z.string().optional(),
        name: z.string().optional(),
        relation: z.string().optional(),
        tldr: z.string().optional(),
        slug: z.string().optional()
      },
      async (args) => {
        const personId = await resolveEntityId('people', {
          id: args.person_id,
          name: args.person_name,
          slug: args.person_slug
        });
        
        if (!personId) {
          return formatError('Person not found', 'No person matches the provided identifier');
        }
        
        const { supabase } = await import('../../../../lib/supabase');
        
        const updateData: any = {};
        if (args.name !== undefined) updateData.name = args.name;
        if (args.relation !== undefined) updateData.relation = args.relation;
        if (args.tldr !== undefined) updateData.tldr = args.tldr;
        if (args.slug !== undefined) updateData.slug = args.slug;
        
        const { data, error } = await supabase
          .from('people')
          .update(updateData)
          .eq('id', personId)
          .select()
          .single();
          
        if (error) {
          if (error.code === '23505') {
            return formatError('Duplicate entry', 'Name or slug already exists');
          }
          throw error;
        }
        
        return formatSuccess('Updated person', data.name);
      }
    );

    server.tool(
      'delete_person',
      'Delete a person from the network',
      {
        person_id: z.string().optional(),
        person_name: z.string().optional(),
        person_slug: z.string().optional()
      },
      async (args) => {
        const personId = await resolveEntityId('people', {
          id: args.person_id,
          name: args.person_name,
          slug: args.person_slug
        });
        
        if (!personId) {
          return formatError('Person not found', 'No person matches the provided identifier');
        }
        
        const { supabase } = await import('../../../../lib/supabase');
        
        const { data: person } = await supabase
          .from('people')
          .select('name, is_primary_user')
          .eq('id', personId)
          .single();
          
        if (person?.is_primary_user) {
          return formatWarning('Cannot delete', 'Primary user cannot be deleted');
        }
        
        const { error } = await supabase
          .from('people')
          .delete()
          .eq('id', personId);
          
        if (error) throw error;
        
        return formatSuccess('Deleted person', person?.name || 'Unknown');
      }
    );

    server.tool(
      'create_person_note',
      'Create a note for a person',
      {
        person_id: z.string().optional(),
        person_name: z.string().optional(),
        person_slug: z.string().optional(),
        title: z.string(),
        content: z.string(),
        tags: z.array(z.string()).optional()
      },
      async (args) => {
        const personId = await resolveEntityId('people', {
          id: args.person_id,
          name: args.person_name,
          slug: args.person_slug
        });
        
        if (!personId) {
          return formatError('Person not found', 'No person matches the provided identifier');
        }
        
        const { supabase } = await import('../../../../lib/supabase');
        
        const { data, error } = await supabase
          .from('person_notes')
          .insert([{
            person_id: personId,
            title: args.title,
            content: args.content,
            tags: args.tags || []
          }])
          .select()
          .single();
          
        if (error) throw error;
        
        return formatSuccess('Created person note', args.title, `ID: ${data.id}`);
      }
    );

    server.tool(
      'list_person_notes',
      'List notes for a specific person',
      {
        person_id: z.string().optional(),
        person_name: z.string().optional(),
        person_slug: z.string().optional(),
        mode: z.enum(['meta', 'full']).default('meta')
      },
      async (args) => {
        const personId = await resolveEntityId('people', {
          id: args.person_id,
          name: args.person_name,
          slug: args.person_slug
        });
        
        if (!personId) {
          return formatError('Person not found', 'No person matches the provided identifier');
        }
        
        const { supabase } = await import('../../../../lib/supabase');
        
        const { data, error } = await supabase
          .from('person_notes')
          .select('*')
          .eq('person_id', personId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        const notes = data || [];
        
        if (args.mode === 'meta') {
          const text = notes.map(n => 
            `• ${n.title} [${n.id}]\n  Tags: ${n.tags?.join(', ') || 'none'}`
          ).join('\n\n');
          
          return {
            content: [{
              type: "text",
              text: `Found ${notes.length} notes:\n\n${text || 'No notes yet'}`
            }]
          };
        }
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ notes })
          }]
        };
      }
    );

    // ====== PROJECT MANAGEMENT ======
    
    server.tool(
      'list_projects',
      'List all projects with statistics',
      {
        limit: z.number().default(20),
        offset: z.number().default(0),
        mode: z.enum(['meta', 'full']).default('meta')
      },
      async ({ limit, offset, mode }) => {
        const { supabase } = await import('../../../../lib/supabase');
        
        const { data, error, count } = await supabase
          .from('projects')
          .select(`
            *,
            sprints(count),
            project_notes(count),
            tasks:sprints(tasks(count))
          `, { count: 'exact' })
          .range(offset, offset + limit - 1)
          .order('is_default_project', { ascending: false })
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        const projects = data || [];
        const hasMore = (count || 0) > offset + limit;
        
        if (mode === 'meta') {
          const text = projects.map(p => {
            const sprintCount = p.sprints?.[0]?.count || 0;
            const noteCount = p.project_notes?.[0]?.count || 0;
            const taskCount = p.tasks?.reduce((sum: number, s: any) => sum + (s.tasks?.[0]?.count || 0), 0) || 0;
            const flags = [];
            if (p.is_default_project) flags.push('DEFAULT');
            if (p.is_protected) flags.push('PROTECTED');
            const flagText = flags.length ? ` [${flags.join(', ')}]` : '';
            
            return `• ${p.name}${flagText} - ${sprintCount} sprints, ${taskCount} tasks, ${noteCount} notes`;
          }).join('\n');
          
          return {
            content: [{
              type: "text",
              text: `Found ${count} projects:\n\n${text}${hasMore ? `\n\n(Showing ${offset + 1}-${offset + projects.length} of ${count})` : ''}`
            }]
          };
        }
        
        const details = projects.map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          tldr: p.tldr,
          is_default_project: p.is_default_project,
          is_protected: p.is_protected,
          sprints_count: p.sprints?.[0]?.count || 0,
          notes_count: p.project_notes?.[0]?.count || 0,
          tasks_total: p.tasks?.reduce((sum: number, s: any) => sum + (s.tasks?.[0]?.count || 0), 0) || 0
        }));
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ projects: details, total: count, has_more: hasMore }, null, 2)
          }]
        };
      }
    );

    server.tool(
      'get_project',
      'Get detailed project information including sprints and notes',
      {
        project_id: z.string().optional(),
        project_name: z.string().optional(),
        project_slug: z.string().optional()
      },
      async (args) => {
        const projectId = await resolveEntityId('projects', {
          id: args.project_id,
          name: args.project_name,
          slug: args.project_slug
        });
        
        if (!projectId) {
          return formatError('Project not found', 'No project matches the provided identifier', ['Check list_projects for available projects']);
        }
        
        const { supabase } = await import('../../../../lib/supabase');
        
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            sprints (
              id,
              name,
              slug,
              tldr,
              status,
              tasks(count),
              sprint_notes(count)
            ),
            project_notes (*)
          `)
          .eq('id', projectId)
          .single();
          
        if (error || !data) {
          return formatError('Project not found', `Project with ID ${projectId} not found`);
        }
        
        const sprints = (data.sprints || []).map((s: any) => 
          `  • ${s.name} (${s.status || 'active'}) - ${s.tasks?.[0]?.count || 0} tasks, ${s.sprint_notes?.[0]?.count || 0} notes\n    ${s.tldr || 'No description'}`
        ).join('\n\n');
        
        const notes = (data.project_notes || []).map((n: any) => 
          `  • ${n.title} [${n.id}]\n    Tags: ${n.tags?.join(', ') || 'none'}`
        ).join('\n\n');
        
        const flags = [];
        if (data.is_default_project) flags.push('DEFAULT PROJECT');
        if (data.is_protected) flags.push('PROTECTED');
        
        return {
          content: [{
            type: "text",
            text: `**${data.name}**${flags.length ? ` [${flags.join(', ')}]` : ''}\n\n` +
                  `ID: ${data.id}\n` +
                  `Slug: ${data.slug || 'not set'}\n` +
                  `TL;DR: ${data.tldr || 'No summary'}\n\n` +
                  `**Sprints (${data.sprints?.length || 0}):**\n${sprints || '  No sprints yet'}\n\n` +
                  `**Project Notes (${data.project_notes?.length || 0}):**\n${notes || '  No notes yet'}`
          }]
        };
      }
    );

    server.tool(
      'create_project',
      'Create a new project',
      {
        name: z.string(),
        tldr: z.string().optional(),
        slug: z.string().optional()
      },
      async ({ name, tldr, slug }) => {
        const { supabase } = await import('../../../../lib/supabase');
        
        const { data, error } = await supabase
          .from('projects')
          .insert([{ name, tldr, slug }])
          .select()
          .single();
          
        if (error) {
          if (error.code === '23505') {
            return formatError('Duplicate entry', `Project with name "${name}" or slug "${slug}" already exists`);
          }
          throw error;
        }
        
        return formatSuccess('Created project', name, `ID: ${data.id}`);
      }
    );

    server.tool(
      'update_project',
      'Update project information',
      {
        project_id: z.string().optional(),
        project_name: z.string().optional(),
        project_slug: z.string().optional(),
        name: z.string().optional(),
        tldr: z.string().optional(),
        slug: z.string().optional()
      },
      async (args) => {
        const projectId = await resolveEntityId('projects', {
          id: args.project_id,
          name: args.project_name,
          slug: args.project_slug
        });
        
        if (!projectId) {
          return formatError('Project not found', 'No project matches the provided identifier');
        }
        
        const { supabase } = await import('../../../../lib/supabase');
        
        const updateData: any = {};
        if (args.name !== undefined) updateData.name = args.name;
        if (args.tldr !== undefined) updateData.tldr = args.tldr;
        if (args.slug !== undefined) updateData.slug = args.slug;
        
        const { data, error } = await supabase
          .from('projects')
          .update(updateData)
          .eq('id', projectId)
          .select()
          .single();
          
        if (error) {
          if (error.code === '23505') {
            return formatError('Duplicate entry', 'Name or slug already exists');
          }
          throw error;
        }
        
        return formatSuccess('Updated project', data.name);
      }
    );

    server.tool(
      'delete_project',
      'Delete a project and all associated data',
      {
        project_id: z.string().optional(),
        project_name: z.string().optional(),
        project_slug: z.string().optional()
      },
      async (args) => {
        const projectId = await resolveEntityId('projects', {
          id: args.project_id,
          name: args.project_name,
          slug: args.project_slug
        });
        
        if (!projectId) {
          return formatError('Project not found', 'No project matches the provided identifier');
        }
        
        const { supabase } = await import('../../../../lib/supabase');
        
        const { data: project } = await supabase
          .from('projects')
          .select('name, is_protected')
          .eq('id', projectId)
          .single();
          
        if (project?.is_protected) {
          return formatWarning('Cannot delete', `Protected project "${project.name}" cannot be deleted`);
        }
        
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', projectId);
          
        if (error) throw error;
        
        return formatSuccess('Deleted project', project?.name || 'Unknown', 'All associated sprints, tasks and notes were deleted');
      }
    );

    server.tool(
      'create_project_note',
      'Create a note directly on a project',
      {
        project_id: z.string().optional(),
        project_name: z.string().optional(),
        project_slug: z.string().optional(),
        title: z.string(),
        content: z.string(),
        tags: z.array(z.string()).optional()
      },
      async (args) => {
        const projectId = await resolveEntityId('projects', {
          id: args.project_id,
          name: args.project_name,
          slug: args.project_slug
        });
        
        if (!projectId) {
          return formatError('Project not found', 'No project matches the provided identifier');
        }
        
        const { supabase } = await import('../../../../lib/supabase');
        
        const { data, error } = await supabase
          .from('project_notes')
          .insert([{
            project_id: projectId,
            title: args.title,
            content: args.content,
            tags: args.tags || []
          }])
          .select()
          .single();
          
        if (error) throw error;
        
        return formatSuccess('Created project note', args.title, `ID: ${data.id}`);
      }
    );

    server.tool(
      'list_project_notes',
      'List notes for a specific project',
      {
        project_id: z.string().optional(),
        project_name: z.string().optional(),
        project_slug: z.string().optional(),
        mode: z.enum(['meta', 'full']).default('meta')
      },
      async (args) => {
        const projectId = await resolveEntityId('projects', {
          id: args.project_id,
          name: args.project_name,
          slug: args.project_slug
        });
        
        if (!projectId) {
          return formatError('Project not found', 'No project matches the provided identifier');
        }
        
        const { supabase } = await import('../../../../lib/supabase');
        
        const { data, error } = await supabase
          .from('project_notes')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        const notes = data || [];
        
        if (args.mode === 'meta') {
          const text = notes.map(n => 
            `• ${n.title} [${n.id}]\n  Tags: ${n.tags?.join(', ') || 'none'}`
          ).join('\n\n');
          
          return {
            content: [{
              type: "text",
              text: `Found ${notes.length} notes:\n\n${text || 'No notes yet'}`
            }]
          };
        }
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ notes })
          }]
        };
      }
    );

    server.tool(
      'create_knowledge_note',
      'Create a note in the default Knowledge project',
      {
        title: z.string(),
        content: z.string(),
        tags: z.array(z.string()).optional()
      },
      async ({ title, content, tags }) => {
        const { supabase } = await import('../../../../lib/supabase');
        
        const { data: defaultProject } = await supabase
          .from('projects')
          .select('id, name')
          .eq('is_default_project', true)
          .single();
          
        if (!defaultProject) {
          return formatError('Default project not found', 'Knowledge project is not configured');
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
        
        return formatSuccess('Created knowledge note', title, `Added to ${defaultProject.name}`);
      }
    );

    // ====== SPRINT MANAGEMENT ======
    
    server.tool(
      'list_sprints',
      'List sprints with optional project filter',
      {
        project_id: z.string().optional(),
        project_name: z.string().optional(),
        project_slug: z.string().optional(),
        status: z.string().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
        mode: z.enum(['meta', 'full']).default('meta')
      },
      async (args) => {
        const { supabase } = await import('../../../../lib/supabase');
        
        let projectId: string | undefined;
        if (args.project_id || args.project_name || args.project_slug) {
          const resolved = await resolveEntityId('projects', {
            id: args.project_id,
            name: args.project_name,
            slug: args.project_slug
          });
          if (!resolved) {
            return formatError('Project not found', 'No project matches the provided identifier');
          }
          projectId = resolved;
        }
        
        let query = supabase
          .from('sprints')
          .select(`
            *,
            projects!inner(name),
            tasks(count),
            sprint_notes(count)
          `, { count: 'exact' });
          
        if (projectId) query = query.eq('project_id', projectId);
        if (args.status) query = query.eq('status', args.status);
        
        query = query
          .range(args.offset, args.offset + args.limit - 1)
          .order('created_at', { ascending: false });
        
        const { data, error, count } = await query;
        if (error) throw error;
        
        const sprints = data || [];
        const hasMore = (count || 0) > args.offset + args.limit;
        
        if (args.mode === 'meta') {
          const text = sprints.map(s => 
            `• ${s.name} (${s.projects.name}) - ${s.status || 'active'} - ${s.tasks?.[0]?.count || 0} tasks, ${s.sprint_notes?.[0]?.count || 0} notes`
          ).join('\n');
          
          const filterText = projectId ? ` in project` : '';
          
          return {
            content: [{
              type: "text",
              text: `Found ${count} sprints${filterText}:\n\n${text}${hasMore ? `\n\n(Showing ${args.offset + 1}-${args.offset + sprints.length} of ${count})` : ''}`
            }]
          };
        }
        
        const details = sprints.map(s => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          tldr: s.tldr,
          status: s.status,
          project_name: s.projects.name,
          project_id: s.project_id,
          tasks_count: s.tasks?.[0]?.count || 0,
          notes_count: s.sprint_notes?.[0]?.count || 0
        }));
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ sprints: details, total: count, has_more: hasMore }, null, 2)
          }]
        };
      }
    );

    server.tool(
      'get_sprint',
      'Get detailed sprint information with tasks and notes',
      {
        sprint_id: z.string().optional(),
        sprint_name: z.string().optional(),
        sprint_slug: z.string().optional(),
        project_id: z.string().optional(),
        project_name: z.string().optional()
      },
      async (args) => {
        let projectId: string | undefined;
        if (args.project_id || args.project_name) {
          const resolved = await resolveEntityId('projects', {
            id: args.project_id,
            name: args.project_name
          });
          if (!resolved) {
            return formatError('Project not found', 'No project matches the provided identifier');
          }
          projectId = resolved;
        }
        
        const sprintId = await resolveEntityId('sprints', {
          id: args.sprint_id,
          name: args.sprint_name,
          slug: args.sprint_slug
        }, projectId ? 'project_id' : undefined, projectId);
        
        if (!sprintId) {
          return formatError('Sprint not found', 'No sprint matches the provided identifier');
        }
        
        const { supabase } = await import('../../../../lib/supabase');
        
        const { data, error } = await supabase
          .from('sprints')
          .select(`
            *,
            projects!inner(name),
            tasks(*),
            sprint_notes(*)
          `)
          .eq('id', sprintId)
          .single();
          
        if (error || !data) {
          return formatError('Sprint not found', `Sprint with ID ${sprintId} not found`);
        }
        
        const tasks = (data.tasks || []);
        const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
        const progress = tasks.length ? Math.round(completedTasks / tasks.length * 100) : 0;
        
        const tasksText = tasks.map((t: any) => 
          `  • ${t.title} (${t.status || 'todo'}) [${t.id}]`
        ).join('\n');
        
        const notesText = (data.sprint_notes || []).map((n: any) => 
          `  • ${n.title} [${n.id}]\n    Tags: ${n.tags?.join(', ') || 'none'}`
        ).join('\n\n');
        
        return {
          content: [{
            type: "text",
            text: `**${data.name}**\n\n` +
                  `ID: ${data.id}\n` +
                  `Slug: ${data.slug || 'not set'}\n` +
                  `Project: ${data.projects.name}\n` +
                  `Status: ${data.status || 'active'}\n` +
                  `TL;DR: ${data.tldr || 'No summary'}\n` +
                  `Progress: ${progress}% (${completedTasks}/${tasks.length} completed)\n\n` +
                  `**Tasks (${tasks.length}):**\n${tasksText || '  No tasks yet'}\n\n` +
                  `**Notes (${data.sprint_notes?.length || 0}):**\n${notesText || '  No notes yet'}`
          }]
        };
      }
    );

    server.tool(
      'create_sprint',
      'Create a new sprint in a project',
      {
        project_id: z.string().optional(),
        project_name: z.string().optional(),
        project_slug: z.string().optional(),
        name: z.string(),
        tldr: z.string().optional(),
        slug: z.string().optional(),
        status: z.string().optional()
      },
      async (args) => {
        const projectId = await resolveEntityId('projects', {
          id: args.project_id,
          name: args.project_name,
          slug: args.project_slug
        });
        
        if (!projectId) {
          return formatError('Project not found', 'No project matches the provided identifier');
        }
        
        const { supabase } = await import('../../../../lib/supabase');
        
        const { data, error } = await supabase
          .from('sprints')
          .insert([{
            project_id: projectId,
            name: args.name,
            tldr: args.tldr,
            slug: args.slug,
            status: args.status
          }])
          .select()
          .single();
          
        if (error) {
          if (error.code === '23505') {
            return formatError('Duplicate entry', `Sprint with name "${args.name}" or slug "${args.slug}" already exists in this project`);
          }
          throw error;
        }
        
        return formatSuccess('Created sprint', args.name, `ID: ${data.id}`);
      }
    );

    server.tool(
      'update_sprint',
      'Update sprint information',
      {
        sprint_id: z.string().optional(),
        sprint_name: z.string().optional(),
        sprint_slug: z.string().optional(),
        name: z.string().optional(),
        tldr: z.string().optional(),
        slug: z.string().optional(),
        status: z.string().optional()
      },
      async (args) => {
        const sprintId = await resolveEntityId('sprints', {
          id: args.sprint_id,
          name: args.sprint_name,
          slug: args.sprint_slug
        });
        
        if (!sprintId) {
          return formatError('Sprint not found', 'No sprint matches the provided identifier');
        }
        
        const { supabase } = await import('../../../../lib/supabase');
        
        const updateData: any = {};
        if (args.name !== undefined) updateData.name = args.name;
        if (args.tldr !== undefined) updateData.tldr = args.tldr;
        if (args.slug !== undefined) updateData.slug = args.slug;
        if (args.status !== undefined) updateData.status = args.status;
        
        const { data, error } = await supabase
          .from('sprints')
          .update(updateData)
          .eq('id', sprintId)
          .select()
          .single();
          
        if (error) {
          if (error.code === '23505') {
            return formatError('Duplicate entry', 'Name or slug already exists in this project');
          }
          throw error;
        }
        
        return formatSuccess('Updated sprint', data.name);
      }
    );

    server.tool(
      'delete_sprint',
      'Delete a sprint and all associated tasks and notes',
      {
        sprint_id: z.string().optional(),
        sprint_name: z.string().optional(),
        sprint_slug: z.string().optional()
      },
      async (args) => {
        const sprintId = await resolveEntityId('sprints', {
          id: args.sprint_id,
          name: args.sprint_name,
          slug: args.sprint_slug
        });
        
        if (!sprintId) {
          return formatError('Sprint not found', 'No sprint matches the provided identifier');
        }
        
        const { supabase } = await import('../../../../lib/supabase');
        
        const { data: sprint } = await supabase
          .from('sprints')
          .select('name')
          .eq('id', sprintId)
          .single();
        
        const { error } = await supabase
          .from('sprints')
          .delete()
          .eq('id', sprintId);
          
        if (error) throw error;
        
        return formatSuccess('Deleted sprint', sprint?.name || 'Unknown', 'All associated tasks and notes were deleted');
      }
    );

    server.tool(
      'create_sprint_note',
      'Create a note for a sprint',
      {
        sprint_id: z.string().optional(),
        sprint_name: z.string().optional(),
        sprint_slug: z.string().optional(),
        title: z.string(),
        content: z.string(),
        tags: z.array(z.string()).optional()
      },
      async (args) => {
        const sprintId = await resolveEntityId('sprints', {
          id: args.sprint_id,
          name: args.sprint_name,
          slug: args.sprint_slug
        });
        
        if (!sprintId) {
          return formatError('Sprint not found', 'No sprint matches the provided identifier');
        }
        
        const { supabase } = await import('../../../../lib/supabase');
        
        const { data, error } = await supabase
          .from('sprint_notes')
          .insert([{
            sprint_id: sprintId,
            title: args.title,
            content: args.content,
            tags: args.tags || []
          }])
          .select()
          .single();
          
        if (error) throw error;
        
        return formatSuccess('Created sprint note', args.title, `ID: ${data.id}`);
      }
    );

    // ====== TASK MANAGEMENT ======
    
    server.tool(
      'list_tasks',
      'List tasks with filters',
      {
        sprint_id: z.string().optional(),
        sprint_name: z.string().optional(),
        project_id: z.string().optional(),
        project_name: z.string().optional(),
        status: z.string().optional(),
        priority: z.enum(['low', 'medium', 'high']).optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
        mode: z.enum(['meta', 'full']).default('meta')
      },
      async (args) => {
        const { supabase } = await import('../../../../lib/supabase');
        
        let query = supabase
          .from('tasks')
          .select(`
            *,
            sprints!inner(
              name,
              projects!inner(name)
            )
          `, { count: 'exact' });
          
        if (args.sprint_id || args.sprint_name) {
          const sprintId = await resolveEntityId('sprints', {
            id: args.sprint_id,
            name: args.sprint_name
          });
          if (!sprintId) {
            return formatError('Sprint not found', 'No sprint matches the provided identifier');
          }
          query = query.eq('sprint_id', sprintId);
        }
        
        if (args.project_id || args.project_name) {
          const projectId = await resolveEntityId('projects', {
            id: args.project_id,
            name: args.project_name
          });
          if (!projectId) {
            return formatError('Project not found', 'No project matches the provided identifier');
          }
          query = query.eq('sprints.project_id', projectId);
        }
        
        if (args.status) query = query.eq('status', args.status);
        if (args.priority) {
          const priorityMap = { low: 1, medium: 3, high: 5 };
          query = query.eq('priority', priorityMap[args.priority]);
        }
        
        query = query
          .range(args.offset, args.offset + args.limit - 1)
          .order('created_at', { ascending: false });
        
        const { data, error, count } = await query;
        if (error) throw error;
        
        const tasks = data || [];
        const hasMore = (count || 0) > args.offset + args.limit;
        
        if (args.mode === 'meta') {
          const text = tasks.map(t => {
            const priorityMap: any = { 1: 'low', 3: 'medium', 5: 'high' };
            const priority = priorityMap[t.priority] || 'medium';
            return `• ${t.title} (${t.status || 'todo'}, ${priority}) - ${t.sprints.projects.name}/${t.sprints.name}`;
          }).join('\n');
          
          return {
            content: [{
              type: "text",
              text: `Found ${count} tasks:\n\n${text}${hasMore ? `\n\n(Showing ${args.offset + 1}-${args.offset + tasks.length} of ${count})` : ''}`
            }]
          };
        }
        
        const details = tasks.map(t => {
          const priorityMap: any = { 1: 'low', 3: 'medium', 5: 'high' };
          return {
            id: t.id,
            title: t.title,
            description: t.description,
            status: t.status,
            priority: priorityMap[t.priority] || 'medium',
            project_name: t.sprints.projects.name,
            sprint_name: t.sprints.name,
            sprint_id: t.sprint_id,
            created_at: t.created_at,
            completed_at: t.completed_at
          };
        });
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ tasks: details, total: count, has_more: hasMore }, null, 2)
          }]
        };
      }
    );

    server.tool(
      'get_task',
      'Get detailed task information',
      {
        task_id: z.string().optional(),
        task_title: z.string().optional()
      },
      async (args) => {
        const { supabase } = await import('../../../../lib/supabase');
        
        let query = supabase
          .from('tasks')
          .select(`
            *,
            sprints!inner(
              name,
              projects!inner(name)
            )
          `);
          
        if (args.task_id) {
          query = query.eq('id', args.task_id);
        } else if (args.task_title) {
          query = query.eq('title', args.task_title);
        } else {
          return formatError('Invalid parameters', 'Either task_id or task_title is required');
        }
        
        const { data, error } = await query.single();
        
        if (error || !data) {
          return formatError('Task not found', 'No task matches the provided identifier');
        }
        
        const priorityMap: any = { 1: 'low', 3: 'medium', 5: 'high' };
        const priority = priorityMap[data.priority] || 'medium';
        
        return {
          content: [{
            type: "text",
            text: `**${data.title}**\n\n` +
                  `ID: ${data.id}\n` +
                  `Project: ${data.sprints.projects.name}\n` +
                  `Sprint: ${data.sprints.name}\n` +
                  `Status: ${data.status || 'todo'}\n` +
                  `Priority: ${priority}\n` +
                  `Description: ${data.description || 'No description'}\n` +
                  `Created: ${new Date(data.created_at).toLocaleDateString()}\n` +
                  `${data.completed_at ? `Completed: ${new Date(data.completed_at).toLocaleDateString()}` : ''}`
          }]
        };
      }
    );

    server.tool(
      'create_task',
      'Create a new task in a sprint',
      {
        sprint_id: z.string().optional(),
        sprint_name: z.string().optional(),
        sprint_slug: z.string().optional(),
        title: z.string(),
        description: z.string().optional(),
        priority: z.enum(['low', 'medium', 'high']).default('medium'),
        status: z.string().optional()
      },
      async (args) => {
        const sprintId = await resolveEntityId('sprints', {
          id: args.sprint_id,
          name: args.sprint_name,
          slug: args.sprint_slug
        });
        
        if (!sprintId) {
          return formatError('Sprint not found', 'No sprint matches the provided identifier');
        }
        
        const { supabase } = await import('../../../../lib/supabase');
        
        const priorityMap = { low: 1, medium: 3, high: 5 };
        
        const { data, error } = await supabase
          .from('tasks')
          .insert([{
            sprint_id: sprintId,
            title: args.title,
            description: args.description,
            priority: priorityMap[args.priority],
            status: args.status
          }])
          .select()
          .single();
          
        if (error) throw error;
        
        return formatSuccess('Created task', args.title, `ID: ${data.id}`);
      }
    );

    server.tool(
      'update_task',
      'Update task information',
      {
        task_id: z.string().optional(),
        task_title: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.string().optional(),
        priority: z.enum(['low', 'medium', 'high']).optional()
      },
      async (args) => {
        const { supabase } = await import('../../../../lib/supabase');
        
        let taskId: string;
        if (args.task_id) {
          taskId = args.task_id;
        } else if (args.task_title) {
          const { data } = await supabase
            .from('tasks')
            .select('id')
            .eq('title', args.task_title)
            .single();
          if (!data) {
            return formatError('Task not found', 'No task matches the provided title');
          }
          taskId = data.id;
        } else {
          return formatError('Invalid parameters', 'Either task_id or task_title is required');
        }
        
        const updateData: any = {};
        if (args.title !== undefined) updateData.title = args.title;
        if (args.description !== undefined) updateData.description = args.description;
        if (args.status !== undefined) {
          updateData.status = args.status;
          if (args.status === 'completed') {
            updateData.completed_at = new Date().toISOString();
          } else if (args.status !== 'completed') {
            updateData.completed_at = null;
          }
        }
        if (args.priority !== undefined) {
          const priorityMap = { low: 1, medium: 3, high: 5 };
          updateData.priority = priorityMap[args.priority];
        }
        
        const { data, error } = await supabase
          .from('tasks')
          .update(updateData)
          .eq('id', taskId)
          .select()
          .single();
          
        if (error) throw error;
        
        return formatSuccess('Updated task', data.title);
      }
    );

    server.tool(
      'delete_task',
      'Delete a task',
      {
        task_id: z.string().optional(),
        task_title: z.string().optional()
      },
      async (args) => {
        const { supabase } = await import('../../../../lib/supabase');
        
        let taskId: string;
        let taskTitle: string = 'Unknown';
        
        if (args.task_id) {
          taskId = args.task_id;
          const { data } = await supabase
            .from('tasks')
            .select('title')
            .eq('id', taskId)
            .single();
          if (data) taskTitle = data.title;
        } else if (args.task_title) {
          const { data } = await supabase
            .from('tasks')
            .select('id, title')
            .eq('title', args.task_title)
            .single();
          if (!data) {
            return formatError('Task not found', 'No task matches the provided title');
          }
          taskId = data.id;
          taskTitle = data.title;
        } else {
          return formatError('Invalid parameters', 'Either task_id or task_title is required');
        }
        
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId);
          
        if (error) throw error;
        
        return formatSuccess('Deleted task', taskTitle);
      }
    );

    // ====== NOTES MANAGEMENT ======
    
    server.tool(
      'get_note',
      'Get any type of note by ID',
      {
        note_id: z.string(),
        note_type: z.enum(['person', 'project', 'sprint']).optional()
      },
      async ({ note_id, note_type }) => {
        const { supabase } = await import('../../../../lib/supabase');
        
        const checkTables = note_type 
          ? [{ table: `${note_type}_notes`, type: note_type }]
          : [
              { table: 'person_notes', type: 'person' },
              { table: 'project_notes', type: 'project' },
              { table: 'sprint_notes', type: 'sprint' }
            ];
        
        for (const { table, type } of checkTables) {
          const { data } = await supabase
            .from(table)
            .select('*')
            .eq('id', note_id)
            .single();
            
          if (data) {
            return {
              content: [{
                type: "text",
                text: `**${data.title}** [${type} note]\n\n` +
                      `ID: ${data.id}\n` +
                      `Tags: ${data.tags?.join(', ') || 'none'}\n` +
                      `Created: ${new Date(data.created_at).toLocaleDateString()}\n\n` +
                      `**Content:**\n${data.content}`
              }]
            };
          }
        }
        
        return formatError('Note not found', `No note found with ID ${note_id}`);
      }
    );

    server.tool(
      'update_note',
      'Update any type of note',
      {
        note_id: z.string(),
        note_type: z.enum(['person', 'project', 'sprint']).optional(),
        title: z.string().optional(),
        content: z.string().optional(),
        tags: z.array(z.string()).optional()
      },
      async ({ note_id, note_type, title, content, tags }) => {
        const { supabase } = await import('../../../../lib/supabase');
        
        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (tags !== undefined) updateData.tags = tags;
        
        const checkTables = note_type 
          ? [{ table: `${note_type}_notes`, type: note_type }]
          : [
              { table: 'person_notes', type: 'person' },
              { table: 'project_notes', type: 'project' },
              { table: 'sprint_notes', type: 'sprint' }
            ];
        
        for (const { table, type } of checkTables) {
          const { data, error } = await supabase
            .from(table)
            .update(updateData)
            .eq('id', note_id)
            .select()
            .single();
            
          if (data && !error) {
            return formatSuccess(`Updated ${type} note`, data.title);
          }
        }
        
        return formatError('Note not found', `No note found with ID ${note_id}`);
      }
    );

    server.tool(
      'delete_note',
      'Delete any type of note',
      {
        note_id: z.string(),
        note_type: z.enum(['person', 'project', 'sprint']).optional()
      },
      async ({ note_id, note_type }) => {
        const { supabase } = await import('../../../../lib/supabase');
        
        const checkTables = note_type 
          ? [{ table: `${note_type}_notes`, type: note_type }]
          : [
              { table: 'person_notes', type: 'person' },
              { table: 'project_notes', type: 'project' },
              { table: 'sprint_notes', type: 'sprint' }
            ];
        
        for (const { table, type } of checkTables) {
          const { data } = await supabase
            .from(table)
            .select('title')
            .eq('id', note_id)
            .single();
            
          if (data) {
            const { error } = await supabase
              .from(table)
              .delete()
              .eq('id', note_id);
              
            if (!error) {
              return formatSuccess(`Deleted ${type} note`, data.title);
            }
          }
        }
        
        return formatError('Note not found', `No note found with ID ${note_id}`);
      }
    );

    server.tool(
      'list_notes',
      'List all notes across the system',
      {
        note_type: z.enum(['person', 'project', 'sprint', 'all']).default('all'),
        limit: z.number().default(50),
        tags: z.array(z.string()).optional(),
        mode: z.enum(['meta', 'full']).default('meta')
      },
      async ({ note_type, limit, tags, mode }) => {
        const { supabase } = await import('../../../../lib/supabase');
        
        const results = [];
        
        if (note_type === 'all' || note_type === 'person') {
          let query = supabase.from('person_notes').select('*, people!inner(name)');
          if (tags?.length) query = query.overlaps('tags', tags);
          const { data } = await query.limit(limit);
          results.push(...(data || []).map((n: any) => ({
            ...n,
            type: 'person',
            parent_name: n.people.name
          })));
        }
        
        if (note_type === 'all' || note_type === 'project') {
          let query = supabase.from('project_notes').select('*, projects!inner(name)');
          if (tags?.length) query = query.overlaps('tags', tags);
          const { data } = await query.limit(limit);
          results.push(...(data || []).map((n: any) => ({
            ...n,
            type: 'project',
            parent_name: n.projects.name
          })));
        }
        
        if (note_type === 'all' || note_type === 'sprint') {
          let query = supabase.from('sprint_notes').select('*, sprints!inner(name)');
          if (tags?.length) query = query.overlaps('tags', tags);
          const { data } = await query.limit(limit);
          results.push(...(data || []).map((n: any) => ({
            ...n,
            type: 'sprint',
            parent_name: n.sprints.name
          })));
        }
        
        results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const limitedResults = results.slice(0, limit);
        
        if (mode === 'meta') {
          const text = limitedResults.map(n => 
            `• ${n.title} [${n.type} note] (${n.parent_name})\n  Tags: ${n.tags?.join(', ') || 'none'}`
          ).join('\n\n');
          
          return {
            content: [{
              type: "text",
              text: `Found ${limitedResults.length} notes${tags?.length ? ` with tags [${tags.join(', ')}]` : ''}:\n\n${text || 'No notes found'}`
            }]
          };
        }
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ notes: limitedResults }, null, 2)
          }]
        };
      }
    );

    server.tool(
      'search_notes',
      'Search notes by content',
      {
        query: z.string(),
        note_type: z.enum(['person', 'project', 'sprint', 'all']).default('all'),
        limit: z.number().default(20)
      },
      async ({ query, note_type, limit }) => {
        const { supabase } = await import('../../../../lib/supabase');
        
        const searchPattern = `%${query}%`;
        const results = [];
        
        if (note_type === 'all' || note_type === 'person') {
          const { data } = await supabase
            .from('person_notes')
            .select('*, people!inner(name)')
            .or(`title.ilike.${searchPattern},content.ilike.${searchPattern}`)
            .limit(limit);
          results.push(...(data || []).map((n: any) => ({
            ...n,
            type: 'person',
            parent_name: n.people.name
          })));
        }
        
        if (note_type === 'all' || note_type === 'project') {
          const { data } = await supabase
            .from('project_notes')
            .select('*, projects!inner(name)')
            .or(`title.ilike.${searchPattern},content.ilike.${searchPattern}`)
            .limit(limit);
          results.push(...(data || []).map((n: any) => ({
            ...n,
            type: 'project',
            parent_name: n.projects.name
          })));
        }
        
        if (note_type === 'all' || note_type === 'sprint') {
          const { data } = await supabase
            .from('sprint_notes')
            .select('*, sprints!inner(name)')
            .or(`title.ilike.${searchPattern},content.ilike.${searchPattern}`)
            .limit(limit);
          results.push(...(data || []).map((n: any) => ({
            ...n,
            type: 'sprint',
            parent_name: n.sprints.name
          })));
        }
        
        results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const limitedResults = results.slice(0, limit);
        
        const text = limitedResults.map(n => {
          const preview = n.content.substring(0, 100) + (n.content.length > 100 ? '...' : '');
          return `• ${n.title} [${n.type} note] (${n.parent_name})\n  Preview: ${preview}`;
        }).join('\n\n');
        
        return {
          content: [{
            type: "text",
            text: `Found ${limitedResults.length} notes matching "${query}":\n\n${text || 'No notes found'}`
          }]
        };
      }
    );

    // ====== MEMORY MANAGEMENT ======
    
    server.tool(
      'list_memory',
      'List memory entries',
      {
        tags: z.array(z.string()).optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
        mode: z.enum(['meta', 'full']).default('meta')
      },
      async ({ tags, limit, offset, mode }) => {
        const { supabase } = await import('../../../../lib/supabase');
        
        let query = supabase.from('memory').select('*', { count: 'exact' });
        
        if (tags?.length) {
          query = query.overlaps('tags', tags);
        }
        
        query = query
          .range(offset, offset + limit - 1)
          .order('created_at', { ascending: false });
        
        const { data, error, count } = await query;
        if (error) throw error;
        
        const memories = data || [];
        const hasMore = (count || 0) > offset + limit;
        
        if (mode === 'meta') {
          const text = memories.map(m => 
            `• ${m.title} [${m.id}]\n  Tags: ${m.tags?.join(', ') || 'none'}`
          ).join('\n\n');
          
          return {
            content: [{
              type: "text",
              text: `Found ${count} memories${tags?.length ? ` with tags [${tags.join(', ')}]` : ''}:\n\n${text || 'No memories found'}${hasMore ? `\n\n(Showing ${offset + 1}-${offset + memories.length} of ${count})` : ''}`
            }]
          };
        }
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ memories, total: count, has_more: hasMore }, null, 2)
          }]
        };
      }
    );

    server.tool(
      'get_memory',
      'Get detailed memory content',
      {
        memory_id: z.string().optional(),
        memory_title: z.string().optional()
      },
      async (args) => {
        const { supabase } = await import('../../../../lib/supabase');
        
        let query = supabase.from('memory').select('*');
        
        if (args.memory_id) {
          query = query.eq('id', args.memory_id);
        } else if (args.memory_title) {
          query = query.eq('title', args.memory_title);
        } else {
          return formatError('Invalid parameters', 'Either memory_id or memory_title is required');
        }
        
        const { data, error } = await query.single();
        
        if (error || !data) {
          return formatError('Memory not found', 'No memory matches the provided identifier');
        }
        
        return {
          content: [{
            type: "text",
            text: `**${data.title}**\n\n` +
                  `ID: ${data.id}\n` +
                  `Tags: ${data.tags?.join(', ') || 'none'}\n` +
                  `Created: ${new Date(data.created_at).toLocaleDateString()}\n` +
                  `Updated: ${new Date(data.updated_at).toLocaleDateString()}\n\n` +
                  `**Content:**\n${data.content}`
          }]
        };
      }
    );

    server.tool(
      'create_memory',
      'Create a new memory entry',
      {
        title: z.string(),
        content: z.string(),
        tags: z.array(z.string()).optional()
      },
      async ({ title, content, tags }) => {
        const { supabase } = await import('../../../../lib/supabase');
        
        const { data, error } = await supabase
          .from('memory')
          .insert([{
            title,
            content,
            tags: tags || []
          }])
          .select()
          .single();
          
        if (error) throw error;
        
        return formatSuccess('Created memory', title, `ID: ${data.id}`);
      }
    );

    server.tool(
      'update_memory',
      'Update memory entry',
      {
        memory_id: z.string().optional(),
        memory_title: z.string().optional(),
        title: z.string().optional(),
        content: z.string().optional(),
        tags: z.array(z.string()).optional()
      },
      async (args) => {
        const { supabase } = await import('../../../../lib/supabase');
        
        let memoryId: string;
        if (args.memory_id) {
          memoryId = args.memory_id;
        } else if (args.memory_title) {
          const { data } = await supabase
            .from('memory')
            .select('id')
            .eq('title', args.memory_title)
            .single();
          if (!data) {
            return formatError('Memory not found', 'No memory matches the provided title');
          }
          memoryId = data.id;
        } else {
          return formatError('Invalid parameters', 'Either memory_id or memory_title is required');
        }
        
        const updateData: any = {};
        if (args.title !== undefined) updateData.title = args.title;
        if (args.content !== undefined) updateData.content = args.content;
        if (args.tags !== undefined) updateData.tags = args.tags;
        
        const { data, error } = await supabase
          .from('memory')
          .update(updateData)
          .eq('id', memoryId)
          .select()
          .single();
          
        if (error) throw error;
        
        return formatSuccess('Updated memory', data.title);
      }
    );

    server.tool(
      'delete_memory',
      'Delete a memory entry',
      {
        memory_id: z.string().optional(),
        memory_title: z.string().optional()
      },
      async (args) => {
        const { supabase } = await import('../../../../lib/supabase');
        
        let memoryId: string;
        let memoryTitle: string = 'Unknown';
        
        if (args.memory_id) {
          memoryId = args.memory_id;
          const { data } = await supabase
            .from('memory')
            .select('title')
            .eq('id', memoryId)
            .single();
          if (data) memoryTitle = data.title;
        } else if (args.memory_title) {
          const { data } = await supabase
            .from('memory')
            .select('id, title')
            .eq('title', args.memory_title)
            .single();
          if (!data) {
            return formatError('Memory not found', 'No memory matches the provided title');
          }
          memoryId = data.id;
          memoryTitle = data.title;
        } else {
          return formatError('Invalid parameters', 'Either memory_id or memory_title is required');
        }
        
        const { error } = await supabase
          .from('memory')
          .delete()
          .eq('id', memoryId);
          
        if (error) throw error;
        
        return formatSuccess('Deleted memory', memoryTitle);
      }
    );

    // ====== META TOOLS ======
    
    server.tool(
      'search_by_tags',
      'Search entities by tags across the system',
      {
        include: z.array(z.string()),
        exclude: z.array(z.string()).optional(),
        entity_type: z.enum(['memory', 'person_note', 'project_note', 'sprint_note', 'all']).default('all'),
        limit: z.number().default(50),
        mode: z.enum(['meta', 'full']).default('meta')
      },
      async ({ include, exclude, entity_type, limit, mode }) => {
        const { supabase } = await import('../../../../lib/supabase');
        
        const results = [];
        
        if (entity_type === 'all' || entity_type === 'memory') {
          let query = supabase.from('memory').select('*').overlaps('tags', include);
          if (exclude?.length) query = query.not('tags', 'overlaps', exclude);
          const { data } = await query.limit(limit);
          results.push(...(data || []).map((item: any) => ({
            type: 'memory',
            id: item.id,
            title: item.title,
            tags: item.tags,
            created_at: item.created_at,
            preview: mode === 'full' ? item.content.substring(0, 150) + '...' : undefined
          })));
        }
        
        if (entity_type === 'all' || entity_type === 'person_note') {
          let query = supabase.from('person_notes').select('*, people!inner(name)').overlaps('tags', include);
          if (exclude?.length) query = query.not('tags', 'overlaps', exclude);
          const { data } = await query.limit(limit);
          results.push(...(data || []).map((item: any) => ({
            type: 'person_note',
            id: item.id,
            title: item.title,
            tags: item.tags,
            parent_name: item.people.name,
            created_at: item.created_at,
            preview: mode === 'full' ? item.content.substring(0, 150) + '...' : undefined
          })));
        }
        
        if (entity_type === 'all' || entity_type === 'project_note') {
          let query = supabase.from('project_notes').select('*, projects!inner(name)').overlaps('tags', include);
          if (exclude?.length) query = query.not('tags', 'overlaps', exclude);
          const { data } = await query.limit(limit);
          results.push(...(data || []).map((item: any) => ({
            type: 'project_note',
            id: item.id,
            title: item.title,
            tags: item.tags,
            parent_name: item.projects.name,
            created_at: item.created_at,
            preview: mode === 'full' ? item.content.substring(0, 150) + '...' : undefined
          })));
        }
        
        if (entity_type === 'all' || entity_type === 'sprint_note') {
          let query = supabase.from('sprint_notes').select('*, sprints!inner(name)').overlaps('tags', include);
          if (exclude?.length) query = query.not('tags', 'overlaps', exclude);
          const { data } = await query.limit(limit);
          results.push(...(data || []).map((item: any) => ({
            type: 'sprint_note',
            id: item.id,
            title: item.title,
            tags: item.tags,
            parent_name: item.sprints.name,
            created_at: item.created_at,
            preview: mode === 'full' ? item.content.substring(0, 150) + '...' : undefined
          })));
        }
        
        results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const limitedResults = results.slice(0, limit);
        
        if (mode === 'meta') {
          const text = limitedResults.map((item: any) => {
            const parentInfo = (item as any).parent_name ? ` (${(item as any).parent_name})` : '';
            return `• ${item.title} [${item.type}]${parentInfo}\n  ID: ${item.id}\n  Tags: ${item.tags?.join(', ') || 'none'}`;
          }).join('\n\n');
          
          return {
            content: [{
              type: "text",
              text: `Found ${limitedResults.length} items with tags [${include.join(', ')}]${exclude?.length ? ` excluding [${exclude.join(', ')}]` : ''}:\n\n${text || 'No items found'}`
            }]
          };
        }
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ results: limitedResults }, null, 2)
          }]
        };
      }
    );

    server.tool(
      'bulk_get',
      'Fetch multiple entities by IDs',
      {
        entity_type: z.enum(['people', 'projects', 'sprints', 'tasks', 'memory']),
        ids: z.array(z.string()),
        mode: z.enum(['meta', 'full']).default('full')
      },
      async ({ entity_type, ids, mode }) => {
        const { supabase } = await import('../../../../lib/supabase');
        
        if (ids.length === 0) {
          return formatError('Invalid parameters', 'At least one ID is required');
        }
        
        const safeIds = ids.slice(0, 100);
        
        let query: any;
        switch (entity_type) {
          case 'people':
            query = supabase.from('people').select('*, person_notes(count)');
            break;
          case 'projects':
            query = supabase.from('projects').select('*, sprints(count), project_notes(count)');
            break;
          case 'sprints':
            query = supabase.from('sprints').select('*, projects!inner(name), tasks(count), sprint_notes(count)');
            break;
          case 'tasks':
            query = supabase.from('tasks').select('*, sprints!inner(name, projects!inner(name))');
            break;
          case 'memory':
            query = supabase.from('memory').select('*');
            break;
        }
        
        query = query.in('id', safeIds);
        
        const { data, error } = await query;
        if (error) throw error;
        
        const items = data || [];
        
        if (mode === 'meta') {
          let text = '';
          switch (entity_type) {
            case 'people':
              text = items.map((p: any) => `• ${p.name} (${p.relation}) - ${p.person_notes?.[0]?.count || 0} notes`).join('\n');
              break;
            case 'projects':
              text = items.map((p: any) => `• ${p.name} - ${p.sprints?.[0]?.count || 0} sprints, ${p.project_notes?.[0]?.count || 0} notes`).join('\n');
              break;
            case 'sprints':
              text = items.map((s: any) => `• ${s.name} (${s.projects.name}) - ${s.tasks?.[0]?.count || 0} tasks`).join('\n');
              break;
            case 'tasks':
              text = items.map((t: any) => `• ${t.title} - ${t.sprints.projects.name}/${t.sprints.name}`).join('\n');
              break;
            case 'memory':
              text = items.map((m: any) => `• ${m.title} - Tags: ${m.tags?.join(', ') || 'none'}`).join('\n');
              break;
          }
          
          return {
            content: [{
              type: "text",
              text: `Found ${items.length} ${entity_type}:\n\n${text}`
            }]
          };
        }
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ [entity_type]: items }, null, 2)
          }]
        };
      }
    );

    server.tool(
      'get_manifest',
      'Get system overview and statistics',
      {},
      async () => {
        const { supabase } = await import('../../../../lib/supabase');
        
        const [
          { data: customInstructions },
          { data: primaryUser },
          { count: peopleCount },
          { count: projectsCount },
          { count: sprintsCount },
          { count: tasksCount },
          { count: memoriesCount },
          { count: allNotesCount },
          { data: recentPeople },
          { data: recentProjects },
          { data: recentMemories }
        ] = await Promise.all([
          supabase.from('custom_instructions').select('*').single(),
          supabase.from('people').select('*').eq('is_primary_user', true).single(),
          supabase.from('people').select('*', { count: 'exact', head: true }),
          supabase.from('projects').select('*', { count: 'exact', head: true }),
          supabase.from('sprints').select('*', { count: 'exact', head: true }),
          supabase.from('tasks').select('*', { count: 'exact', head: true }),
          supabase.from('memory').select('*', { count: 'exact', head: true }),
          supabase.from('person_notes').select('*', { count: 'exact', head: true }),
          supabase.from('people').select('id, name, relation').limit(5).order('created_at', { ascending: false }),
          supabase.from('projects').select('id, name, is_default_project, is_protected').limit(5).order('created_at', { ascending: false }),
          supabase.from('memory').select('id, title, tags').limit(5).order('created_at', { ascending: false })
        ]);
        
        const protectedProjects = (recentProjects || []).filter((p: any) => p.is_protected).map((p: any) => p.name);
        const defaultProject = (recentProjects || []).find((p: any) => p.is_default_project);
        
        return {
          content: [{
            type: "text",
            text: `**🧠 NEURAL SYSTEM MANIFEST v2.1**\n\n` +
                  `**Primary User:** ${primaryUser?.name || 'Not set'} (${primaryUser?.relation || 'Unknown'})\n` +
                  `TL;DR: ${primaryUser?.tldr || 'No summary'}\n\n` +
                  `**AI Configuration:**\n` +
                  `${customInstructions?.behavior_description?.substring(0, 200) || 'Not configured'}...\n\n` +
                  `**System Statistics:**\n` +
                  `• People: ${peopleCount || 0}\n` +
                  `• Projects: ${projectsCount || 0}\n` +
                  `• Sprints: ${sprintsCount || 0}\n` +
                  `• Tasks: ${tasksCount || 0}\n` +
                  `• Memories: ${memoriesCount || 0}\n` +
                  `• Notes: ${allNotesCount || 0}\n\n` +
                  `**Recent People:**\n${(recentPeople || []).map((p: any) => `• ${p.name} (${p.relation})`).join('\n')}\n\n` +
                  `**Recent Projects:**\n${(recentProjects || []).map((p: any) => `• ${p.name}${p.is_default_project ? ' [DEFAULT]' : ''}${p.is_protected ? ' [PROTECTED]' : ''}`).join('\n')}\n\n` +
                  `**Recent Memories:**\n${(recentMemories || []).map((m: any) => `• ${m.title}${m.tags?.length ? ` [${m.tags.join(', ')}]` : ''}`).join('\n')}\n\n` +
                  `**Protected Entities:**\n` +
                  `• Primary User: ${primaryUser?.name || 'None'}\n` +
                  `• Default Project: ${defaultProject?.name || 'None'}\n` +
                  `• Protected Projects: ${protectedProjects.join(', ') || 'None'}\n\n` +
                  `**Usage Tips:**\n` +
                  `• Use names/slugs for better readability (fallback to IDs)\n` +
                  `• Protected entities cannot be deleted\n` +
                  `• Use list_* tools with mode='full' for JSON data\n` +
                  `• Search by tags across all note types and memories`
          }]
        };
      }
    );

    server.tool(
      'update_instructions',
      'Update AI behavior and MCP instructions',
      {
        behavior_description: z.string().optional(),
        mcp_context_instructions: z.string().optional()
      },
      async ({ behavior_description, mcp_context_instructions }) => {
        const { supabase } = await import('../../../../lib/supabase');
        
        const { data: primaryUser } = await supabase
          .from('people')
          .select('id')
          .eq('is_primary_user', true)
          .single();
          
        if (!primaryUser) {
          return formatError('Primary user not found', 'Cannot update instructions without a primary user');
        }
        
        const updateData: any = { updated_at: new Date().toISOString() };
        if (behavior_description !== undefined) updateData.behavior_description = behavior_description;
        if (mcp_context_instructions !== undefined) updateData.mcp_context_instructions = mcp_context_instructions;
        
        const { error } = await supabase
          .from('custom_instructions')
          .update(updateData)
          .eq('user_id', primaryUser.id);
          
        if (error) throw error;
        
        return formatSuccess('Updated instructions', 'AI behavior and MCP context');
      }
    );
  },
  {},
  { basePath: '/api' },
);

export { handler as GET, handler as POST, handler as DELETE };