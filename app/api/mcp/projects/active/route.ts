import { NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';
import { 
  MCPActiveProjectsResponse,
  MCPActiveProject,
  MCPProject,
  MCPSprint,
  createMCPResponse, 
  createMCPError, 
  MCP_ERROR_CODES 
} from '../../../../../lib/mcp-types';
import { requireMCPAuth } from '../../../../../lib/mcp-auth';

// ====== Blocker Detection Logic ======
function detectBlockers(tasks: any[]): Array<{
  task_id: string;
  task_title: string;
  blocker_reason: string;
  suggested_action: string;
  priority: number;
}> {
  const now = new Date();
  const blockers: Array<{
    task_id: string;
    task_title: string;
    blocker_reason: string;
    suggested_action: string;
    priority: number;
  }> = [];

  tasks.forEach(task => {
    const daysPending = Math.floor((now.getTime() - new Date(task.created_at).getTime()) / (1000 * 60 * 60 * 24));
    
    // Blocker detection criteria:
    // 1. High priority tasks pending >14 days
    if (task.status === 'pending' && task.priority >= 4 && daysPending > 14) {
      blockers.push({
        task_id: task.id,
        task_title: task.title,
        blocker_reason: `Task de alta prioridade (${task.priority}/5) pendente há ${daysPending} dias`,
        suggested_action: 'Revisar e desbloqueiar ou dividir em subtasks menores',
        priority: task.priority
      });
    }
    
    // 2. In-progress tasks stalled >21 days
    if (task.status === 'in_progress' && daysPending > 21) {
      blockers.push({
        task_id: task.id,
        task_title: task.title,
        blocker_reason: `Task "em progresso" há ${daysPending} dias sem conclusão`,
        suggested_action: 'Verificar impedimentos ou redefinir scope da task',
        priority: task.priority
      });
    }

    // 3. Critical priority tasks (5) pending >7 days
    if (task.status === 'pending' && task.priority === 5 && daysPending > 7) {
      blockers.push({
        task_id: task.id,
        task_title: task.title,
        blocker_reason: `Task crítica (prioridade 5) pendente há ${daysPending} dias`,
        suggested_action: 'URGENTE: Tratar imediatamente ou redelegar',
        priority: task.priority
      });
    }
  });

  return blockers.sort((a, b) => b.priority - a.priority);
}

// ====== Urgency Detection ======
function getUrgentTasks(tasks: any[], sprintName: string): Array<any> {
  const now = new Date();
  
  return tasks
    .filter(task => {
      const daysPending = Math.floor((now.getTime() - new Date(task.created_at).getTime()) / (1000 * 60 * 60 * 24));
      
      // Urgent criteria:
      return (
        (task.priority >= 4 && task.status !== 'completed') || // High priority non-completed
        (task.priority === 5) || // Critical priority
        (task.status === 'in_progress' && daysPending > 14) // Long in-progress
      );
    })
    .map(task => ({
      ...task,
      sprint_name: sprintName,
      days_pending: Math.floor((now.getTime() - new Date(task.created_at).getTime()) / (1000 * 60 * 60 * 24))
    }))
    .sort((a, b) => {
      // Sort by priority, then by days pending
      if (a.priority !== b.priority) return b.priority - a.priority;
      return b.days_pending - a.days_pending;
    });
}

// ====== Next Actions Generator ======
function generateNextActions(project: MCPProject, sprints: MCPSprint[], blockers: any[]): string[] {
  const actions: string[] = [];
  
  // Blocker-based actions
  if (blockers.length > 0) {
    actions.push(`🚨 Resolver ${blockers.length} blocker(s) crítico(s)`);
    
    const criticalBlockers = blockers.filter(b => b.priority === 5);
    if (criticalBlockers.length > 0) {
      actions.push(`⚡ URGENTE: ${criticalBlockers.length} task(s) crítica(s) bloqueada(s)`);
    }
  }
  
  // Sprint-based actions
  const activeSprintsCount = sprints.filter(s => s.status === 'active').length;
  if (activeSprintsCount === 0) {
    actions.push('📋 Criar novo sprint ativo para organizar work');
  }
  
  // Completion rate based actions
  if (project.completion_rate && project.completion_rate < 30) {
    actions.push('🎯 Focar em completar tasks existentes antes de adicionar novas');
  }
  
  // Health-based actions
  if (project.health_score && project.health_score < 50) {
    actions.push('💡 Revisar projeto - health score baixo indica necessidade de atenção');
  }
  
  // Activity-based actions
  if (project.days_since_activity && project.days_since_activity > 7) {
    actions.push(`⏰ Adicionar progresso - sem atividade há ${project.days_since_activity} dias`);
  }
  
  // Default actions if none found
  if (actions.length === 0) {
    actions.push('✅ Projeto saudável - continuar progresso atual');
  }
  
  return actions.slice(0, 4); // Max 4 actions
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
    // Get all projects with active sprints only
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        tldr,
        created_at,
        updated_at
      `)
      .order('name');

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return NextResponse.json(
        createMCPError(id, MCP_ERROR_CODES.DATABASE_ERROR, "Failed to fetch projects", { error: projectsError }),
        { status: 500 }
      );
    }

    // Process each project and filter for active ones
    const activeProjectsData: MCPActiveProject[] = [];
    let totalActiveSprints = 0;
    let totalPendingTasks = 0;
    let totalUrgentTasks = 0;
    let totalBlockedTasks = 0;
    let healthScores: number[] = [];

    for (const project of projects || []) {
      // Get active sprints for this project
      const { data: sprints } = await supabase
        .from('sprints')
        .select('*')
        .eq('project_id', project.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Skip projects without active sprints
      if (!sprints || sprints.length === 0) continue;

      // Get all tasks for active sprints
      const { data: allTasks } = await supabase
        .from('tasks')
        .select('*')
        .in('sprint_id', sprints.map(s => s.id))
        .order('priority', { ascending: false });

      // Calculate project stats
      const totalTasks = allTasks?.length || 0;
      const completedTasks = allTasks?.filter(t => t.status === 'completed').length || 0;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Calculate health score (simplified version)
      const now = new Date();
      const daysSinceActivity = Math.floor((now.getTime() - new Date(project.updated_at).getTime()) / (1000 * 60 * 60 * 24));
      
      let healthScore = 50; // Base score
      if (sprints.length > 0) healthScore += 20; // Active sprints
      if (daysSinceActivity <= 7) healthScore += 20; // Recent activity
      if (completionRate > 50) healthScore += 10; // Good completion rate
      
      const projectWithHealth: MCPProject = {
        ...project,
        sprint_count: sprints.length,
        total_tasks: totalTasks,
        active_sprints: sprints.length,
        completion_rate: completionRate,
        health_score: Math.min(100, healthScore),
        project_health: healthScore >= 70 ? 'healthy' : healthScore >= 50 ? 'needs_attention' : 'stale',
        days_since_activity: daysSinceActivity,
        blocked_tasks_count: 0, // Will be calculated below
      };

      // Process sprints with tasks
      const enhancedSprints: MCPSprint[] = await Promise.all(
        sprints.map(async (sprint) => {
          const sprintTasks = allTasks?.filter(t => t.sprint_id === sprint.id) || [];
          const sprintCompletedTasks = sprintTasks.filter(t => t.status === 'completed').length;
          const progressPercentage = sprintTasks.length > 0 ? Math.round((sprintCompletedTasks / sprintTasks.length) * 100) : 0;

          return {
            ...sprint,
            task_count: sprintTasks.length,
            completed_tasks: sprintCompletedTasks,
            project_name: project.name,
            tasks: sprintTasks,
            notes: [], // We don't need notes for active view
            progress_percentage: progressPercentage
          };
        })
      );

      // Detect blockers
      const blockers = detectBlockers(allTasks || []);

      // Get urgent tasks
      const urgentTasks = sprints.flatMap(sprint => {
        const sprintTasks = allTasks?.filter(t => t.sprint_id === sprint.id) || [];
        return getUrgentTasks(sprintTasks, sprint.name);
      });

      // Update project with blocker count
      projectWithHealth.blocked_tasks_count = blockers.length;

      // Generate next actions
      const nextActions = generateNextActions(projectWithHealth, enhancedSprints, blockers);

      // Determine if needs attention
      const needsAttention = 
        blockers.length > 0 || 
        healthScore < 60 || 
        daysSinceActivity > 10 ||
        urgentTasks.length > 3;

      activeProjectsData.push({
        project: projectWithHealth,
        active_sprints: enhancedSprints,
        urgent_tasks: urgentTasks.slice(0, 5), // Top 5 urgent tasks
        blockers,
        health_score: healthScore,
        needs_attention: needsAttention,
        next_actions: nextActions
      });

      // Update totals
      totalActiveSprints += sprints.length;
      totalPendingTasks += allTasks?.filter(t => t.status === 'pending').length || 0;
      totalUrgentTasks += urgentTasks.length;
      totalBlockedTasks += blockers.length;
      healthScores.push(healthScore);
    }

    // Generate insights
    const insights: string[] = [];
    
    if (totalBlockedTasks > 0) {
      insights.push(`🚨 ${totalBlockedTasks} tasks bloqueadas precisam de atenção imediata`);
    }
    
    if (totalUrgentTasks > 5) {
      insights.push(`⚡ ${totalUrgentTasks} tasks urgentes - considere repriorizar workload`);
    }
    
    const avgHealthScore = healthScores.length > 0 ? Math.round(healthScores.reduce((a, b) => a + b, 0) / healthScores.length) : 0;
    if (avgHealthScore < 60) {
      insights.push(`💡 Health score médio baixo (${avgHealthScore}/100) - projetos precisam mais atenção`);
    }
    
    const projectsNeedingAttention = activeProjectsData.filter(p => p.needs_attention).length;
    if (projectsNeedingAttention > 0) {
      insights.push(`🎯 ${projectsNeedingAttention} de ${activeProjectsData.length} projetos ativos precisam de atenção`);
    }

    if (insights.length === 0 && activeProjectsData.length > 0) {
      insights.push('✅ Todos os projetos ativos estão saudáveis - bom trabalho!');
    }

    const queryTime = Date.now() - startTime;

    const response: MCPActiveProjectsResponse = {
      active_projects: activeProjectsData,
      summary: {
        total_active_projects: activeProjectsData.length,
        total_active_sprints: totalActiveSprints,
        total_pending_tasks: totalPendingTasks,
        urgent_tasks_count: totalUrgentTasks,
        blocked_tasks_count: totalBlockedTasks,
        average_health_score: avgHealthScore
      },
      insights
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
    console.error('Error in active projects endpoint:', error);
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