import { NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';
import { validateMCPAuth } from '../../../../../lib/mcp-auth';
import { successResponse, errorResponse } from '../../../../../lib/mcp-response';

// ====== GET - Get task by ID ======
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // 🔐 AUTH REQUIRED
  if (!validateMCPAuth(request)) {
    return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
  }

  try {
    const { id: taskId } = await params;

    // Get task with sprint and project info
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select(`
        *,
        sprints!inner (
          id,
          name,
          projects!inner (
            id,
            name
          )
        )
      `)
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        errorResponse('Task not found'),
        { status: 404 }
      );
    }

    const enhancedTask = {
      ...task,
      sprint_name: (task as any).sprints.name,
      project_name: (task as any).sprints.projects.name
    };

    return NextResponse.json(
      successResponse(enhancedTask),
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        }
      }
    );

  } catch (error) {
    console.error('Error getting task:', error);
    return NextResponse.json(
      errorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// ====== PUT - Update task ======
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // 🔐 AUTH REQUIRED
  if (!validateMCPAuth(request)) {
    return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
  }

  try {
    const body = await request.json();
    const { id: taskId } = await params;

    // Set completed_at if status changed to completed
    if (body.status === 'completed' && !body.completed_at) {
      body.completed_at = new Date().toISOString();
    }
    
    // Clear completed_at if status changed away from completed
    if (body.status && body.status !== 'completed' && body.completed_at !== undefined) {
      body.completed_at = null;
    }

    // Update task
    const { data, error } = await supabase
      .from('tasks')
      .update(body)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse('Task not found'),
          { status: 404 }
        );
      }
      
      console.error('Error updating task:', error);
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

// ====== DELETE - Remove task ======
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // 🔐 AUTH REQUIRED
  if (!validateMCPAuth(request)) {
    return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
  }

  try {
    const { id: taskId } = await params;

    // Delete task
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse('Task not found'),
          { status: 404 }
        );
      }
      
      console.error('Error deleting task:', error);
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
    console.error('Error deleting task:', error);
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