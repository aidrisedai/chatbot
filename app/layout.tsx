import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeQuest — Learn to Code by Playing",
  description:
    "A coding game with bite-sized challenges: multiple choice, predict-the-output, fill-in-the-blank, and find-the-error. Learn by doing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
