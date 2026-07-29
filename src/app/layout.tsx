import type { Metadata } from "next";

import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "Training JSA & HIRADC — PT Tiga Persada Benua",
  description:
    "Portal pelatihan interaktif Penyusunan dan Pengisian JSA & HIRADC untuk Tim QHSE PT Tiga Persada Benua.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
