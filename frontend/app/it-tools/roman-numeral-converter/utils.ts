export const MIN_ARABIC_TO_ROMAN = 1;
export const MAX_ARABIC_TO_ROMAN = 3999;

export function arabicToRoman(num: number): string {
    if (num < MIN_ARABIC_TO_ROMAN || num > MAX_ARABIC_TO_ROMAN) {
        return '';
    }

    const lookup: { [key: string]: number } = {
        M: 1000,
        CM: 900,
        D: 500,
        CD: 400,
        C: 100,
        XC: 90,
        L: 50,
        XL: 40,
        X: 10,
        IX: 9,
        V: 5,
        IV: 4,
        I: 1,
    };
    let roman = '';
    // num is modified, so we act on a copy if needed, but primitive is passed by value
    let n = num;
    for (const i in lookup) {
        while (n >= lookup[i]) {
            roman += i;
            n -= lookup[i];
        }
    }
    return roman;
}

const ROMAN_NUMBER_REGEX = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

export function isValidRomanNumber(romanNumber: string) {
    return ROMAN_NUMBER_REGEX.test(romanNumber);
}

export function romanToArabic(s: string): number | null {
    if (!s || !isValidRomanNumber(s)) {
        return null;
    }
    const map: { [key: string]: number } = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    return [...s].reduce((r, c, i, arr) => (map[arr[i + 1]] > map[c] ? r - map[c] : r + map[c]), 0);
}
