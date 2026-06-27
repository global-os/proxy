import { useEffect, useMemo, useRef } from 'react'
import type { AppWindow } from '../components/Workspace/types'
import { SessionKernel, type KernelWindowBinding } from './session-kernel'

export function useSessionKernel(sessionId: string) {
  const kernel = useMemo(() => new SessionKernel(sessionId), [sessionId])
  const bindingsRef = useRef(new Map<number, KernelWindowBinding>())

  useEffect(() => {
    const onMessage = (event: MessageEvent) => kernel.handleMessage(event)
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [kernel])

  useEffect(() => {
    for (const binding of bindingsRef.current.values()) {
      kernel.register(binding)
    }
  }, [kernel])

  const bindWindow = (win: AppWindow, iframe: HTMLIFrameElement | null) => {
    if (!iframe) {
      bindingsRef.current.delete(win.id)
      kernel.unregister(win.id)
      return
    }

    const binding: KernelWindowBinding = {
      sessionId,
      windowId: win.id,
      processId: win.processId ?? 0,
      instanceId: win.instanceId ?? 0,
      bundleName: win.bundleName ?? `${win.title}.gapp`,
      title: win.title,
      iframe,
    }

    bindingsRef.current.set(win.id, binding)
    kernel.register(binding)
  }

  return { bindWindow }
}