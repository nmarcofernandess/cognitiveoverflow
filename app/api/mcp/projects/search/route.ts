import { NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';
import { 
  MCPProjectsSearchResponse,
  MCPProjectsSearchQuery,
  MCPProjectSearchResult,
  MCPSprint,
  createMCPResponse, 
  createMCPError, 
  MCP_ERROR_CODES 
} from '../../../../../lib/mcp-types';
import { requireMCPAuth } from '../../../../../lib/mcp-auth';

// ====== Fuzzy Search Logic ======
function calculateSearchScore(query: string, text: string, field: string): number {
  if (!text || !query) return 0;
  
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Exact match scores highest
  if (textLower === queryLower) return 100;
  
  // Starts with query
  if (textLower.startsWith(queryLower)) return 90;
  
  // Contains exact query
  if (textLower.includes(queryLower)) {
    // Field-based scoring
    if (field === 'name') return 80;
    if (field === 'tldr') return 70;
    return 60;
  }
  
  // Fuzzy word matching
  const queryWords = queryLower.split(' ');
  const textWords = textLower.split(' ');
  let wordMatches = 0;
  let partialMatches = 0;
  
  queryWords.forEach(queryWord => {
    textWords.forEach(textWord => {
      if (textWord === queryWord) {
        wordMatches++;
      } else if (textWord.includes(queryWord) || queryWord.includes(textWord)) {
        partialMatches += 0.5;
      }
    });
  });
  
  const totalMatchScore = (wordMatches + partialMatches) / queryWords.length;
  
  if (totalMatchScore > 0.8) return 50;
  if (totalMatchScore > 0.5) return 30;
  if (totalMatchScore > 0.2) return 20;
  
  return 0;
}

function createHighlights(query: string, text: string, field: string, maxLength: number = 100): Array<{
  field: string;
  snippet: string;
  score: number;
}> {
  if (!text || !query) return [];
  
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  const score = calculateSearchScore(query, text, field);
  
  if (score === 0) return [];
  
  // Find the best snippet around the match
  const matchIndex = textLower.indexOf(queryLower);
  let snippet = text;
  
  if (matchIndex !== -1 && text.length > maxLength) {
    const start = Math.max(0, matchIndex - 30);
    const end = Math.min(text.length, matchIndex + queryLower.length + 30);
    snippet = (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '');
  } else if (text.length > maxLength) {
    snippet = text.slice(0, maxLength) + '...';
  }
  
  // Bold the query terms in the snippet
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  snippet = snippet.replace(regex, '**$1**');
  
  return [{
    field,
    snippet,
    score
  }];
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

  // Parse search query parameters
  const query: MCPProjectsSearchQuery = {
    q: searchParams.get('q') || '',
    fields: searchParams.get('fields')?.split(',') || ['name', 'tldr', 'sprints', 'tasks', 'notes'],
    fuzzy: searchParams.get('fuzzy') !== 'false', // Default true
    include_sprints: searchParams.get('include_sprints') === 'true',
    include_tasks: searchParams.get('include_tasks') === 'true',
    include_blockers: searchParams.get('include_blockers') === 'true',
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
    min_score: searchParams.get('min_score') ? parseInt(searchParams.get('min_score')!) : 10
  };

  if (!query.q.trim()) {
    return NextResponse.json(
      createMCPError(id, MCP_ERROR_CODES.INVALID_PARAMS, "Search query 'q' is required"),
      { status: 400 }
    );
  }

  try {
    // Get all projects for search
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        tldr,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (projectsError) {
      console.error('Error fetching projects for search:', projectsError);
      return NextResponse.json(
        createMCPError(id, MCP_ERROR_CODES.DATABASE_ERROR, "Failed to fetch projects", { error: projectsError }),
        { status: 500 }
      );
    }

    // Search and score projects
    const searchResults: MCPProjectSearchResult[] = [];

    for (const project of projects || []) {
      let totalScore = 0;
      let highlights: Array<{ field: string; snippet: string; score: number; }> = [];
      
      // Search in project fields
      if (query.fields?.includes('name')) {
        const nameScore = calculateSearchScore(query.q, project.name, 'name');
        if (nameScore > 0) {
          totalScore += nameScore;
          highlights.push(...createHighlights(query.q, project.name, 'name'));
        }
      }
      
      if (query.fields?.includes('tldr') && project.tldr) {
        const tldrScore = calculateSearchScore(query.q, project.tldr, 'tldr');
        if (tldrScore > 0) {
          totalScore += tldrScore * 0.8; // Slightly lower weight
          highlights.push(...createHighlights(query.q, project.tldr, 'tldr'));
        }
      }

      // Search in sprints if requested
      let matchedSprints: Array<MCPSprint & {
        search_score: number;
        highlights: Array<{ field: string; snippet: string; }>;
      }> = [];

      if (query.fields?.includes('sprints') || query.include_sprints) {
        const { data: sprints } = await supabase
          .from('sprints')
          .select('*')
          .eq('project_id', project.id);

        if (sprints) {
          for (const sprint of sprints) {
            let sprintScore = 0;
            let sprintHighlights: Array<{ field: string; snippet: string; }> = [];

            // Search sprint name and tldr
            const sprintNameScore = calculateSearchScore(query.q, sprint.name, 'sprint_name');
            const sprintTldrScore = sprint.tldr ? calculateSearchScore(query.q, sprint.tldr, 'sprint_tldr') : 0;

            if (sprintNameScore > 0) {
              sprintScore += sprintNameScore;
              sprintHighlights.push(...createHighlights(query.q, sprint.name, 'sprint_name', 80).map(h => ({ field: h.field, snippet: h.snippet })));
            }

            if (sprintTldrScore > 0) {
              sprintScore += sprintTldrScore * 0.7;
              sprintHighlights.push(...createHighlights(query.q, sprint.tldr, 'sprint_tldr', 120).map(h => ({ field: h.field, snippet: h.snippet })));
            }

                         // Search in sprint tasks if requested
             if (query.fields?.includes('tasks') && sprintScore > 0) {
               const { data: tasks } = await supabase
                 .from('tasks')
                 .select('*')
                 .eq('sprint_id', sprint.id);

               if (tasks) {
                 for (const task of tasks) {
                   const taskTitleScore = calculateSearchScore(query.q, task.title, 'task_title');
                   const taskDescScore = task.description ? calculateSearchScore(query.q, task.description, 'task_description') : 0;

                   if (taskTitleScore > 0) {
                     sprintScore += taskTitleScore * 0.5;
                     sprintHighlights.push(...createHighlights(query.q, task.title, 'task_title', 60).map(h => ({ field: h.field, snippet: h.snippet })));
                   }

                   if (taskDescScore > 0) {
                     sprintScore += taskDescScore * 0.3;
                     sprintHighlights.push(...createHighlights(query.q, task.description, 'task_description', 100).map(h => ({ field: h.field, snippet: h.snippet })));
                   }
                 }
               }
             }

             // Search in sprint notes if requested
             if (query.fields?.includes('notes') && sprintScore > 0) {
              const { data: notes } = await supabase
                .from('sprint_notes')
                .select('*')
                .eq('sprint_id', sprint.id);

              if (notes) {
                for (const note of notes) {
                  const noteTitleScore = calculateSearchScore(query.q, note.title, 'note_title');
                  const noteContentScore = note.content ? calculateSearchScore(query.q, note.content, 'note_content') : 0;

                  if (noteTitleScore > 0) {
                    sprintScore += noteTitleScore * 0.4;
                    sprintHighlights.push(...createHighlights(query.q, note.title, 'note_title', 60).map(h => ({ field: h.field, snippet: h.snippet })));
                  }

                  if (noteContentScore > 0) {
                    sprintScore += noteContentScore * 0.3;
                    sprintHighlights.push(...createHighlights(query.q, note.content, 'note_content', 120).map(h => ({ field: h.field, snippet: h.snippet })));
                  }
                }
              }
            }

                         if (sprintScore > (query.min_score || 10)) {
              // Get sprint details if including sprints
              if (query.include_sprints) {
                const { data: sprintTasks, count: taskCount } = await supabase
                  .from('tasks')
                  .select('*', { count: 'exact' })
                  .eq('sprint_id', sprint.id);

                const { count: completedTasksCount } = await supabase
                  .from('tasks')
                  .select('*', { count: 'exact', head: true })
                  .eq('sprint_id', sprint.id)
                  .eq('status', 'completed');

                const progressPercentage = taskCount ? Math.round((completedTasksCount || 0) / taskCount * 100) : 0;

                matchedSprints.push({
                  ...sprint,
                  task_count: taskCount || 0,
                  completed_tasks: completedTasksCount || 0,
                  project_name: project.name,
                  tasks: query.include_tasks ? sprintTasks : undefined,
                  notes: [], // Don't include notes in search to keep it lean
                  progress_percentage: progressPercentage,
                  search_score: sprintScore,
                  highlights: sprintHighlights
                });
              }

              totalScore += sprintScore * 0.6; // Weight sprint matches
              highlights.push(...sprintHighlights.map(h => ({ ...h, score: sprintScore })));
            }
          }
        }
      }

             // Only include projects with minimum score
       if (totalScore >= (query.min_score || 10)) {
        // Calculate project stats
        const { data: allSprints } = await supabase
          .from('sprints')
          .select('*')
          .eq('project_id', project.id);

        const { data: allTasks, count: totalTasks } = await supabase
          .from('tasks')
          .select('*', { count: 'exact' })
          .in('sprint_id', allSprints?.map(s => s.id) || []);

        const { count: completedTasks } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed')
          .in('sprint_id', allSprints?.map(s => s.id) || []);

        const completionRate = totalTasks ? Math.round((completedTasks || 0) / totalTasks * 100) : 0;

        searchResults.push({
          ...project,
          sprint_count: allSprints?.length || 0,
          total_tasks: totalTasks || 0,
          active_sprints: allSprints?.filter(s => s.status === 'active').length || 0,
          completion_rate: completionRate,
          search_score: Math.round(totalScore),
          highlights,
          matched_sprints: matchedSprints.length > 0 ? matchedSprints : undefined
        });
      }
    }

    // Sort by search score descending
    searchResults.sort((a, b) => b.search_score - a.search_score);

    // Apply limit
    const limitedResults = searchResults.slice(0, query.limit);

    const queryTime = Date.now() - startTime;

    const response: MCPProjectsSearchResponse = {
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
        }
      }
    );

  } catch (error) {
    console.error('Error in projects search endpoint:', error);
    return NextResponse.json(
      createMCPError(id, MCP_ERROR_CODES.INTERNAL_ERROR, "Internal server error", { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500 }
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