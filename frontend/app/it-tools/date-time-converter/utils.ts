import {
    isMatch
} from 'date-fns';

const ISO8601_REGEX = /^([+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([.,]\d+(?!:))?)?(\17[0-5]\d([.,]\d+)?)?([zZ]|([+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
const ISO9075_REGEX = /^([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})(\.[0-9]{1,6})?(([+-])([0-9]{2}):([0-9]{2})|Z)?$/;
const RFC3339_REGEX = /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})(\.[0-9]{1,9})?(([+-])([0-9]{2}):([0-9]{2})|Z)$/;
const RFC7231_REGEX = /^[A-Za-z]{3},\s[0-9]{2}\s[A-Za-z]{3}\s[0-9]{4}\s[0-9]{2}:[0-9]{2}:[0-9]{2}\sGMT$/;
const EXCEL_FORMAT_REGEX = /^-?\d+(\.\d+)?$/;

function createRegexMatcher(regex: RegExp) {
    return (date?: string) => !!date && regex.test(date);
}

export const isISO8601DateTimeString = createRegexMatcher(ISO8601_REGEX);
export const isISO9075DateString = createRegexMatcher(ISO9075_REGEX);
export const isRFC3339DateString = createRegexMatcher(RFC3339_REGEX);
export const isRFC7231DateString = createRegexMatcher(RFC7231_REGEX);
export const isUnixTimestamp = createRegexMatcher(/^[0-9]{1,10}$/);
export const isTimestamp = createRegexMatcher(/^[0-9]{1,13}$/);
export const isMongoObjectId = createRegexMatcher(/^[0-9a-fA-F]{24}$/);
export const isExcelFormat = createRegexMatcher(EXCEL_FORMAT_REGEX);

export function isUTCDateString(date?: string) {
    if (!date) return false;
    try {
        return new Date(date).toUTCString() === date;
    } catch {
        return false;
    }
}

export function dateToExcelFormat(date: Date) {
    return String(((date.getTime()) / (1000 * 60 * 60 * 24)) + 25569);
}

export function excelFormatToDate(excelFormat: string | number) {
    return new Date((Number(excelFormat) - 25569) * 86400 * 1000);
}
