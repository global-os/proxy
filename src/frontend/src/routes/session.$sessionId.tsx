import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Page } from '../components/Page'

export const Route = createFileRoute('/session/$sessionId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { sessionId } = Route.useParams()
  const _navigate = useNavigate()

  return (
    <Page>
        Here is a session #{sessionId}
    </Page>
  )
}
