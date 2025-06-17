import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { 
  MCPProjectsResponse, 
  MCPProjectsQuery, 
  MCPProject,
  MCPSprint,
  createMCPResponse, 
  createMCPError, 
  MCP_ERROR_CODES 
} from '../../../../lib/mcp-types';
import { requireMCPAuth } from '../../../../lib/mcp-auth';

// JWT auth requires Node.js crypto module
// export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || Date.now().toString();

  // 🔐 AUTH REQUIRED
  const auth = await requireMCPAuth(request, id);
  if (!auth.success) {
    return auth.response;
  }

  // Parse query parameters
  const query: MCPProjectsQuery = {
    status: searchParams.get('status') as any || undefined,
    include_sprints: searchParams.get('include_sprints') === 'true',
    include_tasks: searchParams.get('include_tasks') === 'true',
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
    search: searchParams.get('search') || undefined
  };

  try {
    // Build base query for projects
    let projectsQuery = supabase
      .from('projects')
      .select(`
        id,
        name,
        tldr,
        created_at,
        updated_at
      `);

    // Apply search filter
    if (query.search) {
      projectsQuery = projectsQuery.or(`name.ilike.%${query.search}%,tldr.ilike.%${query.search}%`);
    }

    // Apply ordering and limit
    projectsQuery = projectsQuery
      .order('created_at', { ascending: false })
      .limit(query.limit || 50);

    const { data: projects, error: projectsError } = await projectsQuery;

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return NextResponse.json(
        createMCPError(id, MCP_ERROR_CODES.DATABASE_ERROR, "Failed to fetch projects", { error: projectsError }),
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

    // Get total count
    let countQuery = supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    if (query.search) {
      countQuery = countQuery.or(`name.ilike.%${query.search}%,tldr.ilike.%${query.search}%`);
    }

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      console.error('Error getting projects count:', countError);
      return NextResponse.json(
        createMCPError(id, MCP_ERROR_CODES.DATABASE_ERROR, "Failed to get projects count", { error: countError }),
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

    // Enhance projects with sprint and task data
    const enhancedProjects: MCPProject[] = await Promise.all(
      (projects || []).map(async (project) => {
        // Get sprint counts and data
        let sprintsQuery = supabase
          .from('sprints')
          .select('*')
          .eq('project_id', project.id);

        // Apply status filter if provided
        if (query.status) {
          sprintsQuery = sprintsQuery.eq('status', query.status);
        }

        const { data: sprints } = await sprintsQuery.order('created_at', { ascending: false });

        // Calculate sprint statistics
        const sprintCount = sprints?.length || 0;
        const activeSprintsCount = sprints?.filter(s => s.status === 'active').length || 0;

        // Get total tasks count for this project
        const { count: totalTasks } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .in('sprint_id', sprints?.map(s => s.id) || []);

        // Calculate completion rate
        const { count: completedTasks } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed')
          .in('sprint_id', sprints?.map(s => s.id) || []);

        const completionRate = totalTasks ? Math.round((completedTasks || 0) / totalTasks * 100) : 0;

        let enhancedSprints: MCPSprint[] | undefined = undefined;

        if (query.include_sprints && sprints) {
          // Enhance sprints with task data
          enhancedSprints = await Promise.all(
            sprints.map(async (sprint) => {
              // Get tasks for this sprint
              const { data: sprintTasks, count: taskCount } = await supabase
                .from('tasks')
                .select('*', { count: 'exact' })
                .eq('sprint_id', sprint.id)
                .order('priority', { ascending: false });

              const { count: completedTasksCount } = await supabase
                .from('tasks')
                .select('*', { count: 'exact', head: true })
                .eq('sprint_id', sprint.id)
                .eq('status', 'completed');

              const progressPercentage = taskCount ? Math.round((completedTasksCount || 0) / taskCount * 100) : 0;

              let tasks = undefined;
              let notes = undefined;

              if (query.include_tasks) {
                tasks = sprintTasks || [];
              }

              // Get sprint notes if including sprints
              const { data: sprintNotes } = await supabase
                .from('sprint_notes')
                .select('*')
                .eq('sprint_id', sprint.id)
                .order('created_at', { ascending: false })
                .limit(5);

              notes = sprintNotes || [];

              return {
                ...sprint,
                task_count: taskCount || 0,
                completed_tasks: completedTasksCount || 0,
                project_name: project.name,
                tasks,
                notes,
                progress_percentage: progressPercentage
              };
            })
          );
        }

        return {
          ...project,
          sprint_count: sprintCount,
          total_tasks: totalTasks || 0,
          active_sprints: activeSprintsCount,
          sprints: enhancedSprints,
          completion_rate: completionRate
        };
      })
    );

    const response: MCPProjectsResponse = {
      projects: enhancedProjects,
      total_count: totalCount || 0,
      filters_applied: query
    };

    return NextResponse.json(
      createMCPResponse(id, response),
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Content-Type, Authorization': 'application/json',
        }
      }
    );

  } catch (error) {
    console.error('Error in projects endpoint:', error);
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