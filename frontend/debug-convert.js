const { convertText } = require('html-to-latex');

// Mock of my frontend Regex parser
const latexToHtml = (latex) => {
    let html = latex;

    // 1. Extract Body Content only (if document env exists)
    const bodyMatch = html.match(/\\begin\{document\}([\s\S]*)\\end\{document\}/);
    if (bodyMatch && bodyMatch[1]) {
        html = bodyMatch[1];
    } else {
        // Fallback: Strip common preamble commands if no env found
        html = html.replace(/\\documentclass[\s\S]*?\\begin\{document\}/, '');
    }

    // 2. Remove Metadata / Title commands that might linger
    html = html.replace(/\\title\{.*?\}/g, '')
        .replace(/\\author\{.*?\}/g, '')
        .replace(/\\date\{.*?\}/g, '')
        .replace(/\\maketitle/g, '<h1>My Resume</h1>');

    // 3. Structural Conversions
    html = html.replace(/\\section\*?\{(.*?)\}/g, '<h2>$1</h2>')
        .replace(/\\subsection\*?\{(.*?)\}/g, '<h3>$1</h3>')
        .replace(/\\subsubsection\*?\{(.*?)\}/g, '<h4>$1</h4>') // Handle subsubsection
        .replace(/\\centering\{(.*?)\}/g, '<center>$1</center>') // Handle centering
        .replace(/\{\\centering (.*?)\}/g, '<center>$1</center>'); // Handle alternative centering

    // 4. Text Formatting
    html = html.replace(/\\textbf\{(.*?)\}/g, '<strong>$1</strong>')
        .replace(/\\textit\{(.*?)\}/g, '<em>$1</em>')
        .replace(/\\underline\{(.*?)\}/g, '<u>$1</u>')
        .replace(/\\emph\{(.*?)\}/g, '<em>$1</em>');

    // 5. Lists
    html = html.replace(/\\begin\{itemize\}/g, '<ul>')
        .replace(/\\end\{itemize\}/g, '</ul>')
        .replace(/\\begin\{enumerate\}/g, '<ol>')
        .replace(/\\end\{enumerate\}/g, '</ol>')
        .replace(/\\item\s+(.*)/g, '<li>$1</li>');

    // 6. Newlines & Cleanup
    html = html.replace(/\\\\/g, '<br>');

    return html.trim();
};

async function test() {
    try {
        console.log("--- Round 1 ---");
        const latex1 = `\\section*{Summary}
\\textbf{Bold Text}
\\centering{Centered}`;
        console.log("Original LaTeX:", latex1);

        const html1 = latexToHtml(latex1);
        console.log("HTML 1:", html1);

        const latex2 = await convertText(html1);
        console.log("LaTeX 2 (from HTML):", latex2);

        console.log("\n--- Round 2 ---");
        const html2 = latexToHtml(latex2);
        console.log("HTML 2:", html2);

        const latex3 = await convertText(html2);
        console.log("LaTeX 3:", latex3);

    } catch (e) {
        console.error(e);
    }
}

test();
