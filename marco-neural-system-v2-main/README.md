# 🧠 Marco Neural System v2.0

**Sistema de gestão de conhecimento pessoal com interface moderna e integração Supabase**

## 🎯 **Visão Geral**

O Marco Neural System v2.0 é um dashboard completo para gerenciamento de:
- **👥 People**: Pessoas importantes com notas e relacionamentos
- **🚀 Projects & Sprints**: Gestão de projetos com sprints e tasks
- **📊 Overview**: Manifesto minimalista para contexto de IA

### **Status Atual: 100% Funcional**
- ✅ Vite + React + Supabase
- ✅ CRUD completo para todas entidades
- ✅ Interface responsiva com dark theme
- ✅ Edição inline e modais funcionais
- ✅ Sistema otimizado (bundle limpo)

---

## 🏗️ **Arquitetura**

```
Frontend (Vite + React)
├── App.jsx                 → Container principal
├── OverviewTab.jsx         → Manifesto + estatísticas  
├── PeopleTab.jsx          → CRUD pessoas + notas
├── ProjectsTab.jsx        → CRUD sprints + tasks
└── modals/                → Formulários de criação
     ├── AddPersonModal.jsx
     ├── NewProjectModal.jsx
     ├── NewSprintModal.jsx
     ├── AddTaskModal.jsx
     └── AddNoteModal.jsx

Database (Supabase)
├── people                 → Pessoas e relacionamentos
├── person_notes          → Notas de pessoas
├── projects              → Projetos
├── sprints               → Sprints dos projetos
├── tasks                 → Tasks dos sprints
└── sprint_notes          → Notas dos sprints
```

---

## 🚀 **Início Rápido**

### **1. Pré-requisitos**
- Node.js 18+
- Conta Supabase

### **2. Instalação**
```bash
git clone <repository>
cd marco-neural-system-v2
npm install
```

### **3. Configuração**
```bash
# Configure .env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key
```

### **4. Executar**
```bash
npm run dev
# Acesse: http://localhost:5173
```

---

## 🗄️ **Schema do Banco**

### **Tabelas Principais**

```sql
-- Pessoas
CREATE TABLE people (
  id UUID PRIMARY KEY,
  name VARCHAR UNIQUE NOT NULL,
  relation VARCHAR NOT NULL,  -- esposa, irmão, amigo, etc
  tldr TEXT,                  -- Contexto para IA
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Notas de pessoas
CREATE TABLE person_notes (
  id UUID PRIMARY KEY,
  person_id UUID REFERENCES people(id),
  title VARCHAR NOT NULL,
  content TEXT,
  tags TEXT[],
  created_at TIMESTAMP
);

-- Projetos
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  name VARCHAR UNIQUE NOT NULL,
  tldr TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Sprints dos projetos
CREATE TABLE sprints (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  name VARCHAR NOT NULL,
  tldr TEXT,
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Tasks dos sprints
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  sprint_id UUID REFERENCES sprints(id),
  title VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR DEFAULT 'pending',
  priority INTEGER DEFAULT 3,
  created_at TIMESTAMP
);

-- Notas dos sprints
CREATE TABLE sprint_notes (
  id UUID PRIMARY KEY,
  sprint_id UUID REFERENCES sprints(id),
  title VARCHAR NOT NULL,
  content TEXT,
  tags TEXT[],
  created_at TIMESTAMP
);
```

---

## 🎨 **Funcionalidades**

### **📊 Overview Tab**
- **Manifesto Minimalista**: Dados essenciais para contexto de IA
- **Estatísticas**: Contadores de pessoas, projetos, sprints
- **AI Behavior Config**: Configuração de persona e instruções

### **👥 People Tab**
- **Lista de Pessoas**: Nome, relação, TL;DR, contador de notas
- **Pessoa Detail**: Visualização completa com todas as notas
- **Edição Inline**: TL;DR e relação editáveis diretamente
- **Notas**: Sistema completo de notas com tags
- **CRUD Completo**: Criar, editar, deletar pessoas e notas

### **🚀 Projects Tab**
- **Lista Flat**: Todos os sprints de todos os projetos visíveis
- **Sprint Detail**: Tasks, notas, informações completas
- **Edição Inline**: Nome e TL;DR editáveis
- **Tasks**: Criação, edição de status, prioridades
- **Sprint Notes**: Sistema de notas específicas do sprint
- **CRUD Completo**: Projetos, sprints, tasks, notas

---

## 🎯 **Navegação**

### **Fluxo Principal**
```
Overview → Visão geral do sistema
People List → Person Detail
Projects List (Sprints Flat) → Sprint Detail
```

### **Padrões de Edição**
- **Inline**: TL;DR, relações, nomes (click no ícone edit)
- **Modais**: Criação de novas entidades
- **Toggle**: Status de tasks (click no ícone)
- **Forms**: Adição de notas e tasks inline

---

## 🔧 **Tecnologias**

- **Frontend**: Vite, React, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Icons**: Lucide React
- **State**: React useState/useEffect
- **Styling**: Tailwind + componentes customizados

---

## 📦 **Build e Deploy**

### **Build Local**
```bash
npm run build
npm run preview
```

### **Deploy Sugerido**
- **Frontend**: Vercel, Netlify
- **Backend**: Supabase (já cloud)

---

## 🔮 **Roadmap: Migração Next.js + MCP**

### **Próximos Passos**
1. **Migração para Next.js**: Estrutura com API routes
2. **MCP Integration**: Manifesto endpoint para Claude
3. **API RESTful**: Endpoints para todas as operações
4. **Real-time**: WebSockets para updates instantâneos

### **APIs Futuras (Next.js)**
```
/api/manifest     → Manifesto MCP para Claude
/api/people       → CRUD pessoas
/api/projects     → CRUD projetos  
/api/sprints      → CRUD sprints
/api/search       → Busca global
```

---

## 🤖 **Integração IA**

### **Manifesto Structure**
```json
{
  "user": {
    "name": "Marco Fernandes",
    "persona": "rebellious_accomplice"
  },
  "people": [
    { "name": "Yasmin", "relation": "esposa" }
  ],
  "projects": [
    { "name": "DietFlow", "sprint_count": 3 }
  ],
  "last_sync": "2025-01-27T..."
}
```

### **Contexto para IA**
- **Minimalista**: Apenas dados essenciais
- **Relacionamentos**: Contexto das pessoas importantes
- **Projetos**: Status e progresso atual
- **Persona**: Configuração de comportamento da IA

---

## 📁 **Estrutura de Arquivos**

```
marco-neural-system-v2/
├── src/
│   ├── App.jsx                    → Container principal (72 linhas)
│   ├── components/
│   │   ├── OverviewTab.jsx        → Manifesto (181 linhas)
│   │   ├── PeopleTab.jsx          → CRUD pessoas (585 linhas)
│   │   ├── ProjectsTab.jsx        → CRUD projetos (802 linhas)
│   │   ├── modals/                → Modais funcionais
│   │   └── ui/
│   │       ├── button.jsx         → Único UI component
│   │       └── utils.js           → Utilities (cn function)
│   └── lib/
│       └── supabase.js            → Client Supabase
├── .env                           → Variáveis ambiente
├── package.json                   → Dependencies
└── README.md                      → Esta documentação
```

**Total: ~1,700 linhas de código limpo e funcional**

---

## 💡 **Características Técnicas**

### **Performance**
- Bundle otimizado (375kb JS, 24kb CSS)
- Zero código morto
- UI components mínimos
- Queries Supabase eficientes

### **UX/UI**
- Dark theme moderno
- Navegação fluida
- Edição inline intuitiva
- Feedback visual consistente
- Mobile responsivo

### **Arquitetura**
- Componentes limpos e focados
- Estado local React
- Conexão direta Supabase
- Estrutura preparada para MCP

---

## 🎉 **Status do Projeto**

**✅ SISTEMA 100% FUNCIONAL**

- Interface completa e polida
- CRUD funcionando em todas entidades
- Performance otimizada
- Código limpo e manutenível
- Preparado para migração Next.js

**🚀 Pronto para produção e evolução!**

---

## 📞 **Contato**

Marco Fernandes - Criador rebelde deste sistema neural 🧠⚡ 