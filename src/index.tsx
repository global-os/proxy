import 'dotenv/config'
import { serve } from '@hono/node-server'
import { testConnection } from './db/index.js'
import { seedUserFixtures } from './db/seed.js'
import app from './app.js'
import { startRuntimeMaintenance } from './runtime/instance-manager.js'

async function main() {
  await testConnection()
  await seedUserFixtures()
  startRuntimeMaintenance()

  serve(
    {
      fetch: (request, ...args) => {
        console.log('=== FETCH CALLED ===')
        console.log('Request URL:', request.url)
        console.log('Request method:', request.method)
        return app.fetch(request, ...args)
      },
      port: Number(process.env.PORT) || 3000,
    },
    (info) => {
      console.log(`Server running on http://localhost:${info.port}`)
    }
  )
}

main()

export default app
