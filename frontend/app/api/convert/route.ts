import { NextResponse } from 'next/server';

function htmlToLatex(html: string): string {
    let latex = html;

    // 1. Cleaning
    latex = latex.replace(/<head>[\s\S]*?<\/head>/g, '')
        .replace(/<body>/g, '').replace(/<\/body>/g, '')
        .replace(/<html>/g, '').replace(/<\/html>/g, '');

    // 2. Block Elements (Headers) - Map directly to Sections
    latex = latex.replace(/<h1>\s*(.*?)\s*<\/h1>/g, '\\section*{$1}\n')
        .replace(/<h2>\s*(.*?)\s*<\/h2>/g, '\\subsection*{$1}\n')
        .replace(/<h3>\s*(.*?)\s*<\/h3>/g, '\\subsubsection*{$1}\n')
        .replace(/<h4>\s*(.*?)\s*<\/h4>/g, '\\subsubsection*{$1}\n')
        .replace(/<p>/g, '').replace(/<\/p>/g, '\n\n') // Paragraphs to double newlines
        .replace(/<br\s*\/?>/g, '\\\\\n') // Break => LaTeX newline
        .replace(/<div>/g, '').replace(/<\/div>/g, '\n');

    // 3. Lists
    // Unordered
    latex = latex.replace(/<ul>/g, '\\begin{itemize}\n')
        .replace(/<\/ul>/g, '\\end{itemize}\n');
    // Ordered
    latex = latex.replace(/<ol>/g, '\\begin{enumerate}\n')
        .replace(/<\/ol>/g, '\\end{enumerate}\n');
    // Items
    latex = latex.replace(/<li>\s*(.*?)\s*<\/li>/g, '\\item $1\n');

    // 4. Formatting (Bold, Italic, Underline) - Robust mapping
    latex = latex.replace(/<b>\s*(.*?)\s*<\/b>/g, '\\textbf{$1}')
        .replace(/<strong>\s*(.*?)\s*<\/strong>/g, '\\textbf{$1}')
        .replace(/<i>\s*(.*?)\s*<\/i>/g, '\\textit{$1}')
        .replace(/<em>\s*(.*?)\s*<\/em>/g, '\\textit{$1}')
        .replace(/<u>\s*(.*?)\s*<\/u>/g, '\\underline{$1}');

    // 5. Special Handling
    // Centering: <center> or class="text-center"
    latex = latex.replace(/<center>\s*(.*?)\s*<\/center>/g, '{\\centering $1}')
        .replace(/<div[^>]*text-align:\s*center[^>]*>\s*(.*?)\s*<\/div>/g, '{\\centering $1}');

    // 6. Entity Decoding (Basic)
    latex = latex.replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '\\&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');

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
