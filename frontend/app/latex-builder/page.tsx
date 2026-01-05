import ResumeEditor from '@/components/LatexEditor';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ResumeBuilderPage() {
    return (
        <div className="container" style={{ padding: '20px', maxWidth: '100%' }}>
            <Link href="/" style={{
                display: 'flex', alignItems: 'center', gap: 8,
                textDecoration: 'none', color: '#666', fontWeight: 500,
                marginBottom: 20
            }}>
                <ArrowLeft size={16} /> Back to Home
            </Link>



            <ResumeEditor />
        </div>
    );
}
