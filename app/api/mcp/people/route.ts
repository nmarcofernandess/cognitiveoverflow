import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { 
  MCPPeopleResponse, 
  MCPPeopleQuery, 
  MCPPerson,
  createMCPResponse, 
  createMCPError, 
  MCP_ERROR_CODES 
} from '../../../../lib/mcp-types';
import { requireMCPAuth } from '../../../../lib/mcp-auth';

// JWT auth requires Node.js crypto module
// export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || Date.now().toString();

  // 🔐 AUTH REQUIRED
  const auth = await requireMCPAuth(request, id);
  if (!auth.success) {
    return auth.response;
  }

  // Parse query parameters
  const query: MCPPeopleQuery = {
    relation: searchParams.get('relation') || undefined,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
    include_notes: searchParams.get('include_notes') === 'true',
    search: searchParams.get('search') || undefined
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

    // Apply ordering and limit
    peopleQuery = peopleQuery
      .order('created_at', { ascending: false })
      .limit(query.limit || 50);

    const { data: people, error: peopleError } = await peopleQuery;

    if (peopleError) {
      console.error('Error fetching people:', peopleError);
      return NextResponse.json(
        createMCPError(id, MCP_ERROR_CODES.DATABASE_ERROR, "Failed to fetch people", { error: peopleError }),
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    // Get total count (for pagination info)
    let countQuery = supabase
      .from('people')
      .select('*', { count: 'exact', head: true });

    if (query.relation) {
      countQuery = countQuery.eq('relation', query.relation);
    }
    if (query.search) {
      countQuery = countQuery.or(`name.ilike.%${query.search}%,tldr.ilike.%${query.search}%`);
    }

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      console.error('Error getting people count:', countError);
      return NextResponse.json(
        createMCPError(id, MCP_ERROR_CODES.DATABASE_ERROR, "Failed to get people count", { error: countError }),
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    // Enhance people with notes data if requested
    const enhancedPeople: MCPPerson[] = await Promise.all(
      (people || []).map(async (person) => {
        // Get notes count for each person
        const { count: notesCount } = await supabase
          .from('person_notes')
          .select('*', { count: 'exact', head: true })
          .eq('person_id', person.id);

        let notes = undefined;
        let lastInteraction = undefined;

        if (query.include_notes) {
          // Get actual notes if requested
          const { data: personNotes } = await supabase
            .from('person_notes')
            .select('*')
            .eq('person_id', person.id)
            .order('created_at', { ascending: false })
            .limit(10); // Limit notes to prevent huge responses

          notes = personNotes || [];
          
          // Calculate last interaction (most recent note or person update)
          const personUpdate = new Date(person.updated_at || person.created_at);
          const lastNote = personNotes?.[0] ? new Date(personNotes[0].created_at) : null;
          lastInteraction = lastNote && lastNote > personUpdate 
            ? lastNote.toISOString() 
            : (person.updated_at || person.created_at);
        }

        return {
          ...person,
          notes_count: notesCount || 0,
          notes,
          last_interaction: lastInteraction
        };
      })
    );

    const response: MCPPeopleResponse = {
      people: enhancedPeople,
      total_count: totalCount || 0,
      filters_applied: query
    };

    return NextResponse.json(
      createMCPResponse(id, response),
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Content-Type, Authorization': 'application/json',
        }
      }
    );

  } catch (error) {
    console.error('Error in people endpoint:', error);
    return NextResponse.json(
      createMCPError(id, MCP_ERROR_CODES.INTERNAL_ERROR, "Internal server error", { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
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