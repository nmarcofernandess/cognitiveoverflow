import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { 
  MCPProjectsResponse, 
  MCPProjectsQuery, 
  MCPProject
} from '../../../../lib/mcp-types';
import { validateMCPAuth } from '../../../../lib/mcp-auth';
import { successResponse, errorResponse } from '../../../../lib/mcp-response';

// ====== GET - List projects (simplificado) ======
export async function GET(request: Request) {
  const startTime = Date.now();

  // 🔐 AUTH REQUIRED
  if (!validateMCPAuth(request)) {
    return NextResponse.json(
      errorResponse('Unauthorized'),
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  
  // Parse query parameters (simplificado)
  const query: MCPProjectsQuery = {
    status: searchParams.get('status') as any || undefined,
    include_sprints: searchParams.get('include_sprints') === 'true',
    include_tasks: searchParams.get('include_tasks') === 'true',
    limit: searchParams.get('limit') ? Math.min(parseInt(searchParams.get('limit')!), 100) : 50,
    search: searchParams.get('search') || undefined,
    sort: (searchParams.get('sort') as any) || 'newest'
  };

  try {
    // Build base query
    let projectsQuery = supabase
      .from('projects')
      .select(`
        id,
        name,
        tldr,
        created_at,
        updated_at
      `);

    // Apply filters
    if (query.search) {
      projectsQuery = projectsQuery.or(`name.ilike.%${query.search}%,tldr.ilike.%${query.search}%`);
    }

    // Apply ordering
    switch (query.sort) {
      case 'name':
        projectsQuery = projectsQuery.order('name', { ascending: true });
        break;
      case 'activity':
        projectsQuery = projectsQuery.order('updated_at', { ascending: false });
        break;
      case 'newest':
      default:
        projectsQuery = projectsQuery.order('created_at', { ascending: false });
        break;
    }

    projectsQuery = projectsQuery.limit(query.limit || 50);

    const { data: projects, error: projectsError } = await projectsQuery;

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return NextResponse.json(
        errorResponse('Failed to fetch projects'),
        { status: 500 }
      );
    }

    // Get total count
    let countQuery = supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    if (query.search) countQuery = countQuery.or(`name.ilike.%${query.search}%,tldr.ilike.%${query.search}%`);

    const { count: totalCount } = await countQuery;

    // Optionally include sprints/tasks data
    let enhancedProjects: MCPProject[] = projects.map(project => ({
      ...project,
      sprint_count: 0,
      total_tasks: 0,
      active_sprints: 0
    }));

    if (query.include_sprints && projects.length > 0) {
      const projectIds = projects.map(p => p.id);
      
      // Get sprints count for each project
      const { data: sprints } = await supabase
        .from('sprints')
        .select('project_id, status')
        .in('project_id', projectIds);

      const sprintsMap = sprints?.reduce((acc, sprint) => {
        if (!acc[sprint.project_id]) acc[sprint.project_id] = { total: 0, active: 0 };
        acc[sprint.project_id].total++;
        if (sprint.status === 'active') acc[sprint.project_id].active++;
        return acc;
      }, {} as Record<string, { total: number; active: number }>) || {};

      enhancedProjects = enhancedProjects.map(project => ({
        ...project,
        sprint_count: sprintsMap[project.id]?.total || 0,
        active_sprints: sprintsMap[project.id]?.active || 0
      }));
    }

    if (query.include_tasks && projects.length > 0) {
      const projectIds = projects.map(p => p.id);
      
      // Get tasks count via sprints
      const { data: tasks } = await supabase
        .from('tasks')
        .select(`
          id,
          sprints!inner (
            project_id
          )
        `)
        .in('sprints.project_id', projectIds);

      const tasksMap = tasks?.reduce((acc, task) => {
        const projectId = (task as any).sprints.project_id;
        acc[projectId] = (acc[projectId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      enhancedProjects = enhancedProjects.map(project => ({
        ...project,
        total_tasks: tasksMap[project.id] || 0
      }));
    }

    const queryTime = Date.now() - startTime;

    const response: MCPProjectsResponse = {
      projects: enhancedProjects,
      total_count: totalCount || 0,
      filters_applied: query
    };

    return NextResponse.json(
      successResponse(response, queryTime),
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        }
      }
    );

  } catch (error) {
    console.error('Unexpected error in projects GET:', error);
    return NextResponse.json(
      errorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// ====== POST - Create project (novo!) ======
export async function POST(request: Request) {
  // 🔐 AUTH REQUIRED
  if (!validateMCPAuth(request)) {
    return NextResponse.json(
      errorResponse('Unauthorized'),
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    
    // Validação simples
    if (!body.name) {
      return NextResponse.json(
        errorResponse('Name is required'),
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([{
        name: body.name,
        tldr: body.tldr || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return NextResponse.json(
        errorResponse('Failed to create project'),
        { status: 500 }
      );
    }

    // Add counts for consistency
    const enhancedProject: MCPProject = {
      ...data,
      sprint_count: 0,
      total_tasks: 0,
      active_sprints: 0
    };

    return NextResponse.json(
      successResponse(enhancedProject),
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