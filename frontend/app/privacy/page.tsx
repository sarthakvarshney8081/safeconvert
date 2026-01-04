import PrivacyContent from './content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy - SafeConverts',
    description: 'How we handle your data securely.',
};

export default function PrivacyPage() {
    return <PrivacyContent />;
}
