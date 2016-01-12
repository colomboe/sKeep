package it.msec.skeep.encdec;

import java.io.IOException;
import java.lang.reflect.Field;
import java.math.BigInteger;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.spec.InvalidKeySpecException;
import java.util.Arrays;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;

public class Decode 
{
	static {
        try {
            Field field = Class.forName("javax.crypto.JceSecurity").getDeclaredField("isRestricted");
            field.setAccessible(true);
            field.set(null, java.lang.Boolean.FALSE);
        } catch (Exception ex) {
        }
    }
	
    private static String toHex(byte[] array) {
        BigInteger bi = new BigInteger(1, array);
        String hex = bi.toString(16);
        int paddingLength = (array.length * 2) - hex.length();
        if (paddingLength > 0)
            return String.format("%0" + paddingLength + "d", 0) + hex;
        else
            return hex;
    }
    
    public static void decode( String[] args ) throws IOException, NoSuchAlgorithmException, InvalidKeySpecException, InvalidKeyException, InvalidAlgorithmParameterException, NoSuchProviderException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException
    {
    	Path p = FileSystems.getDefault().getPath(args[0]);
        byte [] fileData = Files.readAllBytes(p);
    	
    	System.out.print("Enter your password: ");
    	char[] pwd = System.console().readPassword();
    	String password = new String(pwd);
    	
        String format = new String(fileData, 0, 5);
        byte version = fileData[5];
        byte iv[] = Arrays.copyOfRange(fileData, 6, 6 + 16);
        byte salt[] = Arrays.copyOfRange(fileData, 22, 22 + 64);
        byte aesData[] = Arrays.copyOfRange(fileData, 86, fileData.length);
        
        System.out.println("File data size: " + aesData.length);
        System.out.println("File format: " + format);
        System.out.println("File version: " + version);
        System.out.println("Initialization vector: 0x" + toHex(iv));
        System.out.println("Salt: 0x" + toHex(salt));
        System.out.println("");
        
        PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, 4096, 256);
        SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1");
        byte[] key = skf.generateSecret(spec).getEncoded();
        
        Cipher cipher = Cipher.getInstance("AES/CBC/NoPadding", "SunJCE"); 
        SecretKeySpec skey = new SecretKeySpec(key, "AES"); 
        cipher.init(Cipher.DECRYPT_MODE, skey, new IvParameterSpec(iv));
        byte ret[] = cipher.doFinal(aesData);
        
        if ((args.length == 2) && (!args[1].isEmpty())) {
	        
	        Path p2 = FileSystems.getDefault().getPath(args[1]);
	        Files.write(p2, ret, StandardOpenOption.CREATE_NEW);
	        System.out.println("Written to " + args[1]);
        }
        else
        	System.out.println(new String(ret, "UTF-8"));
    }
}
