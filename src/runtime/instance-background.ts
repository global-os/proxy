import { AsyncLocalStorage } from 'node:async_hooks'
import { ensureInstanceReady } from './instance-manager.js'

type VercelRequestContext = {
  waitUntil?: (promise: Promise<unknown>) => void
}

export const vercelContext = new AsyncLocalStorage<VercelRequestContext>()

const preparing = new Set<number>()

export function isInstancePrepareInFlight(instanceId: number): boolean {
  return preparing.has(instanceId)
}

export function scheduleInstancePrepare(instanceId: number): void {
  if (preparing.has(instanceId)) return

  preparing.add(instanceId)
  const work = ensureInstanceReady(instanceId)
    .catch((err) => {
      console.error(`[instance] prepare failed for ${instanceId}:`, err)
    })
    .finally(() => {
      preparing.delete(instanceId)
    })

  const ctx = vercelContext.getStore()
  if (ctx?.waitUntil) {
    ctx.waitUntil(work)
  } else {
    void work
  }
}