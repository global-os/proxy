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
  // Extract hostname without port
  const hostWithoutPort = hostname.split(':')[0];
  
  // Local development - prefix with /app
  if (hostWithoutPort === 'localhost' || hostWithoutPort === '127.0.0.1') {
    return path.startsWith('/app/') || path.startsWith('/instance/') 
      ? path 
      : '/app' + path;
  }
  
  // Already prefixed - return as-is
  if (path.startsWith('/app/') || path.startsWith('/static/') || path.startsWith('/instance/')) {
    return path;
  }
  
  // Instance subdomain: subdomain.app.dev.onetrueos.com
  const instanceMatch = hostWithoutPort.match(/^([a-z0-9]+)\.app(?:\.dev)?\.onetrueos\.com$/);
  if (instanceMatch && instanceMatch[1] !== 'app') {
    return '/instance/' + instanceMatch[1] + '/' + removeLeadingSlash(path);
  }
  
  // App subdomain or main domain - prefix with /app
  if (hostWithoutPort.match(/^(?:app\.)?(?:dev\.)?onetrueos\.com$/)) {
    return '/app/' + removeLeadingSlash(path);
  }
  
  throw new Error('unrecognized domain: ' + hostname);
}