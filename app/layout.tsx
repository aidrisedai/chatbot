import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeTutor — Learn to Code with AI",
  description:
    "A friendly AI chatbot that teaches you how to code, one step at a time.",
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
