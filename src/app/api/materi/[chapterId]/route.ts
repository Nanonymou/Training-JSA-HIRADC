import { NextResponse } from "next/server";

import { getMateriChapter } from "@/lib/materi/repository";

/**
 * GET /api/materi/[chapterId] — a single chapter's structure and content, or a
 * 404 when the id is unknown. Lets a client fetch just one bab without pulling
 * the whole material.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ chapterId: string }> },
) {
  const { chapterId } = await context.params;
  const chapter = await getMateriChapter(chapterId);

  if (!chapter) {
    return NextResponse.json(
      { error: "Bab tidak ditemukan" },
      { status: 404 },
    );
  }

  return NextResponse.json(chapter);
}
