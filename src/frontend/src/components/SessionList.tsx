import { createComponent } from 'react-fela'
import { useQuery } from '@tanstack/react-query'

const Container = createComponent(() => ({
}))

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

  if (isPending) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {`${error}`}</div>
  }

  return <Container>{(data ?? []).map((sess, i) => {
    return <div key={sess.id}>#{i} {sess.name ? `(${sess.name})` : ''}</div>
  })}</Container>
}
