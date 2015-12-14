declare module asmCrypto {
    
	class PBKDF2_HMAC_SHA1 {
		static bytes(password: string, salt: string, iterations: number, size: number);
	}
}