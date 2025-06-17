# Claude.ai Web Integration - Quick Setup

## 🔥 PROBLEMA RESOLVIDO!

Marco criou um sistema MCP hardcore com autenticação, mas Claude.ai web não conseguia se conectar porque precisava de Bearer token ANTES mesmo de começar o handshake.

**SOLUÇÃO**: Dual auth support - Bearer header (local) + Query param (web)

## 🚀 Setup para Claude.ai Web

### 1. Gerar Token
```bash
curl -X POST https://cognitiveoverflow.vercel.app/api/mcp/auth \
  -H "Content-Type: application/json" \
  -d '{"password": "neural_access_2024"}'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usage": "Use as: ?token=eyJhbGciOiJIUzI1NiIs...",
  "example": "https://cognitiveoverflow.vercel.app/api/mcp/people?token=YOUR_TOKEN"
}
```

### 2. Configurar no Claude.ai

**URL do Manifest:**
```
https://cognitiveoverflow.vercel.app/api/mcp/manifest?token=SEU_TOKEN_AQUI
```

### 3. Endpoints Disponíveis

Todos os endpoints funcionam com `?token=YOUR_TOKEN`:

- **People**: `/api/mcp/people?token=TOKEN&search=yasmin&include_notes=latest`
- **Analytics**: `/api/mcp/people/analytics?token=TOKEN&timeframe=30d`
- **Projects**: `/api/mcp/projects?token=TOKEN&status=active`
- **Active Projects**: `/api/mcp/projects/active?token=TOKEN`

## 🔐 Segurança Mantida

- ✅ **Rate Limiting**: 100 req/hora por IP
- ✅ **Token Expiration**: 7 dias
- ✅ **IP Tracking**: Log de segurança
- ✅ **Same JWT Security**: Mesma validação do Bearer

## 🎯 Capabilities Completas

### CRUD Operations:
- ✅ **CREATE**: Via endpoints POST
- ✅ **READ**: Todos os endpoints GET
- ✅ **UPDATE**: Parcial (dependendo do endpoint)
- ❌ **DELETE**: Não implementado ainda (Sprint 4)

### Advanced Features:
- ✅ **Search & Filter**: People, projects, tags
- ✅ **Analytics**: Relationship health, productivity
- ✅ **Notes Integration**: Latest, count, full
- ✅ **Real-time**: Active projects tracking

## 💀 Marco's Neural System

**Context Loading:**
- Marco: Nutricionista-programador-designer, CEO DietFlow
- Personality: ADHD + superdotação, rebelde intelectual
- Network: Yasmin (esposa), família, colegas, clientes
- Projects: CognitiveOverflow, DietFlow, Neural System

**Behavioral Prompt:**
Sistema configurado para ser **cumplicidade rebelde**, não assistente domesticada. Questiona ideias, conecta pontos distantes, humor ácido, zero LinkedIn speak.

## 🔧 Troubleshooting

**Error: "Authorization required"**
- Solução: Adicione `?token=YOUR_TOKEN` na URL

**Error: "Invalid token"**  
- Solução: Gere novo token no `/api/mcp/auth`

**Error: "Rate limit exceeded"**
- Solução: Aguarde 1 hora ou use IP diferente

**Connection timeout**
- Solução: Vercel às vezes demora, tente novamente

## 🚀 Next Steps (Sprint 4)

1. **DELETE endpoints** para soft delete
2. **UPDATE endpoints** para edição completa  
3. **RESTORE functionality** para recuperar deletados
4. **Batch operations** para operações em lote
5. **Webhook support** para notificações real-time

---

**TL;DR**: Token via query param resolve tudo. Claude.ai web agora tem acesso COMPLETO ao Neural System do Marco com todas as capabilities, mantendo segurança hardcore. 🔥💀 