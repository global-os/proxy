import { createRootRoute,  Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { RendererProvider } from 'react-fela'

import createRenderer from '../lib/renderer'

const renderer = createRenderer()

export const Route = createRootRoute({
  component: RouteComponent,
})

function RouteComponent() {

  return (
    <RendererProvider renderer={renderer}>
      <Outlet />
      <TanStackRouterDevtools />
    </RendererProvider>
  )
}
