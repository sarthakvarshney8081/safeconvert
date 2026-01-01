import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface ToolCardProps {
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
    color?: string;
    badge?: string;
}

export default function ToolCard({ title, description, href, icon: Icon, color = 'var(--primary)', badge }: ToolCardProps) {
    return (
        <Link href={href} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', textDecoration: 'none', color: 'inherit', position: 'relative' }}>
            {badge && (
                <span style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: '#e3f2fd',
                    color: '#1565c0',
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: 500
                }}>
                    {badge}
                </span>
            )}
            <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: `${color}15`,
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Icon size={24} />
            </div>
            <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{title}</h3>
                <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.5 }}>{description}</p>
            </div>
        </Link>
    );
}
