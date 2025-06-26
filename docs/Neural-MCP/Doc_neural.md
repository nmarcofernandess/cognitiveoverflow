# 🧠 Marco Neural System v2.1 - Arquitetura & Stack Real

## 🎯 **O QUE ESTOU TENTANDO FAZER**

Criei um **Neural System** (sistema de conhecimento pessoal) que funciona com:
- ✅ **Frontend web** (Next.js) para gerenciar dados via interface
- ✅ **Claude.ai via MCP** para IA consultar/modificar dados via API
- ✅ **@vercel/mcp-adapter** unificando protocolos no mesmo repo

**OBJETIVO ATINGIDO**: Claude.ai lê/escreve no Supabase através do mesmo handler que serve o frontend, com protocolos diferentes mas queries idênticas.

**RESULTADO ATUAL**:
```
Marco (Frontend) ────┐
                     ├──► Next.js API (Unified Handler) ──► Supabase
Claude (MCP) ────────┘         @vercel/mcp-adapter
                              
(mesmo database, mesmo código, protocolos diferentes)
```

**Stack Final**: Next.js 15 + @vercel/mcp-adapter + Supabase + Vercel Deploy

## 🏠 **CONTEXTO DO PROJETO**

O **Cognitive Overflow** é um hub experimental modular (Next.js) que abriga múltiplos projetos:
- Marco's Personality Trip, Matrix Project, TokenFlow, Comic Builder
- **Neural System** é UM dos projetos (o mais complexo arquiteturalmente)
- URL: `https://cognitiveoverflow.vercel.app/neural`

## 📁 **STACK & ARQUIVOS PRINCIPAIS**

### Stack Tecnológica
- **Next.js 15** (App Router + Turbopack)
- **@vercel/mcp-adapter** (unifica HTTP REST + MCP JSON-RPC 2.0)
- **Supabase** (PostgreSQL + Row Level Security)
- **Vercel Serverless** (deploy automático)
- **TypeScript** (type safety em tudo)

### Frontend
- `app/neural/page.tsx` - Dashboard principal
- `app/neural/layout.tsx` - Matrix Auth wrapper  
- `components/neural/*` - React tabs (Overview, People, Projects, CustomInstructions)
- `lib/supabase.ts` - Supabase client + queries

### Backend Unificado
- `app/api/[transport]/route.ts` - **Handler único** (HTTP + MCP via adapter)
- `types/index.ts` - Interfaces TypeScript compartilhadas

### Environment
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://dtijantzpqtevdqypaeg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
MCP_SECRET_KEY=neural_matrix_jwt_secret_trinity_delineador_2024_hardcore
MCP_MASTER_PASSWORD=neural_access_2024
```

### Desenvolvimento Local
```bash
npm run dev        # Next.js dev server (port 3000/3001)
npm run mcp        # MCP Inspector (testa tools via web)
```

---

## 🎯 **RESUMO DO SISTEMA EM 5 PONTOS**

1. **📊 Overview** que traz estatísticas e navegação: pessoas (count, samples), projetos (count, sprints, tasks), custom instructions (usuário principal + comportamento IA + memória), e links para seções.

2. **👥 Pessoas** com relação, tl;dr e notas pessoais. Marco é usuário principal protegido. Suporte a search por nome/relação.

3. **📁 Projetos** com sprints, tasks e **project notes diretas**. "Conhecimento Geral" é projeto padrão protegido. Navegação: Project → Sprint → Tasks/Notes.

4. **🎭 Custom Instructions** gerencia usuário principal (Marco), comportamento da IA, sistema de memória unificado (title + content + tags), e instruções de uso do MCP.

5. **🔍 Search & Bulk Operations** para busca por tags, nomes, conteúdo, e operações em lote para carregar dados relacionados sem múltiplas queries.

---

## 🗄️ **BANCO DE DADOS & ESTRUTURA v2.1**

```mermaid
erDiagram
    people {
        UUID id PK
        VARCHAR name
        VARCHAR relation
        TEXT tldr
        BOOLEAN is_primary_user
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    
    person_notes {
        UUID id PK
        UUID person_id FK
        VARCHAR title
        TEXT content
        TEXT[] tags
        TIMESTAMP created_at
    }
    
    projects {
        UUID id PK
        VARCHAR name
        TEXT tldr
        BOOLEAN is_default_project
        BOOLEAN is_protected
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    
    project_notes {
        UUID id PK
        UUID project_id FK
        VARCHAR title
        TEXT content
        TEXT[] tags
        TIMESTAMP created_at
    }
    
    sprints {
        UUID id PK
        UUID project_id FK
        VARCHAR name
        TEXT tldr
        VARCHAR status
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    
    tasks {
        UUID id PK
        UUID sprint_id FK
        VARCHAR title
        TEXT description
        VARCHAR status
        INTEGER priority
        TIMESTAMP created_at
        TIMESTAMP completed_at
    }
    
    sprint_notes {
        UUID id PK
        UUID sprint_id FK
        VARCHAR title
        TEXT content
        TEXT[] tags
        TIMESTAMP created_at
    }
    
    custom_instructions {
        UUID id PK
        UUID user_id FK
        TEXT behavior_description
        TEXT mcp_context_instructions
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    
    memory {
        UUID id PK
        VARCHAR title
        TEXT content
        TEXT[] tags
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    people ||--o{ person_notes : "has"
    people ||--|| custom_instructions : "configures"
    projects ||--o{ project_notes : "direct notes"
    projects ||--o{ sprints : "contains"
    sprints ||--o{ tasks : "has"
    sprints ||--o{ sprint_notes : "has"
```

### **Key Updates v2.1:**
- ✅ **`project_notes`** table para notas diretas nos projetos (sem necessidade de sprint)
- ✅ **ID-only model** - sistema migrado para usar apenas IDs, slugs removidos por segurança
- ✅ **`is_protected`** flag em projects ("Conhecimento Geral" não pode ser deletado)
- ✅ **Queries robustas** com error handling aprimorado e modelo ID-only
- ✅ **Cascade deletes** configurados (deletar projeto → remove sprints → remove tasks/notes)

**Memory System**: Memórias permanecem unificadas numa tabela. Search por tags, bulk get por IDs, navegação contextual via UI.


---
```plantuml
@startuml
!theme plain

skinparam defaultFontName "Inter, Helvetica, Arial, sans-serif"
skinparam shadowing false
skinparam package {
    borderColor #333
    backgroundColor #FFF
}
skinparam rectangle {
    borderColor #666
    backgroundColor #FAFAFA
}
skinparam note {
    backgroundColor #FFFFF0
    borderColor #888
}

title <b>Neural System - Estrutura Lógica</b>

package "OVERVIEW" {
    rectangle "O que dá para fazer" as R_Overview_Actions
    note right of R_Overview_Actions
        - Navegar para seções
        - Ver stats
        - Visualizar config da IA
    end note

    rectangle "Pessoas" as R_Overview_People
    note right of R_Overview_People
        Nome, Relação, Nº Total
    end note

    rectangle "Projetos" as R_Overview_Projects
    note right of R_Overview_Projects
        Nome, Nº Sprints, Nº Tasks Totais
    end note
    
    rectangle "Custom Instructions" as R_Overview_Custom
    note right of R_Overview_Custom
        <b>User Principal:</b> Nome + TL;DR
        <b>Comportamento IA:</b> Instrução de persona
        <b>Context:</b> Instrução de uso do sistema MCP
    end note

    rectangle "Memórias" as R_Overview_Memory
    note right of R_Overview_Memory
        Nome da Memória, Tag, Data
    end note
}

package "PEOPLE" {
    package "Tela: Lista de Pessoas" {
        rectangle "O que aparece" as R_PeopleList_Body
        note right of R_PeopleList_Body
            - Nome, Relação, TL;DR, Nº de notas
            - Marco como user principal (não deletável)
        end note
        
        rectangle "O que dá para fazer" as R_PeopleList_Actions
        note right of R_PeopleList_Actions
            - Criar/Deletar pessoa
            - Clicar para ver detalhes
        end note
    }
    
    R_PeopleList_Body -[hidden]down-> R_PeopleList_Actions
    
    package "Tela: Detalhe da Pessoa" {
        rectangle "O que aparece" as R_PersonDetail_Body
        note right of R_PersonDetail_Body
            - Relação, TL;DR
            - Notas completas da pessoa
        end note
        
        rectangle "O que dá para fazer" as R_PersonDetail_Actions
        note right of R_PersonDetail_Actions
            - Editar infos
            - Deletar pessoa
            - Adicionar/Editar/Deletar notas
        end note
    }
    
    R_PersonDetail_Body -[hidden]down-> R_PersonDetail_Actions
    
    R_PeopleList_Actions ..> R_PersonDetail_Body : "Clica em uma pessoa"
}

package "PROJECTS" {
    package "Tela: Lista de Projetos" {
        rectangle "O que aparece" as R_ProjectList_Body
        note right of R_ProjectList_Body
            - Nome do projeto, TL;DR, nº de sprints/tasks
            - **Nº de project notes diretas**
            - Sprints com nº de tasks
            - "Conhecimento Geral" como projeto protegido
        end note
        
        rectangle "O que dá para fazer" as R_ProjectList_Actions
        note right of R_ProjectList_Actions
            - Criar/Deletar projeto
            - Criar sprint
            - **Criar project notes diretas**
            - Clicar para ver detalhes
        end note
    }
    
    R_ProjectList_Body -[hidden]down- R_ProjectList_Actions

    package "Tela: Detalhe do Projeto" {
        rectangle "O que aparece" as R_ProjectDetail_Body
        note right of R_ProjectDetail_Body
            - Nome/TL;DR do projeto
            - **Seção de Project Notes** (title, content, tags)
            - Lista de sprints (nome, tl;dr, nº tasks/notas)
        end note
        
        rectangle "O que dá para fazer" as R_ProjectDetail_Actions
        note right of R_ProjectDetail_Actions
            - Editar/Deletar projeto
            - **CRUD Project Notes** (create, edit, delete)
            - Criar/Deletar sprint
            - Clicar para ver detalhes de sprint
        end note
    }
    
    R_ProjectDetail_Body -[hidden]down- R_ProjectDetail_Actions
    
    package "Tela: Detalhe do Sprint" {
        rectangle "O que aparece" as R_SprintDetail_Body
        note right of R_SprintDetail_Body
            - Nome/TL;DR do sprint
            - Todas as tasks (título, status, desc)
            - Todas as notas do sprint
        end note
        
        rectangle "O que dá para fazer" as R_SprintDetail_Actions
        note right of R_SprintDetail_Actions
            - Editar sprint
            - CRUD de tasks, CRUD de notas
            - Filtrar tasks por status
        end note
    }
    
    R_SprintDetail_Body -[hidden]down- R_SprintDetail_Actions
    
    R_ProjectList_Actions ..> R_ProjectDetail_Body : "Clica em um projeto"
    R_ProjectDetail_Actions ..> R_SprintDetail_Body : "Clica em um sprint"
}

package "CUSTOM INSTRUCTIONS" {
    package "Tela de Gerenciamento" {
        rectangle "O que aparece" as R_CI_Body
        note right of R_CI_Body
            - <b>User principal:</b> Link para a pessoa
            - <b>Comportamento da IA:</b> Descrição editável
            - <b>Lista de memórias:</b> Título e tags de todas
            - <b>Instruções MCP:</b> Como a IA deve usar o sistema
        end note
        
        rectangle "O que dá para fazer" as R_CI_Actions
        note right of R_CI_Actions
            - Editar comportamento da IA
            - Criar/editar/deletar memórias
            - Organizar memórias por tags
            - Editar instruções de uso do MCP
            - Gerenciar sistema de memória unificado
        end note
    }
    R_CI_Body -[hidden]down- R_CI_Actions
}

@enduml
```

---

## 📋 **MANIFEST v2.0 - CONTENT INDEX**

O `get_manifest()` retorna metadata completa do sistema para orientar Claude sobre navegação e uso:

```json
{
  "version": "2.1",
  "user": "Marco Fernandes",
  "description": "Personal Neural System - Knowledge & Project Management",
  "database_url": "https://dtijantzpqtevdqypaeg.supabase.co",
  "stats": {
    "people_count": 8,
    "projects_count": 4,
    "sprints_count": 12,
    "tasks_count": 47,
    "memory_count": 23
  },
  "content_index": {
    "people_summary": "Marco (primary user), Yasmin (esposa), José (pai), Rita (mãe), Bruno (irmão)...",
    "projects_summary": "Conhecimento Geral (default), DietFlow (SaaS nutrition), Neural System (MCP)...",
    "recent_activity": "Last updates: DietFlow MVP tasks, Neural System docs, family notes...",
    "memory_tags": ["ai", "saude", "familia", "tech", "projetos", "ideias", "insights"]
  },
  "navigation_hints": {
    "for_people": "Use person names directly: 'get Marco details' → get_person(name:'Marco')",
    "for_projects": "Use project names: 'add note to DietFlow' → create_project_note(project_name:'DietFlow')",
    "for_memory": "Search by tags: 'memories about AI' → search_by_tags(include:['ai'])",
    "bulk_operations": "Load related data: bulk_get([id1,id2], 'projects') for efficiency"
  },
  "protected_entities": {
    "people": ["Marco (primary user)"],
    "projects": ["Conhecimento Geral (default)"]
  }
}
```

### **Content Index Purpose**
- **Orientação inicial**: Claude vê o que existe sem fazer queries desnecessárias
- **Hints de navegação**: Como usar nomes vs IDs, padrões recomendados
- **Proteções**: Entidades que não podem ser deletadas
- **Tags populares**: Para guiar searches eficientes

---

## 🔄 **HANDLER UNIFICADO - Protocolos Diferentes, Lógica Única**

O sistema usa **1 handler** (`app/api/[transport]/route.ts`) que atende tanto Frontend quanto MCP via `@vercel/mcp-adapter`:

### **Frontend Request (HTTP POST)**
```typescript
// Client-side call via fetch
const response = await fetch('/api/http', {
  method: 'POST',
  body: JSON.stringify({
    tool: 'list_people',
    arguments: { relation: 'família', limit: 10 }
  })
});
const data = await response.json();
// Returns: { success: true, data: [...] }
```

### **MCP Request (JSON-RPC 2.0)**
```json
{
  "jsonrpc": "2.0",
  "id": "req-1",
  "method": "tools/call",
  "params": {
    "name": "list_people", 
    "arguments": { "relation": "família", "limit": 10 }
  }
}
```

### **MCP Response (Formatted for AI)**
```json
{
  "jsonrpc": "2.0",
  "id": "req-1", 
  "result": {
    "content": [{
      "type": "text",
      "text": "✅ Found 3 people in família:\n• Yasmin (esposa) - 2 notes\n• José (pai) - 5 notes\n• Rita (mãe) - 3 notes"
    }]
  }
}
```

### **Unified Logic Flow**
```typescript
// Same handler function for both protocols
async function handleListPeople(args: { relation?, limit? }) {
  // Same Supabase query for both
  const { data, error } = await supabase
    .from('people')
    .select('*, person_notes(count)')
    .eq('relation', args.relation)
    .limit(args.limit || 50);

  // Protocol-specific response formatting
  if (isMCPRequest) {
    return formatForAI(data); // "✅ Found X people..."
  } else {
    return { success: true, data }; // Raw JSON for UI
  }
}
```

**Key Insight**: 
- **Mesma lógica**, formatos diferentes
- **MCP** = texto formatado para IA consumption
- **Frontend** = JSON bruto para UI manipulation
- **Database queries** = 100% idênticas

---

## 🛠️ **FERRAMENTAS DISPONÍVEIS (10 UNIVERSAL TOOLS)**

### 🧠 Core System (1 tool)
- `get_manifest()` - **[readOnly]** Sistema overview completo com todas as entidades, IDs, counts e metadata

### 🔧 Universal CRUD (4 tools)
- `get(entity_type, id)` - **[readOnly]** Buscar qualquer entidade por tipo e ID
- `create(entity_type, data)` - **[idempotent]** Criar pessoa, projeto, sprint, task, memory ou note
- `update(entity_type, id, data)` - **[idempotent]** Atualizar qualquer entidade por ID
- `delete(entity_type, id)` - **[destructive]** Deletar qualquer entidade (respeitando proteções)

### 📊 Advanced Queries (3 tools)
- `search(entity_type, filters?)` - **[readOnly]** Busca avançada com filtros específicos por tipo
- `list_tasks(filters?)` - **[readOnly]** Lista tasks com filtros por projeto, sprint, status
- `get_related_entities(from_type, from_id, to_type)` - **[readOnly]** Navegação hierárquica (projeto→sprints, sprint→tasks/parent, any→notes)

### 🎯 Shortcuts & Config (2 tools)
- `create_knowledge_note(title, content, tags?)` - **[idempotent]** Shortcut para criar nota no projeto "Conhecimento Geral"
- `update_instructions(behavior?, mcp_context?)` - **[idempotent]** Atualizar persona da IA e instruções MCP

### **Entity Types Suportados:**
- `person`, `project`, `sprint`, `task`, `memory`, `note`
- **Proteções**: Marco (pessoa principal), Conhecimento Geral (projeto padrão)
- **Cascade**: Deletar projeto → remove sprints → remove tasks/notes

---

### **Padrões ID-Only (Segurança Máxima)**
```typescript
// 1. Get manifest primeiro para descobrir IDs
get_manifest()

// 2. Usar IDs diretos para todas as operações
create({ entity_type: "sprint", data: { name: "MVP Launch", project_id: "uuid-123", tldr: "..." }})

// 3. Get entities específicas por ID
get({ entity_type: "project", id: "uuid-123-456" })

// Erro típico: 404 não encontrado, 409 constraint violation
```

### **Convenções de Resposta**
- ✅ **Sucesso**: `"✅ [Action] completed: [details]"`
- ❌ **Erro**: `"❌ [Error type]: [details]"`  
- ⚠️ **Warning**: `"⚠️ [Action] completed with warnings: [details]"`
- 📄 **JSON**: `{ type:"json", data:{...} }` para payloads > 1k chars

---

## 💡 **EXEMPLOS DE USO - Name-First Approach**

### **Fluxo Típico de Conversa com Claude**

```
🤖 Claude: "Preciso criar uma nota sobre Machine Learning no projeto DietFlow"

// 1. First get manifest to find DietFlow project ID
👤 Marco: get_manifest()
// Returns: { projects: [{ id: "proj-123", name: "DietFlow", ... }] }

// 2. Create note using ID
👤 Marco: create({
  entity_type: "note",
  data: {
    parent_type: "project",
    parent_id: "proj-123",
    title: "ML para Recomendações",
    content: "Usar TensorFlow para sugestões personalizadas...",
    tags: ["ml", "tech", "mvp"]
  }
})

✅ Response: "Created note: ML para Recomendações"
```

### **Advanced Search & Navigation**

```javascript
// 1. Search memories by filters
search({ entity_type: "memory", filters: { tags: ["ai", "tech"] }})
// Returns: matching memories with full content

// 2. Navigate hierarchically
get_related_entities({ from_type: "project", from_id: "proj-123", to_type: "sprints" })
// Returns: all sprints for the project

// 3. List filtered tasks
list_tasks({ project_ids: ["proj-123"], status: "in_progress" })
// Returns: active tasks for specific project
```

### **Error Handling Examples**

```
❌ get({ entity_type: "person", id: "invalid-id" })
→ "❌ person not found: No person with ID invalid-id"

❌ create({ entity_type: "project", data: { name: "DietFlow" }})
→ "❌ Error creating project: duplicate key value violates unique constraint"

⚠️ delete({ entity_type: "project", id: "conhecimento-geral-id" })
→ "⚠️ Cannot delete protected project: Conhecimento Geral"
```

### **ID-Only Safety in Action**

```typescript
// Step 1: Always get manifest first
get_manifest()
// Discover all available IDs and entity relationships

// Step 2: Use exact IDs for operations
get({ entity_type: "project", id: "proj-uuid-123" })
// No ambiguity, no fallbacks needed

// Step 3: Navigate relationships via IDs
get_related_entities({ from_type: "project", from_id: "proj-uuid-123", to_type: "sprints" })
// Clear hierarchical navigation
```

---

## 🏗️ **ROADMAP & IMPLEMENTAÇÕES v2.1**

### ✅ **Implemented (Current)**
- [x] Handler unificado (Frontend + MCP no mesmo repo)
- [x] 10 Universal MCP tools com ID-only model
- [x] Project notes diretas (sem necessidade de sprint)
- [x] Proteção de entidades ("Marco", "Conhecimento Geral")
- [x] Manifest v2.0 com content_index completo
- [x] Advanced search + hierarchical navigation
- [x] Cascade deletes (project→sprints→tasks/notes)
- [x] Error handling padronizado (✅❌⚠️)
- [x] ID-only model - sistema 100% seguro sem slugs

### 🔄 **In Progress**
- [ ] Real-time sync entre Frontend e MCP calls
- [ ] Advanced search (full-text, date ranges)

### 🗺️ **Backlog**
- [ ] Export/Import sistema completo (JSON/Markdown)
- [ ] Webhook integrations (GitHub, Notion)
- [ ] Multi-user support (team neural systems)
- [ ] AI-powered auto-tagging
- [ ] Graph visualization de relacionamentos

---

## 🎯 **GETTING STARTED - Quick Commands**

```bash
# 1. Ver overview completo do sistema (SEMPRE PRIMEIRO)
get_manifest()

# 2. Buscar projetos com filtros
search({ entity_type: "project", filters: { limit: 10 }})

# 3. Adicionar nota rápida no Knowledge
create_knowledge_note({
  title: "Insight sobre Neural Systems",
  content: "MCP + Vercel = poder sem limites",
  tags: ["insight", "tech"]
})

# 4. Buscar memórias técnicas
search({ entity_type: "memory", filters: { tags: ["tech"] }})

# 5. Ver detalhes de entidade específica (use ID do manifest)
get({ entity_type: "person", id: "marco-uuid-from-manifest" })

# 6. Navegar hierarquicamente
get_related_entities({ from_type: "project", from_id: "proj-id", to_type: "sprints" })
```

**Happy Neural System Navigation! 🧠⚡**

---

## 📡 **Teste com SDK - Por que não usamos**

### **Situação Atual**
Atualmente usamos **HTTP/Vercel** que funciona tanto online quanto em produção com `npm run dev`. O problema é que se o `npm run dev` não estiver rodando, o Claude Desktop dá mensagem de erro.

### **Teste com SDK**
Para evitar essa mensagem de erro quando não estivermos testando, experimentamos o **SDK** que starta sozinho, mas **não foi uma boa ideia** porque:

- ✅ **SDK starta independente** (sem precisar do npm run dev)
- ❌ **Estrutura diferente** - precisaríamos replicar todas as tools em 2 formatos
- ❌ **Duplicação de código** - manter HTTP + STDIO seria trabalhoso
- ❌ **Complexidade desnecessária** - para nossa situação atual

### **Por Curiosidade: Como Seria o SDK**

Se algum dia quisermos implementar SDK, aqui está o que precisaríamos:

#### **1. Criar `lib/supabase.js` (não .ts)**
O SDK precisa de arquivo `.js` puro com validação de env vars e createClient do Supabase.

#### **2. Claude Desktop Configuration**
Configurar dois servidores:
- `neural-system-local` → HTTP via npx mcp-remote (atual)
- `neural-stdio-test` → SDK via Node.js direto com --env-file
Exemplo: 
```json
"neural-stdio-test": {
      "command": "/opt/homebrew/bin/node",
      "args": [
        "--env-file=/Users/marcofernandes/cognitiveoverflow/.env.local",
        "/Users/marcofernandes/cognitiveoverflow/test-stdio-server.mjs"
      ]
    }
```

#### **3. Arquivo SDK Server (.mjs)**
Criar servidor com:
- `Server` from `@modelcontextprotocol/sdk/server`
- `StdioServerTransport` para comunicação
- `ListToolsRequestSchema` e `CallToolRequestSchema` handlers
- Importar `supabase.js` e replicar lógica das tools
- Estrutura completamente diferente do Vercel adapter

### **Conclusão**
Mantemos o **HTTP/Vercel** atual porque:
- ✅ Código unificado (Frontend + MCP no mesmo handler)
- ✅ TypeScript nativo
- ✅ Deploy automático na Vercel
- ✅ Sem duplicação de tools

O **SDK** funciona, mas criaria complexidade desnecessária. Para desenvolvimento, basta rodar `npm run dev` quando quisermos testar no Claude Desktop.

---
