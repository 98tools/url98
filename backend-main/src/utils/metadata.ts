/**
 * Fetch and extract metadata (title, description) from a URL
 */
export interface UrlMetadata {
  title: string;
  description: string;
  image?: string;
  url: string;
}

/**
 * Extracts metadata from HTML content
 */
function extractMetadataFromHtml(html: string, requestedUrl: string): Partial<UrlMetadata> {
  const metadata: Partial<UrlMetadata> = {
    url: requestedUrl,
    title: '',
    description: '',
  };

  // Extract title from <title> tag
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    metadata.title = titleMatch[1].trim();
  }

  // Extract description from meta tags
  const descriptionMatch = html.match(
    /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i
  );
  if (descriptionMatch && descriptionMatch[1]) {
    metadata.description = descriptionMatch[1].trim();
  }

  // Try og:description if regular description not found
  if (!metadata.description) {
    const ogDescMatch = html.match(
      /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i
    );
    if (ogDescMatch && ogDescMatch[1]) {
      metadata.description = ogDescMatch[1].trim();
    }
  }

  // Extract image from og:image
  const ogImageMatch = html.match(
    /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i
  );
  if (ogImageMatch && ogImageMatch[1]) {
    metadata.image = ogImageMatch[1].trim();
  }

  // Get title from og:title if no title found
  if (!metadata.title) {
    const ogTitleMatch = html.match(
      /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i
    );
    if (ogTitleMatch && ogTitleMatch[1]) {
      metadata.title = ogTitleMatch[1].trim();
    }
  }

  return metadata;
}

/**
 * Fetches URL metadata from a given URL
 */
export async function fetchUrlMetadata(url: string): Promise<UrlMetadata> {
  try {
    // Validate URL format
    const urlObj = new URL(url);
    const requestedUrl = urlObj.toString();

    // Fetch the URL with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(requestedUrl, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Only process HTML content
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return {
        url: requestedUrl,
        title: urlObj.hostname || 'Untitled',
        description: 'Content is not HTML',
      };
    }

    // Read response as text (limit to first 1MB to avoid large files)
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > 1024 * 1024) {
      // If larger than 1MB, only use first 1MB
      const html = new TextDecoder().decode(buffer.slice(0, 1024 * 1024));
      return {
        ...extractMetadataFromHtml(html, requestedUrl),
        url: requestedUrl,
      };
    }

    const html = new TextDecoder().decode(buffer);
    return {
      ...extractMetadataFromHtml(html, requestedUrl),
      url: requestedUrl,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Return basic metadata on error
    try {
      const urlObj = new URL(url);
      return {
        url: urlObj.toString(),
        title: urlObj.hostname || 'Untitled',
        description: `Error fetching metadata: ${errorMessage}`,
      };
    } catch {
      return {
        url,
        title: 'Invalid URL',
        description: 'Could not parse or fetch the URL',
      };
    }
  }
}
