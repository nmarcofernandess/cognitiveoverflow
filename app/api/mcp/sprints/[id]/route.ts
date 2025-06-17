import { NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';
import { validateMCPAuth } from '../../../../../lib/mcp-auth';
import { successResponse, errorResponse } from '../../../../../lib/mcp-response';

// ====== GET - Get sprint by ID ======
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // 🔐 AUTH REQUIRED
  if (!validateMCPAuth(request)) {
    return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
  }

  try {
    const { id: sprintId } = await params;

    // Get sprint with project info
    const { data: sprint, error: sprintError } = await supabase
      .from('sprints')
      .select(`
        *,
        projects!inner (
          id,
          name
        )
      `)
      .eq('id', sprintId)
      .single();

    if (sprintError || !sprint) {
      return NextResponse.json(
        errorResponse('Sprint not found'),
        { status: 404 }
      );
    }

    // Get tasks for this sprint
    const { data: tasks, count: taskCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact' })
      .eq('sprint_id', sprintId)
      .order('priority', { ascending: false });

    const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;

    const enhancedSprint = {
      ...sprint,
      project_name: (sprint as any).projects.name,
      task_count: taskCount || 0,
      completed_tasks: completedTasks,
      progress_percentage: taskCount ? Math.round(completedTasks / taskCount * 100) : 0,
      tasks: tasks || []
    };

    return NextResponse.json(
      successResponse(enhancedSprint),
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        }
      }
    );

  } catch (error) {
    console.error('Error getting sprint:', error);
    return NextResponse.json(
      errorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// ====== PUT - Update sprint ======
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // 🔐 AUTH REQUIRED
  if (!validateMCPAuth(request)) {
    return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
  }

  try {
    const body = await request.json();
    const { id: sprintId } = await params;

    // Update sprint
    const { data, error } = await supabase
      .from('sprints')
      .update(body)
      .eq('id', sprintId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse('Sprint not found'),
          { status: 404 }
        );
      }
      
      console.error('Error updating sprint:', error);
      return NextResponse.json(
        errorResponse('Update failed'),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(data),
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
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

// ====== DELETE - Remove sprint ======
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // 🔐 AUTH REQUIRED
  if (!validateMCPAuth(request)) {
    return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
  }

  try {
    const { id: sprintId } = await params;

    // Delete sprint (tasks will cascade delete based on foreign key)
    const { error } = await supabase
      .from('sprints')
      .delete()
      .eq('id', sprintId);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse('Sprint not found'),
          { status: 404 }
        );
      }
      
      console.error('Error deleting sprint:', error);
      return NextResponse.json(
        errorResponse('Delete failed'),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse({ deleted: true }),
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        }
      }
    );

  } catch (error) {
    console.error('Error deleting sprint:', error);
    return NextResponse.json(
      errorResponse('Internal server error'),
      { status: 500 }
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
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      }
    }
  );
} 