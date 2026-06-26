import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Page } from '../components/Page'
import { Workspace } from '../components/Workspace'
import { useSession } from '../lib/auth-client'

export const Route = createFileRoute('/session/$sessionId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { sessionId } = Route.useParams()
  const navigate = useNavigate()
  const { data: session, isPending } = useSession()

  useEffect(() => {
    if (!isPending && !session?.user) {
      navigate({ to: '/login' })
    }
  }, [isPending, session?.user, navigate])

  return (
    <Page>
      <Workspace sessionId={sessionId}>{{}}</Workspace>
    </Page>
  )
}