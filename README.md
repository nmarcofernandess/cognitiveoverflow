# 🧠 COGNITIVE OVERFLOW

> **Hub experimental onde mente, código e criatividade se encontram.**

Um projeto Next.js modular que abriga múltiplos experimentos criativos, análises de personalidade e simulações interativas.

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

## 🛠 Tecnologias

- **Framework**: Next.js 15.3.1 (App Router)
- **UI**: HeroUI + Tailwind CSS
- **Animações**: Framer Motion
- **Ícones**: Iconify React
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
│   └── matrix/                  # Componentes do projeto Matrix
│       ├── MatrixRain.tsx
│       ├── Terminal.tsx
│       ├── BluePill.tsx
│       ├── LandingPage.tsx
│       └── [...outros]
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

## 🔧 Como Adicionar Novos Projetos

### 1. Estrutura de Arquivos
```bash
# Criar rota do projeto
mkdir app/nome-projeto
touch app/nome-projeto/page.tsx

# Criar componentes específicos
mkdir components/nome-projeto
touch components/nome-projeto/ComponentePrincipal.tsx

# Criar estilos específicos (opcional)
touch styles/nome-projeto.css
```

### 2. Padrão de Componente
```tsx
"use client";

import React from 'react';
import { Button } from "@heroui/button";
import { Icon } from '@iconify/react';
import Link from "next/link";

// Importar estilos específicos se necessário
import '../../styles/nome-projeto.css';

export default function NomeProjeto() {
  return (
    <>
      {/* Botão de navegação obrigatório */}
      <div className="fixed top-6 left-6 z-50">
        <Link href="/">
          <Button
            size="lg"
            className="font-mono font-bold backdrop-blur-lg bg-gray-500/20 border border-gray-500/50 text-gray-300 hover:bg-gray-500/30"
          >
            <Icon icon="lucide:arrow-left" width={20} height={20} />
            COGNITIVE OVERFLOW
          </Button>
        </Link>
      </div>

      {/* Conteúdo do projeto */}
      <div className="min-h-screen p-6">
        {/* Seu projeto aqui */}
      </div>
    </>
  );
}
```

### 3. Atualizar Dashboard
Adicione o novo projeto no array `projects` em `app/page.tsx`:

```tsx
{
  id: 'nome-projeto',
  title: "NOME DO PROJETO",
  subtitle: "Descrição curta",
  description: "Descrição completa do projeto...",
  path: "/nome-projeto",
  color: "from-blue-500/20 to-cyan-500/20",
  borderColor: "border-blue-500/40",
  glowColor: "shadow-blue-500/30",
  emoji: "🎯",
  status: "ACTIVE",
  tags: ["Tag1", "Tag2", "Tag3"]
}
```

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

## 📜 Licença

MIT License - Use como quiser, quebre como puder! 🔥

---

**Made with ❤️ by Marco Fernandes**  
*"A mente expandida nunca retorna ao seu tamanho original"*
