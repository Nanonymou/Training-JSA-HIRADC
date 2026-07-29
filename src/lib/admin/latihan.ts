import type { UploadStatus } from "@/lib/upload/types";

/**
 * Mock latihan submissions for the admin review screen.
 *
 * Shaped like the uploads table so the review list can be wired to the DB later
 * without changing the components. `previewKind` tells the preview whether a file
 * can be shown inline (PDF/image) or only downloaded (Office docs).
 */

export type PreviewKind = "pdf" | "image" | "unsupported";

export interface AdminUpload {
  id: string;
  pesertaNama: string;
  pesertaEmail: string;
  lokasi: string;
  fileName: string;
  fileExt: string;
  fileSize: number;
  url: string;
  status: UploadStatus;
  waktuUnggah: string;
  previewKind: PreviewKind;
}

export const ADMIN_UPLOADS: AdminUpload[] = [
  {
    id: "u-001",
    pesertaNama: "Budi Santoso",
    pesertaEmail: "budi@tpb.co.id",
    lokasi: "ABB",
    fileName: "JSA-Menggoreng-Budi.pdf",
    fileExt: "pdf",
    fileSize: 1_240_000,
    url: "/sample/jsa-menggoreng.pdf",
    status: "Pending",
    waktuUnggah: "2026-07-28T02:15:00.000Z",
    previewKind: "pdf",
  },
  {
    id: "u-002",
    pesertaNama: "Siti Aminah",
    pesertaEmail: "siti@tpb.co.id",
    lokasi: "TOP",
    fileName: "HIRADC-Kitchen-Siti.pdf",
    fileExt: "pdf",
    fileSize: 2_010_000,
    url: "/sample/jsa-menggoreng.pdf",
    status: "Disetujui",
    waktuUnggah: "2026-07-27T07:40:00.000Z",
    previewKind: "pdf",
  },
  {
    id: "u-003",
    pesertaNama: "Andi Wijaya",
    pesertaEmail: "andi@tpb.co.id",
    lokasi: "SSC",
    fileName: "Form-JSA-Housekeeping.jpg",
    fileExt: "jpg",
    fileSize: 890_000,
    url: "/sample/form-housekeeping.svg",
    status: "Perlu Revisi",
    waktuUnggah: "2026-07-27T03:05:00.000Z",
    previewKind: "image",
  },
  {
    id: "u-004",
    pesertaNama: "Dewi Lestari",
    pesertaEmail: "dewi@tpb.co.id",
    lokasi: "Pama Asmi",
    fileName: "HIRADC-Laundry-Dewi.xlsx",
    fileExt: "xlsx",
    fileSize: 540_000,
    url: "/sample/hiradc-laundry.xlsx",
    status: "Pending",
    waktuUnggah: "2026-07-26T09:20:00.000Z",
    previewKind: "unsupported",
  },
  {
    id: "u-005",
    pesertaNama: "Rudi Hartono",
    pesertaEmail: "rudi@tpb.co.id",
    lokasi: "SRTA",
    fileName: "JSA-Laundry-Rudi.docx",
    fileExt: "docx",
    fileSize: 320_000,
    url: "/sample/jsa-laundry.docx",
    status: "Ditolak",
    waktuUnggah: "2026-07-25T06:10:00.000Z",
    previewKind: "unsupported",
  },
];
