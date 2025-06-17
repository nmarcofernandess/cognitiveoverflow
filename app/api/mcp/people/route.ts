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

// ====== Utility Functions ======
function parseTimeFilter(timeStr: string): Date | null {
  const now = new Date();
  const units = timeStr.slice(-1);
  const value = parseInt(timeStr.slice(0, -1));
  
  if (isNaN(value)) {
    // Try parsing as ISO date
    try {
      return new Date(timeStr);
    } catch {
      return null;
    }
  }
  
  switch (units) {
    case 'd': return new Date(now.getTime() - value * 24 * 60 * 60 * 1000);
    case 'w': return new Date(now.getTime() - value * 7 * 24 * 60 * 60 * 1000);
    case 'm': return new Date(now.getTime() - value * 30 * 24 * 60 * 60 * 1000);
    case 'y': return new Date(now.getTime() - value * 365 * 24 * 60 * 60 * 1000);
    default: return null;
  }
}

function getRelationType(relation: string): string {
  const familyTypes = ['esposa', 'marido', 'irmão', 'irmã', 'pai', 'mãe', 'filho', 'filha', 'avô', 'avó'];
  const workTypes = ['colega', 'chefe', 'cliente', 'fornecedor', 'parceiro', 'sócio'];
  const friendTypes = ['amigo', 'amiga', 'melhor_amigo'];
  const professionalTypes = ['mentor', 'coach', 'consultor', 'especialista'];
  
  if (familyTypes.includes(relation.toLowerCase())) return 'family';
  if (workTypes.includes(relation.toLowerCase())) return 'work';
  if (friendTypes.includes(relation.toLowerCase())) return 'friends';
  if (professionalTypes.includes(relation.toLowerCase())) return 'professional';
  return 'other';
}

function calculateRelationshipHealth(lastInteraction: string, notesCount: number): 'active' | 'stale' | 'dormant' {
  const daysSince = Math.floor((Date.now() - new Date(lastInteraction).getTime()) / (1000 * 60 * 60 * 24));
  
  if (notesCount === 0) return 'dormant';
  if (daysSince <= 30) return 'active';
  if (daysSince <= 90) return 'stale';
  return 'dormant';
}

function calculateInteractionFrequency(notes: any[]): number {
  if (!notes || notes.length === 0) return 0;
  
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const recentNotes = notes.filter(note => new Date(note.created_at) >= sixMonthsAgo);
  return recentNotes.length / 6; // notes per month
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

  // Parse query parameters with new advanced filters
  const query: MCPPeopleQuery = {
    // Basic filters
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
    
    // Advanced filters
    updated_since: searchParams.get('updated_since') || undefined,
    last_interaction: searchParams.get('last_interaction') || undefined,
    has_notes: searchParams.get('has_notes') ? searchParams.get('has_notes') === 'true' : undefined,
    sort: (searchParams.get('sort') as any) || 'newest',
    tags: searchParams.get('tags') || undefined,
    relation_type: (searchParams.get('relation_type') as any) || undefined,
    relationship_health: (searchParams.get('relationship_health') as any) || undefined
  };

  try {
    // Build optimized base query with join for notes count
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

    // Apply basic filters
    if (query.relation) {
      peopleQuery = peopleQuery.eq('relation', query.relation);
    }

    if (query.search) {
      peopleQuery = peopleQuery.or(`name.ilike.%${query.search}%,tldr.ilike.%${query.search}%`);
    }

    // Apply temporal filters
    if (query.updated_since) {
      const sinceDate = parseTimeFilter(query.updated_since);
      if (sinceDate) {
        peopleQuery = peopleQuery.gte('updated_at', sinceDate.toISOString());
      }
    }

    // Apply relation type filter
    if (query.relation_type) {
      // Get all relations of this type
      const { data: allPeople } = await supabase.from('people').select('relation');
      const relevantRelations = allPeople?.filter(p => getRelationType(p.relation) === query.relation_type)
        .map(p => p.relation) || [];
      
      if (relevantRelations.length > 0) {
        peopleQuery = peopleQuery.in('relation', relevantRelations);
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

    // Apply limit
    peopleQuery = peopleQuery.limit(query.limit || 50);

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

    // Get total count efficiently
    let countQuery = supabase
      .from('people')
      .select('*', { count: 'exact', head: true });

    // Apply same filters for count
    if (query.relation) countQuery = countQuery.eq('relation', query.relation);
    if (query.search) countQuery = countQuery.or(`name.ilike.%${query.search}%,tldr.ilike.%${query.search}%`);
    if (query.updated_since) {
      const sinceDate = parseTimeFilter(query.updated_since);
      if (sinceDate) countQuery = countQuery.gte('updated_at', sinceDate.toISOString());
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

    // Bulk fetch notes data for optimization (instead of N+1 queries)
    const peopleIds = (people || []).map(p => p.id);
    let allNotesData: any[] = [];
    
    if (peopleIds.length > 0) {
      const { data: notesData } = await supabase
        .from('person_notes')
        .select('*')
        .in('person_id', peopleIds)
        .order('created_at', { ascending: false });
      
      allNotesData = notesData || [];
    }

    // Process and enhance people with calculated fields
    const processedPeople = (people || []).map((person) => {
      const personNotes = allNotesData.filter(note => note.person_id === person.id);
      const notesCount = personNotes.length;
      
      // Calculate last interaction
      const personUpdate = new Date(person.updated_at || person.created_at);
      const lastNote = personNotes[0] ? new Date(personNotes[0].created_at) : null;
      const lastInteraction = lastNote && lastNote > personUpdate 
        ? lastNote.toISOString() 
        : (person.updated_at || person.created_at);

      // Calculate relationship health
      const relationshipHealth = calculateRelationshipHealth(lastInteraction, notesCount);
      
      // Calculate interaction frequency
      const interactionFrequency = calculateInteractionFrequency(personNotes);
      
      // Get all tags used
      const tagsUsed = Array.from(new Set(personNotes.flatMap(note => note.tags || [])));

      // Filter by advanced criteria
      let includeInResults = true;
      
      if (query.has_notes !== undefined) {
        includeInResults = includeInResults && (query.has_notes ? notesCount > 0 : notesCount === 0);
      }
      
      if (query.tags) {
        const searchTags = query.tags.split(',').map(t => t.trim().toLowerCase());
        const hasMatchingTag = searchTags.some(searchTag => 
          tagsUsed.some(tag => tag.toLowerCase().includes(searchTag))
        );
        includeInResults = includeInResults && hasMatchingTag;
      }
      
      if (query.relationship_health) {
        includeInResults = includeInResults && relationshipHealth === query.relationship_health;
      }
      
      if (query.last_interaction) {
        const filterDate = parseTimeFilter(query.last_interaction);
        if (filterDate) {
          const daysSince = Math.floor((Date.now() - new Date(lastInteraction).getTime()) / (1000 * 60 * 60 * 24));
          const filterDays = Math.floor((Date.now() - filterDate.getTime()) / (1000 * 60 * 60 * 24));
          includeInResults = includeInResults && daysSince >= filterDays;
        }
      }

      if (!includeInResults) return null;

      // Prepare notes based on include_notes parameter
      let notes = undefined;
      if (query.include_notes === true) {
        notes = personNotes.slice(0, 10); // Limit to prevent huge responses
      } else if (query.include_notes === 'latest') {
        notes = personNotes.slice(0, 3);
      }

      const enhancedPerson: MCPPerson = {
        ...person,
        notes_count: notesCount,
        notes,
        last_interaction: lastInteraction,
        interaction_frequency: Math.round(interactionFrequency * 10) / 10, // Round to 1 decimal
        relationship_health: relationshipHealth,
        tags_used: tagsUsed
      };

      return enhancedPerson;
    });

    const enhancedPeople = processedPeople.filter((person): person is MCPPerson => person !== null);

    // Apply post-processing sort for complex sorts
    if (query.sort === 'interaction') {
      enhancedPeople.sort((a, b) => new Date(b.last_interaction!).getTime() - new Date(a.last_interaction!).getTime());
    } else if (query.sort === 'notes_count') {
      enhancedPeople.sort((a, b) => b.notes_count - a.notes_count);
    }

    const queryTime = Date.now() - startTime;
    
    const response: MCPPeopleResponse = {
      people: enhancedPeople,
      total_count: totalCount || 0,
      filters_applied: query,
      performance: {
        query_time_ms: queryTime,
        cached: false
      }
    };

    return NextResponse.json(
      createMCPResponse(id, response),
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Content-Type': 'application/json',
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