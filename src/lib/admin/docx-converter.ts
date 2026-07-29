import type { ConvertedChapter } from "@/lib/admin/cms-materi";

/**
 * Convert a training DOCX into the interactive chapter structure.
 *
 * mammoth turns the DOCX into semantic HTML (headings + paragraphs); the pure
 * `chaptersFromHtml` then folds that into chapters and sections by heading level:
 * h1/h2 open a chapter, h3/h4 add a section under it. Keeping the HTML→chapters
 * step pure makes it testable without a real file, and lets the conversion run
 * client-side (mammoth is imported dynamically only when a file is converted).
 */

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slug(text: string, fallback: string): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || fallback;
}

/** Fold heading-structured HTML into chapters (h1/h2) and sections (h3/h4). */
export function chaptersFromHtml(html: string): ConvertedChapter[] {
  const chapters: ConvertedChapter[] = [];
  const headings = [...html.matchAll(/<(h[1-4])[^>]*>([\s\S]*?)<\/\1>/gi)];

  for (const match of headings) {
    const level = Number(match[1][1]);
    const text = stripTags(match[2]);
    if (!text) continue;

    if (level <= 2) {
      chapters.push({
        id: slug(text, `bab-${chapters.length + 1}`),
        title: text,
        sections: [],
      });
    } else {
      if (chapters.length === 0) {
        chapters.push({ id: "bab-1", title: "Materi", sections: [] });
      }
      chapters[chapters.length - 1].sections.push(text);
    }
  }

  return chapters;
}

/** Read a DOCX File and convert it to chapters (client-side). */
export async function convertDocxFile(file: File): Promise<ConvertedChapter[]> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
  return chaptersFromHtml(html);
}
