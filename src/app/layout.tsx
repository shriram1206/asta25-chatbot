import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/utils/themeContext';

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('asta-theme') || 
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  document.documentElement.classList.toggle('dark', theme === 'dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
