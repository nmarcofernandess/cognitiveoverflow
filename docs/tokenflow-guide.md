# 🧠 TokenFlow - Guia de Uso

## Visão Geral
O TokenFlow é um motor de análise avançada para conversas de IA, totalmente integrado ao CognitiveOverflow. Permite importar, analisar, filtrar e exportar suas conversas do ChatGPT e Claude de forma inteligente.

## Funcionalidades Principais

### 📂 Importação de Arquivos
- **ChatGPT**: Suporte a arquivos de exportação JSON do ChatGPT
- **Claude**: Suporte a arquivos de conversas do Claude
- **Múltiplos Arquivos**: Importe vários arquivos simultaneamente
- **Validação**: Validação automática de formato e estrutura

### 🔍 Sistema de Filtros
- **Filtro por Data**: Selecione períodos específicos
- **Filtro por Tags**: Filtros AND/OR personalizáveis
- **Busca Global**: Busca em tempo real no conteúdo
- **Busca no Chat**: Busca específica dentro das conversas
- **Favoritos**: Sistema de marcação de conversas importantes

### 📊 Análise e Visualização
- **Estatísticas Globais**: Total de chats, fontes, período
- **Metadados por Arquivo**: Análise individual de cada arquivo
- **Ordenação**: Por data ou número de mensagens
- **Modo de Visualização**: Todos os chats ou apenas favoritos

### 📤 Exportação
- **Múltiplos Formatos**: JSON, TXT, MD
- **Filtros na Exportação**: Exporte apenas conversas filtradas
- **Organização**: Mantém estrutura e metadados

## Interface

### Header
- **Botão de Importação**: Acesso rápido ao sistema de upload
- **Botão de Exportação**: Exportar conversas processadas
- **Toggle Tema**: Alternar entre modo claro/escuro

### Área de Filtros
- **Controles de Data**: Seletores de período
- **Tags**: Adicionar/remover filtros de tag
- **Busca**: Campo de busca global
- **Estatísticas**: Resumo dos dados carregados

### Chat Principal
- **Lista de Conversas**: Visualização em cards
- **Barra Lateral**: Navegação entre conversas
- **Visualizador**: Conteúdo completo da conversa selecionada
- **Controles**: Favoritos, busca no chat, ordenação

## Tecnologias Integradas

### Estado (Zustand)
- **Store Centralizado**: Gerenciamento de estado reativo
- **Performance**: Cache inteligente de conversas filtradas
- **Persistência**: Manutenção de filtros e configurações

### UI (HeroUI)
- **Componentes**: Buttons, Cards, Switches, Modals
- **Temas**: Suporte completo a modo claro/escuro
- **Responsivo**: Adaptação automática para mobile

### Processamento
- **Workers**: Processamento assíncrono de arquivos grandes
- **JSZip**: Suporte a arquivos compactados
- **React Dropzone**: Upload drag-and-drop intuitivo
- **Virtual**: Virtualização para listas grandes (TanStack Virtual)

## Integração com CognitiveOverflow

### Navegação
- **Botão de Voltar**: Retorno ao dashboard principal
- **Rota Dedicada**: `/tokenflow` com layout próprio
- **Z-index**: Configurado para não conflitar com outros projetos

### Estilo
- **Paleta Própria**: Azul/cyan harmonizando com o tema geral
- **Header Adaptado**: Espaçamento para o botão de navegação
- **Backdrop**: Efeitos visuais consistentes

## Performance

### Otimizações
- **Lazy Loading**: Componentes carregados sob demanda
- **Memoização**: Evita re-renders desnecessários
- **Cache**: Sistema de cache para filtros complexos
- **Virtualização**: Listas grandes sem impacto na performance

### Limitações
- **Memória**: Arquivo muito grandes podem impactar a performance
- **Browser**: Limitado pela capacidade do navegador
- **Processamento**: Workers para não bloquear a UI

## Estrutura de Arquivos

```
components/tokenflow/
├── Chat/              # Sistema de chat
├── Export/            # Funcionalidades de exportação  
├── FileManagement/    # Upload e gerenciamento de arquivos
├── FilterControls/    # Controles de filtro e busca
├── Layout/            # Header e layout específicos
├── Loading/           # Estados de carregamento
├── store/             # Gerenciamento de estado (Zustand)
├── types/             # Definições TypeScript
├── utils/             # Utilitários e conversores
└── workers/           # Web Workers para processamento
```

## Uso Recomendado

1. **Importação**: Comece importando seus arquivos de conversas
2. **Exploração**: Use os filtros para explorar períodos específicos
3. **Favoritos**: Marque conversas importantes para acesso rápido
4. **Busca**: Use a busca global para encontrar tópicos específicos
5. **Exportação**: Exporte subconjuntos filtrados para análise externa

---

**Integrado ao CognitiveOverflow por Marco Fernandes**  
*"Transformando conversas em insights"* 