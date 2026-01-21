import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Edit PDF Online | Add Text, Images & Signatures',
    description: 'Edit PDF documents directly in your browser. Add text, overlay images, draw signatures, and modify content securely and for free.',
    keywords: ['edit pdf', 'pdf editor', 'online pdf editor', 'sign pdf', 'annotate pdf', 'modify pdf', 'free pdf editor'],
    openGraph: {
        title: 'Free Online PDF Editor | Pizza PDF Tools',
        description: 'Edit, sign, and annotate PDF documents seamlessly online.',
        type: 'website',
    }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
