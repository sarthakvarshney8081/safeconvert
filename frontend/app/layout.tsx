import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Navbar from '@/components/ui/Navbar';
import Clarity from '@/components/analytics/Clarity';
import SocialLinks from '@/components/ui/SocialLinks';
import { Toaster } from 'sonner';


const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://safeconverts.com'),
  alternates: {
    canonical: '/',
  },
  title: {
    default: 'SafeConverts - Private PDF Converter, IT Tools & Developer Utilities', // ~65 chars
    template: '%s | SafeConverts',
  },
  description: 'Secure, private, and local-first file tools. PDF editing, LaTeX building, and IT utilities that run entirely in your browser with zero server uploads.', // ~152 chars
  openGraph: {
    title: 'SafeConverts - Secure PDF Converter & Developer Utilities', // Match title
    description: 'Private, browser-based PDF tools, LaTeX editor, Docker maps, and IT utilities.',
    url: '/',
    siteName: 'SafeConverts',
    locale: 'en_US',
    type: 'website',
  },
  keywords: [
    'PDF Converter', 'Merge PDF', 'Compress PDF', 'Sign PDF', 'PDF to Word',
    'PDF to Excel', 'PDF to PPT', 'PDF to Image', 'Image to PDF', 'Repair PDF',
    'Unlock PDF', 'Protect PDF', 'LaTeX Builder', 'LaTeX Editor', 'LaTeX to PDF',
    'Docker Map', 'Infrastructure Visualizer', 'BIP39 Generator', 'Mnemonic Generator',
    'Regex Tester', 'JWT Debugger', 'Bcrypt Generator', 'JSON Converter', 'YAML Converter',
    'Base64 Encoder', 'Hash Generator', 'UUID Generator', 'ULID Generator',
    'QR Code Generator', 'WiFi QR Code', 'Chmod Calculator', 'Crontab Generator',
    'Password Strength Checker', 'URL Parser', 'User Agent Parser', 'MIME Types',
    'Image Compressor', 'PNG to SVG', 'Private File Tools', 'Local PDF Tools',
    'WebAssembly PDF', 'Secure Dev Tools', 'Free Online Utilities'
  ],
  twitter: {
    card: 'summary_large_image',
    title: 'SafeConverts',
    description: 'Secure, private, and local-first file tools.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              strategy="lazyOnload"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="lazyOnload"
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
        <Script
          src="https://unpkg.com/website-carbon-badges@1.1.3/b.min.js"
          strategy="lazyOnload"
        />
        <script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'SafeConverts',
              url: process.env.NEXT_PUBLIC_BASE_URL || 'https://safeconverts.com',
              description: 'Secure, private, and local-first file tools. Compress, convert, and edit PDFs locally.',
              publisher: {
                '@type': 'Organization',
                name: 'SafeConverts',
                logo: {
                  '@type': 'ImageObject',
                  url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://safeconverts.com'}/icon.svg`,
                },
              },
            }),
          }}
        />
        <Navbar />
        <main style={{ flex: 1, paddingBottom: 40 }}>
          {children}
        </main>
        <Toaster richColors position="top-right" />

        <footer style={{ background: 'var(--footer-bg)', color: 'var(--footer-text)', marginTop: 'auto', borderTop: '1px solid var(--footer-border)', padding: '40px 0 0' }}>
          <div className="container">
            {/* Row 1: Tool Categories */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '30px',
              marginBottom: '40px',
              textAlign: 'left'
            }}>
              <div>
                <h2 className="footer-section-title" style={{ color: '#fff', opacity: 1, marginBottom: '15px', fontSize: '1.1rem' }}>PDF Solutions</h2>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li><a href="/tools/merge-pdf" className="footer-link" style={{ color: '#e4e4e7', fontSize: '0.9rem' }}>Merge Documents</a></li>
                  <li><a href="/tools/compress-pdf" className="footer-link" style={{ color: '#e4e4e7', fontSize: '0.9rem' }}>Compress PDF</a></li>
                  <li><a href="/tools/pdf-to-word" className="footer-link" style={{ color: '#e4e4e7', fontSize: '0.9rem' }}>PDF to Word</a></li>
                  <li><a href="/tools/pdf-to-excel" className="footer-link" style={{ color: '#e4e4e7', fontSize: '0.9rem' }}>PDF to Excel</a></li>
                  <li><a href="/tools/sign-pdf" className="footer-link" style={{ color: '#e4e4e7', fontSize: '0.9rem' }}>Sign PDF</a></li>
                </ul>
              </div>

              <div>
                <h2 className="footer-section-title" style={{ color: '#fff', opacity: 1, marginBottom: '15px', fontSize: '1.1rem' }}>Developer Tools</h2>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li><a href="/it-tools/regex-cheatsheet" className="footer-link" style={{ color: '#e4e4e7', fontSize: '0.9rem' }}>Regex patterns</a></li>
                  <li><a href="/it-tools/data-converter" className="footer-link" style={{ color: '#e4e4e7', fontSize: '0.9rem' }}>JSON / YAML</a></li>
                  <li><a href="/it-tools/base64-converter" className="footer-link" style={{ color: '#e4e4e7', fontSize: '0.9rem' }}>Base64 Encode</a></li>
                  <li><a href="/it-tools/hash-text" className="footer-link" style={{ color: '#e4e4e7', fontSize: '0.9rem' }}>Hash Generator</a></li>
                  <li><a href="/it-tools/jwt-parser" className="footer-link" style={{ color: '#e4e4e7', fontSize: '0.9rem' }}>JWT Debugger</a></li>
                </ul>
              </div>

              <div>
                <h2 className="footer-section-title" style={{ color: '#fff', opacity: 1, marginBottom: '15px', fontSize: '1.1rem' }}>Utilities</h2>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li><a href="/tools/compress-image" className="footer-link" style={{ color: '#e4e4e7', fontSize: '0.9rem' }}>Image Compressor</a></li>
                  <li><a href="/tools/png-to-svg" className="footer-link" style={{ color: '#e4e4e7', fontSize: '0.9rem' }}>Vectorize Image</a></li>
                  <li><a href="/it-tools/wifi-qr-code" className="footer-link" style={{ color: '#e4e4e7', fontSize: '0.9rem' }}>WiFi QR Code</a></li>
                  <li><a href="/it-tools/integer-base-converter" className="footer-link" style={{ color: '#e4e4e7', fontSize: '0.9rem' }}>Unit Converter</a></li>
                  <li><a href="/it-tools/password-strength-analyser" className="footer-link" style={{ color: '#e4e4e7', fontSize: '0.9rem' }}>Password Check</a></li>
                </ul>
              </div>

              <div>
                <h2 className="footer-section-title" style={{ color: '#fff', opacity: 1, marginBottom: '15px', fontSize: '1.1rem' }}>Company</h2>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li><a href="/about" className="footer-link" style={{ color: '#e4e4e7', fontSize: '0.9rem' }}>About Us</a></li>
                  <li><a href="/contact" className="footer-link" style={{ color: '#e4e4e7', fontSize: '0.9rem' }}>Contact Support</a></li>
                  <li><a href="/privacy" className="footer-link" style={{ color: '#e4e4e7', fontSize: '0.9rem' }}>Privacy Policy</a></li>
                  <li><a href="/terms" className="footer-link" style={{ color: '#e4e4e7', fontSize: '0.9rem' }}>Terms of Service</a></li>
                  <li><a href="https://github.com/sarthakvarshney8081/safeconvert" className="footer-link" style={{ color: '#e4e4e7', fontSize: '0.9rem' }}>GitHub Project</a></li>
                </ul>
              </div>
            </div>

            {/* Row 2: Large Branding Block */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '40px 0',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              marginBottom: '0'
            }}>
              <div style={{ marginBottom: '16px' }}>
                <img
                  src="/logo-white.svg"
                  alt="SafeConverts Logo"
                  width={274}
                  height={64}
                  style={{ height: '64px', width: 'auto' }}
                />
              </div>
              <p style={{
                fontSize: '1.1rem',
                lineHeight: '1.5',
                maxWidth: '600px',
                color: '#d4d4d8',
                margin: '0 0 24px 0',
                fontWeight: 400
              }}>
                Professional-grade file tools running locally in your browser. Complete privacy, zero server uploads, and lightning-fast processing.
              </p>
              <SocialLinks />
              <div style={{ marginTop: '24px' }}>
                <div id="wcb" className="carbonbadge"></div>
              </div>
            </div>
          </div>

          {/* Row 3: Bottom attribution */}
          <div className="footer-bottom" style={{ padding: '20px 0', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '30px' }}>
            <div className="container footer-attribution-container" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
              <p style={{ fontSize: '0.85rem', color: '#e4e4e7', margin: 0 }}>&copy; {new Date().getFullYear()} SafeConverts Inc.</p>

              <div className="footer-attribution-group" style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#d4d4d8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }}></span>
                  Secure • Private • Local
                </p>
                <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.2)' }} className="hide-mobile"></div>
                <p style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.85rem', color: '#e4e4e7', margin: 0 }}>
                  Made with <span style={{ color: '#ef4444', display: 'inline-block', animation: 'heartbeat 1.5s ease-in-out infinite' }}>❤</span> in <span style={{ color: '#fff', fontWeight: 600 }}>India</span> 🇮🇳
                </p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
