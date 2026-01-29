export const replaceDomainInHTML = (
  html: string,
  oldDomain: string,
  newDomain: string,
  isLocal: boolean
): string => {
  return html
}

// Helper function to replace domain in URL
const makeReplaceURL =
  (oldDomain: string, newDomain: string, isLocal: boolean) =>
  (url: string): string => {
    if (!url) return url

    try {
      // Handle protocol-relative URLs
      if (url.startsWith('//')) {
        return url.replace(new RegExp(`//${oldDomain}`, 'gi'), `//${newDomain}`)
      }

      // Handle relative URLs (no protocol)
      let urlObj
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        // Try with https first as fallback base
        urlObj = new URL(url, `https://${oldDomain}`)
      } else {
        // Parse absolute URLs directly
        urlObj = new URL(url)
      }

      console.log(
        'old urlobj.hostname',
        urlObj.host,
        'vs',
        oldDomain,
        '->',
        newDomain
      )

      // Replace hostname if it matches (preserves original protocol)
      if (urlObj.host.toLowerCase() === oldDomain.toLowerCase()) {
        urlObj.host = newDomain
        console.log('set it', urlObj)
      }

      if (isLocal) {
        urlObj.protocol = 'http'
      }

      console.log('result', urlObj)
      return urlObj.toString()
    } catch (e) {
      // If URL parsing fails, try simple string replacement
      return url.replace(new RegExp(oldDomain, 'gi'), newDomain)
    }
  }
