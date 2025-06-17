import { NextResponse } from 'next/server';
import { supabase } from '../../../../../../lib/supabase';
import { validateMCPAuth } from '../../../../../../lib/mcp-auth';
import { successResponse, errorResponse } from '../../../../../../lib/mcp-response';

// ====== GET - List sprints for project ======
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // 🔐 AUTH REQUIRED
  if (!validateMCPAuth(request)) {
    return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
  }

  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const includeTasksParam = searchParams.get('include_tasks');

    // Verificar se o projeto existe
    const { data: project, error: projectCheckError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', projectId)
      .single();

    if (projectCheckError || !project) {
      return NextResponse.json(
        errorResponse('Project not found'),
        { status: 404 }
      );
    }

    // Buscar sprints do projeto
    const { data: sprints, error } = await supabase
      .from('sprints')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 100));

    if (error) {
      console.error('Error fetching sprints:', error);
      return NextResponse.json(
        errorResponse('Failed to fetch sprints'),
        { status: 500 }
      );
    }

    // Optionally include tasks
    let enhancedSprints = sprints || [];

    if (includeTasksParam === 'true' && sprints && sprints.length > 0) {
      const sprintIds = sprints.map(s => s.id);
      
      // Get tasks for all sprints
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .in('sprint_id', sprintIds)
        .order('priority', { ascending: false });

      const tasksMap = tasks?.reduce((acc, task) => {
        if (!acc[task.sprint_id]) acc[task.sprint_id] = [];
        acc[task.sprint_id].push(task);
        return acc;
      }, {} as Record<string, any[]>) || {};

      enhancedSprints = sprints.map(sprint => {
        const sprintTasks = tasksMap[sprint.id] || [];
        const completedTasks = sprintTasks.filter(t => t.status === 'completed').length;
        
        return {
          ...sprint,
          project_name: project.name,
          task_count: sprintTasks.length,
          completed_tasks: completedTasks,
          progress_percentage: sprintTasks.length > 0 ? Math.round(completedTasks / sprintTasks.length * 100) : 0,
          tasks: sprintTasks
        };
      });
    } else {
      enhancedSprints = sprints.map(sprint => ({
        ...sprint,
        project_name: project.name,
        task_count: 0,
        completed_tasks: 0,
        progress_percentage: 0
      }));
    }

    return NextResponse.json(
      successResponse({
        project: project,
        sprints: enhancedSprints
      }),
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        }
      }
    );

  } catch (error) {
    console.error('Error fetching sprints:', error);
    return NextResponse.json(
      errorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// ====== POST - Create sprint for project ======
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // 🔐 AUTH REQUIRED
  if (!validateMCPAuth(request)) {
    return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
  }

  try {
    const body = await request.json();
    const { id: projectId } = await params;
    
    // Validação simples
    if (!body.name) {
      return NextResponse.json(
        errorResponse('Name is required'),
        { status: 400 }
      );
    }

    // Verificar se o projeto existe
    const { data: project, error: projectCheckError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', projectId)
      .single();

    if (projectCheckError || !project) {
      return NextResponse.json(
        errorResponse('Project not found'),
        { status: 404 }
      );
    }

    // Criar o sprint
    const { data, error } = await supabase
      .from('sprints')
      .insert([{
        project_id: projectId,
        name: body.name,
        tldr: body.tldr || null,
        status: body.status || 'active'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating sprint:', error);
      return NextResponse.json(
        errorResponse('Failed to create sprint'),
        { status: 500 }
      );
    }

    // Add additional fields for consistency
    const enhancedSprint = {
      ...data,
      project_name: project.name,
      task_count: 0,
      completed_tasks: 0,
      progress_percentage: 0
    };

    return NextResponse.json(
      successResponse(enhancedSprint),
      {
        status: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        }
      }
    );

  } catch (error) {
    console.error('Error parsing request body:', error);
    return NextResponse.json(
      errorResponse('Invalid request body'),
      { status: 400 }
    );
  }
}

// ====== OPTIONS - CORS ======
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      }
    }
  );
} 