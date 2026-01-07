import { createComponent } from 'react-fela'
import { useQuery } from '@tanstack/react-query'
import { Tabs } from '@base-ui/react/tabs'

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

  return <Container>
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
          return <div key={sess.id}>#{i} {sess.name ? `(${sess.name})` : ''}</div>
        })}
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
}
