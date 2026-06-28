import { AsyncLocalStorage } from 'node:async_hooks'
import { ensureInstanceReady } from './manager.js'

type VercelRequestContext = {
  waitUntil?: (promise: Promise<unknown>) => void
}

export const vercelContext = new AsyncLocalStorage<VercelRequestContext>()

export function scheduleInstancePrepare(instanceId: number): void {
  const work = ensureInstanceReady(instanceId).catch((err) => {
    console.error(`[instance] prepare failed for ${instanceId}:`, err)
  })

  const ctx = vercelContext.getStore()
  if (ctx?.waitUntil) {
    ctx.waitUntil(work)
  } else {
    void work
  }
}