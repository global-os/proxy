const { JSDOM } = require('jsdom')

export const replaceDomainInHTML = (
  html: string,
  oldDomain: string,
  newDomain: string,
  isLocal: boolean
): string => {
  try {
    console.log('about to parse', html)
    // JSDOM handles malformed HTML gracefully
    const dom = new JSDOM(html, {
      includeNodeLocations: false,
      storageQuota: 10000000,
    })

    const doc = dom.window.document

    const replaceURL = makeReplaceURL(oldDomain, newDomain, isLocal)

    // Replace in <a> tags
    doc.querySelectorAll('a[href]').forEach((el: HTMLAnchorElement) => {
      console.log(
        'replacing LINK',
        oldDomain,
        'with',
        newDomain,
        'text',
        el.outerHTML
      )
      el.href = replaceURL(el.href)
    })

    // Replace in <link> tags (stylesheets, icons, etc.)
    doc.querySelectorAll('link[href]').forEach((el: HTMLLinkElement) => {
      el.href = replaceURL(el.href)
    })

    // Replace in <script> tags
    doc.querySelectorAll('script[src]').forEach((el: HTMLScriptElement) => {
      el.src = replaceURL(el.src)
    })

    // Replace in <img> tags
    doc.querySelectorAll('img[src]').forEach((el: HTMLImageElement) => {
      el.src = replaceURL(el.src)
    })

    // Replace in <source> tags (video/audio)
    doc.querySelectorAll('source[src]').forEach((el: HTMLSourceElement) => {
      el.src = replaceURL(el.src)
    })

    // Replace in <iframe> tags
    doc.querySelectorAll('iframe[src]').forEach((el: HTMLIFrameElement) => {
      el.src = replaceURL(el.src)
    })

    // Replace in <form> tags
    doc.querySelectorAll('form[action]').forEach((el: HTMLFormElement) => {
      el.action = replaceURL(el.action)
    })

    // Replace in meta tags (og:image, og:url, canonical, etc.)
    doc.querySelectorAll('meta[content]').forEach((el: HTMLMetaElement) => {
      const content = el.getAttribute('content')
      if (content && (content.includes('http') || content.includes('//'))) {
        el.setAttribute('content', replaceURL(content))
      }
    })

    // Replace in meta refresh tags
    doc
      .querySelectorAll('meta[http-equiv="refresh"]')
      .forEach((el: HTMLMetaElement) => {
        const content = el.getAttribute('content')
        if (content) {
          el.setAttribute(
            'content',
            content.replace(new RegExp(oldDomain, 'gi'), newDomain)
          )
        }
      })

    // Replace in style attributes
    doc.querySelectorAll('[style]').forEach((el: HTMLStyleElement) => {
      const style = el.getAttribute('style')
      if (style && style.includes(oldDomain)) {
        el.setAttribute(
          'style',
          style.replace(new RegExp(oldDomain, 'gi'), newDomain)
        )
      }
    })

    // Replace in inline <style> tags
    doc.querySelectorAll('style').forEach((el: HTMLStyleElement) => {
      if (el.textContent.includes(oldDomain)) {
        el.textContent = el.textContent.replace(
          new RegExp(oldDomain, 'gi'),
          newDomain
        )
      }
    })

    // Replace in inline <script> tags
    doc
      .querySelectorAll('script:not([src])')
      .forEach((el: HTMLScriptElement) => {
        if (el.textContent.includes(oldDomain)) {
          el.textContent = el.textContent.replace(
            new RegExp(oldDomain, 'gi'),
            newDomain
          )
        }
      })

    return dom.serialize()
  } catch (error) {
    console.error('Error parsing HTML:', error)

    // Fallback: regex-based replacement if DOM parsing fails completely
    return html.replace(new RegExp(oldDomain, 'gi'), newDomain)
  }
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
        console.log('parsing3', url)
        urlObj = new URL(url, `https://${oldDomain}`)
      } else {
        // Parse absolute URLs directly
        console.log('parsing4', url)
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
