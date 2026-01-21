import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Merge PDF - Combine PDF Files Online for Free',
    description: 'Merge multiple PDF files into one document. Use Advanced Mode to reorder pages, split documents, and combine specific page ranges.',
    keywords: ['merge pdf', 'combine pdf', 'pdf joiner', 'merge pdf files', 'free pdf merger', 'combine pdf online'],
    openGraph: {
        title: 'Merge PDF | Pizza PDF Tools',
        description: 'Combine multiple PDFs into one. Supports advanced reordering and page selection.',
        type: 'website',
    }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
