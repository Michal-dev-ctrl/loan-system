import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "מערכת השכרת ציוד לאירועים",
  description:
    "גמ\"ח אור לכלה שמחת \"יום טוב\" – מערכת לניהול השכרת ציוד לאירועים, פיקדון ותרומה.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

