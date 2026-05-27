import type { Metadata } from "next";
import { Inter, Cardo } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cardo = Cardo({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-cardo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Marketing · Inger Marie",
  description: "Marketing dashboard for psykoterapeut.net",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da" className={`${inter.variable} ${cardo.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
