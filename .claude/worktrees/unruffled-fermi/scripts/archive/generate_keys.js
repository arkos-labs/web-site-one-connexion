import crypto from 'crypto';

// Generate VAPID-compatible key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'prime256v1',
});

const pub = publicKey.export({ type: 'spki', format: 'buffer' });
const priv = privateKey.export({ type: 'pkcs8', format: 'buffer' });

// We need just the raw 65 bytes for the public key
// and 32 bytes for the private key for some web-push libraries
// But standard web-push uses base64url encoded PEM or raw
console.log("Public Key (base64):", pub.toString('base64'));
console.log("Private Key (base64):", priv.toString('base64'));
