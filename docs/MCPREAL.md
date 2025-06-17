# MCP REAL - Neural System MCP Server Implementation

## 🎯 Mission: Claude.ai Integration REAL

Implementar um **MCP Server genuíno** seguindo a especificação **2025-03-26** para integração completa com Claude Desktop e Claude.ai web.

## 🚨 Problem Statement

Nossa implementação atual é **"REST API com sabor MCP"** - funciona internamente mas NÃO é compatível com Claude.ai que espera:

- ✅ **JSON-RPC 2.0** protocol
- ✅ **OAuth 2.1** authorization  
- ✅ **MCP Protocol 2025-03-26** specification
- ✅ **Tool/Resource discovery** dinâmico
- ✅ **Streamable HTTP** transport

## 🏗️ Architecture Overview

```
┌─────────────────┐    JSON-RPC 2.0     ┌─────────────────┐
│   Claude.ai     │◄──────────────────►│  MCP Server     │
│   (MCP Host)    │  Streamable HTTP   │  (Neural API)   │
└─────────────────┘                    └─────────────────┘
                                              │
                                              ▼
                                       ┌─────────────────┐
                                       │   Supabase      │
                                       │   Database      │
                                       └─────────────────┘
```

## 📋 Implementation Plan

### Phase 1: Setup MCP Server Framework
- [ ] Install official MCP SDK for TypeScript
- [ ] Create proper MCP server structure  
- [ ] Implement JSON-RPC 2.0 transport
- [ ] Add OAuth 2.1 authorization

### Phase 2: Tool Implementation
- [ ] Convert REST endpoints to MCP tools
- [ ] Implement People CRUD tools
- [ ] Implement Projects CRUD tools  
- [ ] Implement Sprints/Tasks tools

### Phase 3: Resource & Prompts
- [ ] Add neural manifest resource
- [ ] Create context prompts for Marco's persona
- [ ] Implement dynamic tool discovery

### Phase 4: Testing & Integration
- [ ] Test with Claude Desktop
- [ ] Test with Claude.ai web
- [ ] Performance optimization
- [ ] Security validation

## 🛠️ Technical Specifications

### MCP Protocol Version
- **Target Spec:** `2025-03-26`
- **Transport:** Streamable HTTP (not SSE)
- **Auth:** OAuth 2.1 with Bearer tokens
- **Message Format:** JSON-RPC 2.0

### Required Endpoints
```
POST /api/mcp/server          # Main MCP server endpoint
GET  /api/mcp/manifest        # Server manifest/capabilities  
GET  /.well-known/mcp         # Server discovery
```

### Tools to Implement
1. **People Management**
   - `list_people` - List all people with filters
   - `get_person` - Get person details
   - `create_person` - Create new person
   - `update_person` - Update person info
   - `delete_person` - Delete person
   - `add_note` - Add note to person

2. **Project Management**  
   - `list_projects` - List all projects
   - `get_project` - Get project details
   - `create_project` - Create new project
   - `update_project` - Update project
   - `delete_project` - Delete project

3. **Sprint Management**
   - `list_sprints` - List sprints for project
   - `create_sprint` - Create new sprint
   - `update_sprint` - Update sprint
   - `delete_sprint` - Delete sprint

4. **Task Management**
   - `list_tasks` - List tasks for sprint
   - `create_task` - Create new task
   - `update_task` - Update task status
   - `delete_task` - Delete task

### Resources to Implement
1. **Neural Manifest** (`neural://manifest`)
   - User persona (Marco's context)
   - System statistics
   - Recent activity

2. **Context Data** (`neural://context/{type}`)
   - People relationships
   - Project status
   - Active sprints

### Prompts to Implement
1. **System Persona** - Marco's rebellious AI assistant setup
2. **Task Analysis** - Project/sprint analysis templates  
3. **Relationship Mapping** - People relationship insights

## 📦 Dependencies Required

```json
{
  "@modelcontextprotocol/sdk": "^0.5.0",
  "jsonwebtoken": "^9.0.0", 
  "jose": "^5.0.0",
  "zod": "^3.22.0"
}
```

## 🔐 Security Model

### OAuth 2.1 Flow
1. **Authorization Request** - Claude requests access
2. **User Consent** - Marco approves access  
3. **Token Exchange** - Issue Bearer token
4. **Tool Access** - Validate token per request

### Permission Scopes
- `neural:read` - Read people, projects, tasks
- `neural:write` - Create/update data
- `neural:delete` - Delete operations  
- `neural:admin` - Full system access

## 🎭 Marco's AI Persona Integration

The MCP server will include Marco's rebellious AI persona:

```typescript
const MARCO_PERSONA = {
  name: "Marco Fernandes", 
  role: "CEO/Fundador DietFlow",
  personality: "Rebelde intelectual com humor ácido",
  context: "TDAH + superdotação, alergia a rotinas sem propósito",
  voice: "Trinity no show do Nine Inch Nails: delineador + deboche"
};
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install @modelcontextprotocol/sdk jsonwebtoken jose zod
```

### 2. Create MCP Server
```bash
mkdir -p app/api/mcp-server
touch app/api/mcp-server/route.ts
```

### 3. Implement Basic Structure
```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamable.js';

const server = new McpServer({
  name: "neural-system",
  version: "1.0.0"
});

// Add tools, resources, prompts
// Start server with Streamable HTTP
```

### 4. Test with Claude Desktop
```json
// claude_desktop_config.json
{
  "mcpServers": {
    "neural-system": {
      "command": "node",
      "args": ["path/to/mcp-server.js"],
      "env": {
        "NEURAL_API_URL": "https://cognitiveoverflow.vercel.app"
      }
    }
  }
}
```

## 🎯 Success Criteria

- [ ] ✅ Claude Desktop recognizes server
- [ ] ✅ Tool discovery works correctly  
- [ ] ✅ CRUD operations via natural language
- [ ] ✅ OAuth flow completes successfully
- [ ] ✅ Performance under 200ms average
- [ ] ✅ Error handling robust
- [ ] ✅ Logging comprehensive

## 📚 References

- [MCP Specification 2025-03-26](https://modelcontextprotocol.io/specification/2025-03-26)
- [Official TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)  
- [OAuth 2.1 Draft](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1)
- [JSON-RPC 2.0 Spec](https://www.jsonrpc.org/specification)

## 💀 Death to Fake MCP!

**Chega de gambiarra!** Vamos implementar isso como os deuses da programação fazem - seguindo as specs, sem inventar moda, com arquitetura limpa e performance brutal! 🤘

---

**Status:** ✅ IMPLEMENTED & TESTED  
**Next:** Deploy e testar com Claude Desktop  

## 🚀 Current Status: FUNCIONAL!

### ✅ Implementação Completa
- **MCP Server:** `/api/mcp-server` - JSON-RPC 2.0 functional ✅
- **Discovery:** `/.well-known/mcp` - Server discovery working ✅  
- **Tools:** 16 tools implementadas (People, Projects, Sprints, Tasks) ✅
- **Resources:** Neural manifest + context data ✅
- **Prompts:** Marco's persona + analysis templates ✅

### 🧪 Testes Realizados
```bash
# Initialize
curl -X POST http://localhost:3000/api/mcp-server -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 1, "method": "initialize"}'
# Response: {"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2025-03-26"...}}

# List Tools  
curl -X POST http://localhost:3000/api/mcp-server -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 2, "method": "tools/list"}'
# Response: 16 tools listed successfully

# Execute Tool
curl -X POST http://localhost:3000/api/mcp-server -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "list_people", "arguments": {"limit": 3}}}'
# Response: {"jsonrpc":"2.0","id":3,"result":{"content":[{"type":"text","text":"Found 2 people..."}]}}

# Discovery
curl -X GET http://localhost:3000/.well-known/mcp
# Response: Server discovery information with capabilities
```

### 🎯 Frontend Integration
- **OverviewTab:** Updated to generate MCP Server URL ✅
- **URL Generation:** `window.location.origin/api/mcp-server` ✅
- **Copy to Clipboard:** Functional for Claude Desktop integration ✅ 