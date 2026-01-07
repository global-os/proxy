import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { signUp } from '../lib/auth-client'
import { Page } from '../components/Page'
import { VerticalFrame } from '../components/VerticalFrame'
import { PageTitle } from '../components/PageTitle'

export const Route = createFileRoute('/register')({
  component: RouteComponent,
})

function RouteComponent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [name, setName] = useState('')
  const navigate = useNavigate()

  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log('submitted')
    e.preventDefault()

    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    await signUp.email(
      { email, password, name, roles: ['STUDENT'] },
      {
        onSuccess: () => {
          setError(null)
          navigate({ to: '/' })
        },
        onError: (error) => {
          setError(error.error.message)
          console.error(error)
        },
      }
    )
  }

  return (
    <Page>
      <VerticalFrame>
        <div>
          <PageTitle>Create New Account</PageTitle>
          {!!error && <div style={{ color: 'red' }}>Error: {error}</div>}
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="name">Name (optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div>
              <button type="submit">Register</button>
            </div>
          </form>
        </div>
      </VerticalFrame>
    </Page>
  )
}
