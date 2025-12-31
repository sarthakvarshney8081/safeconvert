'use client';

import ToolInterface from '@/components/ToolInterface';
import { Video } from 'lucide-react';

export default function VideoToGifTool() {
    return (
        <ToolInterface
            title="Video to GIF"
            description="Convert MP4, AVI, or MOV to animated GIF."
            accept="video/*"
            apiEndpoint="/api/video/video-to-gif"
            resultFileName="converted.gif"
            icon={Video}
            extraOptions={[
                {
                    name: "fps",
                    label: "Frame Rate (FPS)",
                    type: "select",
                    defaultValue: "10",
                    options: [
                        { label: "5 FPS (Low)", value: "5" },
                        { label: "10 FPS (Standard)", value: "10" },
                        { label: "15 FPS (High)", value: "15" },
                        { label: "24 FPS (Cinematic)", value: "24" },
                    ]
                },
                {
                    name: "width",
                    label: "Width (px)",
                    type: "select",
                    defaultValue: "320",
                    options: [
                        { label: "320px", value: "320" },
                        { label: "480px", value: "480" },
                        { label: "600px", value: "600" },
                        { label: "800px", value: "800" },
                    ]
                }
            ]}
        />
    );
}
