import { NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';
import { 
  MCPPeopleAnalyticsResponse, 
  MCPPeopleAnalytics,
  createMCPResponse, 
  createMCPError, 
  MCP_ERROR_CODES 
} from '../../../../../lib/mcp-types';
import { requireMCPAuth } from '../../../../../lib/mcp-auth';

// ====== Analytics Utilities ======
function getRelationType(relation: string): 'family' | 'work' | 'friends' | 'professional' | 'other' {
  const familyTypes = ['esposa', 'marido', 'irmão', 'irmã', 'pai', 'mãe', 'filho', 'filha', 'avô', 'avó'];
  const workTypes = ['colega', 'chefe', 'cliente', 'fornecedor', 'parceiro', 'sócio'];
  const friendTypes = ['amigo', 'amiga', 'melhor_amigo'];
  const professionalTypes = ['mentor', 'coach', 'consultor', 'especialista'];
  
  const lowerRelation = relation.toLowerCase();
  if (familyTypes.includes(lowerRelation)) return 'family';
  if (workTypes.includes(lowerRelation)) return 'work';
  if (friendTypes.includes(lowerRelation)) return 'friends';
  if (professionalTypes.includes(lowerRelation)) return 'professional';
  return 'other';
}

function calculateRelationshipHealth(lastInteraction: string, notesCount: number): 'active' | 'stale' | 'dormant' {
  const daysSince = Math.floor((Date.now() - new Date(lastInteraction).getTime()) / (1000 * 60 * 60 * 24));
  
  if (notesCount === 0) return 'dormant';
  if (daysSince <= 30) return 'active';
  if (daysSince <= 90) return 'stale';
  return 'dormant';
}

function getMonthKey(date: string): string {
  return new Date(date).toISOString().slice(0, 7); // YYYY-MM
}

function getTimeRanges() {
  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  
  return { last7Days, last30Days, last90Days };
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

  try {
    // Get all people
    const { data: people, error: peopleError } = await supabase
      .from('people')
      .select('*')
      .order('created_at', { ascending: false });

    if (peopleError) {
      console.error('Error fetching people for analytics:', peopleError);
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

    // Get all notes
    const { data: allNotes, error: notesError } = await supabase
      .from('person_notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (notesError) {
      console.error('Error fetching notes for analytics:', notesError);
      return NextResponse.json(
        createMCPError(id, MCP_ERROR_CODES.DATABASE_ERROR, "Failed to fetch notes", { error: notesError }),
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

    const notes = allNotes || [];
    const totalPeople = (people || []).length;
    const { last7Days, last30Days, last90Days } = getTimeRanges();

    // ====== BY RELATION ANALYSIS ======
    const byRelation: Record<string, number> = {};
    const byRelationType = {
      family: 0,
      work: 0,
      friends: 0,
      professional: 0,
      other: 0
    };

    (people || []).forEach(person => {
      // Count by specific relation
      byRelation[person.relation] = (byRelation[person.relation] || 0) + 1;
      
      // Count by relation type
      const relationType = getRelationType(person.relation);
      byRelationType[relationType]++;
    });

    // ====== INTERACTION ANALYSIS ======
    const recentNotes7d = notes.filter(note => new Date(note.created_at) >= last7Days);
    const recentNotes30d = notes.filter(note => new Date(note.created_at) >= last30Days);
    const recentNotes90d = notes.filter(note => new Date(note.created_at) >= last90Days);

    // Get unique people contacted in each period
    const peopleContacted7d = new Set(recentNotes7d.map(note => note.person_id)).size;
    const peopleContacted30d = new Set(recentNotes30d.map(note => note.person_id)).size;
    const peopleContacted90d = new Set(recentNotes90d.map(note => note.person_id)).size;

    // People with no notes (never contacted)
    const peopleWithNotes = new Set(notes.map(note => note.person_id));
    const neverContacted = totalPeople - peopleWithNotes.size;

    const interactionSummary = {
      last_7_days: peopleContacted7d,
      last_30_days: peopleContacted30d,
      last_90_days: peopleContacted90d,
      never_contacted: neverContacted,
      total_interactions: notes.length
    };

    // ====== TAGS ANALYSIS ======
    const tagCounts: Record<string, { count: number; people: Set<string> }> = {};
    
    notes.forEach(note => {
      (note.tags || []).forEach((tag: string) => {
        if (!tagCounts[tag]) {
          tagCounts[tag] = { count: 0, people: new Set() };
        }
        tagCounts[tag].count++;
        tagCounts[tag].people.add(note.person_id);
      });
    });

    const topTags = Object.entries(tagCounts)
      .map(([tag, data]) => ({
        tag,
        count: data.count,
        people_count: data.people.size
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // ====== RELATIONSHIP HEALTH ANALYSIS ======
    const healthCounts = { active: 0, stale: 0, dormant: 0 };
    let mostActiveRelationship = '';
    let longestWithoutContact = '';
    let maxNotes = 0;
    let maxDaysSince = 0;

    (people || []).forEach(person => {
      const personNotes = notes.filter(note => note.person_id === person.id);
      const notesCount = personNotes.length;
      
      const lastNote = personNotes[0];
      const lastInteraction = lastNote ? lastNote.created_at : person.created_at;
      const daysSince = Math.floor((Date.now() - new Date(lastInteraction).getTime()) / (1000 * 60 * 60 * 24));
      
      const health = calculateRelationshipHealth(lastInteraction, notesCount);
      healthCounts[health]++;

      // Track most active (most notes)
      if (notesCount > maxNotes) {
        maxNotes = notesCount;
        mostActiveRelationship = person.name;
      }

      // Track longest without contact (only those with previous contact)
      if (notesCount > 0 && daysSince > maxDaysSince) {
        maxDaysSince = daysSince;
        longestWithoutContact = person.name;
      }
    });

    const relationshipHealth = {
      active: healthCounts.active,
      stale: healthCounts.stale,
      dormant: healthCounts.dormant
    };

    // ====== MONTHLY ACTIVITY ANALYSIS ======
    const monthlyActivity: Record<string, { notes_count: number; people_contacted: Set<string> }> = {};
    
    notes.forEach(note => {
      const month = getMonthKey(note.created_at);
      if (!monthlyActivity[month]) {
        monthlyActivity[month] = { notes_count: 0, people_contacted: new Set() };
      }
      monthlyActivity[month].notes_count++;
      monthlyActivity[month].people_contacted.add(note.person_id);
    });

    const monthlyActivityArray = Object.entries(monthlyActivity)
      .map(([month, data]) => ({
        month,
        notes_count: data.notes_count,
        people_contacted: data.people_contacted.size
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months

    // ====== INSIGHTS GENERATION ======
    const mostUsedTags = topTags.slice(0, 3).map(t => t.tag);
    
    // Suggested contacts: stale relationships with previous interaction
    const suggestedContacts = (people || [])
      .filter(person => {
        const personNotes = notes.filter(note => note.person_id === person.id);
        const lastNote = personNotes[0];
        const daysSince = lastNote ? 
          Math.floor((Date.now() - new Date(lastNote.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 
          999;
        return personNotes.length > 0 && daysSince >= 30 && daysSince <= 120; // Stale but not dormant
      })
      .sort((a, b) => {
        const aLastNote = notes.find(note => note.person_id === a.id);
        const bLastNote = notes.find(note => note.person_id === b.id);
        const aDays = aLastNote ? Math.floor((Date.now() - new Date(aLastNote.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 999;
        const bDays = bLastNote ? Math.floor((Date.now() - new Date(bLastNote.created_at).getTime()) / (1000 * 60 * 60 * 1000)) : 999;
        return bDays - aDays; // Most overdue first
      })
      .slice(0, 5)
      .map(person => person.name);

    const insights = {
      most_active_relationship: mostActiveRelationship,
      longest_without_contact: longestWithoutContact,
      most_used_tags: mostUsedTags,
      suggested_contacts: suggestedContacts
    };

    // ====== BUILD FINAL RESPONSE ======
    const analytics: MCPPeopleAnalytics = {
      total_people: totalPeople,
      by_relation: byRelation,
      by_relation_type: byRelationType,
      interaction_summary: interactionSummary,
      top_tags: topTags,
      relationship_health: relationshipHealth,
      monthly_activity: monthlyActivityArray,
      insights
    };

    const queryTime = Date.now() - startTime;

    const response: MCPPeopleAnalyticsResponse = {
      analytics,
      generated_at: new Date().toISOString(),
      query_time_ms: queryTime
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
    console.error('Error in people analytics endpoint:', error);
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