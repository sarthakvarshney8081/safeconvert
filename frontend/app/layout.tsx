import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/ui/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SafeConverts - Self-Hosted File Tools',
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
        <footer style={{ background: '#fff', borderTop: '1px solid #eee', color: '#666', marginTop: 'auto' }}>
          <div className="container" style={{ padding: '40px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
            {/* Branding Column */}
            <div>
              <h3 style={{ marginBottom: '15px', color: '#333' }}>SafeConverts</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                Privacy-first, open-source file manipulation tools running entirely on your own infrastructure.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{ marginBottom: '15px', color: '#333', fontSize: '1rem' }}>Tools</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><a href="/tools/merge-pdf">Merge PDF</a></li>
                <li><a href="/tools/compress-image">Compress Image</a></li>
                <li><a href="/workflow">Workflows</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 style={{ marginBottom: '15px', color: '#333', fontSize: '1rem' }}>Legal</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><a href="/about">About Us</a></li>
                <li><a href="/privacy">Privacy Policy</a></li>
                <li><a href="https://github.com/sarthakvarshney8081/safeconvert">GitHub</a></li>
              </ul>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #eee', padding: '20px', textAlign: 'center', fontSize: '0.85rem' }}>
            <div className="container">
              © {new Date().getFullYear()} <a href="https://SafeConverts.com" style={{ textDecoration: 'none', color: 'inherit' }}>SafeConverts.com</a>. Secure, Private, and Open Source.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
