import {
  FileStack,
  Scissors,
  RotateCw,
  Image as ImageIcon,
  FileType,
  Shield,
  Unlock,
  Scan,
  Minimize2
} from 'lucide-react';
import ToolCard from '@/components/ui/ToolCard';

export default function Home() {
  const tools = [
    {
      title: 'Merge PDF',
      description: 'Combine multiple PDFs into one unified document.',
      href: '/tools/merge-pdf',
      icon: FileStack,
      color: '#FF5252'
    },
    {
      title: 'Split PDF',
      description: 'Extract pages or split your PDF into multiple files.',
      href: '/tools/split-pdf',
      icon: Scissors,
      color: '#FF4081'
    },
    {
      title: 'Rotate PDF',
      description: 'Rotate your PDF pages permanently.',
      href: '/tools/rotate-pdf',
      icon: RotateCw,
      color: '#7C4DFF'
    },
    {
      title: 'Compress Image',
      description: 'Reduce image file size while maintaining quality.',
      href: '/tools/compress-image',
      icon: Minimize2,
      color: '#448AFF'
    },
    {
      title: 'Image to PDF',
      description: 'Convert JPG, PNG, or other images to PDF format.',
      href: '/tools/image-to-pdf',
      icon: ImageIcon,
      color: '#00B0FF'
    },
    {
      title: 'PDF to Image',
      description: 'Convert PDF pages to high-quality images.',
      href: '/tools/pdf-to-image',
      icon: FileType,
      color: '#00E676'
    },
    {
      title: 'Office to PDF',
      description: 'Convert Word, Excel, and PowerPoint files to PDF.',
      href: '/tools/office-to-pdf',
      icon: FileType,
      color: '#FFC107'
    },
    {
      title: 'Protect PDF',
      description: 'Encrypt your PDF with a password.',
      href: '/tools/protect-pdf',
      icon: Shield,
      color: '#3D5AFE'
    },
    {
      title: 'Unlock PDF',
      description: 'Remove password security from PDF files.',
      href: '/tools/unlock-pdf',
      icon: Unlock,
      color: '#F44336'
    },
    {
      title: 'Scan to PDF (OCR)',
      description: 'Convert scanned documents into searchable PDFs.',
      href: '/tools/scan-pdf',
      icon: Scan,
      color: '#607D8B'
    },
    {
      title: 'Convert Image',
      description: 'Convert between PNG, JPG, WebP locally.',
      href: '/tools/convert-image',
      icon: ImageIcon,
      color: '#009688'
    },
    {
      title: 'Resize Image',
      description: 'Resize dimensions of your images.',
      href: '/tools/resize-image',
      icon: Minimize2,
      color: '#795548'
    }
  ];

  return (
    <div className="container" style={{ padding: '60px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px', background: 'linear-gradient(45deg, #6200EE, #03DAC6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Every tool you need
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#666', maxWidth: 600, margin: '0 auto' }}>
          Fully self-hosted, privacy-first file conversion and manipulation tools.
          Your files never leave your server.
        </p>
      </div>

      <div className="grid grid-cols-4">
        {tools.map((tool, i) => (
          <ToolCard key={i} {...tool} />
        ))}
      </div>
    </div>
  );
}
