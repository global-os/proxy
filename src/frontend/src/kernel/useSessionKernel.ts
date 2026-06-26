import { useEffect, useRef } from 'react'
import type { AppWindow } from '../components/Workspace/types'
import { SessionKernel } from './session-kernel'

export function useSessionKernel(sessionId: string) {
  const kernelRef = useRef<SessionKernel | null>(null)
  const iframeRefs = useRef(new Map<number, HTMLIFrameElement>())

  useEffect(() => {
    kernelRef.current = new SessionKernel(sessionId)
    return () => {
      kernelRef.current = null
    }
  }, [sessionId])

  useEffect(() => {
    const kernel = kernelRef.current
    if (!kernel) return
    const onMessage = (event: MessageEvent) => kernel.handleMessage(event)
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [sessionId])

  const bindWindow = (win: AppWindow, iframe: HTMLIFrameElement | null) => {
    const kernel = kernelRef.current
    if (!kernel) return
    if (!iframe) {
      iframeRefs.current.delete(win.id)
      kernel.unregister(win.id)
      return
    }

    iframeRefs.current.set(win.id, iframe)
    kernel.register({
      sessionId,
      windowId: win.id,
      processId: win.processId ?? 0,
      instanceId: win.instanceId ?? 0,
      bundleName: win.bundleName ?? `${win.title}.gapp`,
      title: win.title,
      iframe,
    })
  }

  return { bindWindow }
}