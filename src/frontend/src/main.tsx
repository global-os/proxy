console.log('🚀 Main.tsx executing');

import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

import './index.css'

console.log('main.tsx')

const router = createRouter({
  routeTree,
  defaultNotFoundComponent: () => {
    return <div>Could not find page</div>
  },
  defaultErrorComponent: () => {
    return <div>error comp</div>
  }
})

console.log('Registered routes:', router.routeTree)
console.log('Current location:', window.location.pathname)

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.body
const root = ReactDOM.createRoot(rootElement)
root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
