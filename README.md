# sKeep

sKeep is a password and note manager running entirely inside the web browser. It does encryption and decryption on the client side, so your data and your password are never sent or stored anywhere outside your PC until encryption is done. It provides a UI for desktop and mobile usage.

Encrypted data is stored inside your Dropbox account storage. It is suggested to use a dedicated Dropbox account with two factor authentication enabled in order to get total access security.

Any notebook is encrypted with a dedicated password; since the encryption/decryption key is derived from the password, if you loose the password you are actually loosing all your notebook data.

Browser support is the following:
 * Internet Exporer 11
 * Microsoft Edge
 * Firefox 40 or later
 * Chrome 45 or later

Roadmap

When Edge will support native PDBFK2 algorithm, drop support for IE11 in order to obtain a better password/key security with higher iteration values.

Installation/development

sKeep is developed in TypeScript, so you need a TypeScript compiler in order to generate the app js file. Then, all you need is to deploy the app on a HTTPS web server.
You have to obtain a key from the Dropbox developer portal by creating a new App. Insert the data about your app inside the XXXX file before compiling.



