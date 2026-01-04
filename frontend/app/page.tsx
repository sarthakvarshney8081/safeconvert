
import HomeTools from '@/components/HomeTools';

export default function Home() {
  return (
    <div className="container" style={{ padding: '60px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: 20, background: 'linear-gradient(45deg, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          SafeConverts
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#666', maxWidth: 600, margin: '0 auto 40px' }}>
          Premium PDF and Image tools. 100% Privacy-Focused.
          <br />
          No sign-up required.
        </p>
      </div>

      <HomeTools />
    </div>
  );
}
