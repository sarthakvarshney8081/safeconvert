'use client';

import ToolInterface from '@/components/ToolInterface';
import { Image as ImageIcon } from 'lucide-react';

export default function PngToSvgTool() {
    return (
        <ToolInterface
            title="PNG to SVG"
            description="Convert raster images (PNG, JPG) to Vector SVG."
            accept="image/*"
            apiEndpoint="/api/images/png-to-svg"
            resultFileName="vectorized.svg"
            icon={ImageIcon}
        />
    );
}
