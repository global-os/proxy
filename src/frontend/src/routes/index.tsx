import { createFileRoute, useNavigate } from '@tanstack/react-router'
// import { useSession } from '../lib/auth-client'
import { Button } from '@base-ui/react/button';
import { useEffect } from 'react';
import { Page } from '../components/Page'
import { HorizontalFrame } from '../components/HorizontalFrame'
import { useSession } from '../lib/auth-client';

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const navigate = useNavigate()

   const { data: session, isPending, error } = useSession()

   const userId = session?.user.id

   useEffect(() => {
    if (!isPending && !error && userId !== undefined) {
      navigate({ to: '/sessions' })
    }

   }, [isPending, userId])

  return (
    <Page>
      <HorizontalFrame>
        <div style={{ whiteSpace: 'nowrap', paddingLeft: '4em', paddingTop: '11em', paddingRight: '2em' }}>
          <Button onClick={() => {
            navigate({ to: '/login' })
          }}>Log In</Button>
          {' '}
          <Button onClick={() => {
            navigate({ to: '/register' })
          }}>Sign Up</Button>
        </div>
      </HorizontalFrame>
    </Page>
  )
}

// function MyApp() {

//   if (isPending) {
//     return <div>loading...</div>
//   }

//   if (error) {
//     return <div>ERROR: {`${error}`}</div>
//   }

//   return (
//     <div>
//       <Button native={false}>Let's go</Button>

//       <h3>Welcome Home!</h3>

//       {session && <div>Hello {session.user?.name ?? `${session.user}`}</div>}
//     </div>
//   )
// }
