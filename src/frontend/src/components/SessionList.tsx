import { createComponent } from 'react-fela'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { Tabs } from '@base-ui/react/tabs'

const Container = createComponent(() => ({}))

type Session = {
  id: number
  name?: string | null
  user_id: string
}

async function fetchSessions(): Promise<Session[]> {
  const r = await fetch('/api/sessions')
  if (!r.ok) {
    throw new Error(`Failed to load sessions (${r.status})`)
  }
  return r.json()
}

async function createSession(): Promise<Session[]> {
  const r = await fetch('/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({}),
  })
  if (!r.ok) {
    let message = `Failed to create session (${r.status})`
    try {
      const body = (await r.json()) as { message?: string }
      if (body.message) message = body.message
    } catch {
      // ignore non-JSON error bodies
    }
    throw new Error(message)
  }
  return r.json()
}

export const SessionList = () => {
  const queryClient = useQueryClient()
  const [createError, setCreateError] = useState<string | null>(null)

  const { data, isPending, error } = useQuery<Session[]>({
    queryKey: ['sessions'],
    queryFn: fetchSessions,
  })

  const { isPending: isCreating, mutateAsync } = useMutation({
    mutationKey: ['sessions', 'create'],
    mutationFn: createSession,
    onSuccess: (sessions) => {
      queryClient.setQueryData(['sessions'], sessions)
      setCreateError(null)
    },
  })

  const handleCreateSession = useCallback(async () => {
    setCreateError(null)
    try {
      await mutateAsync()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create session')
    }
  }, [mutateAsync])

  if (isPending) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {`${error}`}</div>
  }

  return (
    <Container>
      <Tabs.Root defaultValue="global-pc">
        <Tabs.List>
          <Tabs.Tab value="global-pc">My Global PC</Tabs.Tab>
          <Tabs.Tab value="settings">Settings</Tabs.Tab>
          <Tabs.Tab value="help">Help</Tabs.Tab>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Panel value="global-pc">
          My Sessions
          {(data ?? []).map((sess, i) => {
            return (
              <div key={sess.id}>
                <a href={`/session/${sess.id}`}>
                  Open session #{i + 1} {sess.name ? `(${sess.name})` : ''}
                </a>
              </div>
            )
          })}
          {createError && (
            <p role="alert" style={{ color: '#b91c1c' }}>
              {createError}
            </p>
          )}
          <button onClick={handleCreateSession} disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create New Session'}
          </button>
        </Tabs.Panel>
        <Tabs.Panel value="settings">PI</Tabs.Panel>
        <Tabs.Panel value="help">
          For support, please send an email to{' '}
          <a href="mailto:coldairnetworks@fastmail.com">coldairnetworks@fastmail.com</a>{' '}
          and we will assist as soon as possible.
        </Tabs.Panel>
      </Tabs.Root>
    </Container>
  )
}