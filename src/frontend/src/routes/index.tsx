import { createFileRoute, useNavigate } from '@tanstack/react-router'
// import { useSession } from '../lib/auth-client'
import { Button } from '@base-ui/react/button';
import { Page } from '../components/Page'
import { LogoBox } from '../components/LogoBox'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const navigate = useNavigate()

  return (
    <Page>
      <LogoBox>
        <div style={{ whiteSpace: 'nowrap', margin: 10 }}>
          <Button onClick={() => {
            navigate({ to: '/login' })
          }}>Log In</Button>
          {' '}
          <Button onClick={() => {
            navigate({ to: '/register' })
          }}>Register</Button>
        </div>
      </LogoBox>
    </Page>
  )
}

// function MyApp() {
//   const { data: session, isPending, error } = useSession()

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
