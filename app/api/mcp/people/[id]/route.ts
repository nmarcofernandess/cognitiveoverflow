import { NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';
import { 
  MCPPersonFullResponse, 
  MCPPersonFull,
  createMCPResponse, 
  createMCPError, 
  MCP_ERROR_CODES 
} from '../../../../../lib/mcp-types';
import { requireMCPAuth } from '../../../../../lib/mcp-auth';

export async function GET(request: Request, context: { params: { id: string } }) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get('id') || Date.now().toString();
  const personId = context.params.id;

  // 🔐 AUTH REQUIRED
  const auth = await requireMCPAuth(request, requestId);
  if (!auth.success) {
    return auth.response;
  }

  try {
    // Get person details
    const { data: person, error: personError } = await supabase
      .from('people')
      .select('*')
      .eq('id', personId)
      .single();

    if (personError || !person) {
      return NextResponse.json(
        createMCPError(requestId, MCP_ERROR_CODES.NOT_FOUND, `Person with ID ${personId} not found`),
        { 
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }

    // Get ALL notes
    const { data: notes, error: notesError } = await supabase
      .from('person_notes')
      .select('*')
      .eq('person_id', personId)
      .order('created_at', { ascending: false });

    if (notesError) {
      return NextResponse.json(
        createMCPError(requestId, MCP_ERROR_CODES.DATABASE_ERROR, "Failed to fetch notes"),
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

    // Calculate stats
    const allTags = Array.from(new Set((notes || []).flatMap(note => note.tags || [])));
    const notesCount = (notes || []).length;
    
    const lastNote = (notes || [])[0];
    const lastInteraction = lastNote ? lastNote.created_at : person.created_at;
    const daysSince = Math.floor((Date.now() - new Date(lastInteraction).getTime()) / (1000 * 60 * 60 * 24));
    
    let health: 'active' | 'stale' | 'dormant' = 'dormant';
    if (notesCount > 0 && daysSince <= 30) health = 'active';
    else if (notesCount > 0 && daysSince <= 90) health = 'stale';

    // Build timeline
    const timeline = [
      {
        date: person.created_at,
        type: 'person_created' as const,
        title: 'Pessoa adicionada',
        summary: `${person.name} foi adicionado como ${person.relation}`
      },
      ...(notes || []).map(note => ({
        date: note.created_at,
        type: 'note_added' as const,
        title: note.title,
        summary: note.content || 'Nota adicionada',
        tags: note.tags
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const stats = {
      notes_count: notesCount,
      first_interaction: person.created_at,
      last_interaction: lastInteraction,
      interaction_frequency: notesCount / 6, // rough estimate
      tags_used: allTags,
      avg_notes_per_month: notesCount / 6,
      days_since_last_contact: daysSince
    };

    const relationships = {
      health,
      health_reason: `${daysSince} dias desde última interação`,
      suggested_actions: health === 'active' ? 
        ['Continue mantendo contato'] : 
        ['Retomar contato em breve', 'Revisar histórico']
    };

    const fullPerson: MCPPersonFull = {
      ...person,
      notes_count: notesCount,
      notes: notes || [],
      last_interaction: lastInteraction,
      interaction_frequency: stats.interaction_frequency,
      relationship_health: health,
      tags_used: allTags,
      stats,
      timeline,
      relationships
    };

    const response: MCPPersonFullResponse = {
      person: fullPerson,
      query_time_ms: Date.now() - startTime
    };

    return NextResponse.json(
      createMCPResponse(requestId, response),
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
    return NextResponse.json(
      createMCPError(requestId, MCP_ERROR_CODES.INTERNAL_ERROR, "Internal server error"),
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