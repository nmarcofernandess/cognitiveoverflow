import { NextResponse } from 'next/server';
import { supabase } from '../../../../../../lib/supabase';
import { validateMCPAuth } from '../../../../../../lib/mcp-auth';
import { successResponse, errorResponse } from '../../../../../../lib/mcp-response';

// ====== GET - List tasks for sprint ======
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // 🔐 AUTH REQUIRED
  if (!validateMCPAuth(request)) {
    return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
  }

  try {
    const { id: sprintId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');

    // Verificar se o sprint existe
    const { data: sprint, error: sprintCheckError } = await supabase
      .from('sprints')
      .select(`
        id,
        name,
        projects!inner (
          id,
          name
        )
      `)
      .eq('id', sprintId)
      .single();

    if (sprintCheckError || !sprint) {
      return NextResponse.json(
        errorResponse('Sprint not found'),
        { status: 404 }
      );
    }

    // Build query for tasks
    let tasksQuery = supabase
      .from('tasks')
      .select('*')
      .eq('sprint_id', sprintId)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 100));

    // Apply status filter if provided
    if (status) {
      tasksQuery = tasksQuery.eq('status', status);
    }

    const { data: tasks, error } = await tasksQuery;

    if (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json(
        errorResponse('Failed to fetch tasks'),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse({
        sprint: {
          id: sprint.id,
          name: sprint.name,
          project_name: (sprint as any).projects.name
        },
        tasks: tasks || []
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
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      errorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// ====== POST - Create task for sprint ======
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // 🔐 AUTH REQUIRED
  if (!validateMCPAuth(request)) {
    return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
  }

  try {
    const body = await request.json();
    const { id: sprintId } = await params;
    
    // Validação simples
    if (!body.title) {
      return NextResponse.json(
        errorResponse('Title is required'),
        { status: 400 }
      );
    }

    // Verificar se o sprint existe
    const { data: sprint, error: sprintCheckError } = await supabase
      .from('sprints')
      .select('id, name')
      .eq('id', sprintId)
      .single();

    if (sprintCheckError || !sprint) {
      return NextResponse.json(
        errorResponse('Sprint not found'),
        { status: 404 }
      );
    }

    // Criar a task
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        sprint_id: sprintId,
        title: body.title,
        description: body.description || null,
        status: body.status || 'pending',
        priority: body.priority || 3
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return NextResponse.json(
        errorResponse('Failed to create task'),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(data),
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