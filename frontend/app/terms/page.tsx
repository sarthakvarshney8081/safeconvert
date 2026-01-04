import TermsContent from './content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service | SafeConverts',
    description: 'Terms of Service for using SafeConverts tools.',
};

export default function TermsPage() {
    return <TermsContent />;
}
