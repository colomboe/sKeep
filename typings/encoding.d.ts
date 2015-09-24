declare class TextDecoder {
    constructor(enc: string);
    decode(data: ArrayBufferView): string;
}

declare class TextEncoder {
    constructor(enc: string);
    encode(data: string): Uint8Array;
}