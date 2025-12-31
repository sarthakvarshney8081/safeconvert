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
              <div style={{ marginBottom: '15px' }}>
                <img src="/logo.svg" alt="SafeConverts" style={{ height: '40px', maxWidth: '100%' }} />
              </div>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                Premium tools for privacy-conscious users.
              </p>
            </div>

            {/* PDF Tools */}
            <div>
              <h4 style={{ marginBottom: '15px', color: '#333', fontSize: '1rem' }}>PDF Tools</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><a href="/tools/merge-pdf">Merge PDF</a></li>
                <li><a href="/tools/compress-pdf">Compress PDF</a></li>
                <li><a href="/tools/pdf-to-word">PDF to Word</a></li>
                <li><a href="/tools/pdf-to-excel">PDF to Excel</a></li>
              </ul>
            </div>

            {/* Edit Tools */}
            <div>
              <h4 style={{ marginBottom: '15px', color: '#333', fontSize: '1rem' }}>Edit Tools</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><a href="/tools/page-numbers">Page Numbers</a></li>
                <li><a href="/tools/crop-pdf">Crop PDF</a></li>
                <li><a href="/tools/rotate-pdf">Rotate PDF</a></li>
              </ul>
            </div>

            {/* Image Tools */}
            <div>
              <h4 style={{ marginBottom: '15px', color: '#333', fontSize: '1rem' }}>Image Tools</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><a href="/tools/compress-image">Compress Image</a></li>
                <li><a href="/tools/image-to-pdf">Image to PDF</a></li>
                <li><a href="/tools/convert-image">Convert Image</a></li>
                <li><a href="/tools/png-to-svg">PNG to SVG</a></li>
              </ul>
            </div>

            {/* GIF Tools */}
            <div>
              <h4 style={{ marginBottom: '15px', color: '#333', fontSize: '1rem' }}>GIF Tools</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><a href="/tools/video-to-gif">Video to GIF</a></li>
                <li><a href="/tools/gif-maker">GIF Maker</a></li>
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
              <p style={{ marginBottom: 10 }}>&copy; {new Date().getFullYear()} SafeConverts. All rights reserved.</p>
              <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.9rem' }}>
                Made with <span style={{ color: '#e25555' }}>❤</span> in <span style={{ fontWeight: 600, color: '#333' }}>India</span> <span style={{ fontSize: '1.2rem' }}>🇮🇳</span>
              </p>
              <p style={{ fontSize: '0.8rem', marginTop: 5, color: '#aaa' }}>Secure. Private. Local.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
