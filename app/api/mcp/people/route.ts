import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { 
  MCPPeopleResponse, 
  MCPPeopleQuery, 
  MCPPerson
} from '../../../../lib/mcp-types';
import { validateMCPAuth } from '../../../../lib/mcp-auth';
import { successResponse, errorResponse } from '../../../../lib/mcp-response';

// ====== GET - List people (simplificado) ======
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
  const query: MCPPeopleQuery = {
    relation: searchParams.get('relation') || undefined,
    limit: searchParams.get('limit') ? Math.min(parseInt(searchParams.get('limit')!), 100) : 50,
    include_notes: (() => {
      const param = searchParams.get('include_notes');
      if (param === 'true') return true;
      if (param === 'latest') return 'latest';
      if (param === 'count') return 'count';
      return false;
    })(),
    search: searchParams.get('search') || undefined,
    updated_since: searchParams.get('updated_since') || undefined,
    sort: (searchParams.get('sort') as any) || 'newest'
  };

  try {
    // Build base query
    let peopleQuery = supabase
      .from('people')
      .select(`
        id,
        name,
        relation,
        tldr,
        created_at,
        updated_at
      `);

    // Apply filters
    if (query.relation) {
      peopleQuery = peopleQuery.eq('relation', query.relation);
    }

    if (query.search) {
      peopleQuery = peopleQuery.or(`name.ilike.%${query.search}%,tldr.ilike.%${query.search}%`);
    }

    if (query.updated_since) {
      try {
        const sinceDate = new Date(query.updated_since);
        peopleQuery = peopleQuery.gte('updated_at', sinceDate.toISOString());
      } catch {
        // Invalid date, ignore filter
      }
    }

    // Apply ordering
    switch (query.sort) {
      case 'name':
        peopleQuery = peopleQuery.order('name', { ascending: true });
        break;
      case 'oldest':
        peopleQuery = peopleQuery.order('created_at', { ascending: true });
        break;
      case 'newest':
      default:
        peopleQuery = peopleQuery.order('created_at', { ascending: false });
        break;
    }

    peopleQuery = peopleQuery.limit(query.limit || 50);

    const { data: people, error: peopleError } = await peopleQuery;

    if (peopleError) {
      console.error('Error fetching people:', peopleError);
      return NextResponse.json(
        errorResponse('Failed to fetch people'),
        { status: 500 }
      );
    }

    // Get total count
    let countQuery = supabase
      .from('people')
      .select('*', { count: 'exact', head: true });

    if (query.relation) countQuery = countQuery.eq('relation', query.relation);
    if (query.search) countQuery = countQuery.or(`name.ilike.%${query.search}%,tldr.ilike.%${query.search}%`);

    const { count: totalCount } = await countQuery;

    // Optionally include notes data
    let enhancedPeople: MCPPerson[] = people.map(person => ({
      ...person,
      notes_count: 0
    }));

    if (query.include_notes && people.length > 0) {
      const peopleIds = people.map(p => p.id);
      
      if (query.include_notes === 'count' || query.include_notes === true) {
        // Get notes count for each person
        const { data: notesCounts } = await supabase
          .from('person_notes')
          .select('person_id')
          .in('person_id', peopleIds);

        const countsMap = notesCounts?.reduce((acc, note) => {
          acc[note.person_id] = (acc[note.person_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

        enhancedPeople = people.map(person => ({
          ...person,
          notes_count: countsMap[person.id] || 0
        }));
      }

      if (query.include_notes === 'latest' || query.include_notes === true) {
        // Get latest notes
        const { data: notes } = await supabase
          .from('person_notes')
          .select('*')
          .in('person_id', peopleIds)
          .order('created_at', { ascending: false })
          .limit(query.include_notes === 'latest' ? peopleIds.length : 100);

        const notesMap = notes?.reduce((acc, note) => {
          if (!acc[note.person_id]) acc[note.person_id] = [];
          acc[note.person_id].push(note);
          return acc;
        }, {} as Record<string, any[]>) || {};

        enhancedPeople = enhancedPeople.map(person => ({
          ...person,
          notes: notesMap[person.id] || [],
          notes_count: notesMap[person.id]?.length || 0,
          last_interaction: notesMap[person.id]?.[0]?.created_at
        }));
      }
    } else {
      // Default: just add notes_count = 0
      enhancedPeople = people.map(person => ({
        ...person,
        notes_count: 0
      }));
    }

    const queryTime = Date.now() - startTime;

    const response: MCPPeopleResponse = {
      people: enhancedPeople,
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
    console.error('Unexpected error in people GET:', error);
    return NextResponse.json(
      errorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// ====== POST - Create person (novo!) ======
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
    if (!body.name || !body.relation) {
      return NextResponse.json(
        errorResponse('Name and relation are required'),
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('people')
      .insert([{
        name: body.name,
        relation: body.relation,
        tldr: body.tldr || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating person:', error);
      return NextResponse.json(
        errorResponse('Failed to create person'),
        { status: 500 }
      );
    }

    // Add notes_count for consistency
    const enhancedPerson: MCPPerson = {
      ...data,
      notes_count: 0
    };

    return NextResponse.json(
      successResponse(enhancedPerson),
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