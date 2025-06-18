import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

// ====== MCP REAL - Neural System Server ======
// Implements MCP Protocol 2025-03-26 specification
// Compatible with Claude Desktop and Claude.ai web

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, any>;
}

interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

interface JsonRpcNotification {
  jsonrpc: "2.0";
  method: string;
  params?: Record<string, any>;
}

// MCP Protocol Constants
const MCP_PROTOCOL_VERSION = "2025-03-26";

// Marco's Persona for AI Integration
const MARCO_PERSONA = {
  name: "Marco Fernandes",
  role: "CEO/Fundador DietFlow", 
  personality: "Rebelde intelectual com humor ácido",
  context: "TDAH + superdotação, alergia a rotinas sem propósito",
  voice: "Trinity no show do Nine Inch Nails: delineador + deboche",
  instructions: [
    "Questione ideias com lógica feroz - se mundano, corte na veia sem diplomacia",
    "Densidade em docs técnicos, síntese didática com TL;DR cortante para dúvidas", 
    "Detectou estagnação? Cave fundo: filosofia + experimentos + estudos contraintuitivos",
    "Conecte pontos distantes, force saída da bolha com dados, não opinião",
    "Cumplicidade rebelde > reverência educada"
  ]
};

// Server Capabilities following MCP 2025-03-26
const SERVER_CAPABILITIES = {
  tools: {
    listChanged: true
  },
  resources: {
    subscribe: true,
    listChanged: true  
  },
  prompts: {
    listChanged: true
  },
  logging: {}
};

// Neural System Tools Definition
const NEURAL_TOOLS = [
  // People Management Tools
  {
    name: "list_people",
    description: "List all people in Marco's network with optional filters",
    inputSchema: {
      type: "object",
      properties: {
        relation: { type: "string", description: "Filter by relationship type" },
        limit: { type: "number", description: "Max number of results", default: 20 },
        search: { type: "string", description: "Search by name" }
      }
    }
  },
  {
    name: "get_person", 
    description: "Get detailed information about a specific person",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Person ID" }
      },
      required: ["id"]
    }
  },
  {
    name: "create_person",
    description: "Add a new person to Marco's network",
    inputSchema: {
      type: "object", 
      properties: {
        name: { type: "string", description: "Person's name" },
        relation: { type: "string", description: "Relationship to Marco" },
        tldr: { type: "string", description: "Brief description" },
        email: { type: "string", description: "Email address" }
      },
      required: ["name", "relation"]
    }
  },
  {
    name: "update_person",
    description: "Update information about an existing person",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Person ID" },
        name: { type: "string" },
        relation: { type: "string" },
        tldr: { type: "string" },
        email: { type: "string" }
      },
      required: ["id"]
    }
  },
  {
    name: "delete_person",
    description: "Remove a person from Marco's network",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Person ID" }
      },
      required: ["id"]
    }
  },
  {
    name: "add_note",
    description: "Add a note about a person",
    inputSchema: {
      type: "object",
      properties: {
        person_id: { type: "string", description: "Person ID" },
        title: { type: "string", description: "Note title" },
        content: { type: "string", description: "Note content" }
      },
      required: ["person_id", "title", "content"]
    }
  },

  // Project Management Tools
  {
    name: "list_projects",
    description: "List all projects with optional filters", 
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", description: "Filter by status" },
        limit: { type: "number", description: "Max results", default: 20 }
      }
    }
  },
  {
    name: "get_project",
    description: "Get detailed project information",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Project ID" }
      },
      required: ["id"]
    }
  },
  {
    name: "create_project",
    description: "Create a new project",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Project name" },
        tldr: { type: "string", description: "Project summary" },
        status: { type: "string", description: "Project status", default: "active" }
      },
      required: ["name"]
    }
  },
  {
    name: "update_project", 
    description: "Update project information",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Project ID" },
        name: { type: "string" },
        tldr: { type: "string" },
        status: { type: "string" }
      },
      required: ["id"]
    }
  },
  {
    name: "delete_project",
    description: "Delete a project and all associated data",
    inputSchema: {
      type: "object", 
      properties: {
        id: { type: "string", description: "Project ID" }
      },
      required: ["id"]
    }
  },

  // Sprint Management Tools
  {
    name: "list_sprints",
    description: "List sprints for a project",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string", description: "Project ID" },
        status: { type: "string", description: "Sprint status" }
      },
      required: ["project_id"]
    }
  },
  {
    name: "create_sprint",
    description: "Create a new sprint",
    inputSchema: {
      type: "object",
      properties: {
        project_id: { type: "string", description: "Project ID" },
        name: { type: "string", description: "Sprint name" },
        description: { type: "string", description: "Sprint description" },
        start_date: { type: "string", description: "Start date" },
        end_date: { type: "string", description: "End date" }
      },
      required: ["project_id", "name"]
    }
  },

  // Task Management Tools  
  {
    name: "list_tasks",
    description: "List tasks for a sprint with optional status filter",
    inputSchema: {
      type: "object",
      properties: {
        sprint_id: { type: "string", description: "Sprint ID" },
        status: { type: "string", description: "Filter by task status (todo, in_progress, completed)" }
      },
      required: ["sprint_id"]
    }
  },
  {
    name: "create_task",
    description: "Create a new task",
    inputSchema: {
      type: "object",
      properties: {
        sprint_id: { type: "string", description: "Sprint ID" },
        title: { type: "string", description: "Task title" },
        description: { type: "string", description: "Task description" },
        priority: { type: "string", description: "Task priority", default: "medium" }
      },
      required: ["sprint_id", "title"]
    }
  },
  {
    name: "get_task",
    description: "Get detailed task information with context",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Task ID" }
      },
      required: ["id"]
    }
  },
  {
    name: "update_task",
    description: "Update task information",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Task ID" },
        title: { type: "string" },
        description: { type: "string" },
        status: { type: "string" },
        priority: { type: "string" }
      },
      required: ["id"]
    }
  },
  {
    name: "delete_task",
    description: "Delete a task",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Task ID" }
      },
      required: ["id"]
    }
  },

  // Sprint Individual Management
  {
    name: "get_sprint",
    description: "Get detailed sprint information with tasks and notes",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Sprint ID" }
      },
      required: ["id"]
    }
  },
  {
    name: "update_sprint",
    description: "Update sprint information",
    inputSchema: {
      type: "object", 
      properties: {
        id: { type: "string", description: "Sprint ID" },
        name: { type: "string" },
        description: { type: "string" },
        status: { type: "string" },
        start_date: { type: "string" },
        end_date: { type: "string" }
      },
      required: ["id"]
    }
  },
  {
    name: "delete_sprint",
    description: "Delete a sprint and all associated tasks",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Sprint ID" }
      },
      required: ["id"]
    }
  },

  // Sprint Notes Management
  {
    name: "create_sprint_note",
    description: "Add a note to a sprint",
    inputSchema: {
      type: "object",
      properties: {
        sprint_id: { type: "string", description: "Sprint ID" },
        title: { type: "string", description: "Note title" },
        content: { type: "string", description: "Note content" }
      },
      required: ["sprint_id", "title", "content"]
    }
  },
  {
    name: "update_sprint_note",
    description: "Update a sprint note",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Note ID" },
        title: { type: "string" },
        content: { type: "string" }
      },
      required: ["id"]
    }
  },
  {
    name: "delete_sprint_note",
    description: "Delete a sprint note",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Note ID" }
      },
      required: ["id"]
    }
  },

  // Person Notes Management (estava faltando update/delete)
  {
    name: "update_note",
    description: "Update a person note",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Note ID" },
        title: { type: "string" },
        content: { type: "string" }
      },
      required: ["id"]
    }
  },
  {
    name: "delete_note",
    description: "Delete a person note",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Note ID" }
      },
      required: ["id"]
    }
  },

  // Memory Management Tools
  {
    name: "get_memory",
    description: "Get memory entries with optional filtering by tags",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Max number of entries", default: 50 },
        tags: { type: "array", items: { type: "string" }, description: "Filter by tags" }
      }
    }
  },
  {
    name: "create_memory",
    description: "Create a new memory entry",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Memory title" },
        content: { type: "string", description: "Memory content" },
        tags: { type: "array", items: { type: "string" }, description: "Tags for organization" }
      },
      required: ["title", "content"]
    }
  },
  {
    name: "update_memory",
    description: "Update an existing memory entry",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Memory ID" },
        title: { type: "string" },
        content: { type: "string" },
        tags: { type: "array", items: { type: "string" } }
      },
      required: ["id"]
    }
  },
  {
    name: "delete_memory",
    description: "Delete a memory entry",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Memory ID" }
      },
      required: ["id"]
    }
  },
  {
    name: "get_custom_instructions",
    description: "Get complete custom instructions and system configuration",
    inputSchema: {
      type: "object",
      properties: {}
    }
  }
];

// Neural System Resources
const NEURAL_RESOURCES = [
  {
    uri: "neural://manifest",
    name: "Neural System Manifest",
    description: "Complete overview of Marco's neural system including persona, stats, and recent activity",
    mimeType: "application/json"
  },
  {
    uri: "neural://context/people", 
    name: "People Context",
    description: "Marco's network relationships and interactions",
    mimeType: "application/json"
  },
  {
    uri: "neural://context/projects",
    name: "Projects Context", 
    description: "Active projects and their current status",
    mimeType: "application/json"
  }
];

// Neural System Prompts
const NEURAL_PROMPTS = [
  {
    name: "marco_persona",
    description: "Configure AI assistant with Marco's rebellious persona and context",
    arguments: []
  },
  {
    name: "project_analysis",
    description: "Analyze project status and provide insights",
    arguments: [
      { name: "project_id", description: "Project to analyze", required: true }
    ]
  },
  {
    name: "relationship_mapping",
    description: "Analyze and map relationships in Marco's network",
    arguments: [
      { name: "focus_person", description: "Person to focus analysis on", required: false }
    ]
  }
];

// Tool Implementation Functions
async function executeTool(toolName: string, params: any): Promise<any> {
  try {
    switch (toolName) {
      case "list_people":
        return await listPeople(params);
      case "get_person":
        return await getPerson(params);
      case "create_person":
        return await createPerson(params);
      case "update_person":
        return await updatePerson(params);
      case "delete_person":
        return await deletePerson(params);
      case "add_note":
        return await addNote(params);
      case "list_projects":
        return await listProjects(params);
      case "get_project":
        return await getProject(params);
      case "create_project":
        return await createProject(params);
      case "update_project":
        return await updateProject(params);
      case "delete_project":
        return await deleteProject(params);
      case "list_sprints":
        return await listSprints(params);
      case "create_sprint":
        return await createSprint(params);
      case "list_tasks":
        return await listTasks(params);
      case "create_task":
        return await createTask(params);
      case "get_task":
        return await getTask(params);
      case "update_task":
        return await updateTask(params);
      case "delete_task":
        return await deleteTask(params);
      case "get_sprint":
        return await getSprint(params);
      case "update_sprint":
        return await updateSprint(params);
      case "delete_sprint":
        return await deleteSprint(params);
      case "create_sprint_note":
        return await createSprintNote(params);
      case "update_sprint_note":
        return await updateSprintNote(params);
      case "delete_sprint_note":
        return await deleteSprintNote(params);
      case "update_note":
        return await updateNote(params);
      case "delete_note":
        return await deleteNote(params);
      case "get_memory":
        return await getMemory(params);
      case "create_memory":
        return await createMemory(params);
      case "update_memory":
        return await updateMemory(params);
      case "delete_memory":
        return await deleteMemory(params);
      case "get_custom_instructions":
        return await getCustomInstructions(params);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error: any) {
    throw new Error(`Tool execution failed: ${error.message}`);
  }
}

// Tool Implementations (using existing Supabase logic)
async function listPeople(params: any) {
  let query = supabase.from('people').select('*');
  
  if (params.relation) {
    query = query.eq('relation', params.relation);
  }
  if (params.search) {
    query = query.ilike('name', `%${params.search}%`);
  }
  
  const limit = params.limit || 20;
  query = query.limit(limit);
  
  const { data, error } = await query;
  if (error) throw error;
  
  return {
    content: [
      {
        type: "text",
        text: `Found ${data.length} people in Marco's network:\n\n${data.map(p => `• ${p.name} (${p.relation})`).join('\n')}`
      }
    ]
  };
}

async function getPerson(params: any) {
  const { data, error } = await supabase
    .from('people')
    .select('*, person_notes(*)')
    .eq('id', params.id)
    .single();
    
  if (error) throw error;
  if (!data) throw new Error('Person not found');
  
  return {
    content: [
      {
        type: "text", 
        text: `**${data.name}**\n\nRelationship: ${data.relation}\nTLDR: ${data.tldr || 'No summary'}\nEmail: ${data.email || 'Not provided'}\n\nNotes: ${data.person_notes?.length || 0} notes available`
      }
    ]
  };
}

async function createPerson(params: any) {
  const { data, error } = await supabase
    .from('people')
    .insert([params])
    .select()
    .single();
    
  if (error) throw error;
  
  return {
    content: [
      {
        type: "text",
        text: `✅ Added ${data.name} to Marco's network as ${data.relation}`
      }
    ]
  };
}

async function updatePerson(params: any) {
  const { id, ...updateData } = params;
  const { data, error } = await supabase
    .from('people')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  
  return {
    content: [
      {
        type: "text",
        text: `✅ Updated ${data.name}'s information`
      }
    ]
  };
}

async function deletePerson(params: any) {
  const { error } = await supabase
    .from('people')
    .delete()
    .eq('id', params.id);
    
  if (error) throw error;
  
  return {
    content: [
      {
        type: "text",
        text: `✅ Removed person from Marco's network`
      }
    ]
  };
}

async function addNote(params: any) {
  const { data, error } = await supabase
    .from('person_notes')
    .insert([{
      person_id: params.person_id,
      title: params.title,
      content: params.content,
      tags: params.tags || []
    }])
    .select()
    .single();
    
  if (error) throw error;
  
  return {
    content: [
      {
        type: "text",
        text: `✅ Added note "${data.title}" to person`
      }
    ]
  };
}

async function listProjects(params: any) {
  let query = supabase.from('projects').select(`
    *,
    sprints!inner(
      id,
      name,
      tasks(count)
    )
  `);
  
  if (params.status) {
    query = query.eq('status', params.status);
  }
  
  const limit = params.limit || 20;
  query = query.limit(limit);
  
  const { data, error } = await query;
  if (error) throw error;
  
  const projectsText = data.map(p => {
    const sprints = (p as any).sprints || [];
    const totalTasks = sprints.reduce((sum: number, s: any) => sum + (s.tasks?.[0]?.count || 0), 0);
    return `• **${p.name}** (${p.status ?? 'active'})\n  TLDR: ${p.tldr || 'No summary'}\n  Sprints: ${sprints.length} | Tasks: ${totalTasks}`;
  }).join('\n\n');
  
  return {
    content: [
      {
        type: "text",
        text: `Found ${data.length} projects:\n\n${projectsText}`
      }
    ]
  };
}

async function getProject(params: any) {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      sprints (
        id,
        name,
        description,
        status,
        tasks(count),
        sprint_notes(count)
      )
    `)
    .eq('id', params.id)
    .single();
    
  if (error) throw error;
  if (!data) throw new Error('Project not found');
  
  const sprints = (data as any).sprints || [];
  const sprintsText = sprints.map((s: any) => {
    const taskCount = s.tasks?.[0]?.count || 0;
    const noteCount = s.sprint_notes?.[0]?.count || 0;
    return `  • **${s.name}** (${s.status || 'active'})\n    TLDR: ${s.description || 'No description'}\n    Tasks: ${taskCount} | Notes: ${noteCount}`;
  }).join('\n\n');
  
  const totalTasks = sprints.reduce((sum: number, s: any) => sum + (s.tasks?.[0]?.count || 0), 0);
  
  return {
    content: [
      {
        type: "text",
        text: `**${data.name}**\n\nStatus: ${data.status || 'active'}\nTLDR: ${data.tldr || 'No summary'}\nTotal Sprints: ${sprints.length} | Total Tasks: ${totalTasks}\n\n**Sprints:**\n${sprintsText || '  No sprints'}`
      }
    ]
  };
}

async function createProject(params: any) {
  const { data, error } = await supabase
    .from('projects')
    .insert([params])
    .select()
    .single();
    
  if (error) throw error;
  
  return {
    content: [
      {
        type: "text",
        text: `✅ Created project "${data.name}"`
      }
    ]
  };
}

async function updateProject(params: any) {
  const { id, ...updateData } = params;
  const { data, error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  
  return {
    content: [
      {
        type: "text",
        text: `✅ Updated project "${data.name}"`
      }
    ]
  };
}

async function deleteProject(params: any) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', params.id);
    
  if (error) throw error;
  
  return {
    content: [
      {
        type: "text",
        text: `✅ Deleted project and all associated data`
      }
    ]
  };
}

async function listSprints(params: any) {
  const { data, error } = await supabase
    .from('sprints')
    .select('*')
    .eq('project_id', params.project_id);
    
  if (error) throw error;
  
  return {
    content: [
      {
        type: "text",
        text: `Found ${data.length} sprints:\n\n${data.map(s => `• ${s.name} (${s.status || 'active'})`).join('\n')}`
      }
    ]
  };
}

async function createSprint(params: any) {
  const { data, error } = await supabase
    .from('sprints')
    .insert([params])
    .select()
    .single();
    
  if (error) throw error;
  
  return {
    content: [
      {
        type: "text",
        text: `✅ Created sprint "${data.name}"`
      }
    ]
  };
}

async function listTasks(params: any) {
  let query = supabase.from('tasks').select('*').eq('sprint_id', params.sprint_id);
  
  // Filter by status if provided
  if (params.status) {
    query = query.eq('status', params.status);
  }
  
  query = query.order('priority', { ascending: false });
  
  const { data, error } = await query;
  if (error) throw error;
  
  const tasksText = data.map(t => {
    const priority = t.priority ? ` [${t.priority}]` : '';
    const description = t.description ? `\n    ${t.description}` : '';
    return `• **${t.title}** (${t.status || 'todo'})${priority}${description}`;
  }).join('\n\n');
  
  const statusCounts = data.reduce((acc: any, t) => {
    const status = t.status || 'todo';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  
  const statusText = Object.entries(statusCounts)
    .map(([status, count]) => `${status}: ${count}`)
    .join(' | ');
  
  return {
    content: [
      {
        type: "text",
        text: `Found ${data.length} tasks (${statusText}):\n\n${tasksText || 'No tasks found'}`
      }
    ]
  };
}

async function createTask(params: any) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([params])
    .select()
    .single();
    
  if (error) throw error;
  
  return {
    content: [
      {
        type: "text",
        text: `✅ Created task "${data.title}"`
      }
    ]
  };
}

async function getTask(params: any) {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      sprints!inner (
        id,
        name,
        projects!inner (
          id,
          name
        )
      )
    `)
    .eq('id', params.id)
    .single();
    
  if (error) throw error;
  if (!data) throw new Error('Task not found');
  
  return {
    content: [
      {
        type: "text",
        text: `**${data.title}**\n\nProject: ${(data as any).sprints.projects.name}\nSprint: ${(data as any).sprints.name}\nStatus: ${data.status || 'todo'}\nPriority: ${data.priority || 'medium'}\nDescription: ${data.description || 'No description'}\nCreated: ${new Date(data.created_at).toLocaleDateString()}`
      }
    ]
  };
}

async function updateTask(params: any) {
  const { id, ...updateData } = params;
  
  // Set completed_at if status changed to completed
  if (updateData.status === 'completed' && !updateData.completed_at) {
    updateData.completed_at = new Date().toISOString();
  }
  
  // Clear completed_at if status changed away from completed
  if (updateData.status && updateData.status !== 'completed' && updateData.completed_at !== undefined) {
    updateData.completed_at = null;
  }
  
  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  
  return {
    content: [
      {
        type: "text",
        text: `✅ Updated task "${data.title}"`
      }
    ]
  };
}

async function deleteTask(params: any) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', params.id);
    
  if (error) throw error;
  
  return {
    content: [
      {
        type: "text",
        text: `✅ Deleted task`
      }
    ]
  };
}

// Sprint Individual Management
async function getSprint(params: any) {
  const { data, error } = await supabase
    .from('sprints')
    .select(`
      *,
      projects!inner (
        id,
        name
      ),
      tasks (*),
      sprint_notes (*)
    `)
    .eq('id', params.id)
    .single();
    
  if (error) throw error;
  if (!data) throw new Error('Sprint not found');
  
  const tasks = (data as any).tasks || [];
  const notes = (data as any).sprint_notes || [];
  const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
  const progress = tasks.length ? Math.round(completedTasks / tasks.length * 100) : 0;
  
  const tasksText = tasks.map((t: any) => `  • ${t.title} (${t.status || 'todo'})`).join('\n');
  const notesText = notes.map((n: any) => `  • ${n.title}`).join('\n');
  
  return {
    content: [
      {
        type: "text",
        text: `**${data.name}**\n\nProject: ${(data as any).projects.name}\nDescription: ${data.description || 'No description'}\nProgress: ${progress}% (${completedTasks}/${tasks.length} tasks)\n\n**Tasks:**\n${tasksText || '  No tasks'}\n\n**Notes:**\n${notesText || '  No notes'}`
      }
    ]
  };
}

async function updateSprint(params: any) {
  const { id, ...updateData } = params;
  const { data, error } = await supabase
    .from('sprints')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  
  return {
    content: [
      {
        type: "text",
        text: `✅ Updated sprint "${data.name}"`
      }
    ]
  };
}

async function deleteSprint(params: any) {
  const { error } = await supabase
    .from('sprints')
    .delete()
    .eq('id', params.id);
    
  if (error) throw error;
  
  return {
    content: [
      {
        type: "text",
        text: `✅ Deleted sprint and all associated tasks`
      }
    ]
  };
}

// Sprint Notes Management
async function createSprintNote(params: any) {
  const { data, error } = await supabase
    .from('sprint_notes')
    .insert([{
      sprint_id: params.sprint_id,
      title: params.title,
      content: params.content
    }])
    .select()
    .single();
    
  if (error) throw error;
  
  return {
    content: [
      {
        type: "text",
        text: `✅ Added note "${data.title}" to sprint`
      }
    ]
  };
}

async function updateSprintNote(params: any) {
  const { id, ...updateData } = params;
  const { data, error } = await supabase
    .from('sprint_notes')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  
  return {
    content: [
      {
        type: "text",
        text: `✅ Updated sprint note "${data.title}"`
      }
    ]
  };
}

async function deleteSprintNote(params: any) {
  const { error } = await supabase
    .from('sprint_notes')
    .delete()
    .eq('id', params.id);
    
  if (error) throw error;
  
  return {
    content: [
      {
        type: "text",
        text: `✅ Deleted sprint note`
      }
    ]
  };
}

// Person Notes Management
async function updateNote(params: any) {
  const { id, ...updateData } = params;
  const { data, error } = await supabase
    .from('person_notes')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  
  return {
    content: [
      {
        type: "text",
        text: `✅ Updated person note "${data.title}"`
      }
    ]
  };
}

async function deleteNote(params: any) {
  const { error } = await supabase
    .from('person_notes')
    .delete()
    .eq('id', params.id);
    
  if (error) throw error;
  
  return {
    content: [
      {
        type: "text",
        text: `✅ Deleted person note`
      }
    ]
  };
}

async function getMemory(params: any) {
  const limit = params.limit || 50;
  const tags = params.tags;
  
  let query = supabase.from('memory').select('*');
  
  if (tags && Array.isArray(tags)) {
    query = query.overlaps('tags', tags);
  }
  
  query = query
    .order('created_at', { ascending: false })
    .limit(limit);
    
  const { data, error } = await query;
  if (error) throw error;
  
  return {
    content: [
      {
        type: "text",
        text: data.length > 0 
          ? `Memory entries (${data.length}):\n\n${data.map(m => 
              `• **${m.title}**\n  ${m.content.substring(0, 200)}...${m.tags ? `\n  Tags: ${m.tags.join(', ')}` : ''}`
            ).join('\n\n')}`
          : "No memory entries found"
      }
    ]
  };
}

async function createMemory(params: any) {
  const { data, error } = await supabase
    .from('memory')
    .insert([{
      title: params.title,
      content: params.content,
      tags: params.tags || null
    }])
    .select()
    .single();
    
  if (error) throw error;
  
  return {
    content: [
      {
        type: "text",
        text: `✅ Created memory "${data.title}"`
      }
    ]
  };
}

async function updateMemory(params: any) {
  const { id, ...updateData } = params;
  const { data, error } = await supabase
    .from('memory')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  
  return {
    content: [
      {
        type: "text",
        text: `✅ Updated memory "${data.title}"`
      }
    ]
  };
}

async function deleteMemory(params: any) {
  const { error } = await supabase
    .from('memory')
    .delete()
    .eq('id', params.id);
    
  if (error) throw error;
  
  return {
    content: [
      {
        type: "text",
        text: `✅ Deleted memory`
      }
    ]
  };
}

async function getCustomInstructions(params: any) {
  const { data: instructions, error: instructionsError } = await supabase
    .from('custom_instructions')
    .select('*')
    .single();
    
  if (instructionsError) throw instructionsError;

  const { data: marco, error: marcoError } = await supabase
    .from('people')
    .select('name, tldr')
    .eq('is_primary_user', true)
    .single();
    
  if (marcoError) throw marcoError;

  const { count: memoryCount, error: memoryError } = await supabase
    .from('memory')
    .select('*', { count: 'exact', head: true });
    
  if (memoryError) throw memoryError;
  
  return {
    content: [
      {
        type: "text",
        text: `**Custom Instructions:**\n\n**Primary User:** ${marco.name}\n**User TLDR:** ${marco.tldr || 'Not set'}\n\n**AI Behavior:**\n${instructions.behavior_description}\n\n**MCP Instructions:**\n${instructions.mcp_context_instructions}\n\n**Memory System:** ${memoryCount || 0} memories available`
      }
    ]
  };
}

// Resource Implementation Functions
async function getResource(uri: string): Promise<any> {
  if (uri === "neural://manifest") {
    return await getNeuralManifest();
  } else if (uri.startsWith("neural://context/")) {
    const contextType = uri.split("/").pop();
    if (!contextType) {
      throw new Error("Invalid context URI");
    }
    return await getContextData(contextType);
  } else {
    throw new Error(`Unknown resource: ${uri}`);
  }
}

async function getNeuralManifest() {
  // Get system stats
  const [peopleCount, projectsCount, sprintsCount, tasksCount] = await Promise.all([
    supabase.from('people').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('sprints').select('*', { count: 'exact', head: true }),
    supabase.from('tasks').select('*', { count: 'exact', head: true })
  ]);

  const manifest = {
    version: "1.0.0",
    last_sync: new Date().toISOString(),
    user: MARCO_PERSONA,
    stats: {
      people_count: peopleCount.count || 0,
      projects_count: projectsCount.count || 0, 
      sprints_count: sprintsCount.count || 0,
      tasks_count: tasksCount.count || 0
    },
    capabilities: SERVER_CAPABILITIES,
    protocol_version: MCP_PROTOCOL_VERSION
  };

  return {
    contents: [
      {
        uri: "neural://manifest",
        text: JSON.stringify(manifest, null, 2),
        mimeType: "application/json"
      }
    ]
  };
}

async function getContextData(contextType: string) {
  if (contextType === "people") {
    const { data } = await supabase.from('people').select('*').limit(10);
    return {
      contents: [
        {
          uri: `neural://context/people`,
          text: JSON.stringify(data, null, 2),
          mimeType: "application/json"
        }
      ]
    };
  } else if (contextType === "projects") {
    const { data } = await supabase.from('projects').select('*').limit(10);
    return {
      contents: [
        {
          uri: `neural://context/projects`,
          text: JSON.stringify(data, null, 2),
          mimeType: "application/json"
        }
      ]
    };
  } else {
    throw new Error(`Unknown context type: ${contextType}`);
  }
}

// Prompt Implementation Functions
async function getPrompt(name: string, arguments_: any): Promise<any> {
  switch (name) {
    case "marco_persona":
      return {
        messages: [
          {
            role: "system",
            content: {
              type: "text",
              text: `Você é a IA de Marco Fernandes. ${MARCO_PERSONA.voice}.\n\nPersonalidade: ${MARCO_PERSONA.personality}\nContexto: ${MARCO_PERSONA.context}\n\nInstruções:\n${MARCO_PERSONA.instructions.map(i => `• ${i}`).join('\n')}\n\nSeja uma parceira intelectual rebelde, não uma assistente domesticada. Use humor ácido quando apropriado e questione ideias mundanas com lógica feroz.`
            }
          }
        ]
      };
      
    case "project_analysis":
      if (!arguments_.project_id) {
        throw new Error("project_id is required for project analysis");
      }
      
      const projectData = await getProject(arguments_);
      return {
        messages: [
          {
            role: "user", 
            content: {
              type: "text",
              text: `Analise este projeto e forneça insights acionáveis:\n\n${projectData.content[0].text}\n\nForneça análise de status, possíveis blockers, próximos passos recomendados e oportunidades de otimização. Use o tom rebelde característico do Marco.`
            }
          }
        ]
      };
      
    case "relationship_mapping":
      let peopleData;
      if (arguments_.focus_person) {
        peopleData = await getPerson({ id: arguments_.focus_person });
      } else {
        peopleData = await listPeople({ limit: 10 });
      }
      
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text", 
              text: `Mapeie e analise as relações na rede do Marco:\n\n${peopleData.content[0].text}\n\nIdentifique padrões, conexões importantes, possíveis sinergias e oportunidades de networking. Mantenha o tom direto e perspicaz do Marco.`
            }
          }
        ]
      };
      
    default:
      throw new Error(`Unknown prompt: ${name}`);
  }
}

// Main MCP Server Handler
async function handleMCPRequest(request: JsonRpcRequest): Promise<JsonRpcResponse> {
  const { id, method, params } = request;

  // 🔍 Debug log para Marco identificar requests
  console.log(`🧠 MCP Request: ${method}`, { id, params });

  try {
    let result: any;

    switch (method) {
      case "initialize":
        console.log("🎯 Initialize request - sending capabilities");
        result = {
          protocolVersion: MCP_PROTOCOL_VERSION,
          capabilities: SERVER_CAPABILITIES,
          serverInfo: {
            name: "neural-system",
            version: "1.0.0"
          }
        };
        break;

      case "tools/list":
        console.log("🛠️ Tools/list request - sending", NEURAL_TOOLS.length, "tools");
        result = {
          tools: NEURAL_TOOLS
        };
        break;

      case "tools/call":
        if (!params?.name) {
          throw new Error("Tool name is required");
        }
        console.log("🔧 Tool call:", params.name, params.arguments);
        result = await executeTool(params.name, params.arguments || {});
        break;

      case "resources/list":
        result = {
          resources: NEURAL_RESOURCES
        };
        break;

      case "resources/read":
        if (!params?.uri) {
          throw new Error("Resource URI is required");
        }
        result = await getResource(params.uri);
        break;

      case "prompts/list":
        result = {
          prompts: NEURAL_PROMPTS
        };
        break;

      case "prompts/get":
        if (!params?.name) {
          throw new Error("Prompt name is required");
        }
        result = await getPrompt(params.name, params.arguments || {});
        break;

      case "notifications/initialized":
        console.log("📡 Client initialized notification received");
        // Notifications don't require a response, but we'll send an empty result
        result = {};
        break;

      default:
        console.log("❌ Unknown method:", method);
        throw new Error(`Unknown method: ${method}`);
    }

    console.log("✅ MCP Response success for", method);
    return {
      jsonrpc: "2.0",
      id,
      result
    };

  } catch (error: any) {
    console.error("💥 MCP Error:", method, error.message);
    return {
      jsonrpc: "2.0", 
      id,
      error: {
        code: -32603,
        message: error.message,
        data: { method, params }
      }
    };
  }
}

// Simple Auth for Claude.ai Web
function validateSimpleAuth(request: NextRequest): boolean {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  const authHeader = request.headers.get('Authorization');
  
  // Development bypass
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // Token via query param (Claude.ai web)
  if (token === 'neural_access_2024') {
    return true;
  }
  
  // Bearer token (local clients)
  if (authHeader === 'Bearer neural_access_2024') {
    return true;
  }
  
  return false;
}

// HTTP Handler for Next.js
export async function POST(request: NextRequest) {
  try {
    // Simple auth check
    if (!validateSimpleAuth(request)) {
      return NextResponse.json({
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32001,
          message: "Authentication required. Use ?token=neural_access_2024 or Authorization: Bearer neural_access_2024"
        }
      }, { 
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }
    
    const body = await request.json();
    
    // Validate JSON-RPC 2.0 format
    if (body.jsonrpc !== "2.0") {
      return NextResponse.json({
        jsonrpc: "2.0",
        id: body.id || null,
        error: {
          code: -32600,
          message: "Invalid Request - JSON-RPC 2.0 required"
        }
      }, { status: 400 });
    }

    // Handle the request
    const response = await handleMCPRequest(body);
    
    return NextResponse.json(response, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32700,
        message: "Parse error",
        data: error.message
      }
    }, { status: 400 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const debug = url.searchParams.get('debug');
  
  // Debug endpoint para Marco testar
  if (debug === 'tools') {
    return NextResponse.json({
      status: "Neural System MCP Server",
      tools_count: NEURAL_TOOLS.length,
      tools: NEURAL_TOOLS.map(t => ({ name: t.name, description: t.description })),
      resources_count: NEURAL_RESOURCES.length,
      prompts_count: NEURAL_PROMPTS.length,
      auth_required: "?token=neural_access_2024",
      test_command: "POST with JSON-RPC 2.0 body: { \"jsonrpc\": \"2.0\", \"id\": 1, \"method\": \"tools/list\" }"
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }

  // Health check para Claude.ai integration
  if (!validateSimpleAuth(request)) {
    return NextResponse.json({
      error: "Authentication required",
      usage: "Use ?token=neural_access_2024 for Claude.ai web integration",
      debug_endpoint: "/api/mcp-server?debug=tools",
      server_status: "healthy"
    }, { 
      status: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
  
  return NextResponse.json({
    status: "MCP Server Active",
    version: "1.0.0",
    protocol: "JSON-RPC 2.0",
    auth: "Simple token-based",
    endpoint: "/api/mcp-server",
    tools_available: NEURAL_TOOLS.length,
    usage: {
      claude_web: "Use ?token=neural_access_2024",
      claude_desktop: "Use Authorization: Bearer neural_access_2024",
      test_debug: "?debug=tools"
    }
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
} 