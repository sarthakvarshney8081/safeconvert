import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Image to PDF Converter | Free & Secure Online Tool',
    description: 'Convert JPG, PNG, and other images to PDF format instantly. Free, secure, and high-quality conversion with no file limits.',
    keywords: ['image to pdf', 'jpg to pdf', 'png to pdf', 'converter', 'free pdf tool', 'online converter', 'secure pdf tools'],
    openGraph: {
        title: 'Image to PDF Converter | Pizza PDF Tools',
        description: 'Convert your images to PDF documents quickly and securely.',
        type: 'website',
    }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
