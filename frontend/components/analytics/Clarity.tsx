'use client';

import { useEffect } from 'react';
import { clarity } from '@microsoft/clarity';

interface ClarityProps {
    projectId: string;
}

export default function Clarity({ projectId }: ClarityProps) {
    useEffect(() => {
        if (projectId) {
            clarity.init(projectId);
        }
    }, [projectId]);

    return null;
}
