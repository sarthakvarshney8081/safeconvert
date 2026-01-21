import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'PDF to Image Converter | High Quality PNG & JPG',
    description: 'Convert PDF pages to high-resolution images (PNG or JPG). Batch process entire documents securely and free of charge.',
    keywords: ['pdf to image', 'pdf to jpg', 'pdf to png', 'convert pdf', 'extract images from pdf', 'free pdf converter'],
    openGraph: {
        title: 'PDF to Image Converter | Pizza PDF Tools',
        description: 'Turn your PDF pages into high-quality images instantly.',
        type: 'website',
    }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
