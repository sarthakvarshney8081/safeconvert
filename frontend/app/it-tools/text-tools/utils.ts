export const natoAlphabet = [
    'Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf',
    'Hotel', 'India', 'Juliet', 'Kilo', 'Lima', 'Mike', 'November',
    'Oscar', 'Papa', 'Quebec', 'Romeo', 'Sierra', 'Tango', 'Uniform',
    'Victor', 'Whiskey', 'X-ray', 'Yankee', 'Zulu'
];

export function textToNato(text: string): string {
    return text
        .split('')
        .map((char) => {
            const lower = char.toLowerCase();
            const code = lower.charCodeAt(0);
            if (code >= 97 && code <= 122) {
                return natoAlphabet[code - 97];
            }
            return char;
        })
        .join(' ');
}

export function textToBinary(text: string, separator = ' '): string {
    return text
        .split('')
        .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
        .join(separator);
}

export function binaryToText(binary: string): string {
    const cleanBinary = binary.replace(/[^01]/g, '');
    if (cleanBinary.length % 8 !== 0) return '';

    // Split into chunks of 8
    const chunks = cleanBinary.match(/.{1,8}/g) || [];
    return chunks.map(chunk => String.fromCharCode(parseInt(chunk, 2))).join('');
}

export function textToUnicode(text: string): string {
    return text.split('').map(value => `&#${value.charCodeAt(0)};`).join('');
}

export function unicodeToText(unicodeStr: string): string {
    return unicodeStr.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(Number(dec)));
}
