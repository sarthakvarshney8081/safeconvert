import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Navbar from '@/components/ui/Navbar';
import Clarity from '@/components/analytics/Clarity';

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
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
            >
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
        {process.env.NEXT_PUBLIC_CLARITY_ID && (
          <Clarity projectId={process.env.NEXT_PUBLIC_CLARITY_ID} />
        )}
        <Navbar />
        <main style={{ flex: 1, paddingBottom: 40 }}>
          {children}
        </main>

        <footer style={{ background: '#fff', borderTop: '1px solid #f0f0f0', color: '#666', marginTop: 'auto' }}>
          <div className="container" style={{ padding: '80px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '50px' }}>
            {/* Branding Column */}
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ marginBottom: '25px' }}>
                <img src="/logo.svg" alt="SafeConverts" style={{ height: '45px' }} />
              </div>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.6', maxWidth: '280px', color: '#888' }}>
                Secure, private, and local-first file tools. Your files never leave your browser or your server.
              </p>
            </div>

            {/* tool columns */}
            <div>
              <h4 className="footer-section-title">PDF Tools</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li><a href="/tools/merge-pdf" className="footer-link">Merge PDF</a></li>
                <li><a href="/tools/compress-pdf" className="footer-link">Compress PDF</a></li>
                <li><a href="/tools/pdf-to-word" className="footer-link">PDF to Word</a></li>
                <li><a href="/tools/pdf-to-excel" className="footer-link">PDF to Excel</a></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-section-title">Edit & Image</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li><a href="/tools/crop-pdf" className="footer-link">Crop PDF</a></li>
                <li><a href="/tools/rotate-pdf" className="footer-link">Rotate PDF</a></li>
                <li><a href="/tools/compress-image" className="footer-link">Compress Image</a></li>
                <li><a href="/tools/png-to-svg" className="footer-link">PNG to SVG</a></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-section-title">Links</h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li><a href="/about" className="footer-link">About Us</a></li>
                <li><a href="/privacy" className="footer-link">Privacy Policy</a></li>
                <li><a href="https://github.com/sarthakvarshney8081/safeconvert" className="footer-link">GitHub Source</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              <p style={{ fontSize: '0.9rem' }}>&copy; {new Date().getFullYear()} SafeConverts. All rights reserved.</p>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.95rem', color: '#333' }}>
                  Made with <span style={{ color: '#ff4d4d', display: 'inline-block', animation: 'heartbeat 1.5s ease-in-out infinite' }}>❤</span> in <span style={{ fontWeight: 600 }}>India</span> <span style={{ fontSize: '1.2rem' }}>🇮🇳</span>
                </p>
                <p style={{ fontSize: '0.75rem', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Secure • Private • Local</p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
