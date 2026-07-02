import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";

const pixel = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel-raw",
  display: "swap",
});

const bodyFont = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-body-raw",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CodeQuest — Learn to Code by Playing",
  description:
    "A coding game with bite-sized challenges and a Prodigy-style adventure mode. Learn by doing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${pixel.variable} ${bodyFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
