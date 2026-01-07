import { createComponent } from 'react-fela'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useCallback } from 'react'

const Container = createComponent(() => ({}))

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

  const { isPending: _, isSuccess: __, error: _mutationError, mutate: _mutate } = useMutation({
    mutationFn: async (): Promise<undefined> => {

    }
  })

  const createSession = useCallback(() => {

  }, [])

  if (isPending) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {`${error}`}</div>
  }

  return (
    <Container>
      {(data ?? []).map((sess, i) => {
        return (
          <div key={sess.id}>
            <a href={`/sessions/${sess.id}`}>
              Open session #{i + 1} {sess.name ? `(${sess.name})` : ''}
            </a>
          </div>
        )
      })}
      <button onClick={createSession}>Create New Session</button>
    </Container>
  )
}
