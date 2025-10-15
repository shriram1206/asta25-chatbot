import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "ASTA'25 - National Technical Symposium",
  description: 'Smart assistant for ASTA\'25 at Selvam College of Technology - Oct 24, 2025. Get event info, schedules, results & more!',
  keywords: ['ASTA 2025', 'Technical Symposium', 'Selvam College', 'College Events', 'National Symposium'],
  authors: [{ name: 'Department of CSE, Selvam College of Technology' }],
  openGraph: {
    title: "ASTA'25 - National Technical Symposium",
    description: 'Smart assistant for ASTA\'25 at Selvam College of Technology - Oct 24, 2025',
    type: 'website',
  },
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
