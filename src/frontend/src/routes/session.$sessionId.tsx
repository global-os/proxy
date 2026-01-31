import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Page } from '../components/Page'
import { Workspace, WorkspaceActions } from '../components/Workspace'

export const Route = createFileRoute('/session/$sessionId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { sessionId } = Route.useParams()
  const _navigate = useNavigate()

  return (
    <Page>
      <Workspace>
        {{
          onStartup: (actions: WorkspaceActions) => {
            actions.openWindow({
              title: 'Foo',

              width: 300,
              height: 300,

              x: 0,
              y: 0,
            })
          },
        }}
      </Workspace>
    </Page>
  )
}
