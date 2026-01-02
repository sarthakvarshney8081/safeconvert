import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'SafeConverts - Secure, Local File Tools';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 60,
                    background: 'linear-gradient(to bottom right, #ffffff, #f0f0f0)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                    color: '#333',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 20,
                    }}
                >
                    {/* Simple geometric logo approximation or just text if no svg asset available to load in edge */}
                    <div style={{
                        width: 80,
                        height: 80,
                        background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                        borderRadius: 20,
                        marginRight: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 48,
                        fontWeight: 'bold'
                    }}>
                        S
                    </div>
                    <div style={{ fontSize: 80, fontWeight: 800, letterSpacing: '-0.02em' }}>
                        SafeConverts
                    </div>
                </div>
                <div style={{ fontSize: 32, opacity: 0.6, maxWidth: 800, textAlign: 'center', lineHeight: 1.4 }}>
                    Secure. Private. Local-First.
                </div>
                <div style={{
                    marginTop: 40,
                    background: '#2563eb',
                    color: 'white',
                    padding: '12px 32px',
                    borderRadius: 50,
                    fontSize: 24,
                    fontWeight: 600
                }}>
                    safeconverts.com
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
