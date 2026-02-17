interface BookmarkMetadata {
  title: string | null
  imageUrl: string | null
}

export default class BookmarkMetadataService {
  private readonly timeout = 5000

  async fetch(url: string): Promise<BookmarkMetadata> {
    try {
      new URL(url) // validates URL
    } catch {
      return { title: null, imageUrl: null }
    }

    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), this.timeout)

      const response = await globalThis.fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TooDooBot/1.0; +https://github.com/toodoo)',
          'Accept': 'text/html,application/xhtml+xml',
        },
      })

      clearTimeout(timer)

      if (!response.ok) {
        return { title: null, imageUrl: this.faviconUrl(url) }
      }

      const contentType = response.headers.get('content-type') ?? ''
      if (!contentType.includes('text/html')) {
        return { title: null, imageUrl: this.faviconUrl(url) }
      }

      const html = await response.text()
      const title = this.extractTitle(html)
      const ogImage = this.extractOgImage(html, url)

      return { title, imageUrl: ogImage ?? this.faviconUrl(url) }
    } catch {
      return { title: null, imageUrl: this.faviconUrl(url) }
    }
  }

  private extractTitle(html: string): string | null {
    // Try og:title first (two attribute orders)
    const ogTitle =
      html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']{1,500})["']/i)?.[1] ??
      html.match(/<meta[^>]+content=["']([^"']{1,500})["'][^>]+property=["']og:title["']/i)?.[1]

    if (ogTitle) return ogTitle.trim()

    // Fallback to <title>
    const titleTag = html.match(/<title[^>]*>([^<]{1,500})<\/title>/i)?.[1]
    return titleTag ? titleTag.trim() : null
  }

  private extractOgImage(html: string, baseUrl: string): string | null {
    const match =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1]

    if (!match) return null

    try {
      // Resolve relative URLs
      return new URL(match.trim(), baseUrl).href
    } catch {
      return null
    }
  }

  private faviconUrl(url: string): string {
    try {
      const { hostname } = new URL(url)
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
    } catch {
      return ''
    }
  }
}
