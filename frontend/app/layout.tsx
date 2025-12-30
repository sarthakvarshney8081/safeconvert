import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/ui/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SafeConvert - Self-Hosted File Tools',
  description: 'Privacy-focused file conversion and manipulation tools.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main style={{ flex: 1, paddingBottom: 40 }}>
          {children}
        </main>
        <footer style={{ background: '#fff', padding: '20px 0', borderTop: '1px solid #eee', textAlign: 'center', color: '#666' }}>
          <div className="container">
            © {new Date().getFullYear()} SafeConvert. Run locally, keep data private.
          </div>
        </footer>
      </body>
    </html>
  );
}
