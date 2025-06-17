import { NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';
import { 
  MCPTasksResponse,
  MCPTasksQuery,
  MCPTaskWithContext,
  createMCPResponse, 
  createMCPError, 
  MCP_ERROR_CODES 
} from '../../../../../lib/mcp-types';
import { requireMCPAuth } from '../../../../../lib/mcp-auth';

// ====== Urgency Calculation ======
function calculateUrgencyScore(task: any, daysPending: number): number {
  let urgencyScore = 0;
  
  // Priority weight (40% of score)
  urgencyScore += (task.priority / 5) * 40;
  
  // Days pending weight (35% of score)
  if (daysPending <= 1) urgencyScore += 35;
  else if (daysPending <= 3) urgencyScore += 30;
  else if (daysPending <= 7) urgencyScore += 25;
  else if (daysPending <= 14) urgencyScore += 15;
  else if (daysPending <= 30) urgencyScore += 10;
  else urgencyScore += 5; // Very stale
  
  // Status weight (25% of score)
  if (task.status === 'pending') urgencyScore += 25;
  else if (task.status === 'in_progress') urgencyScore += 15;
  else urgencyScore += 0; // Completed
  
  return Math.round(urgencyScore);
}

// ====== Blocker Detection ======
function isBlocked(task: any, daysPending: number): { 
  is_blocked: boolean; 
  blocker_reason?: string; 
  suggested_actions?: string[]; 
} {
  const blockers = [];
  
  // High priority tasks pending too long
  if (task.status === 'pending' && task.priority >= 4 && daysPending > 14) {
    blockers.push(`Task de alta prioridade (${task.priority}/5) pendente há ${daysPending} dias`);
  }
  
  // Critical tasks pending >7 days
  if (task.status === 'pending' && task.priority === 5 && daysPending > 7) {
    blockers.push(`Task crítica pendente há ${daysPending} dias`);
  }
  
  // In-progress tasks stalled
  if (task.status === 'in_progress' && daysPending > 21) {
    blockers.push(`Task "em progresso" há ${daysPending} dias sem conclusão`);
  }
  
  if (blockers.length > 0) {
    const suggestedActions = [];
    
    if (task.priority === 5) {
      suggestedActions.push('URGENTE: Tratar imediatamente');
    }
    if (daysPending > 30) {
      suggestedActions.push('Considerar quebrar em subtasks menores');
    }
    if (task.status === 'in_progress') {
      suggestedActions.push('Verificar impedimentos ou redefinir scope');
    } else {
      suggestedActions.push('Revisar e iniciar ou redelegar');
    }
    
    return {
      is_blocked: true,
      blocker_reason: blockers[0],
      suggested_actions: suggestedActions
    };
  }
  
  return { is_blocked: false };
}

// ====== Date Parsing ======
function parseRelativeDate(dateStr: string): Date | null {
  const now = new Date();
  const match = dateStr.match(/^(\d+)([dwm])$/);
  if (!match) return null;
  
  const amount = parseInt(match[1]);
  const unit = match[2];
  
  if (unit === 'd') {
    return new Date(now.getTime() - amount * 24 * 60 * 60 * 1000);
  } else if (unit === 'w') {
    return new Date(now.getTime() - amount * 7 * 24 * 60 * 60 * 1000);
  } else if (unit === 'm') {
    return new Date(now.getTime() - amount * 30 * 24 * 60 * 60 * 1000);
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

  // Parse query parameters
  const query: MCPTasksQuery = {
    status: searchParams.get('status') as any || undefined,
    priority_min: searchParams.get('priority_min') ? parseInt(searchParams.get('priority_min')!) : undefined,
    priority_max: searchParams.get('priority_max') ? parseInt(searchParams.get('priority_max')!) : undefined,
    due_date: searchParams.get('due_date') || undefined,
    project_id: searchParams.get('project_id') || undefined,
    sprint_id: searchParams.get('sprint_id') || undefined,
    blocked: searchParams.get('blocked') === 'true' ? true : (searchParams.get('blocked') === 'false' ? false : undefined),
    days_pending_min: searchParams.get('days_pending_min') ? parseInt(searchParams.get('days_pending_min')!) : undefined,
    sort: searchParams.get('sort') as any || 'urgency',
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
  };

  try {
    // Build base query for tasks with joins
    let tasksQuery = supabase
      .from('tasks')
      .select(`
        *,
        sprints!inner(
          id,
          name,
          project_id,
          projects!inner(
            id,
            name
          )
        )
      `);

    // Apply filters
    if (query.status) {
      tasksQuery = tasksQuery.eq('status', query.status);
    }

    if (query.priority_min !== undefined) {
      tasksQuery = tasksQuery.gte('priority', query.priority_min);
    }

    if (query.priority_max !== undefined) {
      tasksQuery = tasksQuery.lte('priority', query.priority_max);
    }

    if (query.project_id) {
      tasksQuery = tasksQuery.eq('sprints.project_id', query.project_id);
    }

    if (query.sprint_id) {
      tasksQuery = tasksQuery.eq('sprint_id', query.sprint_id);
    }

    // Apply due date filter
    if (query.due_date) {
      const dueDate = parseRelativeDate(query.due_date);
      if (dueDate) {
        tasksQuery = tasksQuery.lte('created_at', dueDate.toISOString());
      }
    }

    // Apply days pending filter
    if (query.days_pending_min !== undefined) {
      const cutoffDate = new Date(Date.now() - query.days_pending_min * 24 * 60 * 60 * 1000);
      tasksQuery = tasksQuery.lte('created_at', cutoffDate.toISOString());
    }

    // Execute query
    const { data: tasks, error: tasksError } = await tasksQuery
      .order('priority', { ascending: false })
      .limit(query.limit || 50);

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      return NextResponse.json(
        createMCPError(id, MCP_ERROR_CODES.DATABASE_ERROR, "Failed to fetch tasks", { error: tasksError }),
        { status: 500 }
      );
    }

    const now = new Date();

    // Process tasks with context and scoring
    const processedTasks: MCPTaskWithContext[] = (tasks || []).map(task => {
      const daysPending = Math.floor((now.getTime() - new Date(task.created_at).getTime()) / (1000 * 60 * 60 * 24));
      const urgencyScore = calculateUrgencyScore(task, daysPending);
      const blockerInfo = isBlocked(task, daysPending);
      
      // Build context path
      const projectName = task.sprints?.projects?.name || 'Unknown Project';
      const sprintName = task.sprints?.name || 'Unknown Sprint';
      const contextPath = `${projectName} > ${sprintName} > ${task.title}`;

      return {
        ...task,
        project_name: projectName,
        project_id: task.sprints?.projects?.id || '',
        sprint_name: sprintName,
        sprint_id: task.sprint_id,
        context_path: contextPath,
        days_pending: daysPending,
        urgency_score: urgencyScore,
        ...blockerInfo,
        estimated_effort: undefined, // Could be added later
        suggested_actions: blockerInfo.suggested_actions
      };
    });

    // Apply blocked filter after processing
    let filteredTasks = processedTasks;
    if (query.blocked !== undefined) {
      filteredTasks = processedTasks.filter(task => task.is_blocked === query.blocked);
    }

    // Apply sorting
    switch (query.sort) {
      case 'priority':
        filteredTasks.sort((a, b) => b.priority - a.priority);
        break;
      case 'created':
        filteredTasks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'due_date':
        // Sort by days pending (oldest first for due date)
        filteredTasks.sort((a, b) => b.days_pending - a.days_pending);
        break;
      case 'project':
        filteredTasks.sort((a, b) => a.project_name.localeCompare(b.project_name));
        break;
      default: // 'urgency'
        filteredTasks.sort((a, b) => b.urgency_score - a.urgency_score);
    }

    // Calculate summary statistics
    const summary = {
      total_tasks: filteredTasks.length,
      by_status: filteredTasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      by_priority: filteredTasks.reduce((acc, task) => {
        acc[task.priority.toString()] = (acc[task.priority.toString()] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      by_project: filteredTasks.reduce((acc, task) => {
        acc[task.project_name] = (acc[task.project_name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      blocked_tasks: filteredTasks.filter(t => t.is_blocked).length,
      urgent_tasks: filteredTasks.filter(t => t.priority >= 4 && t.days_pending >= 7).length
    };

    const queryTime = Date.now() - startTime;

    const response: MCPTasksResponse = {
      tasks: filteredTasks,
      summary,
      performance: {
        query_time_ms: queryTime
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
    console.error('Error in tasks endpoint:', error);
    return NextResponse.json(
      createMCPError(id, MCP_ERROR_CODES.INTERNAL_ERROR, "Internal server error", { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500 }
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