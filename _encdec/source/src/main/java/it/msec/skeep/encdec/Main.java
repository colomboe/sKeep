package it.msec.skeep.encdec;

import java.io.IOException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.spec.InvalidKeySpecException;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;

public class Main {

	public static void main(String[] args) throws InvalidKeyException, NoSuchAlgorithmException, InvalidKeySpecException, InvalidAlgorithmParameterException, NoSuchProviderException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, IOException {
		if ((args.length == 0)
			|| (("encode".equals(args[0])) && (args.length < 3))
			|| (("decode".equals(args[0])) && (args.length < 2))) {
			System.out.println("\nUsage:");
			System.out.println(" - Encoding: java -jar skeep.encdec-2.1.0.jar encode <source> <destination>");
			System.out.println(" - Decoding: java -jar skeep.encdec-2.1.0.jar decode <source> [<destination>]");
			System.out.println("   (if no destination is provided the output is printed on stdout)");
			return;
		}
		
		switch (args[0]) {
		
			case "encode":
				String encodeArgs[] = new String[2];
				encodeArgs[0] = args[1];
				encodeArgs[1] = args[2];
				Encode.encode(encodeArgs);
				break;
			case "decode":
				String decodeArgs[] = new String[2];
				decodeArgs[0] = args[1];
				if (args.length == 3)
					decodeArgs[1] = args[2];
				else
					decodeArgs[1] = "";
				Decode.decode(decodeArgs);
				break;
			default:
				System.out.println("Unknown command \"" + args[0] + "\"");	
		}
		
	}

}
