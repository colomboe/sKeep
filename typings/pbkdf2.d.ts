declare class PBKDF2 {
    constructor(password: string, salt: string, iterations: number, size: number);
    deriveKey(first: () => void, second: (key: string) => void): void;
}