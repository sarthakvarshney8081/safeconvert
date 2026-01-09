import React, { Suspense } from 'react';
import HeroStatic from '@/components/HeroStatic';
import HeroSearch from '@/components/HeroSearch';
import HomeTools from '@/components/HomeTools';

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
        HeroStatic is a Server Component: Paints H1/Background immediately (LCP Win).
        HeroSearch is a Client Component: Hydrates for search logic.
        Wrapped in Suspense to prevent de-opting entire page to client rendering.
      */}
      <HeroStatic>
        <Suspense fallback={<div style={{ height: 56, width: '100%', maxWidth: 500, background: '#f8fafc', borderRadius: 16 }} />}>
          <HeroSearch />
        </Suspense>
      </HeroStatic>

      {/* 
        HomeTools filters tools based on URL params.
      */}
      <Suspense fallback={<ToolsSkeleton />}>
        <HomeTools />
      </Suspense>
    </main>
  );
}
