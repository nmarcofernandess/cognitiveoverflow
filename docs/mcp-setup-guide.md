# 🧠 Neural System MCP - Setup Guide Completo

## ✅ **DEPENDÊNCIAS INSTALADAS**

### MCP Core Dependencies
```bash
# SDK oficial MCP
@modelcontextprotocol/sdk@^1.12.3  ✅ INSTALADO

# Validação de schemas
zod@^3.25.67  ✅ INSTALADO

# Supabase para database
@supabase/supabase-js@^2.49.10  ✅ INSTALADO
```

### Arquivos de Configuração
```bash
✅ vercel.json - Otimizações Vercel para MCP
✅ .cursor/mcp.json - Configuração Cursor IDE
✅ app/api/mcp-server/route.ts - MCP Server produção (31 tools)
```

**NOTA**: Removemos `@vercel/mcp-adapter` porque a implementação manual JSON-RPC 2.0 está mais estável e confiável.

---

## 🚀 **ENDPOINT FUNCIONAL**

### Produção (Vercel)
- **Primary MCP**: `https://cognitiveoverflow.vercel.app/api/mcp-server`
- **Auth Token**: `?token=neural_access_2024`
- **Short URL**: `https://cognitiveoverflow.vercel.app/mcp`

### Local Development
- **Primary MCP**: `http://localhost:3000/api/mcp-server`

---

## 🔧 **CONFIGURAÇÃO CLAUDE.AI**

### Para Claude Desktop
```json
{
  "mcpServers": {
    "neural-system": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://cognitiveoverflow.vercel.app/api/mcp-server?token=neural_access_2024"
      ]
    }
  }
}
```

### Para Claude.ai Web
- **URL**: `https://cognitiveoverflow.vercel.app/api/mcp-server`
- **Auth**: Adicionar `?token=neural_access_2024` na URL

---

## 🛠️ **TOOLS DISPONÍVEIS (31 TOTAL)**

### People Management (6 tools)
- `list_people` - Lista pessoas com filtros
- `get_person` - Detalhes de pessoa específica
- `create_person` - Criar nova pessoa
- `update_person` - Atualizar pessoa
- `delete_person` - Deletar pessoa (exceto Marco)
- `add_note` - Adicionar nota à pessoa

### Project Management (12 tools)
- `list_projects` - Lista projetos
- `get_project` - Detalhes do projeto
- `create_project` - Criar projeto
- `update_project` - Atualizar projeto
- `delete_project` - Deletar projeto
- `list_sprints` - Lista sprints
- `create_sprint` - Criar sprint
- `get_sprint` - Detalhes do sprint
- `update_sprint` - Atualizar sprint
- `delete_sprint` - Deletar sprint
- `list_tasks` - Lista tasks
- `create_task` - Criar task

### Memory & Instructions (4 tools)
- `get_memory` - Buscar memórias
- `create_memory` - Criar memória
- `get_custom_instructions` - Config da IA
- `update_custom_instructions` - Atualizar config IA

### Task Management (9 tools)
- `get_task` - Detalhes da task
- `update_task` - Atualizar task
- `delete_task` - Deletar task
- `create_sprint_note` - Criar nota do sprint
- `update_sprint_note` - Atualizar nota
- `delete_sprint_note` - Deletar nota
- `update_note` - Atualizar nota pessoa
- `delete_note` - Deletar nota pessoa
- `update_memory` - Atualizar memória
- `delete_memory` - Deletar memória

---

## 🧪 **TESTES DE VALIDAÇÃO**

### Test 1: Tools List
```bash
curl -X POST "https://cognitiveoverflow.vercel.app/api/mcp-server?token=neural_access_2024" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}'
```

### Test 2: List People
```bash
curl -X POST "https://cognitiveoverflow.vercel.app/api/mcp-server?token=neural_access_2024" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "list_people", "arguments": {"limit": 5}}}'
```

### Test 3: Debug Info
```bash
curl "https://cognitiveoverflow.vercel.app/api/mcp-server?debug=tools&token=neural_access_2024"
```

---

## ⚡ **OTIMIZAÇÕES VERCEL**

### vercel.json Configurações
- **maxDuration**: 30s para processamento de queries complexas
- **memory**: 1024MB para handling de datasets grandes
- **CORS**: Headers configurados para integração cross-origin
- **Cache**: Disabled para dados dinâmicos
- **Rewrites**: URL amigável `/mcp` → `/api/mcp-server`

### Performance Benefits
- **Edge Network**: Latência reduzida globalmente
- **Auto-scaling**: Baseado em demanda
- **JSON-RPC 2.0**: Implementação pura e otimizada
- **Debug logging**: Para troubleshooting

---

## 🔐 **SEGURANÇA**

### Authentication
- **Token-based**: `neural_access_2024`
- **Multiple methods**: Query param ou Authorization header
- **Development bypass**: Sem auth em NODE_ENV=development
- **Marco protection**: Usuário principal não pode ser deletado

### Database Security
- **Supabase RLS**: Row Level Security habilitado
- **Validation**: Zod schemas para input validation
- **Error handling**: Logs detalhados sem exposição de dados sensíveis

---

## 📊 **MÉTRICAS ATUAIS**

- ✅ **31 tools** implementadas e funcionais
- ✅ **JSON-RPC 2.0** protocol compliant
- ✅ **Supabase integration** com 8 tabelas
- ✅ **Dual architecture** (HTTP REST + MCP JSON-RPC)
- ✅ **Production deployment** na Vercel
- ✅ **Debug logging** implementado
- ✅ **Single endpoint** limpo e manutenível

**Status**: 🟢 **PRODUCTION READY**

**Filosofia**: "Implementação manual > dependência experimental" 