const hostsToRegex = (hostPatterns: string[]): RegExp => {
  let combinedRegex = '(' + hostPatterns.join('|') + ')'
  return new RegExp(combinedRegex)
}

const removeLeadingSlash = (path: string): string => {
  return path.replace(/^\/+/, '')
}

export const pathFromHostnameAndPath = (
  hostname: string,
  path: string
): string => {
  console.log('reslving', hostname, path)
  if ('localhost' === hostname) {
    return path
  }

  const matches = hostname.match(
    /^((?:[a-z0-9])+)\.app(?:\.dev)?\.onetrueos\.com$/
  )
  if (matches) {
    const subdomain = matches[1]
    if (subdomain === 'app') {
      console.log('matches app!')
      if (path.startsWith('/static/')) {
        return path
      }
      return '/app/' + removeLeadingSlash(path)
    }
    return '/instance/' + subdomain + '/' + removeLeadingSlash(path)
  } else {
    const matches = hostname.match(/^app\.(?:dev\.)?onetrueos\.com$/)
    if (matches) {
      return '/app/' + removeLeadingSlash(path)
    }
  }

  throw new Error('unrecognized domain')
}
