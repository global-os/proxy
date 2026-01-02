import { createFileRoute } from '@tanstack/react-router'
import { VerticalFrame } from '../components/VerticalFrame'
import { Page } from '../components/Page'
import { PageTitle } from '../components/PageTitle'

export const Route = createFileRoute('/sessions')({
  component: RouteComponent,
})

function RouteComponent() {

  return (
    <Page>
      <VerticalFrame>
        <div>
          <PageTitle>Sessions</PageTitle>
        </div>
      </VerticalFrame>
    </Page>
  )
}
