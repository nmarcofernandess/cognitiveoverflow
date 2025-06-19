# 📋 Tabela de Mapeamento Neural System - Frontend vs MCP

> **⚠️ Importante**: Esta é uma tabela de **organização visual** e **facilitação**. As estruturas são **arquiteturas diferentes** - Frontend usa query modules + React patterns, MCP usa tool wrappers + Zod schemas + text responses. **Não há unificação técnica**, apenas mapeamento para governança.

## 🏗️ **Diferenças Estruturais**:

| Aspecto | Frontend | MCP |
|---------|----------|-----|
| **Organização** | Modules (`detailQueries`, `overviewQueries`) | Tools inline no handler |
| **Retorno** | Dados nativos (`Person[]`, `Project[]`) | Wrapper MCP (`{content: [{type, text}]}`) |
| **Parâmetros** | Function args simples | Zod schema validation |
| **Error handling** | Try/catch + React state | Throw error (MCP wrapper) |
| **Response** | Rich TypeScript objects | Formatted text strings |

---

## 👥 **PEOPLE MANAGEMENT**

| Operação | Frontend | MCP Tool | Status | Observações |
|----------|----------|----------|---------|-------------|
| **Listar pessoas (overview)** | `overviewQueries.getPeopleSummary()` | `list_people` | 🔄 **DUPLICADO** | Frontend: name+relation only / MCP: filtering |
| **Listar pessoas (detalhado)** | `detailQueries.getPeopleList()` | `list_people` | 🔄 **DUPLICADO** | Frontend: inclui notes_count / MCP: texto formatado |
| **Obter pessoa específica** | ❌ | `get_person` | 🚫 **MCP Only** | Frontend usa state do list |
| **Criar pessoa** | Inline no componente | `create_person` | 🔄 **DUPLICADO** | Frontend: form + setState / MCP: zod validation |
| **Atualizar pessoa** | Inline no componente | `update_person` | 🔄 **DUPLICADO** | Frontend: form + setState / MCP: zod validation |
| **Deletar pessoa** | Inline no componente | `delete_person` | 🔄 **DUPLICADO** | Frontend: setState / MCP: confirmation text |
| **Adicionar nota pessoa** | Inline no componente | `add_note` | 🔄 **DUPLICADO** | Frontend: form handling / MCP: structured params |

---

## 📊 **PROJECT MANAGEMENT** 

| Operação | Frontend | MCP Tool | Status | Observações |
|----------|----------|----------|---------|-------------|
| **Listar projetos (overview)** | `overviewQueries.getProjectsSummary()` | `list_projects` | 🔄 **DUPLICADO** | Frontend: name+sprint_count / MCP: texto formatado |
| **Listar projetos (detalhado)** | `detailQueries.getProjectsList()` | `list_projects` | 🔄 **DUPLICADO** | Frontend: nested sprints+tasks / MCP: filters |
| **Obter projeto específico** | ❌ | `get_project` | 🚫 **MCP Only** | Frontend usa state do list |
| **Criar projeto** | Inline no componente | `create_project` | 🔄 **DUPLICADO** | Frontend: form + setState / MCP: zod validation |
| **Atualizar projeto** | Inline no componente | `update_project` | 🔄 **DUPLICADO** | Frontend: form + setState / MCP: optional fields |
| **Deletar projeto** | Inline no componente | `delete_project` | 🔄 **DUPLICADO** | Frontend: setState / MCP: confirmation text |

---

## 🏃‍♂️ **SPRINT MANAGEMENT**

| Operação | Frontend | MCP Tool | Status | Observações |
|----------|----------|----------|---------|-------------|
| **Listar sprints** | Inline nos projetos | `list_sprints` | 🔄 **DUPLICADO** | Frontend: nested query / MCP: project_id filter |
| **Obter sprint específico** | ❌ | `get_sprint` | 🚫 **MCP Only** | Frontend usa nested data |
| **Criar sprint** | Inline no componente | `create_sprint` | 🔄 **DUPLICADO** | Frontend: form + setState / MCP: zod validation |
| **Atualizar sprint** | Inline no componente | `update_sprint` | 🔄 **DUPLICADO** | Frontend: form + setState / MCP: optional fields |
| **Deletar sprint** | Inline no componente | `delete_sprint` | 🔄 **DUPLICADO** | Frontend: setState / MCP: confirmation text |
| **Adicionar nota sprint** | Inline no componente | `add_sprint_note` | 🔄 **DUPLICADO** | Frontend: form handling / MCP: structured params |
| **Listar notas sprint** | ❌ | `list_sprint_notes` | 🚫 **MCP Only** | Frontend carrega inline |
| **Deletar nota sprint** | Inline no componente | `delete_sprint_note` | 🔄 **DUPLICADO** | Frontend: setState / MCP: confirmation |

---

## ✅ **TASK MANAGEMENT**

| Operação | Frontend | MCP Tool | Status | Observações |
|----------|----------|----------|---------|-------------|
| **Listar tasks** | Inline nos sprints | `list_tasks` | 🔄 **DUPLICADO** | Frontend: nested query / MCP: sprint_id filter |
| **Obter task específica** | ❌ | `get_task` | 🚫 **MCP Only** | Frontend usa nested data |
| **Criar task** | Inline no componente | `create_task` | 🔄 **DUPLICADO** | Frontend: form + setState / MCP: zod + priority map |
| **Atualizar task** | Inline no componente | `update_task` | 🔄 **DUPLICADO** | Frontend: form + setState / MCP: priority conversion |
| **Deletar task** | Inline no componente | `delete_task` | 🔄 **DUPLICADO** | Frontend: setState / MCP: confirmation text |
| **Atualizar status task** | Inline no componente | `update_task_status` | 🔄 **DUPLICADO** | Frontend: dropdown + setState / MCP: enum validation |

---

## 🧠 **MEMORY SYSTEM**

| Operação | Frontend | MCP Tool | Status | Observações |
|----------|----------|----------|---------|-------------|
| **Listar memórias (overview)** | `overviewQueries.getMemorySummary()` | ❌ | 🚫 **Frontend Only** | Frontend: title+tags summary |
| **Buscar por tags** | `customQueries.getMemoryByTags()` | `search_by_tags` | 🔄 **DUPLICADO** | ✅ **RESOLVIDO** - MCP universal search |
| **Buscar conteúdo completo** | ❌ | `bulk_get` | 🚫 **MCP Only** | MCP: bulk fetch by IDs or all |
| **Busca universal (todas entidades)** | ❌ | `search_by_tags` | 🚫 **MCP Only** | MCP: memory+person_notes+sprint_notes |
| **Criar memória** | Inline no componente | `create_memory` | 🔄 **DUPLICADO** | Frontend: form + setState / MCP: zod validation |
| **Atualizar memória** | Inline no componente | `update_memory` | 🔄 **DUPLICADO** | Frontend: form + setState / MCP: optional fields |
| **Deletar memória** | Inline no componente | `delete_memory` | 🔄 **DUPLICADO** | Frontend: setState / MCP: confirmation text |

---

## ⚙️ **CUSTOM INSTRUCTIONS**

| Operação | Frontend | MCP Tool | Status | Observações |
|----------|----------|----------|---------|-------------|
| **Obter instruções** | `overviewQueries.getCustomInstructions()` | `get_custom_instructions` | 🔄 **DUPLICADO** | Frontend: join with people / MCP: raw data |
| **Atualizar instruções** | Inline no componente | `update_custom_instructions` | 🔄 **DUPLICADO** | Frontend: form + setState / MCP: validation |

---

## 📈 **SYSTEM OVERVIEW**

| Operação | Frontend | MCP Tool | Status | Observações |
|----------|----------|----------|---------|-------------|
| **Obter estatísticas** | `overviewQueries.getOverviewStats()` | ❌ | 🚫 **Frontend Only** | Counts de todas as tabelas |
| **Carregar manifest completo** | `loadManifest()` (multiple queries) | `get_manifest` | 🔄 **DUPLICADO** | Frontend: parallel calls / MCP: single tool |

---

## 🔧 **UTILITIES & HELPERS**

| Operação | Frontend | MCP Tool | Status | Observações |
|----------|----------|----------|---------|-------------|
| **Supabase client** | `createClient()` em lib/supabase | Dynamic import | 🔄 **DIFERENTES** | Frontend: static / MCP: dynamic |
| **Type definitions** | Interfaces TypeScript | Zod schemas | 🔄 **DIFERENTES** | Frontend: static types / MCP: runtime validation |
| **Error handling** | Try/catch + React state | Throw error (MCP wraps) | 🔄 **DIFERENTES** | Frontend: UI feedback / MCP: text response |

---

## 📊 **RESUMO GERAL**

| Categoria | Frontend Total | MCP Total | Duplicados | Frontend Only | MCP Only |
|-----------|----------------|-----------|------------|---------------|----------|
| **People** | 7 operações | 7 tools | 6 🔄 | 0 | 1 🚫 |
| **Projects** | 6 operações | 6 tools | 5 🔄 | 0 | 1 🚫 |
| **Sprints** | 6 operações | 8 tools | 6 🔄 | 0 | 2 🚫 |
| **Tasks** | 6 operações | 6 tools | 6 🔄 | 0 | 0 |
| **Memory** | 5 operações | 6 tools | 3 🔄 | 1 🚫 | 3 🚫 |
| **Custom Instructions** | 2 operações | 2 tools | 2 🔄 | 0 | 0 |
| **System** | 2 operações | 1 tool | 1 🔄 | 1 🚫 | 0 |
| **TOTAL** | **34 operações** | **36 tools** | **29 🔄** | **2 🚫** | **7 🚫** |

---

## 🎯 **GAPS CRÍTICOS IDENTIFICADOS**:

### 🚫 **MCP Missing** (Frontend tem, MCP não):
1. ~~**`getMemoryByTags()`** - Busca por tags no sistema de memória~~ ✅ **RESOLVIDO** com `search_by_tags`
2. **`getOverviewStats()`** - Estatísticas gerais do sistema

### 🚫 **Frontend Missing** (MCP tem, Frontend não):  
1. **`get_person`** - Obter pessoa específica (Frontend usa state do list)
2. **`get_project`** - Obter projeto específico (Frontend usa state do list)
3. **`get_sprint`** - Obter sprint específico (Frontend usa nested data)
4. **`list_sprint_notes`** - Listar notas de sprint (Frontend carrega inline)
5. **`search_by_tags`** - Busca universal em memory+person_notes+sprint_notes 🚀 **NOVA**
6. **`bulk_get`** - Busca conteúdo completo por IDs ou todos de um tipo 🚀 **NOVA**

---

## 📋 **CONVENÇÕES DE NOMENCLATURA**:

### Frontend (JavaScript/React):
- **Padrão**: `camelCase`
- **Hooks**: `use` prefix (`usePeople`, `useCreatePerson`)
- **Queries**: Organized in modules (`detailQueries`, `overviewQueries`)
- **Funções**: Descriptive (`getPeopleList`, `getProjectsSummary`)

### MCP (Model Context Protocol):
- **Padrão**: `snake_case`
- **Tools**: Action-oriented (`list_people`, `create_person`)
- **Parameters**: Zod schema validation
- **Responses**: Structured text content

---

## ✅ **CONCLUSÃO**:

**Esta tabela serve para**:
- 📋 **Documentação** das operações existentes
- 🔍 **Identificação** de gaps e duplicações  
- 🗺️ **Mapeamento** conceitual entre Frontend e MCP
- 📚 **Referência** para desenvolvedores
- 🎯 **Governança** e organização visual

**Esta tabela NÃO serve para**:
- ❌ Unificação técnica de código
- ❌ Eliminação de duplicações
- ❌ Abstração de implementação
- ❌ Single source of truth

**As arquiteturas permanecem independentes e diferentes por design.** 🏗️

---

## 📅 **Histórico de Atualizações**:

- **2024-01-20**: Criação inicial do mapeamento
- **2024-01-20**: Identificação de gaps críticos
- **2024-01-20**: Documentação das diferenças estruturais
- **2025-01-20**: Adição das tools universais `search_by_tags` e `bulk_get` 🚀

---

**Última atualização**: 20 de Janeiro de 2025  
**Responsável**: Marco Fernandes  
**Status**: Documentação ativa 