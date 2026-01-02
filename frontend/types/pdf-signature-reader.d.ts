declare module 'pdf-signature-reader' {
    export interface Signature {
        reason: string;
        contactInfo: string;
        location: string;
        name: string;
        signedData: Buffer;
        byteRange: number[];
        type: string;
        subFilter: string;
    }

    export function getSignatures(pdfBuffer: Buffer): Signature[];
}
