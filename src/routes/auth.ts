import { Hono, type Context } from 'hono'
import { auth } from '../auth.js'
import { isDatabaseConfigured } from '../db/index.js'

export type AuthType = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null
    session: typeof auth.$Infer.Session.session | null
  }
}

const AUTH_HANDLER_TIMEOUT_MS = 8_000

async function handleAuth(c: Context) {
  if (!isDatabaseConfigured()) {
    return c.json(
      { message: 'Server misconfigured: database is not configured.' },
      503
    )
  }

  const timeoutResponse = new Promise<Response>((resolve) => {
    setTimeout(() => {
      resolve(
        Response.json(
          { message: 'Authentication timed out. The database may be unreachable.' },
          { status: 504 }
        )
      )
    }, AUTH_HANDLER_TIMEOUT_MS)
  })

  return Promise.race([auth.handler(c.req.raw), timeoutResponse])
}

const router = new Hono<{ Bindings: AuthType }>({ strict: false })

router.on(['POST', 'GET'], '/*', (c) => handleAuth(c))

export default router