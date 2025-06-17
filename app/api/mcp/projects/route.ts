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

// ====== Health Scoring & Business Logic ======
function calculateHealthScore(project: any, sprints: any[], tasks: any[]): {
  health_score: number;
  project_health: 'healthy' | 'needs_attention' | 'stale' | 'blocked';
  days_since_activity: number;
  blocked_tasks_count: number;
  next_suggested_actions: string[];
  last_activity: string;
} {
  let healthScore = 0;
  const now = new Date();
  
  // Calculate days since last activity
  const lastTaskUpdate = tasks.length > 0 
    ? Math.max(...tasks.map(t => new Date(t.created_at).getTime()))
    : 0;
  const lastSprintUpdate = sprints.length > 0
    ? Math.max(...sprints.map(s => new Date(s.updated_at).getTime()))
    : 0;
  const lastActivity = Math.max(lastTaskUpdate, lastSprintUpdate, new Date(project.updated_at).getTime());
  const daysSinceActivity = Math.floor((now.getTime() - lastActivity) / (1000 * 60 * 60 * 24));
  
  // Health scoring algorithm:
  // 1. Active sprints: +20 points
  const activeSprintsCount = sprints.filter(s => s.status === 'active').length;
  if (activeSprintsCount > 0) healthScore += 20;
  
  // 2. Recent activity (7d): +30 points, (14d): +15 points
  if (daysSinceActivity <= 7) healthScore += 30;
  else if (daysSinceActivity <= 14) healthScore += 15;
  
  // 3. High completion rate (>80%): +25 points, (>60%): +15 points, (>40%): +10 points
  const completionRate = project.completion_rate || 0;
  if (completionRate > 80) healthScore += 25;
  else if (completionRate > 60) healthScore += 15;
  else if (completionRate > 40) healthScore += 10;
  
  // 4. No blocked tasks: +15 points
  const blockedTasks = tasks.filter(t => 
    t.status === 'pending' && 
    ((now.getTime() - new Date(t.created_at).getTime()) / (1000 * 60 * 60 * 24)) > 14 &&
    t.priority >= 4
  );
  const blockedTasksCount = blockedTasks.length;
  if (blockedTasksCount === 0) healthScore += 15;
  
  // 5. Regular progress: +10 points (tasks completed recently)
  const recentCompletedTasks = tasks.filter(t => 
    t.status === 'completed' && 
    ((now.getTime() - new Date(t.created_at).getTime()) / (1000 * 60 * 60 * 24)) <= 30
  ).length;
  if (recentCompletedTasks > 0) healthScore += 10;
  
  // Determine health status
  let projectHealth: 'healthy' | 'needs_attention' | 'stale' | 'blocked' = 'healthy';
  if (blockedTasksCount > 0) projectHealth = 'blocked';
  else if (daysSinceActivity > 30) projectHealth = 'stale';
  else if (healthScore < 40) projectHealth = 'needs_attention';
  
  // Generate suggested actions
  const suggestedActions: string[] = [];
  if (blockedTasksCount > 0) {
    suggestedActions.push(`Resolver ${blockedTasksCount} task(s) bloqueada(s) há mais de 14 dias`);
  }
  if (daysSinceActivity > 7) {
    suggestedActions.push(`Adicionar progresso - último update há ${daysSinceActivity} dias`);
  }
  if (completionRate < 50 && tasks.length > 0) {
    suggestedActions.push('Focar em completar tasks pendentes para melhorar completion rate');
  }
  if (activeSprintsCount === 0 && sprints.length > 0) {
    suggestedActions.push('Reativar ou criar novo sprint para continuar progresso');
  }
  
  return {
    health_score: Math.min(100, healthScore),
    project_health: projectHealth,
    days_since_activity: daysSinceActivity,
    blocked_tasks_count: blockedTasksCount,
    next_suggested_actions: suggestedActions,
    last_activity: new Date(lastActivity).toISOString()
  };
}

function parseRelativeDate(dateStr: string): Date | null {
  const now = new Date();
  const match = dateStr.match(/^(\d+)([dw])$/);
  if (!match) return null;
  
  const amount = parseInt(match[1]);
  const unit = match[2];
  
  if (unit === 'd') {
    return new Date(now.getTime() - amount * 24 * 60 * 60 * 1000);
  } else if (unit === 'w') {
    return new Date(now.getTime() - amount * 7 * 24 * 60 * 60 * 1000);
  }
  return null;
}

export async function GET(request: Request) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || Date.now().toString();

  // 🔐 AUTH REQUIRED
  const auth = await requireMCPAuth(request, id);
  if (!auth.success) {
    return auth.response;
  }

  // Parse query parameters with expanded options
  const query: MCPProjectsQuery = {
    status: searchParams.get('status') as any || undefined,
    include_sprints: searchParams.get('include_sprints') === 'true',
    include_tasks: searchParams.get('include_tasks') === 'true',
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
    search: searchParams.get('search') || undefined,
    
    // New advanced filters
    health: searchParams.get('health') as any || undefined,
    last_activity: searchParams.get('last_activity') || undefined,
    completion_rate_min: searchParams.get('completion_rate_min') ? parseInt(searchParams.get('completion_rate_min')!) : undefined,
    completion_rate_max: searchParams.get('completion_rate_max') ? parseInt(searchParams.get('completion_rate_max')!) : undefined,
    has_active_sprints: searchParams.get('has_active_sprints') === 'true' ? true : (searchParams.get('has_active_sprints') === 'false' ? false : undefined),
    priority_level: searchParams.get('priority_level') as any || undefined,
    sort: searchParams.get('sort') as any || 'newest',
    include_blockers: searchParams.get('include_blockers') === 'true',
    team_member: searchParams.get('team_member') || undefined
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

    // Apply last_activity filter
    if (query.last_activity) {
      const activityDate = parseRelativeDate(query.last_activity);
      if (activityDate) {
        projectsQuery = projectsQuery.gte('updated_at', activityDate.toISOString());
      }
    }

    // Get total count first
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

    // Get projects with basic ordering (will be re-sorted after health calculation)
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

    // Enhance projects with sprint, task data, and health scoring
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

        // Get all tasks for this project
        const { data: allTasks, count: totalTasks } = await supabase
          .from('tasks')
          .select('*', { count: 'exact' })
          .in('sprint_id', sprints?.map(s => s.id) || []);

        // Calculate completion rate
        const { count: completedTasks } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed')
          .in('sprint_id', sprints?.map(s => s.id) || []);

        const completionRate = totalTasks ? Math.round((completedTasks || 0) / totalTasks * 100) : 0;

        // Calculate health score and project health
        const healthData = calculateHealthScore(
          { ...project, completion_rate: completionRate },
          sprints || [],
          allTasks || []
        );

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
          completion_rate: completionRate,
          ...healthData
        };
      })
    );

    // Apply advanced filters after enhancement
    let filteredProjects = enhancedProjects;

    // Filter by health
    if (query.health) {
      filteredProjects = filteredProjects.filter(p => p.project_health === query.health);
    }

    // Filter by completion rate
    if (query.completion_rate_min !== undefined) {
      filteredProjects = filteredProjects.filter(p => (p.completion_rate || 0) >= query.completion_rate_min!);
    }
    if (query.completion_rate_max !== undefined) {
      filteredProjects = filteredProjects.filter(p => (p.completion_rate || 0) <= query.completion_rate_max!);
    }

    // Filter by active sprints
    if (query.has_active_sprints !== undefined) {
      filteredProjects = filteredProjects.filter(p => 
        query.has_active_sprints ? p.active_sprints > 0 : p.active_sprints === 0
      );
    }

    // Apply sorting
    switch (query.sort) {
      case 'health':
        filteredProjects.sort((a, b) => (b.health_score || 0) - (a.health_score || 0));
        break;
      case 'activity':
        filteredProjects.sort((a, b) => (a.days_since_activity || 0) - (b.days_since_activity || 0));
        break;
      case 'completion':
        filteredProjects.sort((a, b) => (b.completion_rate || 0) - (a.completion_rate || 0));
        break;
      case 'urgency':
        filteredProjects.sort((a, b) => {
          const urgencyA = (a.blocked_tasks_count || 0) * 10 + (5 - (a.health_score || 0) / 20);
          const urgencyB = (b.blocked_tasks_count || 0) * 10 + (5 - (b.health_score || 0) / 20);
          return urgencyB - urgencyA;
        });
        break;
      case 'name':
        filteredProjects.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // 'newest'
        filteredProjects.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    const queryTime = Date.now() - startTime;

    const response: MCPProjectsResponse = {
      projects: filteredProjects,
      total_count: totalCount || 0,
      filters_applied: query,
      performance: {
        query_time_ms: queryTime,
        health_calculated: true
      }
    };

    return NextResponse.json(
      createMCPResponse(id, response),
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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