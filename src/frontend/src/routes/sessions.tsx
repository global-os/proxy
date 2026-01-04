import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { VerticalFrame } from '../components/VerticalFrame'
import { Page } from '../components/Page'
import { PageTitle } from '../components/PageTitle'
import { Button } from '@base-ui/react/button'
import { signOut } from '../lib/auth-client'
import { SessionList } from '../components/SessionList'

export const Route = createFileRoute('/sessions')({
  component: RouteComponent,
})

function RouteComponent() {

  const navigate = useNavigate()

  return (
    <Page>
      <VerticalFrame>
        <div>
          <PageTitle>Sessions</PageTitle>
        </div>
        <div>
          <SessionList />
        </div>
        <div>
          <Button onClick={async () => {

            await signOut() // TODO handle error here

            // TODO for some reason we need to wait here, otherwise
            // the session won't be clear when we reload
            await new Promise<void>((res) => {
              setTimeout(() => {
                res()
              }, 500)
            })

            navigate({ to: '/' })
          }}>Log Out</Button>
        </div>
      </VerticalFrame>
    </Page>
  )
}
