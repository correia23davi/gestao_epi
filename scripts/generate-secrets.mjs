import crypto from "node:crypto";

console.log("JWT_SECRET=" + crypto.randomBytes(48).toString("hex"));
console.log("DATA_ENCRYPTION_KEY=" + crypto.randomBytes(32).toString("hex"));
