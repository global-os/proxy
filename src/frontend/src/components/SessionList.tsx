import { createComponent } from 'react-fela'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useCallback } from 'react'
import { Tabs } from '@base-ui/react/tabs'

const Container = createComponent(() => ({ }))

type Session = {
  id: string
  name?: string
}

export const SessionList = () => {
  const { data, isPending, error } = useQuery<Session[]>({
    queryKey: ['sessions'],
    queryFn: async () => {
      const r = await fetch('/api/sessions')
      const j = await r.json()
      return j as Session[]
    },
  })

  const { data: _mutData, isPending: _mutIsPending, error: _mutError, mutateAsync } = useMutation<Session[]>({
    mutationKey: ['sessions'],
    mutationFn: async () => {
      const r = await fetch('/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({})
    })
      const j = await r.json()
      return j as Session[]
    },
  })

//   const { isPending: _, isSuccess: __, error: _mutationError, mutateAsync } = useMutation({
//     mutationFn: async (): Promise<undefined> => {
// return axios.post('/todos', newTodo)
//     }
//   })

  const createSession = useCallback(() => {
    mutateAsync(undefined, {
      onSuccess: () => {
        console.info('success mutating')
      },
    }).then(() => {
      console.info('finished mutating')
    }).catch(() => {
      console.error('errored mutating')
    })
  }, [])

  if (isPending) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {`${error}`}</div>
  }

  return (
    <Container>
      <Tabs.Root defaultValue="global-pc">
        <Tabs.List >
          <Tabs.Tab value="global-pc">
            My Global PC
          </Tabs.Tab>
          <Tabs.Tab value="settings">
            Settings
          </Tabs.Tab>
          <Tabs.Tab value="help">
            Help
          </Tabs.Tab>
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
          <button onClick={createSession}>Create New Session</button>
        </Tabs.Panel>
        <Tabs.Panel value="settings">
          PI
        </Tabs.Panel>
        <Tabs.Panel value="help">
          For support, please send an email to{' '}
          <a href="mailto:coldairnetworks@fastmail.com">coldairnetworks@fastmail.com</a>
          {' '}and we will assist as soon as possible.
        </Tabs.Panel>
      </Tabs.Root>
    </Container>
  )
}
