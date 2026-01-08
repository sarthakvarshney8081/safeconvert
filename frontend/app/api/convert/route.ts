import { NextResponse } from 'next/server';

function htmlToLatex(html: string): string {
    let latex = html;

    // 1. Cleaning
    latex = latex.replace(/<head>[\s\S]*?<\/head>/g, '')
        .replace(/<body>/g, '').replace(/<\/body>/g, '')
        .replace(/<html>/g, '').replace(/<\/html>/g, '');

    // 2. Block Elements (Headers) - Map directly to Sections
    latex = latex.replace(/<h1>\s*([\s\S]*?)\s*<\/h1>/g, '\\section*{$1}\n')
        .replace(/<h2>\s*([\s\S]*?)\s*<\/h2>/g, '\\subsection*{$1}\n')
        .replace(/<h3>\s*([\s\S]*?)\s*<\/h3>/g, '\\subsubsection*{$1}\n')
        .replace(/<h4>\s*([\s\S]*?)\s*<\/h4>/g, '\\subsubsection*{$1}\n')
        .replace(/<p>\s*([\s\S]*?)\s*<\/p>/g, '$1\n\n')
        .replace(/<br\s*\/?>/g, '\\\\\n')
        .replace(/<hr\s*\/?>/g, '\\titlerule\n')
        .replace(/<div>\s*([\s\S]*?)\s*<\/div>/g, '$1\n');

    // 3. Lists
    latex = latex.replace(/<ul>/g, '\\begin{itemize}\n')
        .replace(/<\/ul>/g, '\\end{itemize}\n');
    latex = latex.replace(/<ol>/g, '\\begin{enumerate}\n')
        .replace(/<\/ol>/g, '\\end{enumerate}\n');
    latex = latex.replace(/<li>\s*([\s\S]*?)\s*<\/li>/g, '\\item $1\n');

    // 4. Formatting & Links
    latex = latex.replace(/<b>\s*([\s\S]*?)\s*<\/b>/g, '\\textbf{$1}')
        .replace(/<strong>\s*([\s\S]*?)\s*<\/strong>/g, '\\textbf{$1}')
        .replace(/<i>\s*([\s\S]*?)\s*<\/i>/g, '\\textit{$1}')
        .replace(/<em>\s*([\s\S]*?)\s*<\/em>/g, '\\textit{$1}')
        .replace(/<u>\s*([\s\S]*?)\s*<\/u>/g, '\\underline{$1}')
        .replace(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, '\\href{$1}{$2}');

    // 5. Special Handling
    latex = latex.replace(/<center>\s*([\s\S]*?)\s*<\/center>/g, '{\\centering $1}')
        .replace(/<div(?:[^>]*?text-align:\s*center[^>]*?)>\s*([\s\S]*?)\s*<\/div>/g, '{\\centering $1}');

    // 6. Entity Decoding (Basic)
    latex = latex.replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '\\&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');

    // 7. Final Cleanup: Strip any remaining HTML tags to prevent them leaking into LaTeX
    latex = latex.replace(/<(?!\\href|\\textbf|\\textit|\\underline|\\section|\\subsection|\\subsubsection|\\item|\\begin|\\end|\\titlerule)[^>]*>/g, '');

    // 8. Cleanup extra newlines
    latex = latex.replace(/\n{3,}/g, '\n\n');

    return latex.trim();
}

export async function POST(req: Request) {
    try {
        const { html } = await req.json();
        if (!html) return NextResponse.json({ error: 'HTML content is required' }, { status: 400 });

        const latex = htmlToLatex(html);

        return NextResponse.json({ latex });
    } catch (error: any) {
        console.error('Conversion error:', error);
        return NextResponse.json({ error: 'Failed conversion', details: error.message }, { status: 500 });
    }
}
