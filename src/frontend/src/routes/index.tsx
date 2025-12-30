import { createFileRoute } from '@tanstack/react-router'
import { useSession } from '../lib/auth-client'
import { Button } from '@base-ui/react/button';
import { createComponent } from 'react-fela'
import { Page } from '../components/Page';

import { Link } from '@tanstack/react-router'


export const Route = createFileRoute('/')({
  component: Index,
})

const section = () => ({
  margin: '0 auto',
  fontSize: '1rem',
  display: 'block',
  width: '30.5rem',
  height: '15.5rem',
  background: 'red'
})

const LoginBox = createComponent(section)

function Index() {
  return (
    <Page>

      <LoginBox>
        <Link to={'/login'}>
          Login
        </Link>{' '}
        <Link to={'/register'}>
          Register
        </Link>
      </LoginBox>
      <hr />

    </Page>
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
