import type { Context } from 'hono'
import type { HttpBindings } from '@hono/node-server'
import type { IncomingMessage } from 'node:http'

type IncomingWithRawBody = IncomingMessage & { rawBody?: Buffer }

async function bufferIncoming(
  incoming: IncomingWithRawBody,
  timeoutMs: number,
): Promise<Buffer> {
  if (incoming.rawBody instanceof Buffer) {
    return incoming.rawBody
  }

  if (incoming.readableEnded) {
    return Buffer.alloc(0)
  }

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    const timeout = setTimeout(() => {
      cleanup()
      reject(new Error(`Incoming body read timed out after ${timeoutMs}ms`))
    }, timeoutMs)

    const onData = (chunk: Buffer) => chunks.push(chunk)
    const onEnd = () => {
      cleanup()
      resolve(Buffer.concat(chunks))
    }
    const onError = (err: Error) => {
      cleanup()
      reject(err)
    }

    const cleanup = () => {
      clearTimeout(timeout)
      incoming.off('data', onData)
      incoming.off('end', onEnd)
      incoming.off('error', onError)
    }

    incoming.on('data', onData)
    incoming.on('end', onEnd)
    incoming.on('error', onError)
    incoming.resume()
  })
}

export async function readRequestBody(c: Context, timeoutMs = 5_000): Promise<Buffer> {
  const incoming = (c.env as HttpBindings | undefined)?.incoming as IncomingWithRawBody | undefined
  if (incoming && c.req.method !== 'GET' && c.req.method !== 'HEAD') {
    try {
      return await bufferIncoming(incoming, timeoutMs)
    } catch (err) {
      console.warn('[read-body] incoming read failed, falling back to Request:', err)
    }
  }

  const body = await Promise.race([
    c.req.arrayBuffer(),
    new Promise<ArrayBuffer>((_, reject) =>
      setTimeout(() => reject(new Error(`Request body read timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ])
  return Buffer.from(body)
}

export async function buildBufferedRequest(c: Context): Promise<Request> {
  const headers = new Headers(c.req.raw.headers)
  const method = c.req.method

  if (method === 'GET' || method === 'HEAD') {
    return new Request(c.req.url, { method, headers })
  }

  const body = await readRequestBody(c)
  if (body.length === 0) {
    return new Request(c.req.url, { method, headers })
  }

  return new Request(c.req.url, { method, headers, body: new Uint8Array(body) })
}