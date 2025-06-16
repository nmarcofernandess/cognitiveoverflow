import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
    middlewareMode: false,
    // Configurar middleware para rotas de API
    proxy: {
      // Fallback para servir APIs localmente
    }
  },
  // Plugin customizado para servir APIs
  configureServer(server) {
    server.middlewares.use('/api', async (req, res, next) => {
      try {
        // Extrair o caminho da API
        const apiPath = req.url.split('?')[0]
        const apiFile = path.join(process.cwd(), 'api', apiPath.replace('/api/', '') + '.js')
        
        // Verificar se o arquivo da API existe
        if (fs.existsSync(apiFile)) {
          // Importar e executar a API
          const apiModule = await import(apiFile + '?t=' + Date.now())
          const handler = apiModule.default || apiModule.handler
          
          if (handler) {
            // Criar objetos de request/response compatíveis
            const mockReq = {
              method: req.method,
              url: req.url,
              headers: req.headers,
              query: new URL(req.url, 'http://localhost').searchParams,
              body: req.method !== 'GET' ? await getBody(req) : undefined
            }
            
            const mockRes = {
              status: (code) => {
                res.statusCode = code
                return mockRes
              },
              json: (data) => {
                res.setHeader('Content-Type', 'application/json')
                res.setHeader('Access-Control-Allow-Origin', '*')
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
                res.end(JSON.stringify(data))
              },
              send: (data) => {
                res.setHeader('Access-Control-Allow-Origin', '*')
                res.end(data)
              }
            }
            
            // Executar o handler
            await handler(mockReq, mockRes)
          } else {
            res.statusCode = 500
            res.end('API handler not found')
          }
        } else {
          next()
        }
      } catch (error) {
        console.error('API Error:', error)
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: error.message }))
      }
    })
  }
})

// Função auxiliar para ler o body da requisição
function getBody(req) {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(body))
      } catch {
        resolve(body)
      }
    })
  })
}
