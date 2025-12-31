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
    // Organize PDF
    { title: 'Merge PDF', description: 'Combine multiple PDFs into one.', icon: FileStack, href: '/tools/merge-pdf', color: '#FF5252' },
    { title: 'Split PDF', description: 'Separate PDF pages.', icon: Scissors, href: '/tools/split-pdf', color: '#FF4081' },
    { title: 'Remove Pages', description: 'Delete unwanted pages.', icon: Minimize2, href: '/tools/remove-pages', color: '#ef4444' }, // Using Minimize2 as Trash placeholder
    { title: 'Extract Pages', description: 'Save specific pages.', icon: FileType, href: '/tools/extract-pages', color: '#8b5cf6' },
    { title: 'Organize PDF', description: 'Reorder and manage pages.', icon: FileStack, href: '/tools/organize-pdf', color: '#f59e0b' },

    // Optimize & Repair
    { title: 'Compress PDF', description: 'Reduce file size.', icon: Minimize2, href: '/tools/compress-pdf', color: '#10b981' },
    { title: 'Repair PDF', description: 'Recover broken PDFs.', icon: Shield, href: '/tools/repair-pdf', color: '#6366f1' },

    // Convert TO PDF
    { title: 'Image to PDF', description: 'JPG/PNG to PDF.', icon: ImageIcon, href: '/tools/image-to-pdf', color: '#00B0FF' },
    { title: 'Office to PDF', description: 'Word/Excel to PDF.', icon: FileType, href: '/tools/office-to-pdf', color: '#FFC107' },
    { title: 'Scan to PDF', description: 'OCR images to text.', icon: Scan, href: '/tools/scan-pdf', color: '#607D8B' },

    // Convert FROM PDF
    { title: 'PDF to Image', description: 'Save as high-res JPG.', icon: ImageIcon, href: '/tools/pdf-to-image', color: '#00E676' },
    { title: 'PDF to Word', description: 'Convert to DOCX.', icon: FileType, href: '/tools/pdf-to-word', color: '#3b82f6' },
    { title: 'PDF to Excel', description: 'Convert to XLSX.', icon: FileType, href: '/tools/pdf-to-excel', color: '#22c55e' },
    { title: 'PDF to PPT', description: 'Convert to PowerPoint.', icon: FileType, href: '/tools/pdf-to-ppt', color: '#f97316' },

    // Edit & Security
    { title: 'Rotate PDF', description: 'Rotate pages permanently.', icon: RotateCw, href: '/tools/rotate-pdf', color: '#7C4DFF' },
    { title: 'Watermark', description: 'Add text overlay.', icon: FileType, href: '/tools/watermark-pdf', color: '#ec4899' },
    { title: 'Protect PDF', description: 'Encrypt with password.', icon: Shield, href: '/tools/protect-pdf', color: '#3D5AFE' },
    { title: 'Unlock PDF', description: 'Remove password.', icon: Unlock, href: '/tools/unlock-pdf', color: '#F44336' },

    // Image Tools
    { title: 'Compress Image', description: 'Reduce image size.', icon: Minimize2, href: '/tools/compress-image', color: '#448AFF' },
    { title: 'Resize Image', description: 'Change dimensions.', icon: Minimize2, href: '/tools/resize-image', color: '#795548' },
    { title: 'Convert Image', description: 'Change format.', icon: ImageIcon, href: '/tools/convert-image', color: '#009688' },
  ];

  return (
    <div className="container" style={{ padding: '60px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: 20, background: 'linear-gradient(45deg, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          SafeConverts
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#666', maxWidth: 600, margin: '0 auto 40px' }}>
          Premium PDF and Image tools. 100% Privacy-Focused.
          <br />
          No sign-up required.
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
