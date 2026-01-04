import ContactContent from './content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us | SafeConverts',
    description: 'Get in touch with the SafeConverts team. We are here to help with your file conversion needs.',
};

export default function ContactPage() {
    return <ContactContent />;
}
