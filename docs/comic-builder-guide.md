# 📚 Comic Builder Guide

> **Ferramenta para criação de histórias em quadrinhos com suporte a IA**

O Comic Builder é uma aplicação integrada ao CognitiveOverflow que permite organizar personagens, cenas e gerar prompts estruturados para manter consistência visual em histórias em quadrinhos.

## 🎯 Funcionalidades Principais

### 📝 Gerenciamento de Projeto
- **Importação/Exportação**: Sistema completo para backup e restauração
- **Estilo de Comic**: Definição global do estilo visual da história
- **Prompt Geral**: Geração automática de prompt base para IA visual

### 👥 Sistema de Personagens
- **Personagens Múltiplos**: Criação ilimitada de personagens
- **Fases Evolutivas**: Cada personagem pode ter múltiplas fases (idade, visual, etc.)
- **Detalhes Visuais**: Cabelo, roupas, expressão, barba, tatuagens, corpo, acessórios
- **Protagonista**: Marcação especial para personagem principal

### 🎬 Organização de Cenas
- **Painéis Duplos**: Cada cena possui painel superior e inferior
- **Descrição e Legenda**: Campos separados para narrativa e diálogo
- **Personagens Ativos**: Seleção de quais personagens/fases aparecem
- **Letras de Identificação**: Sistema automático de numeração (A, B, C...)

## 🛠 Como Usar

### 1. Configuração Inicial
1. Acesse `/comic-builder` no CognitiveOverflow
2. Defina o **Estilo do Comic** na aba "Configurações Gerais"
3. Configure o personagem protagonista padrão

### 2. Criando Personagens
1. Na aba "Configurações Gerais", role até "Personagens"
2. Clique em "Adicionar Personagem"
3. Preencha:
   - **Nome**: Nome do personagem
   - **É Protagonista**: Marque se for o personagem principal
4. Adicione **Fases** conforme necessário:
   - **Idade**: Descrição da faixa etária
   - **Título**: Nome da fase (ex: "Jovem", "Adulto")
   - **Descrição**: Descrição geral da aparência

### 3. Detalhes Visuais das Fases
Para cada fase, configure os detalhes visuais:
- **Cabelo**: Cor, comprimento, estilo
- **Roupas**: Vestimenta característica
- **Expressão**: Expressão facial típica
- **Barba**: Presença e estilo de barba
- **Tatuagens**: Descrição de tatuagens
- **Corpo**: Tipo físico e características
- **Estilo Visual**: Elementos únicos de design
- **Acessórios**: Itens que o personagem carrega

### 4. Criando Cenas
1. Vá para a aba "Cenas"
2. Clique em "Adicionar Cena"
3. Para cada painel (superior e inferior):
   - **Descrição**: Ação que acontece no painel
   - **Legenda**: Texto/diálogo do painel
4. Selecione **Personagens Ativos**:
   - Escolha quais personagens aparecem
   - Selecione a fase específica de cada um

### 5. Geração de Prompts
- **Prompt Geral**: Copia estrutura completa (estilo + personagens)
- **Prompt por Cena**: Cada cena gera seu prompt específico
- **Consistência Visual**: Mantém referências visuais entre cenas

## 🎨 Estrutura de Dados

### Comic Style
```typescript
interface ComicBuilderData {
  comicStyle: string;        // Estilo geral da história
  characters: Character[];   // Array de personagens
  scenes: Scene[];          // Array de cenas
}
```

### Personagem
```typescript
interface Character {
  id: string;
  name: string;
  isProtagonist: boolean;
  phases: CharacterPhase[];
}

interface CharacterPhase {
  id: string;
  age: string;
  title: string;
  description: string;
  details?: {
    hair?: string;
    clothes?: string;
    expression?: string;
    beard?: string;
    tattoos?: string;
    body?: string;
    visualStyle?: string;
    accessories?: string;
  };
}
```

### Cena
```typescript
interface Scene {
  id: string;
  letter: string;           // A, B, C...
  upperPanel: ScenePanel;   // Painel superior
  lowerPanel: ScenePanel;   // Painel inferior
  characters: SceneCharacter[]; // Personagens ativos
  generatedImage?: string;  // Imagem gerada (futuro)
}

interface ScenePanel {
  description: string;      // Ação do painel
  caption: string;         // Texto/diálogo
  image?: string;          // Imagem (futuro)
}
```

## 🔄 Workflow Recomendado

### 1. Planejamento
- Defina o estilo visual geral
- Crie todos os personagens principais
- Configure as fases de cada personagem

### 2. Desenvolvimento
- Crie cenas sequencialmente (A, B, C...)
- Mantenha consistência nos personagens ativos
- Use descrições detalhadas para melhor resultado da IA

### 3. Geração
- Copie o prompt geral no início do projeto
- Use prompts específicos de cena para gerar imagens
- Mantenha referência visual entre cenas

## 💡 Dicas Avançadas

### Consistência Visual
- Use terminologias consistentes entre fases
- Mantenha elementos visuais únicos por personagem
- Referencie sempre o estilo geral do comic

### Organização
- Nomeie fases de forma clara ("Jovem Marco", "Marco Adulto")
- Use letras de cena para facilitar referência
- Exporte regularmente para backup

### Prompts Eficazes
- Seja específico nas descrições visuais
- Inclua elementos de ambiente quando relevante
- Use o campo "legenda" para diálogos importantes

## 🎯 Integrações Futuras

- **Geração de Imagens**: Integração direta com APIs de IA visual
- **Templates**: Estilos de comic pré-definidos
- **Colaboração**: Sistema multi-usuário
- **Animação**: Export para motion comics

---

**Criado para o CognitiveOverflow por Marco Fernandes**  
*"Transformando ideias em narrativas visuais estruturadas"* 