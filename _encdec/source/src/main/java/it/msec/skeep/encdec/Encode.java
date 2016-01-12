package it.msec.skeep.encdec;

import java.io.IOException;
import java.lang.reflect.Field;
import java.math.BigInteger;
import java.nio.ByteBuffer;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;

public class Encode 
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
    
    public static void encode( String[] args ) throws IOException, NoSuchAlgorithmException, InvalidKeySpecException, InvalidKeyException, InvalidAlgorithmParameterException, NoSuchProviderException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException
    {
    	Path p = FileSystems.getDefault().getPath(args[0]);
        byte [] fileData = Files.readAllBytes(p);
    	
    	System.out.print("Enter your password: ");
    	char[] pwd = System.console().readPassword();
    	String password = new String(pwd);
    	
    	SecureRandom sr = SecureRandom.getInstance("SHA1PRNG");
        byte[] salt = new byte[64];
        byte[] iv = new byte[16];
        sr.nextBytes(salt);
        sr.nextBytes(iv);
        
        System.out.println("File format: " + "SKEEP");
        System.out.println("File version: " + "2");
        System.out.println("Initialization vector: 0x" + toHex(iv));
        System.out.println("Salt: 0x" + toHex(salt));
        System.out.println("");
        
    	PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, 4096, 256);
        SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1");
        byte[] key = skf.generateSecret(spec).getEncoded();
    	
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding", "SunJCE"); 
        SecretKeySpec skey = new SecretKeySpec(key, "AES"); 
        cipher.init(Cipher.ENCRYPT_MODE, skey, new IvParameterSpec(iv));
        byte aesData[] = cipher.doFinal(fileData);
        
        ByteBuffer bb = ByteBuffer.allocate(aesData.length + 86);
        bb.put("SKEEP".getBytes());
        bb.put((byte)2);
        bb.put(iv);
        bb.put(salt);
        bb.put(aesData);
        
        Path p2 = FileSystems.getDefault().getPath(args[1]);
        Files.write(p2, bb.array(), StandardOpenOption.CREATE_NEW);
        System.out.println("Written to " + args[1]);
    }
}
