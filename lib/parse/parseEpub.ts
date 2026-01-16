import JSZip from "jszip";

interface EpubMetadata {
  title: string;
  author?: string;
}

interface SpineItem {
  href: string;
  id: string;
}

/**
 * Parse an EPUB file and extract its text content.
 * EPUB files are ZIP archives containing HTML/XHTML documents.
 */
export async function parseEpub(file: File): Promise<string> {
  try {
    // Load the ZIP file
    const zip = await JSZip.loadAsync(file);

    // 1. Find the container.xml to locate the rootfile (content.opf)
    const containerXml = await zip.file("META-INF/container.xml")?.async("text");
    if (!containerXml) {
      throw new Error("Invalid EPUB: Missing container.xml");
    }

    // Parse container.xml to find content.opf path
    const rootfilePath = parseContainerXml(containerXml);
    if (!rootfilePath) {
      throw new Error("Invalid EPUB: Could not find rootfile path");
    }

    // Get the directory of the content.opf file
    const opfDir = rootfilePath.substring(0, rootfilePath.lastIndexOf("/") + 1);

    // 2. Read and parse content.opf
    const contentOpf = await zip.file(rootfilePath)?.async("text");
    if (!contentOpf) {
      throw new Error("Invalid EPUB: Missing content.opf");
    }

    // Parse spine (reading order) and manifest (file references)
    const { spine, manifest, metadata } = parseContentOpf(contentOpf);

    // 3. Extract text from each spine item in order
    const textParts: string[] = [];

    // Add title if available
    if (metadata.title) {
      textParts.push(`# ${metadata.title}\n`);
      if (metadata.author) {
        textParts.push(`By ${metadata.author}\n`);
      }
      textParts.push("\n---\n\n");
    }

    for (let i = 0; i < spine.length; i++) {
      const spineItem = spine[i];
      const manifestItem = manifest.get(spineItem.id);

      if (!manifestItem) continue;

      // Construct the full path to the content file
      const contentPath = opfDir + manifestItem.href;
      const contentFile = await zip.file(contentPath)?.async("text");

      if (contentFile) {
        const text = extractTextFromHtml(contentFile);
        if (text.trim()) {
          // Add chapter separator if not the first chapter
          if (textParts.length > (metadata.title ? 3 : 0)) {
            textParts.push("\n\n--- Chapter ---\n\n");
          }
          textParts.push(text);
        }
      }
    }

    const result = textParts.join("").trim();

    if (!result) {
      throw new Error("No readable text found in EPUB file.");
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to parse EPUB file.");
  }
}

/**
 * Parse container.xml to find the path to content.opf
 */
function parseContainerXml(xml: string): string | null {
  // Simple regex-based parsing for the rootfile path
  // Looking for: <rootfile full-path="..." media-type="application/oebps-package+xml"/>
  const match = xml.match(/full-path=["']([^"']+)["']/);
  return match ? match[1] : null;
}

/**
 * Parse content.opf to extract spine, manifest, and metadata
 */
function parseContentOpf(xml: string): {
  spine: SpineItem[];
  manifest: Map<string, { href: string; mediaType: string }>;
  metadata: EpubMetadata;
} {
  const spine: SpineItem[] = [];
  const manifest = new Map<string, { href: string; mediaType: string }>();
  const metadata: EpubMetadata = { title: "" };

  // Extract title
  const titleMatch = xml.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i);
  if (titleMatch) {
    metadata.title = decodeHtmlEntities(titleMatch[1].trim());
  }

  // Extract author
  const authorMatch = xml.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/i);
  if (authorMatch) {
    metadata.author = decodeHtmlEntities(authorMatch[1].trim());
  }

  // Parse manifest items
  // Looking for: <item id="..." href="..." media-type="..."/>
  const manifestRegex = /<item\s+([^>]+)\/?\s*>/gi;
  let manifestMatch;
  while ((manifestMatch = manifestRegex.exec(xml)) !== null) {
    const attrs = manifestMatch[1];
    const id = extractAttr(attrs, "id");
    const href = extractAttr(attrs, "href");
    const mediaType = extractAttr(attrs, "media-type");

    if (id && href) {
      manifest.set(id, {
        href: decodeURIComponent(href),
        mediaType: mediaType || "",
      });
    }
  }

  // Parse spine items
  // Looking for: <itemref idref="..."/>
  const spineRegex = /<itemref\s+([^>]+)\/?\s*>/gi;
  let spineMatch;
  while ((spineMatch = spineRegex.exec(xml)) !== null) {
    const attrs = spineMatch[1];
    const idref = extractAttr(attrs, "idref");
    if (idref) {
      spine.push({
        id: idref,
        href: manifest.get(idref)?.href || "",
      });
    }
  }

  return { spine, manifest, metadata };
}

/**
 * Extract an attribute value from an attribute string
 */
function extractAttr(attrs: string, name: string): string | null {
  const regex = new RegExp(`${name}=["']([^"']+)["']`, "i");
  const match = attrs.match(regex);
  return match ? match[1] : null;
}

/**
 * Extract readable text from HTML/XHTML content
 */
function extractTextFromHtml(html: string): string {
  // Remove script and style elements
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

  // Remove all HTML tags, converting certain tags to whitespace
  // Block elements should create paragraph breaks
  const blockElements = [
    "p",
    "div",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "li",
    "br",
    "hr",
    "blockquote",
    "pre",
    "section",
    "article",
  ];

  for (const tag of blockElements) {
    const regex = new RegExp(`<${tag}[^>]*>`, "gi");
    text = text.replace(regex, "\n");
    text = text.replace(new RegExp(`</${tag}>`, "gi"), "\n");
  }

  // Remove remaining HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode HTML entities
  text = decodeHtmlEntities(text);

  // Normalize whitespace
  text = text
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 0)
    .join("\n\n");

  return text;
}

/**
 * Decode common HTML entities
 */
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&apos;": "'",
    "&#39;": "'",
    "&mdash;": "—",
    "&ndash;": "–",
    "&hellip;": "...",
    "&ldquo;": '"',
    "&rdquo;": '"',
    "&lsquo;": "'",
    "&rsquo;": "'",
    "&copy;": "©",
    "&reg;": "®",
    "&trade;": "™",
    "&deg;": "°",
    "&bull;": "•",
  };

  let result = text;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replace(new RegExp(entity, "gi"), char);
  }

  // Decode numeric entities
  result = result.replace(/&#(\d+);/g, (_, num) =>
    String.fromCharCode(parseInt(num, 10))
  );
  result = result.replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );

  return result;
}

/**
 * Get metadata from an EPUB file without extracting full text
 */
export async function getEpubMetadata(file: File): Promise<EpubMetadata> {
  try {
    const zip = await JSZip.loadAsync(file);

    const containerXml = await zip.file("META-INF/container.xml")?.async("text");
    if (!containerXml) {
      return { title: file.name.replace(/\.epub$/i, "") };
    }

    const rootfilePath = parseContainerXml(containerXml);
    if (!rootfilePath) {
      return { title: file.name.replace(/\.epub$/i, "") };
    }

    const contentOpf = await zip.file(rootfilePath)?.async("text");
    if (!contentOpf) {
      return { title: file.name.replace(/\.epub$/i, "") };
    }

    const { metadata } = parseContentOpf(contentOpf);
    return metadata.title ? metadata : { title: file.name.replace(/\.epub$/i, "") };
  } catch {
    return { title: file.name.replace(/\.epub$/i, "") };
  }
}
