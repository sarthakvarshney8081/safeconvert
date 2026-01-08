import React, { Suspense } from 'react';
import LandingHero from '@/components/LandingHero'; // Client Component (uses useSearchParams)
import HomeTools from '@/components/HomeTools';     // Client Component (uses useSearchParams)

// Create a static skeleton for the Hero to prevent CLS
const HeroSkeleton = () => (
  <div style={{
    height: '600px',
    width: '100%',
    background: 'radial-gradient(circle at 50% 10%, #f0f9ff 0%, #fff 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <h1 style={{ opacity: 0, position: 'absolute' }}>SafeConverts - Private PDF Tools & IT Utilities</h1>
    {/* Optional: Add shimmer effect or simple loader */}
  </div>
);

// Create a static skeleton for the Tools Grid
const ToolsSkeleton = () => (
  <div className="container" style={{ padding: '10px 20px 60px', minHeight: '800px' }}>
    <div style={{ height: 40, width: 200, background: '#f1f5f9', borderRadius: 8, marginBottom: 20 }}></div>
    <div className="grid grid-cols-4" style={{ gap: 20 }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ height: 180, background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0' }}></div>
      ))}
    </div>
  </div>
);

export default function Home() {
  return (
    <main style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* 
        Wrap LandingHero in Suspense because it uses client-side hooks (useSearchParams). 
        The fallback reserves space to minimize layout shift.
      */}
      <Suspense fallback={<HeroSkeleton />}>
        <LandingHero />
      </Suspense>

      {/* 
        Wrap HomeTools in Suspense (it filters tools based on URL params).
        Separate boundary allows Hero to load even if Tools logic is slower.
      */}
      <Suspense fallback={<ToolsSkeleton />}>
        <HomeTools />
      </Suspense>
    </main>
  );
}
