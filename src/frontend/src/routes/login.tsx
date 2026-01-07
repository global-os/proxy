import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { signIn } from '../lib/auth-client'
import { useState } from 'react'
import { VerticalFrame } from '../components/VerticalFrame'
import { Page } from '../components/Page'
import { PageTitle } from '../components/PageTitle'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    await signIn.email(
      { email: usernameOrEmail, password },
      {
        onSuccess: () => {
          navigate({ to: '/' })
        },
        onError: (error) => {
          console.error(error)
        },
      }
    )
  }

  const handleGoogleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    await signIn.social(
      { provider: 'google' },
      {
        onSuccess: () => {
          navigate({ to: '/' })
        },
        onError: (error) => {
          console.error(error)
        },
      }
    )
  }

  const handleGithubLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    await signIn.social(
      { provider: 'github' },
      {
        onSuccess: () => {
          navigate({ to: '/' })
        },
        onError: (error) => {
          console.error(error)
        },
      }
    )
  }

  return (
    <Page>
      <VerticalFrame>
        <div>
          <PageTitle>Log In</PageTitle>
          <form onSubmit={handleEmailLogin}>
            <div>
              <label htmlFor="email">Email</label>
              <input
                id="username"
                type="text"
                name="username"
                autoComplete="username"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input
                name="password"
                id="password"
                autoComplete="current-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <button type="submit">Login</button>
            </div>
          </form>
          <form onSubmit={handleGoogleLogin}>
            <button type="submit">Login with Google</button>
          </form>
          <form onSubmit={handleGithubLogin}>
            <button type="submit">Login with Github</button>
          </form>
        </div>
      </VerticalFrame>
    </Page>
  )
}
