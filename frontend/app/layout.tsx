import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Navbar from '@/components/ui/Navbar';
import Clarity from '@/components/analytics/Clarity';
import SocialLinks from '@/components/ui/SocialLinks';


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
  description: 'SafeConverts offers secure, local-first file tools including PDF editors, LaTeX builder, Docker visualizers, and essential IT utilities. Everything runs privately in your browser with zero server uploads.', // ~195 chars
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

        <footer style={{ background: 'var(--footer-bg)', color: 'var(--footer-text)', marginTop: 'auto', borderTop: '1px solid var(--footer-border)' }}>
          <div className="container" style={{ padding: '60px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
            {/* Branding Column */}
            <div className="footer-mobile-center" style={{ gridColumn: 'span 2' }}>
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* White Logo for Dark Footer */}
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>SafeConverts</span>
              </div>
              <p style={{ fontSize: '1rem', lineHeight: '1.6', maxWidth: '340px', color: '#d4d4d8', marginBottom: 25 }}>
                Professional-grade file tools running locally in your browser. Complete privacy, zero server uploads, and lightning-fast processing.
              </p>
              <SocialLinks />
            </div>

            {/* tool columns */}
            <div className="footer-desktop-only">
              <h2 className="footer-section-title" style={{ color: '#fff', opacity: 1 }}>PDF Solutions</h2>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><a href="/tools/merge-pdf" className="footer-link" style={{ color: '#e4e4e7' }}>Merge Documents</a></li>
                <li><a href="/tools/compress-pdf" className="footer-link" style={{ color: '#e4e4e7' }}>Compress PDF</a></li>
                <li><a href="/tools/pdf-to-word" className="footer-link" style={{ color: '#e4e4e7' }}>PDF to Word</a></li>
                <li><a href="/tools/pdf-to-excel" className="footer-link" style={{ color: '#e4e4e7' }}>PDF to Excel</a></li>
                <li><a href="/tools/sign-pdf" className="footer-link" style={{ color: '#e4e4e7' }}>Sign PDF</a></li>
              </ul>
            </div>

            <div className="footer-desktop-only">
              <h2 className="footer-section-title" style={{ color: '#fff', opacity: 1 }}>Developer Tools</h2>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><a href="/it-tools/regex-cheatsheet" className="footer-link" style={{ color: '#e4e4e7' }}>Regex Cheatsheet</a></li>
                <li><a href="/it-tools/data-converter" className="footer-link" style={{ color: '#e4e4e7' }}>JSON / YAML</a></li>
                <li><a href="/it-tools/base64-converter" className="footer-link" style={{ color: '#e4e4e7' }}>Base64 Encode</a></li>
                <li><a href="/it-tools/hash-text" className="footer-link" style={{ color: '#e4e4e7' }}>Hash Generator</a></li>
                <li><a href="/it-tools/jwt-parser" className="footer-link" style={{ color: '#e4e4e7' }}>JWT Debugger</a></li>
              </ul>
            </div>

            <div className="footer-desktop-only">
              <h2 className="footer-section-title" style={{ color: '#fff', opacity: 1 }}>Utilities</h2>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><a href="/tools/compress-image" className="footer-link" style={{ color: '#e4e4e7' }}>Image Compressor</a></li>
                <li><a href="/tools/png-to-svg" className="footer-link" style={{ color: '#e4e4e7' }}>Vectorize Image</a></li>
                <li><a href="/it-tools/wifi-qr-code" className="footer-link" style={{ color: '#e4e4e7' }}>WiFi QR Code</a></li>
                <li><a href="/it-tools/password-strength-analyser" className="footer-link" style={{ color: '#e4e4e7' }}>Password Check</a></li>
              </ul>
            </div>

            <div className="footer-mobile-center">
              <h2 className="footer-section-title" style={{ color: '#fff', opacity: 1 }}>Company</h2>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><a href="/about" className="footer-link" style={{ color: '#e4e4e7' }}>About Us</a></li>
                <li><a href="/contact" className="footer-link" style={{ color: '#e4e4e7' }}>Contact Support</a></li>
                <li><a href="/privacy" className="footer-link" style={{ color: '#e4e4e7' }}>Privacy Policy</a></li>
                <li><a href="/terms" className="footer-link" style={{ color: '#e4e4e7' }}>Terms of Service</a></li>
                <li><a href="https://github.com/sarthakvarshney8081/safeconvert" className="footer-link" style={{ color: '#e4e4e7' }}>GitHub</a></li>
              </ul>
            </div>

            {/* Empty slot to maintain grid layout after removing Newsletter */}
            <div className="footer-desktop-only"></div>
          </div>

          <div className="footer-bottom" style={{ padding: '25px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="container" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
              <p style={{ fontSize: '0.9rem', color: '#e4e4e7', margin: 0 }}>&copy; {new Date().getFullYear()} SafeConverts Inc.</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '25px', flexWrap: 'wrap' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#d4d4d8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }}></span>
                  Secure • Private • Local
                </p>
                <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.2)' }} className="hide-mobile"></div>
                <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', color: '#e4e4e7', margin: 0 }}>
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
