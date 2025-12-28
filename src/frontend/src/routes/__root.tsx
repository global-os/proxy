import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { signOut, useSession } from '../lib/auth-client'

export const Route = createRootRoute({
  component: RouteComponent,
})

const getUrl = (path: string): string => {
  return path
}

function RouteComponent() {
  const { data: session } = useSession()

  return (
    <>
      <div className="p-2 flex">
        <Link to={getUrl('/')} className="[&.active]:font-bold">
          Home
        </Link>{' '}
        {session ? (
          <button onClick={() => signOut()}>Sign Out</button>
        ) : (
          <>
            <Link to={getUrl('/login')} className="[&.active]:font-bold">
              Login
            </Link>{' '}
            <Link to={getUrl('/register')} className="[&.active]:font-bold">
              Register
            </Link>
          </>
        )}
      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  )
}
