import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import telegramOrderHandler from './api/telegram/order.js'

function telegramApiPlugin() {
  return {
    name: 'telegram-order-api',
    configureServer(server) {
      server.middlewares.use('/api/telegram/order', async (request, response) => {
        if (request.method === 'POST') {
          try {
            let rawBody = ''
            for await (const chunk of request) {
              rawBody += chunk
              if (rawBody.length > 1_000_000) {
                response.statusCode = 413
                response.end(JSON.stringify({ error: 'Request body is too large.' }))
                return
              }
            }
            request.body = rawBody ? JSON.parse(rawBody) : null
          } catch {
            response.statusCode = 400
            response.end(JSON.stringify({ error: 'Invalid JSON body.' }))
            return
          }
        }

        const apiResponse = {
          setHeader(name, value) {
            response.setHeader(name, value)
            return this
          },
          status(code) {
            response.statusCode = code
            return this
          },
          json(payload) {
            response.setHeader('Content-Type', 'application/json; charset=utf-8')
            response.end(JSON.stringify(payload))
            return this
          },
        }

        await telegramOrderHandler(request, apiResponse)
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  for (const key of ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID']) {
    if (env[key]) process.env[key] = env[key]
  }

  return {
    plugins: [react(), telegramApiPlugin()],
    server: {
      port: 3000,
      open: true,
    },
  }
})
