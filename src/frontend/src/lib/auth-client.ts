import { createAuthClient } from 'better-auth/react'
import { inferAdditionalFields } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  basePath: '/api/auth',
  plugins: [
    inferAdditionalFields({
      user: {
        roles: {
          type: 'string[]',
        },
      },
    }),
  ],
})

export const {
  useSession,
  signIn,
  signUp,
  signOut,
  requestPasswordReset,
  resetPassword,
} = authClient

export type Session = typeof authClient.$Infer.Session
export type User = typeof authClient.$Infer.Session.user

type AuthErrorContext = {
  error?: { message?: string; status?: number }
  responseText?: string
}

export function authErrorMessage(ctx: AuthErrorContext): string {
  const err = ctx.error as (AuthErrorContext['error'] & { error?: unknown }) | undefined
  if (err?.message?.includes('Fetch related error') && err.error) {
    return authErrorFromUnknown(err.error)
  }
  if (ctx.error?.message) return ctx.error.message

  if (ctx.responseText) {
    try {
      const parsed = JSON.parse(ctx.responseText) as { message?: string }
      if (parsed.message) return parsed.message
    } catch {
      if (ctx.responseText.includes('FUNCTION_INVOCATION_TIMEOUT')) {
        return 'Server timed out. Please try again in a moment.'
      }
      const trimmed = ctx.responseText.trim()
      if (trimmed) return trimmed
    }
  }

  if (ctx.error?.status === 504) {
    return 'Server timed out. Please try again in a moment.'
  }
  if (ctx.error?.status === 429) {
    return 'Too many requests. Please try again later.'
  }

  return 'Something went wrong. Please try again.'
}

export function authErrorFromUnknown(err: unknown): string {
  if (err && typeof err === 'object' && 'error' in err) {
    const nested = authErrorMessage(err as AuthErrorContext)
    if (nested !== 'Something went wrong. Please try again.') return nested
  }

  if (err instanceof TypeError) {
    const msg = err.message.toLowerCase()
    if (msg.includes('network') || msg.includes('fetch')) {
      return 'Network error — could not reach the server. Check your connection and try again.'
    }
  }

  if (err instanceof Error) {
    const msg = err.message.toLowerCase()
    if (msg.includes('networkerror') || msg.includes('failed to fetch')) {
      return 'Network error — could not reach the server. Check your connection and try again.'
    }
    if (err.message) return err.message
  }

  return 'Something went wrong. Please try again.'
}

export async function runAuthAction(
  action: () => Promise<unknown>,
  setError: (message: string) => void,
): Promise<void> {
  try {
    const result = await action()
    if (result && typeof result === 'object' && 'error' in result) {
      const error = (result as { error?: AuthErrorContext['error'] }).error
      if (error) setError(authErrorMessage({ error }))
    }
  } catch (err) {
    setError(authErrorFromUnknown(err))
  }
}
