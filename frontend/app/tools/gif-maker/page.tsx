'use client';

import ToolInterface from '@/components/ToolInterface';
import { Image as ImageIcon } from 'lucide-react';

export default function GifMakerTool() {
    // GIF Maker handles multiple images
    return (
        <ToolInterface
            title="GIF Maker"
            description="Create animated GIFs from multiple images."
            accept="image/*"
            multiple={true}
            apiEndpoint="/api/video/gif-maker"
            resultFileName="animation.gif"
            icon={ImageIcon}
            extraOptions={[
                {
                    name: "fps",
                    label: "Speed (Frames/Sec)",
                    type: "select",
                    defaultValue: "2",
                    options: [
                        { label: "1 (Slow)", value: "1" },
                        { label: "2 (Normal)", value: "2" },
                        { label: "5 (Fast)", value: "5" },
                        { label: "10 (Very Fast)", value: "10" },
                    ]
                }
            ]}
        />
    );
}
