import { NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';
import { 
  MCPProjectsAnalyticsResponse,
  MCPProjectsAnalytics,
  createMCPResponse, 
  createMCPError, 
  MCP_ERROR_CODES 
} from '../../../../../lib/mcp-types';
import { requireMCPAuth } from '../../../../../lib/mcp-auth';

// ====== Analytics Helper Functions ======
function calculateHealthScore(project: any, sprints: any[], tasks: any[]): number {
  let healthScore = 50; // Base score
  const now = new Date();
  
  // Recent activity scoring
  const daysSinceActivity = Math.floor((now.getTime() - new Date(project.updated_at).getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceActivity <= 7) healthScore += 30;
  else if (daysSinceActivity <= 14) healthScore += 15;
  
  // Active sprints scoring
  const activeSprintsCount = sprints.filter(s => s.status === 'active').length;
  if (activeSprintsCount > 0) healthScore += 20;
  
  // Completion rate scoring
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  if (completionRate > 80) healthScore += 25;
  else if (completionRate > 60) healthScore += 15;
  else if (completionRate > 40) healthScore += 10;
  
  // No blocked tasks scoring
  const blockedTasks = tasks.filter(t => 
    t.status === 'pending' && 
    ((now.getTime() - new Date(t.created_at).getTime()) / (1000 * 60 * 60 * 24)) > 14 &&
    t.priority >= 4
  ).length;
  if (blockedTasks === 0) healthScore += 15;
  
  return Math.min(100, healthScore);
}

function determineProjectHealth(healthScore: number, daysSinceActivity: number, blockedTasks: number): 'healthy' | 'needs_attention' | 'stale' | 'blocked' {
  if (blockedTasks > 0) return 'blocked';
  if (daysSinceActivity > 30) return 'stale';
  if (healthScore < 40) return 'needs_attention';
  return 'healthy';
}

function generateSuggestedActions(project: any, healthScore: number, daysSinceActivity: number, blockedTasks: number, completionRate: number): string[] {
  const actions: string[] = [];
  
  if (blockedTasks > 0) {
    actions.push(`Resolver ${blockedTasks} task(s) bloqueada(s)`);
  }
  
  if (daysSinceActivity > 14) {
    actions.push(`Retomar atividade - ${daysSinceActivity} dias sem updates`);
  }
  
  if (completionRate < 30) {
    actions.push('Focar em completar tasks pendentes');
  }
  
  if (healthScore < 50) {
    actions.push('Revisar estratégia do projeto');
  }
  
  return actions.length > 0 ? actions : ['Continuar progresso atual'];
}

function getWeekKey(date: Date): string {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  return startOfWeek.toISOString().split('T')[0];
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

  try {
    // Get all projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (projectsError) {
      console.error('Error fetching projects for analytics:', projectsError);
      return NextResponse.json(
        createMCPError(id, MCP_ERROR_CODES.DATABASE_ERROR, "Failed to fetch projects", { error: projectsError }),
        { status: 500 }
      );
    }

    // Get all sprints
    const { data: sprints, error: sprintsError } = await supabase
      .from('sprints')
      .select('*');

    if (sprintsError) {
      console.error('Error fetching sprints for analytics:', sprintsError);
      return NextResponse.json(
        createMCPError(id, MCP_ERROR_CODES.DATABASE_ERROR, "Failed to fetch sprints", { error: sprintsError }),
        { status: 500 }
      );
    }

    // Get all tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*');

    if (tasksError) {
      console.error('Error fetching tasks for analytics:', tasksError);
      return NextResponse.json(
        createMCPError(id, MCP_ERROR_CODES.DATABASE_ERROR, "Failed to fetch tasks", { error: tasksError }),
        { status: 500 }
      );
    }

    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Overview calculations
    const activeProjects = projects?.filter(p => {
      const projectSprints = sprints?.filter(s => s.project_id === p.id) || [];
      return projectSprints.some(s => s.status === 'active');
    }).length || 0;

    const completedProjects = projects?.filter(p => {
      const projectSprints = sprints?.filter(s => s.project_id === p.id) || [];
      return projectSprints.length > 0 && projectSprints.every(s => s.status === 'completed');
    }).length || 0;

    const archivedProjects = projects?.filter(p => {
      const projectSprints = sprints?.filter(s => s.project_id === p.id) || [];
      return projectSprints.some(s => s.status === 'archived');
    }).length || 0;

    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
    const overallCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Productivity calculations
    const tasksCompletedLast7d = tasks?.filter(t => 
      t.status === 'completed' && 
      t.completed_at && 
      new Date(t.completed_at) > last7Days
    ).length || 0;

    const tasksCompletedLast30d = tasks?.filter(t => 
      t.status === 'completed' && 
      t.completed_at && 
      new Date(t.completed_at) > last30Days
    ).length || 0;

    const avgTasksPerWeek = Math.round(tasksCompletedLast30d / 4.3); // Approximate weeks in 30 days

    // Completion velocity (last 8 weeks)
    const completionVelocity = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const weekTasks = tasks?.filter(t => {
        const taskDate = new Date(t.created_at);
        return taskDate >= weekStart && taskDate < weekEnd;
      }) || [];
      
      const weekCompletedTasks = weekTasks.filter(t => t.status === 'completed').length;
      const weekCompletionRate = weekTasks.length > 0 ? Math.round((weekCompletedTasks / weekTasks.length) * 100) : 0;
      
      completionVelocity.push({
        week: getWeekKey(weekStart),
        completed_tasks: weekCompletedTasks,
        completion_rate: weekCompletionRate
      });
    }

    // Projects health analysis
    const projectsHealth = [];
    let mostProductiveProject = '';
    let longestStaleProject = '';
    let maxCompletedTasks = 0;
    let maxDaysSinceActivity = 0;

    for (const project of projects || []) {
      const projectSprints = sprints?.filter(s => s.project_id === project.id) || [];
      const projectTasks = tasks?.filter(t => {
        const taskSprint = sprints?.find(s => s.id === t.sprint_id);
        return taskSprint?.project_id === project.id;
      }) || [];

      const daysSinceActivity = Math.floor((now.getTime() - new Date(project.updated_at).getTime()) / (1000 * 60 * 60 * 24));
      const completedTasksCount = projectTasks.filter(t => t.status === 'completed').length;
      const completionRate = projectTasks.length > 0 ? Math.round((completedTasksCount / projectTasks.length) * 100) : 0;
      
      const healthScore = calculateHealthScore(project, projectSprints, projectTasks);
      const projectHealth = determineProjectHealth(healthScore, daysSinceActivity, 0); // Simplified for overview
      
      const blockedTasksCount = projectTasks.filter(t => 
        t.status === 'pending' && 
        ((now.getTime() - new Date(t.created_at).getTime()) / (1000 * 60 * 60 * 24)) > 14 &&
        t.priority >= 4
      ).length;

      const suggestedActions = generateSuggestedActions(project, healthScore, daysSinceActivity, blockedTasksCount, completionRate);

      projectsHealth.push({
        project_name: project.name,
        project_id: project.id,
        health_score: healthScore,
        status: projectHealth,
        last_activity: project.updated_at,
        completion_rate: completionRate,
        active_sprints: projectSprints.filter(s => s.status === 'active').length,
        pending_tasks: projectTasks.filter(t => t.status === 'pending').length,
        blocked_tasks: blockedTasksCount,
        suggested_actions: suggestedActions
      });

      // Track most productive and stale projects
      if (completedTasksCount > maxCompletedTasks) {
        maxCompletedTasks = completedTasksCount;
        mostProductiveProject = project.name;
      }

      if (daysSinceActivity > maxDaysSinceActivity) {
        maxDaysSinceActivity = daysSinceActivity;
        longestStaleProject = project.name;
      }
    }

    // Highest priority tasks
    const highestPriorityTasks = (tasks || [])
      .filter(t => t.status !== 'completed' && t.priority >= 4)
      .map(t => {
        const taskSprint = sprints?.find(s => s.id === t.sprint_id);
        const taskProject = projects?.find(p => p.id === taskSprint?.project_id);
        const daysPending = Math.floor((now.getTime() - new Date(t.created_at).getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          task_title: t.title,
          project_name: taskProject?.name || 'Unknown',
          priority: t.priority,
          days_pending: daysPending
        };
      })
      .sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return b.days_pending - a.days_pending;
      })
      .slice(0, 5);

    // Completion trends
    const recentVelocity = completionVelocity.slice(-4); // Last 4 weeks
    const olderVelocity = completionVelocity.slice(-8, -4); // 4 weeks before that
    
    const recentAvg = recentVelocity.reduce((sum, week) => sum + week.completion_rate, 0) / recentVelocity.length;
    const olderAvg = olderVelocity.reduce((sum, week) => sum + week.completion_rate, 0) / olderVelocity.length;
    
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    let changePercentage = 0;
    
    if (olderAvg > 0) {
      changePercentage = Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
      if (changePercentage > 10) trend = 'improving';
      else if (changePercentage < -10) trend = 'declining';
    }

    // Generate recommendations
    const recommendations: string[] = [];
    
    const blockedProjectsCount = projectsHealth.filter(p => p.status === 'blocked').length;
    const staleProjectsCount = projectsHealth.filter(p => p.status === 'stale').length;
    
    if (blockedProjectsCount > 0) {
      recommendations.push(`${blockedProjectsCount} projeto(s) com tasks bloqueadas precisam atenção`);
    }
    
    if (staleProjectsCount > 0) {
      recommendations.push(`${staleProjectsCount} projeto(s) sem atividade recente - considere reativar ou arquivar`);
    }
    
    if (overallCompletionRate < 50) {
      recommendations.push('Taxa de conclusão baixa - revisar priorização e scope das tasks');
    }
    
    if (trend === 'declining') {
      recommendations.push('Produtividade em declínio - considere reduzir workload ou melhorar foco');
    }

    if (recommendations.length === 0) {
      recommendations.push('Ótimo trabalho! Continue mantendo o ritmo atual');
    }

    const queryTime = Date.now() - startTime;

    const analytics: MCPProjectsAnalytics = {
      overview: {
        total_projects: projects?.length || 0,
        active_projects: activeProjects,
        completed_projects: completedProjects,
        archived_projects: archivedProjects,
        total_sprints: sprints?.length || 0,
        active_sprints: sprints?.filter(s => s.status === 'active').length || 0,
        total_tasks: totalTasks,
        overall_completion_rate: overallCompletionRate
      },
      productivity: {
        tasks_completed_last_7d: tasksCompletedLast7d,
        tasks_completed_last_30d: tasksCompletedLast30d,
        avg_tasks_per_week: avgTasksPerWeek,
        completion_velocity: completionVelocity
      },
      projects_health: projectsHealth,
      insights: {
        most_productive_project: mostProductiveProject,
        longest_stale_project: longestStaleProject,
        highest_priority_tasks: highestPriorityTasks,
        completion_trends: {
          trend,
          change_percentage: changePercentage,
          period: 'last_4_weeks_vs_previous_4'
        },
        recommendations
      }
    };

    const response: MCPProjectsAnalyticsResponse = {
      analytics,
      generated_at: new Date().toISOString(),
      query_time_ms: queryTime
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
    console.error('Error in projects analytics endpoint:', error);
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