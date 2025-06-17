import { NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';
import { MCPProject } from '../../../../../lib/mcp-types';
import { validateMCPAuth } from '../../../../../lib/mcp-auth';
import { successResponse, errorResponse } from '../../../../../lib/mcp-response';

// ====== GET - Get project by ID (simplificado) ======
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const startTime = Date.now();
  const { id: projectId } = await params;

  // 🔐 AUTH REQUIRED
  if (!validateMCPAuth(request)) {
    return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
  }

  try {
    // Get project with sprints and tasks count
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        errorResponse('Project not found'),
        { status: 404 }
      );
    }

    // Get sprints for this project
    const { data: sprints, count: sprintCount } = await supabase
      .from('sprints')
      .select('*', { count: 'exact' })
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    // Count active sprints
    const activeSprintsCount = sprints?.filter(s => s.status === 'active').length || 0;

    // Get tasks count via sprints
    const sprintIds = sprints?.map(s => s.id) || [];
    let totalTasks = 0;
    
    if (sprintIds.length > 0) {
      const { count } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .in('sprint_id', sprintIds);
      totalTasks = count || 0;
    }

    const enhancedProject: MCPProject = {
      ...project,
      sprint_count: sprintCount || 0,
      total_tasks: totalTasks,
      active_sprints: activeSprintsCount,
      sprints: sprints || []
    };

    const queryTime = Date.now() - startTime;

    return NextResponse.json(
      successResponse(enhancedProject, queryTime),
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        }
      }
    );

  } catch (error) {
    console.error('Error getting project:', error);
    return NextResponse.json(
      errorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// ====== PUT - Update project ======
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // 🔐 AUTH REQUIRED
  if (!validateMCPAuth(request)) {
    return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
  }

  try {
    const body = await request.json();
    const { id: projectId } = await params;

    // Update project
    const { data, error } = await supabase
      .from('projects')
      .update(body)
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse('Project not found'),
          { status: 404 }
        );
      }
      
      console.error('Error updating project:', error);
      return NextResponse.json(
        errorResponse('Update failed'),
        { status: 500 }
      );
    }

    // Add counts for consistency
    const enhancedProject: MCPProject = {
      ...data,
      sprint_count: 0, // Will be fetched separately if needed
      total_tasks: 0,
      active_sprints: 0
    };

    return NextResponse.json(
      successResponse(enhancedProject),
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

// ====== DELETE - Remove project ======
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // 🔐 AUTH REQUIRED
  if (!validateMCPAuth(request)) {
    return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
  }

  try {
    const { id: projectId } = await params;

    // Delete project (sprints and tasks will cascade delete based on foreign key)
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse('Project not found'),
          { status: 404 }
        );
      }
      
      console.error('Error deleting project:', error);
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
    console.error('Error deleting project:', error);
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