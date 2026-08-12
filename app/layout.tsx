import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Candle Manufacturing OS",
  description: "Auditable inventory, production, purchasing, costing and lot traceability for candle makers.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
