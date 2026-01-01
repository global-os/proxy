import { createFileRoute } from '@tanstack/react-router'
// import { useSession } from '../lib/auth-client'
// import { Button } from '@base-ui/react/button';
import { Page } from '../components/Page'
import { LogoBox } from '../components/LogoBox'

import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <Page>
      <LogoBox>
        <Link to={'/login'}>Login</Link> <Link to={'/register'}>Register</Link>
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
