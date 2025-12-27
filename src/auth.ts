import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db/index.js'

const isLocalhost = () => {
  return process.env.IS_LOCALHOST === 'true'
}

console.log('db url is', process.env.DATABASE_URL)
export const auth = betterAuth({
  basePath: isLocalhost() ? '/app/auth' : '/auth',
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  // Allow requests from the frontend development server
  trustedOrigins: [
    'http://localhost:5173',
    'app.onetrueos.com',
    'app.app.onetrueos.com'
  ],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    // github: {
    //   clientId: process.env.GITHUB_CLIENT_ID ?? '',
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET,
    // },
    // google: {
    //   clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // },
  },
})

export type AuthType = {
  user: typeof auth.$Infer.Session.user | null
  session: typeof auth.$Infer.Session.session | null
}
