import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luriq Cake & Cookies",
  description: "Cookies premium dari Gorontalo, dibuat dengan cinta.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
