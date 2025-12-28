import { createFileRoute } from '@tanstack/react-router'
import { useSession } from '../lib/auth-client'
import { Button } from '@base-ui/react/button';

import '../index.css'

console.log('index.tsx loaded') 

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <html>
      <body>
        <MyApp />
      </body>
    </html>
  )
}

function MyApp() {
  const { data: session, isPending, error } = useSession()

  if (isPending) {
    return <div>loading...</div>
  }

  if (error) {
    return <div>ERROR: {`${error}`}</div>
  }

  return (
      <div>
        <Button native={false}>Let's go</Button>

        <h3>Welcome Home!</h3>
        {session && <div>Hello {session.user?.name ?? `${session.user}`}</div>}
      </div>
  )
}
