# 📁 Guia de Organização - Cognitive Overflow

## 🎯 Filosofia de Organização

O **Cognitive Overflow** é um hub modular onde cada projeto mantém sua identidade única, mas segue padrões consistentes de organização e navegação.

## 📂 Estrutura de Pastas

```
cognitiveoverflow/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Dashboard principal
│   ├── projeto/page.tsx         # Páginas de cada projeto
│   └── layout.tsx               # Layout global
├── components/                   # Componentes organizados por projeto
│   ├── projeto1/                # Namespace isolado por projeto
│   │   ├── ComponentePrincipal.tsx
│   │   ├── ComponenteSecundario.tsx
│   │   └── index.ts            # Exports organizados
│   └── shared/                  # Componentes compartilhados
│       ├── Navigation.tsx
│       └── BackButton.tsx
├── styles/                       # Estilos organizados
│   ├── globals.css              # Estilos globais básicos
│   ├── projects/                # Estilos específicos de cada projeto
│   │   ├── marco.css           # Isolado para Marco
│   │   ├── matrix.css          # Isolado para Matrix
│   │   └── projeto.css         # Template para novos projetos
│   └── shared/                  # Estilos compartilhados
│       └── navigation.css
├── types/                        # Definições TypeScript
│   ├── global.d.ts             # Tipos globais
│   └── projects/               # Tipos específicos por projeto
│       ├── marco.types.ts
│       └── matrix.types.ts
├── config/                       # Configurações
│   ├── projects.ts             # Metadata dos projetos
│   └── constants.ts            # Constantes globais
└── docs/                        # Documentação
    ├── ORGANIZATION.md         # Este arquivo
    └── ADDING_PROJECTS.md      # Como adicionar projetos
```

## 🧩 Padrões de Componentes

### Componente de Projeto (Template)

```tsx
"use client";

import React from 'react';
import { Button } from "@heroui/button";
import { Icon } from '@iconify/react';
import Link from "next/link";

// Importar estilos específicos do projeto
import '../../styles/projects/nome-projeto.css';

export default function NomeProjeto() {
  return (
    <>
      {/* OBRIGATÓRIO: Botão de navegação */}
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

      {/* Conteúdo principal do projeto */}
      <div className="min-h-screen">
        {/* Implementação específica */}
      </div>
    </>
  );
}
```

### Namespace de Componentes

Cada projeto deve ter seus componentes em uma pasta isolada:

```tsx
// components/marco/index.ts
export { PersonalityTrip } from './PersonalityTrip';
export { PersonalityCard } from './PersonalityCard';
export { RaveMode } from './RaveMode';

// components/matrix/index.ts
export { MatrixRain } from './MatrixRain';
export { Terminal } from './Terminal';
export { BluePill } from './BluePill';
```

## 🎨 Isolamento de Estilos

### Estilos Específicos por Projeto

Cada projeto deve ter seu arquivo CSS isolado:

```css
/* styles/projects/nome-projeto.css */

/* Variáveis CSS do projeto */
:root {
  --projeto-primary: #color;
  --projeto-secondary: #color;
}

/* Classes com namespace */
.nome-projeto-container {
  /* estilos específicos */
}

.nome-projeto-card {
  /* estilos específicos */
}
```

### Evitar Vazamento de Estilos

- Use classes com prefixo do projeto
- Evite sobrescrever estilos globais
- Use CSS Modules se necessário
- Teste em outros projetos após mudanças

## 🔧 Metadata de Projetos

Centralize informações dos projetos em `config/projects.ts`:

```tsx
export interface ProjectMetadata {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  path: string;
  status: 'ACTIVE' | 'DEVELOPMENT' | 'ARCHIVED';
  tags: string[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  emoji: string;
}

export const projects: ProjectMetadata[] = [
  // Definições dos projetos
];
```

## 📝 Convenções de Nomenclatura

### Arquivos e Pastas
- **Componentes**: `PascalCase.tsx`
- **Hooks**: `camelCase.ts`
- **Utilitários**: `camelCase.ts`
- **Estilos**: `kebab-case.css`
- **Tipos**: `camelCase.types.ts`

### CSS Classes
- **Projeto específico**: `projeto-elemento`
- **Estado**: `is-active`, `has-error`
- **Variantes**: `elemento--variant`

### Variáveis CSS
- **Globais**: `--color-primary`
- **Projeto**: `--marco-purple`, `--matrix-green`

## 🚀 Adicionando Novos Projetos

1. **Criar estrutura**:
   ```bash
   mkdir app/novo-projeto
   mkdir components/novo-projeto
   touch styles/projects/novo-projeto.css
   ```

2. **Implementar página principal**:
   - Usar template padrão
   - Adicionar navegação obrigatória
   - Importar estilos específicos

3. **Atualizar dashboard**:
   - Adicionar no array `projects`
   - Definir cores e metadata

4. **Testar isolamento**:
   - Verificar se não afeta outros projetos
   - Testar navegação
   - Validar responsividade

## ⚠️ Cuidados Importantes

### ❌ O que NÃO fazer:
- Modificar estilos globais sem considerar impacto
- Usar IDs únicos em CSS (usar classes)
- Misturar estilos de projetos diferentes
- Esquecer botão de navegação
- Hardcoded valores que deveriam ser configuráveis

### ✅ O que fazer:
- Manter isolamento entre projetos
- Usar padrões consistentes
- Documentar decisões importantes
- Testar em diferentes resoluções
- Manter performance otimizada

## 🔄 Manutenção

### Limpeza Periódica
- Remover componentes não utilizados
- Otimizar imports duplicados
- Revisar estilos obsoletos
- Atualizar documentação

### Monitoramento
- Performance de cada projeto
- Tamanho do bundle
- Erros de console
- Acessibilidade

---

**Lembre-se**: Cada projeto é um universo criativo único, mas todos vivem harmoniosamente no mesmo hub! 🌌 