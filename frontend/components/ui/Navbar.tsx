import Link from 'next/link';
import { FileDigit, Menu } from 'lucide-react';

export default function Navbar() {
    return (
        <nav style={{
            background: 'var(--surface)',
            borderBottom: '1px solid #eee',
            padding: '16px 0',
            position: 'sticky',
            top: 0,
            zIndex: 50
        }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '1.5rem', color: 'var(--primary)' }}>
                    <FileDigit size={32} />
                    SafeConverts
                </Link>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <Link href="/" className="btn">All Tools</Link>
                    <Link href="/workflow" className="btn">Workflows</Link>
                    <Link href="/about" className="btn">About</Link>
                </div>
            </div>
        </nav>
    );
}
