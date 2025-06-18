#!/bin/bash

# 🧠 Neural System - Claude Desktop Setup Script
# Instala configuração MCP no Claude Desktop automaticamente

echo "🧠 Neural System - Claude Desktop Setup"
echo "========================================"

# Detectar o OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
    echo "📱 macOS detectado"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    CLAUDE_CONFIG_DIR="$HOME/.config/claude-desktop"
    echo "🐧 Linux detectado"
elif [[ "$OSTYPE" == "msys" ]]; then
    CLAUDE_CONFIG_DIR="$APPDATA/Claude"
    echo "🪟 Windows detectado"
else
    echo "❌ OS não suportado: $OSTYPE"
    exit 1
fi

echo "📁 Diretório config: $CLAUDE_CONFIG_DIR"

# Criar diretório se não existir
mkdir -p "$CLAUDE_CONFIG_DIR"

# Backup do config existente
if [ -f "$CLAUDE_CONFIG_DIR/config.json" ]; then
    echo "💾 Fazendo backup do config existente..."
    cp "$CLAUDE_CONFIG_DIR/config.json" "$CLAUDE_CONFIG_DIR/config.json.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Copiar nova configuração
echo "📝 Instalando configuração Neural System..."
cat > "$CLAUDE_CONFIG_DIR/config.json" << 'EOF'
{
  "mcpServers": {
    "neural-system": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://cognitiveoverflow.vercel.app/api/mcp-server?token=neural_access_2024"
      ]
    },
    "neural-system-local": {
      "command": "npx", 
      "args": [
        "mcp-remote",
        "http://localhost:3000/api/mcp-server?token=neural_access_2024"
      ]
    }
  }
}
EOF

echo "✅ Configuração instalada com sucesso!"
echo ""
echo "🔄 Próximos passos:"
echo "1. Reinicie o Claude Desktop"
echo "2. Verifique se 'neural-system' aparece nas integrações"
echo "3. Teste com: 'Liste as pessoas da minha rede'"
echo ""
echo "🔧 Para testar local:"
echo "   npm run dev"
echo "   (usa neural-system-local automaticamente)"
echo ""

# Verificar se mcp-remote está instalado
if ! command -v npx mcp-remote &> /dev/null; then
    echo "⚠️  mcp-remote não encontrado. Instalando..."
    npm install -g mcp-remote
    echo "✅ mcp-remote instalado"
fi

echo "🎯 Setup completo! Marco, reinicia o Claude Desktop." 