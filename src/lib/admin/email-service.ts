import type { EmailContent } from "@/lib/admin/email-template";

/**
 * Notification email sending service.
 *
 * Renders an EmailContent (subject + paragraphs) into a branded HTML layout and
 * a plain-text alternative, then sends it. Delivery goes through Resend's HTTP
 * API when `RESEND_API_KEY` is configured; without one it simulates a send so
 * the review flow works in dev (flagged `dev: true`, same seed-fallback pattern
 * as the repositories). The result carries the status to store on the upload row
 * (Terkirim / Gagal) and when it was sent. Server-only.
 */

const BRAND = "Training JSA & HIRADC";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Wrap the email paragraphs in a simple, inline-styled HTML layout. */
export function renderEmailHtml(content: EmailContent): string {
  const paragraphs = content.body
    .map(
      (line) =>
        `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#1f2937;">${escapeHtml(
          line,
        )}</p>`,
    )
    .join("");

  return `<!doctype html>
<html lang="id">
<body style="margin:0;padding:24px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
<tr><td style="background:#7c3aed;padding:20px 24px;">
<span style="color:#ffffff;font-size:16px;font-weight:bold;">${escapeHtml(BRAND)}</span>
</td></tr>
<tr><td style="padding:24px;">${paragraphs}</td></tr>
<tr><td style="padding:16px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;">
<span style="font-size:12px;color:#6b7280;">Email otomatis — mohon tidak membalas pesan ini.</span>
</td></tr>
</table>
</body>
</html>`;
}

/** Plain-text alternative for clients that don't render HTML. */
export function renderEmailText(content: EmailContent): string {
  return content.body.join("\n\n");
}

export interface EmailSendResult {
  status: "Terkirim" | "Gagal";
  sentAt: Date | null;
  /** True when no provider was configured and the send was simulated. */
  dev: boolean;
  error?: string;
}

export interface SendEmailInput {
  to: string;
  content: EmailContent;
}

export async function sendReviewEmail(
  input: SendEmailInput,
): Promise<EmailSendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "no-reply@training-jsa-hiradc.local";

  // No provider configured: simulate a successful send for the dev flow.
  if (!apiKey) {
    return { status: "Terkirim", sentAt: new Date(), dev: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: input.to,
        subject: input.content.subject,
        html: renderEmailHtml(input.content),
        text: renderEmailText(input.content),
      }),
    });

    if (!res.ok) {
      return {
        status: "Gagal",
        sentAt: null,
        dev: false,
        error: `Provider ${res.status}`,
      };
    }

    return { status: "Terkirim", sentAt: new Date(), dev: false };
  } catch (error) {
    return {
      status: "Gagal",
      sentAt: null,
      dev: false,
      error: error instanceof Error ? error.message : "Kesalahan jaringan",
    };
  }
}
