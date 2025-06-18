import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Validate env vars but don't break build - just log loudly
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = `🚨 MISSING SUPABASE ENV VARS: URL=${!!supabaseUrl}, KEY=${!!supabaseAnonKey}`
  console.error(errorMsg)
  
  // Only throw in production runtime (not build time)
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production' && process.env.VERCEL) {
    console.error('🔥 Production deployment needs these vars!')
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for Neural System
export interface Person {
  id: string
  name: string
  relation: string
  tldr?: string
  is_primary_user?: boolean
  created_at: string
  updated_at?: string
}

export interface PersonNote {
  id: string
  person_id: string
  title: string
  content?: string
  tags: string[]
  created_at: string
}

export interface Project {
  id: string
  name: string
  tldr?: string
  created_at: string
  updated_at?: string
}

export interface Sprint {
  id: string
  project_id: string
  name: string
  tldr?: string
  status: 'active' | 'completed' | 'archived'
  created_at: string
  updated_at?: string
}

export interface Task {
  id: string
  sprint_id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: number
  created_at: string
  completed_at?: string
}

export interface SprintNote {
  id: string
  sprint_id: string
  title: string
  content?: string
  tags: string[]
  created_at: string
}

// 🎭 Custom Instructions System
export interface CustomInstructions {
  id: string
  user_id: string // References Marco (primary user)
  behavior_description: string
  mcp_context_instructions: string
  created_at: string
  updated_at?: string
  people?: { name: string; tldr?: string } // Join with Marco
}

export interface Memory {
  id: string
  title: string
  content: string
  tags: string[] | null
  created_at: string
  updated_at?: string
}

// 🎯 Summary types for Overview (lightweight data)
export interface PersonSummary {
  name: string
  relation: string
  // NO tldr here - only for lists
}

export interface ProjectSummary {
  name: string
  sprint_count: number
  // NO tldr, NO total_tasks here - only for lists
}

export interface OverviewStats {
  people: number
  projects: number
  sprints: number
  tasks: number
}

// 📊 Optimized queries for Overview
export const overviewQueries = {
  // Get people summary (name + relation only)
  async getPeopleSummary(limit = 10): Promise<PersonSummary[]> {
    const { data, error } = await supabase
      .from('people')
      .select('name, relation')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Get projects summary with sprint counts only (no tldr, no tasks)
  async getProjectsSummary(limit = 10): Promise<ProjectSummary[]> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        name,
        sprints(id)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(project => ({
      name: project.name,
      sprint_count: (project as any).sprints?.length || 0
    }));
  },

  // Get system stats
  async getOverviewStats(): Promise<OverviewStats> {
    const [peopleCount, projectsCount, sprintsCount, tasksCount] = await Promise.all([
      supabase.from('people').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('sprints').select('*', { count: 'exact', head: true }),
      supabase.from('tasks').select('*', { count: 'exact', head: true })
    ]);

    return {
      people: peopleCount.count || 0,
      projects: projectsCount.count || 0,
      sprints: sprintsCount.count || 0,
      tasks: tasksCount.count || 0
    };
  },

  // Get Custom Instructions config for Overview
  async getCustomInstructions(): Promise<CustomInstructions | null> {
    const { data, error } = await supabase
      .from('custom_instructions')
      .select(`
        *,
        people:user_id(name, tldr)
      `)
      .single();

    if (error) {
      console.error('Error fetching custom instructions:', error);
      return null;
    }

    return data;
  },

};

// 📋 Full queries for detailed lists (PeopleTab, ProjectsTab)
export const detailQueries = {
  // Get full people list with tldr and notes count (including Marco)
  async getPeopleList() {
    const { data, error } = await supabase
      .from('people')
      .select(`
        id,
        name,
        relation,
        tldr,
        is_primary_user,
        created_at,
        updated_at
      `)
      .order('is_primary_user', { ascending: false }) // Marco first
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get notes count for each person
    const peopleWithCounts = await Promise.all(
      (data || []).map(async (person) => {
        const { count } = await supabase
          .from('person_notes')
          .select('*', { count: 'exact', head: true })
          .eq('person_id', person.id);
        
        return {
          ...person,
          notes_count: count || 0
        };
      })
    );

    return peopleWithCounts;
  },

  // Get full projects list with tldr and counts
  async getProjectsList() {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        tldr,
        created_at,
        updated_at,
        sprints(
          id,
          name,
          tasks(id)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(project => ({
      ...project,
      sprint_count: (project as any).sprints?.length || 0,
      total_tasks: (project as any).sprints?.reduce((total: number, sprint: any) => 
        total + (sprint.tasks?.length || 0), 0) || 0,
      sprints: ((project as any).sprints || []).map((sprint: any) => ({
        id: sprint.id,
        name: sprint.name,
        task_count: sprint.tasks?.length || 0
      }))
    }));
  }
};

// 🎭 Custom Instructions & Memory queries
export const customQueries = {
  // Get Custom Instructions with details
  async getCustomInstructions(): Promise<CustomInstructions | null> {
    try {
      const { data, error } = await supabase
        .from('custom_instructions')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching custom instructions:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching custom instructions:', error);
      return null;
    }
  },

  // Update Custom Instructions
  async updateCustomInstructions(updates: Partial<CustomInstructions>): Promise<boolean> {
    try {
      // 🔥 Como há apenas uma linha na tabela, vamos atualizar diretamente
      const { error } = await supabase
        .from('custom_instructions')
        .update({
          behavior_description: updates.behavior_description,
          mcp_context_instructions: updates.mcp_context_instructions,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', '48ff8f29-3bee-4aa0-83ae-927ff8dde816'); // Marco's ID

      if (error) {
        console.error('Error updating custom instructions:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating custom instructions:', error);
      return false;
    }
  },

  // Get all memory entries
  async getMemoryList(): Promise<Memory[]> {
    const { data, error } = await supabase
      .from('memory')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching memory:', error);
      return [];
    }

    return data || [];
  },

  // Get memory by tags (for filtering)
  async getMemoryByTags(tags: string[]): Promise<Memory[]> {
    const { data, error } = await supabase
      .from('memory')
      .select('*')
      .overlaps('tags', tags)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching memory by tags:', error);
      return [];
    }

    return data || [];
  },

  // Create Memory
  async createMemory(memory: Omit<Memory, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('memory')
        .insert([{
          title: memory.title,
          content: memory.content,
          tags: memory.tags && memory.tags.length > 0 ? memory.tags : null
        }]);

      if (error) {
        console.error('Error creating memory:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error creating memory:', error);
      return false;
    }
  },

  // Update Memory
  async updateMemory(id: string, updates: Partial<Memory>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('memory')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating memory:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating memory:', error);
      return false;
    }
  },

  // Delete Memory
  async deleteMemory(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('memory')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting memory:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting memory:', error);
      return false;
    }
  },

  // Get memory count for Overview
  async getMemoryCount(): Promise<number> {
    const { count, error } = await supabase
      .from('memory')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching memory count:', error);
      return 0;
    }

    return count || 0;
  },

  // Get memory summary for Overview (title + tags only)
  async getMemorySummary(limit = 10): Promise<Pick<Memory, 'id' | 'title' | 'tags' | 'created_at'>[]> {
    const { data, error } = await supabase
      .from('memory')
      .select('id, title, tags, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching memory summary:', error);
      return [];
    }

    return data || [];
  }
}; 