import type { MateriChapter, MateriSection } from "@/lib/materi/chapters";

/**
 * Convert a DOCX into interactive material chapters.
 *
 * Where `docx-converter` extracts just chapter/section titles for a quick
 * preview, this produces the full MateriChapter shape the reader renders —
 * chapters (h1/h2) containing sections (h3/h4) with paragraphs and bullets, each
 * section tagged with a display `variant`. That makes an uploaded document
 * render as cards/prose rather than a flat wall of text.
 *
 * The HTML→chapters step is pure (testable without a file); mammoth is imported
 * dynamically so it only loads when converting. Server-side.
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

/** ~180 words per minute, at least 1. */
function estimateMinutes(words: number): number {
  return Math.max(1, Math.round(words / 180));
}

interface DraftSection {
  heading: string;
  paragraphs: string[];
  bullets: string[];
}

interface DraftChapter {
  title: string;
  sections: DraftSection[];
}

/** Fold heading/paragraph/list HTML into interactive chapters. */
export function htmlToInteractiveChapters(html: string): MateriChapter[] {
  const drafts: DraftChapter[] = [];

  function currentChapter(): DraftChapter {
    if (drafts.length === 0) drafts.push({ title: "Materi", sections: [] });
    return drafts[drafts.length - 1];
  }

  function currentSection(): DraftSection {
    const chapter = currentChapter();
    if (chapter.sections.length === 0) {
      chapter.sections.push({ heading: "", paragraphs: [], bullets: [] });
    }
    return chapter.sections[chapter.sections.length - 1];
  }

  const blocks = html.matchAll(/<(h[1-4]|p|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi);
  for (const block of blocks) {
    const tag = block[1].toLowerCase();
    const inner = block[2];

    if (tag === "h1" || tag === "h2") {
      const title = stripTags(inner);
      if (title) drafts.push({ title, sections: [] });
    } else if (tag === "h3" || tag === "h4") {
      const heading = stripTags(inner);
      if (heading) {
        currentChapter().sections.push({
          heading,
          paragraphs: [],
          bullets: [],
        });
      }
    } else if (tag === "p") {
      const text = stripTags(inner);
      if (text) currentSection().paragraphs.push(text);
    } else {
      const bullets = [...inner.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
        .map((li) => stripTags(li[1]))
        .filter(Boolean);
      if (bullets.length > 0) currentSection().bullets.push(...bullets);
    }
  }

  return drafts.map((chapter, index) => {
    let words = 0;
    const sections: MateriSection[] = chapter.sections
      .filter((s) => s.heading || s.paragraphs.length || s.bullets.length)
      .map((section, sectionIndex) => {
        words +=
          section.paragraphs.join(" ").split(/\s+/).filter(Boolean).length +
          section.bullets.join(" ").split(/\s+/).filter(Boolean).length;
        // A list with no prose reads well as cards; otherwise prose.
        const variant =
          section.bullets.length > 0 && section.paragraphs.length === 0
            ? "cards"
            : "prose";
        return {
          id: slug(section.heading, `bagian-${sectionIndex + 1}`),
          heading: section.heading || chapter.title,
          variant,
          paragraphs: section.paragraphs.length ? section.paragraphs : undefined,
          bullets: section.bullets.length ? section.bullets : undefined,
        } satisfies MateriSection;
      });

    return {
      id: slug(chapter.title, `bab-${index + 1}`),
      order: index + 1,
      title: chapter.title,
      summary: sections[0]?.paragraphs?.[0]?.slice(0, 120) ?? "",
      minutes: estimateMinutes(words),
      sections,
    } satisfies MateriChapter;
  });
}

/** Read a DOCX File and convert it into interactive chapters (server-side). */
export async function convertDocxToMateri(file: File): Promise<MateriChapter[]> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
  return htmlToInteractiveChapters(html);
}
