export function instanceSlugFromHostname(hostname: string): string {
  return hostname.split('.')[0]
}

export function stripInstancePrefix(pathname: string, slug: string): string {
  const prefix = `/instance/${slug}`
  if (pathname === prefix || pathname === `${prefix}/`) return '/'
  if (pathname.startsWith(`${prefix}/`)) {
    const rest = pathname.slice(prefix.length)
    return rest.startsWith('/') ? rest : `/${rest}`
  }
  return pathname
}