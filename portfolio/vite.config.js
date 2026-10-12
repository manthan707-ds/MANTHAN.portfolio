import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { devApi } from './dev-api.js'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '') // reads .env so api/chat.js can see GEMINI_API_KEY while developing
  return {
    plugins: [
      react(),
      { name: 'dev-api', configureServer(server) { server.middlewares.use(devApi(process.cwd(), env)) } },
    ],
  }
})
