/** Evict extracted bundle after this idle period (instance record kept). */
export const INSTANCE_IDLE_MS = Number(process.env.INSTANCE_IDLE_MS ?? process.env.CONTAINER_IDLE_MS ?? 15 * 60 * 1000)

export const CLEANUP_INTERVAL_MS = Number(process.env.RUNTIME_CLEANUP_INTERVAL_MS ?? 60 * 1000)

export const INSTANCE_DOMAIN_SUFFIX =
  process.env.INSTANCE_DOMAIN_SUFFIX ??
  (process.env.NODE_ENV === 'production' ? 'app.onetrueos.com' : 'app.dev.onetrueos.com')

/** Origin used in iframe URLs (defaults to backend port 3000 in dev). */
export function instancePublicUrl(instanceId: number): string {
  if (process.env.INSTANCE_PUBLIC_ORIGIN) {
    return new URL(`${instanceId}.${INSTANCE_DOMAIN_SUFFIX}/`, process.env.INSTANCE_PUBLIC_ORIGIN).toString()
  }
  const protocol = process.env.INSTANCE_PUBLIC_PROTOCOL ?? (process.env.NODE_ENV === 'production' ? 'https' : 'http')
  const port = process.env.INSTANCE_PUBLIC_PORT ?? (process.env.NODE_ENV === 'production' ? '' : '3000')
  const portSuffix = port ? `:${port}` : ''
  return `${protocol}://${instanceId}.${INSTANCE_DOMAIN_SUFFIX}${portSuffix}/`
}