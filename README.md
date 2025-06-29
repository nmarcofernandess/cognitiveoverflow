# 🧠 COGNITIVE OVERFLOW

> **Hub experimental onde mente, código e criatividade se encontram.**

Um projeto Next.js modular que abriga múltiplos experimentos criativos, análises de personalidade e simulações interativas.

## 🔐 Sistema Matrix Auth

O Cognitive Overflow possui um sistema de autenticação Matrix unificado que protege projetos sensíveis:

- **🔵 Blue Pill (Public)**: Acesso livre e imediato
- **🔴 Red Pill (Protected)**: Requer Matrix Auth com senha `redpill`
- **🎯 One Login, All Access**: Uma autenticação libera todos os projetos protegidos por 7 dias
- **🎨 Custom Auth Screens**: Títulos e mensagens personalizadas por projeto

### Dashboard Organizado
```
🌍 PUBLIC PROJECTS          🔐 MATRIX PROTECTED
- Marco's Personality Trip    - The Matrix 
- TokenFlow                   - Recursos Vault
- Comic Builder               - Future Protected Projects...
- Apatia Landing
```

## 🚀 Projetos Ativos

### 🧠 Marco's Personality Trip (`/marco`)
Análise multidimensional da personalidade com:
- Sistema de tipologia (Eneagrama, MBTI, Temperamentos)
- Modo RAVE interativo com efeitos visuais psicodélicos
- Interface reativa com animações dinâmicas

### 💊 Matrix Project (`/matrix`)
Simulação cyberpunk inspirada na Matrix com:
- Sistema de pílulas (Red Pill vs Blue Pill)
- Análise de relacionamentos sem filtros
- Interface terminal estilo hacker

### 🧠 TokenFlow (`/tokenflow`)
Motor de análise avançada para conversas de IA com:
- Importação de conversas ChatGPT e Claude
- Sistema de filtros e busca inteligente
- Exportação em múltiplos formatos
- Interface moderna com gerenciamento de favoritos

### 📚 Comic Builder (`/comic-builder`)
Ferramenta para criação de histórias em quadrinhos com:
- Sistema de personagens com fases evolutivas
- Organização de cenas em painéis estruturados
- Geração de prompts para IA visual
- Interface drag-and-drop para organização

## 🛠 Tecnologias

- **Framework**: Next.js 15.3.1 (App Router)
- **UI**: HeroUI + Tailwind CSS
- **State Management**: Zustand (TokenFlow)
- **Drag & Drop**: DnD Kit (Comic Builder)
- **Animações**: Framer Motion
- **Ícones**: Iconify React + Tabler Icons + Lucide React
- **File Processing**: JSZip, React Dropzone
- **Virtualization**: TanStack Virtual
- **Tipagem**: TypeScript
- **Deploy**: Vercel (preparado)

## 📁 Estrutura do Projeto

```
cognitiveoverflow/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Dashboard principal
│   ├── marco/page.tsx           # Marco's Personality Trip
│   ├── matrix/page.tsx          # Matrix Project
│   └── layout.tsx               # Layout global
├── components/                   # Componentes organizados por projeto
│   ├── analysis/                # Componentes do projeto Marco
│   │   └── PersonalityTrip.tsx
│   ├── matrix/                  # Componentes do projeto Matrix
│   │   ├── MatrixRain.tsx
│   │   ├── Terminal.tsx
│   │   ├── BluePill.tsx
│   │   ├── LandingPage.tsx
│   │   └── [...outros]
│   ├── tokenflow/               # Componentes do projeto TokenFlow
│   │   ├── Chat/                # Sistema de chat e conversas
│   │   ├── Export/              # Funcionalidades de exportação
│   │   ├── FileManagement/      # Gerenciamento de arquivos
│   │   ├── FilterControls/      # Controles de filtro
│   │   ├── Layout/              # Componentes de layout
│   │   ├── Loading/             # Estados de carregamento
│   │   ├── store/               # Gerenciamento de estado (Zustand)
│   │   ├── types/               # Definições TypeScript
│   │   └── utils/               # Utilitários e helpers
│   └── comic-builder/           # Componentes do projeto Comic Builder
│       ├── hooks/               # Hooks personalizados
│       ├── character-*.tsx      # Componentes de personagens
│       ├── scene-*.tsx          # Componentes de cenas
│       ├── dashboard.tsx        # Dashboard principal
│       ├── header.tsx           # Navegação e ações
│       └── ComicBuilderMain.tsx # Componente principal
├── styles/                       # Estilos separados por projeto
│   ├── globals.css              # Estilos globais
│   └── matrix.css               # Estilos específicos do Matrix
├── types/                        # Definições TypeScript
└── config/                       # Configurações do projeto
```

## 🎨 Guia de Estilo por Projeto

### Marco's Personality Trip
- **Paleta**: Gradientes roxo/rosa/cyan
- **Tipografia**: Sans-serif moderna
- **Animações**: Smooth, psicodélicas no RAVE mode
- **Estética**: Clean com explosões visuais controladas

### Matrix Project
- **Paleta**: Verde Matrix (#00ff00), vermelho (#ff0000), roxo (#9900ff)
- **Tipografia**: `VT323`, `JetBrains Mono` (monospace)
- **Animações**: Rain effect, terminal typing, glow effects
- **Estética**: Cyberpunk/hacker terminal

### TokenFlow
- **Paleta**: Azul/cyan (#00bfff), cinza moderno
- **Tipografia**: Sans-serif limpa para interface
- **Animações**: Smooth transitions, hover effects
- **Estética**: Dashboard profissional com cards e filtros

### Comic Builder
- **Paleta**: Índigo/violeta (#6366f1), roxo moderno
- **Tipografia**: Sans-serif limpa, elementos drag-and-drop
- **Animações**: Drag transitions, card organizing effects
- **Estética**: Interface de criação visual com drag-and-drop

## 🔧 Como Adicionar Novos Projetos

### 🎯 **Sistema Matrix Auth Unificado**

O Cognitive Overflow agora usa um sistema automatizado onde cada projeto pode ser **público** (🔵 blue pill) ou **protegido** (🔴 red pill) com Matrix Auth.

### 1. **Configurar Projeto** 
Adicione no `config/projects.ts`:

```tsx
{
  id: 'nome-projeto',
  title: "NOME DO PROJETO",
  subtitle: "Descrição curta",
  description: "Descrição completa do projeto...",
  path: "/nome-projeto",
  status: "ACTIVE",
  protected: false, // 🔵 true = Matrix Auth | false = Público
  tags: ["Tag1", "Tag2", "Tag3"],
  colors: {
    primary: "from-blue-500/20 to-cyan-500/20",
    secondary: "blue-500",
    accent: "cyan-500", 
    borderColor: "border-blue-500/40",
    glowColor: "shadow-blue-500/30"
  },
  emoji: "🎯",
  // Opcional para projetos protegidos:
  authConfig: {
    title: "CUSTOM AUTH TITLE",
    subtitle: "Custom auth message"
  }
}
```

### 2. **Criar Estrutura**
```bash
mkdir app/nome-projeto
touch app/nome-projeto/page.tsx
touch app/nome-projeto/layout.tsx  # Se protegido
```

### 3. **Layout (se protegido)**
```tsx
// app/nome-projeto/layout.tsx
"use client";
import AutoMatrixLayout from '../../components/matrix/AutoMatrixLayout';

export default function ProjetoLayout({ children }: { children: React.ReactNode }) {
  return <AutoMatrixLayout>{children}</AutoMatrixLayout>;
}
```

### 4. **Página do Projeto**
```tsx
// app/nome-projeto/page.tsx
"use client";
import React from 'react';
import { Button } from "@heroui/button";
import { Icon } from '@iconify/react';
import Link from "next/link";
import MatrixLogoutButton from '../../components/matrix/MatrixLogoutButton'; // Se protegido

export default function NomeProjeto() {
  return (
    <>
      {/* Navigation */}
      <div className="fixed top-6 left-6 z-50">
        <Link href="/">
          <Button size="lg" className="font-mono font-bold backdrop-blur-lg bg-gray-500/20 border border-gray-500/50 text-gray-300 hover:bg-gray-500/30">
            <Icon icon="lucide:arrow-left" width={20} height={20} />
            COGNITIVE OVERFLOW
          </Button>
        </Link>
      </div>

      {/* Logout (apenas se protegido) */}
      <div className="fixed top-6 right-6 z-50">
        <MatrixLogoutButton redirectTo="/nome-projeto" />
      </div>

      {/* Conteúdo */}
      <div className="min-h-screen p-6">
        {/* Seu projeto aqui */}
      </div>
    </>
  );
}
```

### 🔐 **Matrix Auth System**
- **Password:** `redpill` (libera todos os protegidos)
- **Duration:** 7 dias
- **Guide:** Ver `docs/AUTO_MATRIX_GUIDE.md` para detalhes completos

## 🚀 Comandos de Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar servidor de produção
npm start

# Lint do código
npm run lint
```

## 🌐 Deploy

O projeto está configurado para deploy automático na Vercel:

1. Conecte o repositório GitHub à Vercel
2. Configure o domínio `cognitiveoverflow.com`
3. Deploy automático a cada push na branch `main`

## 📝 Padrões de Código

- **Componentes**: PascalCase (`ComponenteNome.tsx`)
- **Hooks**: camelCase (`useNomeHook.ts`)
- **Estilos**: kebab-case (`nome-projeto.css`)
- **Tipos**: PascalCase com interface (`interface NomeTipo`)

## 🎯 Roadmap

- [ ] Sistema de autenticação
- [ ] API para persistência de dados
- [ ] Modo escuro/claro global
- [ ] PWA (Progressive Web App)
- [ ] Analytics e métricas
- [ ] Sistema de comentários
- [ ] Integração com IA

## 🤝 Contribuição

Este é um projeto experimental pessoal, mas sugestões são bem-vindas!

## 📚 Documentação

- **README.md** - Overview, quick start e comandos básicos
- **docs/ORGANIZATION.md** - Estrutura técnica, padrões e convenções
- **docs/AUTO_MATRIX_GUIDE.md** - Sistema Matrix Auth detalhado
- **docs/comic-builder-guide.md** - Guia específico do Comic Builder
- **docs/tokenflow-guide.md** - Guia específico do TokenFlow

## 📜 Licença

MIT License - Use como quiser, quebre como puder! 🔥

---

**Made with ❤️ by Marco Fernandes**  
*"A mente expandida nunca retorna ao seu tamanho original"*
