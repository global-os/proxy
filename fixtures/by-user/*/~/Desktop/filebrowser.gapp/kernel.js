// Parent kernel bridge — postMessage activates platform syscalls (POST /api/syscalls):
//   fs:browse  -> fs.browse  -> fs:browse:complete  | fs:browse:error
//   fs:mkdir   -> fs.mkdir   -> fs:mkdir:complete   | fs:mkdir:error
//   fs:rename  -> fs.rename  -> fs:rename:complete  | fs:rename:error
//   fs:delete  -> fs.delete  -> fs:delete:complete  | fs:delete:error

const pending = new Map()
let nextRequestId = 0

export function toParent(type, payload = {}) {
  const requestId = `${type}-${++nextRequestId}`
  return new Promise((resolve, reject) => {
    pending.set(requestId, { resolve, reject })
    window.parent.postMessage({ type, requestId, ...payload }, '*')
  })
}

window.addEventListener('message', (event) => {
  const data = event.data
  if (!data || typeof data.type !== 'string') return
  if (!data.type.endsWith(':complete') && !data.type.endsWith(':error')) return

  const requestId = typeof data.requestId === 'string' ? data.requestId : null
  const handlers = requestId
    ? pending.get(requestId)
    : pending.get(data.type.slice(0, data.type.lastIndexOf(':')))
  if (!handlers) return

  if (requestId) pending.delete(requestId)
  if (data.type.endsWith(':complete')) {
    handlers.resolve(data.result ?? data)
  } else {
    handlers.reject(new Error(data.message || 'Request failed'))
  }
})