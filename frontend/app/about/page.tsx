import AboutContent from './content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Us - SafeConverts',
    description: 'Learn about our mission to provide secure, private file tools.',
};

export default function AboutPage() {
    return <AboutContent />;
}
