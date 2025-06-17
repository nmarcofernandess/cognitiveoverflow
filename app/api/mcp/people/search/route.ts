import { NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';
import { 
  MCPPeopleSearchResponse, 
  MCPPeopleSearchQuery, 
  MCPPersonSearchResult,
  MCPSearchHighlight,
  createMCPResponse, 
  createMCPError, 
  MCP_ERROR_CODES 
} from '../../../../../lib/mcp-types';
import { requireMCPAuth } from '../../../../../lib/mcp-auth';

// ====== Search Utilities ======
function calculateRelevanceScore(
  searchTerm: string, 
  person: any, 
  notes: any[] = []
): { score: number; highlights: MCPSearchHighlight[] } {
  const term = searchTerm.toLowerCase();
  const highlights: MCPSearchHighlight[] = [];
  let score = 0;

  // Score name matches (highest weight)
  if (person.name?.toLowerCase().includes(term)) {
    score += 0.5;
    highlights.push({
      field: 'name',
      snippet: highlightText(person.name, term),
      score: 0.5
    });
  }

  // Score relation matches
  if (person.relation?.toLowerCase().includes(term)) {
    score += 0.3;
    highlights.push({
      field: 'relation',
      snippet: highlightText(person.relation, term),
      score: 0.3
    });
  }

  // Score TLDR matches
  if (person.tldr?.toLowerCase().includes(term)) {
    score += 0.2;
    highlights.push({
      field: 'tldr',
      snippet: highlightText(person.tldr, term, 100),
      score: 0.2
    });
  }

  // Score note content matches
  notes.forEach(note => {
    if (note.title?.toLowerCase().includes(term)) {
      score += 0.15;
      highlights.push({
        field: 'note_title',
        snippet: highlightText(note.title, term),
        score: 0.15
      });
    }

    if (note.content?.toLowerCase().includes(term)) {
      score += 0.1;
      highlights.push({
        field: 'note_content',
        snippet: highlightText(note.content, term, 150),
        score: 0.1
      });
    }

    // Score tag matches
    const matchingTags = note.tags?.filter((tag: string) => 
      tag.toLowerCase().includes(term)
    ) || [];
    if (matchingTags.length > 0) {
      score += 0.05 * matchingTags.length;
      highlights.push({
        field: 'tags',
        snippet: matchingTags.join(', '),
        score: 0.05 * matchingTags.length
      });
    }
  });

  return { score: Math.min(score, 1), highlights };
}

function highlightText(text: string, term: string, maxLength = 80): string {
  if (!text || !term) return text || '';
  
  const lowerText = text.toLowerCase();
  const lowerTerm = term.toLowerCase();
  const index = lowerText.indexOf(lowerTerm);
  
  if (index === -1) return text.slice(0, maxLength);
  
  // Calculate excerpt around the match
  const start = Math.max(0, index - 30);
  const end = Math.min(text.length, index + term.length + 30);
  let excerpt = text.slice(start, end);
  
  if (start > 0) excerpt = '...' + excerpt;
  if (end < text.length) excerpt = excerpt + '...';
  
  // Add highlight markers
  const beforeMatch = excerpt.substring(0, excerpt.toLowerCase().indexOf(lowerTerm));
  const match = excerpt.substring(
    excerpt.toLowerCase().indexOf(lowerTerm),
    excerpt.toLowerCase().indexOf(lowerTerm) + term.length
  );
  const afterMatch = excerpt.substring(
    excerpt.toLowerCase().indexOf(lowerTerm) + term.length
  );
  
  return `${beforeMatch}**${match}**${afterMatch}`;
}

function fuzzyMatch(term: string, text: string): boolean {
  if (!term || !text) return false;
  
  const termLower = term.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Exact match
  if (textLower.includes(termLower)) return true;
  
  // Fuzzy matching: allow for 1-2 character differences
  if (term.length >= 4) {
    const words = termLower.split(' ');
    return words.some(word => {
      if (word.length >= 3) {
        // Check for partial matches
        for (let i = 0; i <= textLower.length - word.length + 1; i++) {
          const substr = textLower.substring(i, i + word.length);
          let differences = 0;
          for (let j = 0; j < word.length; j++) {
            if (word[j] !== substr[j]) differences++;
          }
          if (differences <= 1) return true; // Allow 1 character difference
        }
      }
      return false;
    });
  }
  
  return false;
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

  // Parse query parameters
  const query: MCPPeopleSearchQuery = {
    q: searchParams.get('q') || '',
    fields: searchParams.get('fields')?.split(',') || ['name', 'tldr', 'notes'],
    fuzzy: searchParams.get('fuzzy') !== 'false', // Default true
    limit: Math.min(parseInt(searchParams.get('limit') || '20'), 50),
    include_notes: (() => {
      const param = searchParams.get('include_notes');
      return param === 'highlights' ? 'highlights' : param === 'true';
    })(),
    min_score: parseFloat(searchParams.get('min_score') || '0.1')
  };

  // Ensure defaults for optional fields
  const fields = query.fields || ['name', 'tldr', 'notes'];
  const minScore = query.min_score || 0.1;

  // Validate required parameters
  if (!query.q || query.q.trim().length === 0) {
    return NextResponse.json(
      createMCPError(id, MCP_ERROR_CODES.INVALID_PARAMS, "Query parameter 'q' is required"),
      { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }

  try {
    // Get all people (we'll do scoring in memory for better fuzzy matching)
    const { data: people, error: peopleError } = await supabase
      .from('people')
      .select(`
        id,
        name,
        relation,
        tldr,
        created_at,
        updated_at
      `);

    if (peopleError) {
      console.error('Error fetching people for search:', peopleError);
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

    // Get all notes for search if needed
    let allNotes: any[] = [];
    if (fields.includes('notes')) {
      const { data: notesData } = await supabase
        .from('person_notes')
        .select('*')
        .order('created_at', { ascending: false });
      allNotes = notesData || [];
    }

    // Process each person for search relevance
    const searchResults: MCPPersonSearchResult[] = [];

    for (const person of people || []) {
      const personNotes = allNotes.filter(note => note.person_id === person.id);
      
      // Apply field-specific filtering
      let shouldInclude = false;
      
      if (fields.includes('name') && person.name) {
        shouldInclude = shouldInclude || (query.fuzzy ? 
          fuzzyMatch(query.q, person.name) : 
          person.name.toLowerCase().includes(query.q.toLowerCase()));
      }
      
      if (fields.includes('tldr') && person.tldr) {
        shouldInclude = shouldInclude || (query.fuzzy ? 
          fuzzyMatch(query.q, person.tldr) : 
          person.tldr.toLowerCase().includes(query.q.toLowerCase()));
      }
      
      if (fields.includes('notes') && personNotes.length > 0) {
        shouldInclude = shouldInclude || personNotes.some(note => {
          return (query.fuzzy ? 
            fuzzyMatch(query.q, note.title || '') || 
            fuzzyMatch(query.q, note.content || '') ||
            (note.tags || []).some((tag: string) => fuzzyMatch(query.q, tag)) :
            (note.title || '').toLowerCase().includes(query.q.toLowerCase()) ||
            (note.content || '').toLowerCase().includes(query.q.toLowerCase()) ||
            (note.tags || []).some((tag: string) => tag.toLowerCase().includes(query.q.toLowerCase()))
          );
        });
      }

      if (!shouldInclude) continue;

      // Calculate relevance score and highlights
      const { score, highlights } = calculateRelevanceScore(query.q, person, personNotes);
      
      if (score < minScore) continue;

      // Calculate additional person metrics
      const notesCount = personNotes.length;
      const personUpdate = new Date(person.updated_at || person.created_at);
      const lastNote = personNotes[0] ? new Date(personNotes[0].created_at) : null;
      const lastInteraction = lastNote && lastNote > personUpdate 
        ? lastNote.toISOString() 
        : (person.updated_at || person.created_at);

      const searchResult: MCPPersonSearchResult = {
        ...person,
        notes_count: notesCount,
        last_interaction: lastInteraction,
        search_score: Math.round(score * 1000) / 1000, // Round to 3 decimals
        highlights: highlights.slice(0, 5), // Limit highlights
        notes: query.include_notes === true ? personNotes.slice(0, 3) : undefined
      };

      searchResults.push(searchResult);
    }

    // Sort by relevance score (highest first)
    searchResults.sort((a, b) => b.search_score - a.search_score);

    // Apply limit
    const limitedResults = searchResults.slice(0, query.limit);

    const queryTime = Date.now() - startTime;

    const response: MCPPeopleSearchResponse = {
      results: limitedResults,
      total_count: searchResults.length,
      query,
      search_time_ms: queryTime
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
    console.error('Error in people search endpoint:', error);
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