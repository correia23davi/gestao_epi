import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";

function getKey() {
  const keyHex = process.env.DATA_ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error(
      'DATA_ENCRYPTION_KEY não definida. Gere uma com "npm run gen-secrets" e ' +
        "configure-a nas variáveis de ambiente."
    );
  }
  const key = Buffer.from(keyHex, "hex");
  if (key.length !== 32) {
    throw new Error(
      "DATA_ENCRYPTION_KEY inválida: precisa ser uma string hexadecimal de " +
        "64 caracteres (32 bytes)."
    );
  }
  return key;
}

export function encrypt(plainObj) {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const plaintext = Buffer.from(JSON.stringify(plainObj), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, ciphertext]).toString("base64");
}

export function decrypt(payloadB64) {
  const key = getKey();
  const raw = Buffer.from(payloadB64, "base64");
  const iv = raw.subarray(0, 12);
  const authTag = raw.subarray(12, 28);
  const ciphertext = raw.subarray(28);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(plaintext.toString("utf8"));
}

export function blindIndex(value) {
  const key = getKey();
  return crypto
    .createHmac("sha256", key)
    .update(String(value).trim().toUpperCase())
    .digest("hex");
}
