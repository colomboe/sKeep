# Encoding and decoding CLI tool

This tool is designed to let you import and export data in your Dropbox sKeep archive. It is also useful as a "change password" tool since you can export your data to a plain text/JSON file and then encode it again with a new password.

## Requirements

This tool is implemented in Java 8, so you need a compatible JRE installed on your system. I've tested it only on Windows, but I think it should work on any Java supported platform.

## Build

You can use the pre-compiled JAR file provided, but if you prefer to build it yourself, you simply have to move to the source folder and then execute the command
```
mvn install
```
(the build process requires Maven and a compatible JDK installed on your system)

## Execution

From a command prompt, move into the JAR folder and then execute the following command:
```
java -jar skeep.encdec-2.1.0.jar
```
Then you can follow the instructions provided.

## Example

To decode a .skeep file to stdout:
```
java -jar skeep.encdec-2.1.0.jar decode myfile.skeep
```
