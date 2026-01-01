import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { RendererProvider } from 'react-fela'

import createRenderer from '../lib/renderer'
import { AnimationContext } from '../contexts/animation'

const createRenderResult = createRenderer()

export const Route = createRootRoute({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <RendererProvider renderer={createRenderResult.renderer}>
      <AnimationContext value={createRenderResult.animations}>
        <Outlet />
        <TanStackRouterDevtools />
      </AnimationContext>
    </RendererProvider>
  )
}
