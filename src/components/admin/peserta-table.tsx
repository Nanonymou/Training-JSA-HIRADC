import {
  PESERTA_RECORDS,
  type PesertaRecord,
  type QuizStatus,
  type UploadState,
} from "@/lib/admin/peserta";
import { cn } from "@/lib/utils";

const QUIZ_STYLE: Record<QuizStatus, string> = {
  Lulus: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  "Belum Lulus": "bg-destructive/15 text-destructive",
  "Belum Ikut": "bg-muted text-muted-foreground",
};

const UPLOAD_STYLE: Record<UploadState, string> = {
  Terkirim: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Belum: "bg-muted text-muted-foreground",
};

function Badge({ className, children }: { className: string; children: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        className,
      )}
    >
      {children}
    </span>
  );
}

function formatTanggal(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

/**
 * The Data Peserta table.
 *
 * One row per peserta: who and where, their quiz outcome (with score) and upload
 * state, and when they attended. Scrolls horizontally on narrow screens so the
 * columns stay readable rather than wrapping. Runs on mock data; filters and
 * export come in later tasks.
 */
export function PesertaTable({
  rows = PESERTA_RECORDS,
}: {
  rows?: PesertaRecord[];
}) {
  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[42rem] text-sm">
          <thead>
            <tr className="border-border text-muted-foreground border-b text-left text-xs">
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Lokasi</th>
              <th className="px-4 py-3 font-medium">Status Quiz</th>
              <th className="px-4 py-3 font-medium">Upload</th>
              <th className="px-4 py-3 font-medium">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-muted-foreground px-4 py-12 text-center"
                >
                  Tidak ada peserta yang cocok.
                </td>
              </tr>
            ) : (
              rows.map((peserta) => (
                <tr
                  key={peserta.id}
                  className="border-border/60 border-b last:border-0"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{peserta.nama}</p>
                    <p className="text-muted-foreground text-xs">
                      {peserta.jabatan} · {peserta.email}
                    </p>
                  </td>
                  <td className="px-4 py-3">{peserta.lokasi}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Badge className={QUIZ_STYLE[peserta.quizStatus]}>
                        {peserta.quizStatus}
                      </Badge>
                      {peserta.quizScore !== null && (
                        <span className="text-muted-foreground text-xs tabular-nums">
                          {peserta.quizScore}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={UPLOAD_STYLE[peserta.uploadStatus]}>
                      {peserta.uploadStatus}
                    </Badge>
                  </td>
                  <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                    {formatTanggal(peserta.waktuHadir)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
