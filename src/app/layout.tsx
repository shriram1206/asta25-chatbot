import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "ASTA'25 - National Technical Symposium",
  description: 'Smart assistant for ASTA\'25 at Selvam College of Technology - Oct 24, 2025',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
