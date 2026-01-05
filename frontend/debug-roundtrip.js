const { convertText } = require('html-to-latex');

// Mock of my frontend Regex parser (Simulating what runs in browser)
const latexToHtml = (latex) => {
    let html = latex;

    // 1. Extract Body
    const bodyMatch = html.match(/\\begin\{document\}([\s\S]*)\\end\{document\}/);
    if (bodyMatch && bodyMatch[1]) {
        html = bodyMatch[1];
    } else {
        html = html.replace(/\\documentclass[\s\S]*?\\begin\{document\}/, '');
    }

    // 2. Remove Metadata
    html = html.replace(/\\title\{.*?\}/g, '')
        .replace(/\\author\{.*?\}/g, '')
        .replace(/\\date\{.*?\}/g, '')
        .replace(/\\maketitle/g, '<h1>My Resume</h1>'); // <--- This adds H1 if maketitle exists

    // 3. Structural (My Updated Logic)
    html = html.replace(/\\section\*?\{(.*?)\}/g, '<h1>$1</h1>')
        .replace(/\\subsection\*?\{(.*?)\}/g, '<h2>$1</h2>')
        .replace(/\\subsubsection\*?\{(.*?)\}/g, '<h3>$1</h3>')
        .replace(/\\centering\{(.*?)\}/g, '<center>$1</center>')
        .replace(/\{\\centering (.*?)\}/g, '<center>$1</center>');

    // 4. Formatting
    html = html.replace(/\\textbf\{(.*?)\}/g, '<strong>$1</strong>')
        .replace(/\\textit\{(.*?)\}/g, '<em>$1</em>')
        .replace(/\\underline\{(.*?)\}/g, '<u>$1</u>');

    // 5. Lists
    html = html.replace(/\\begin\{itemize\}/g, '<ul>')
        .replace(/\\end\{itemize\}/g, '</ul>')
        .replace(/\\item\s+(.*)/g, '<li>$1</li>');

    // 6. Newlines & Cleanup
    html = html.replace(/\\\\/g, '<br>');
    // Current logic does NOT touch \n

    return html.trim();
};

async function test() {
    const latex3 = await convertText(html2);
    console.log("\nLaTeX 3:", latex3);
}

test();
