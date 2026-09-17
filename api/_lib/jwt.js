import jwt from "jsonwebtoken";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      'JWT_SECRET não definida. Gere uma com "npm run gen-secrets" e ' +
        "configure-a nas variáveis de ambiente."
    );
  }
  return secret;
}

export function signToken(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: "8h" });
}

export function verifyToken(token) {
  return jwt.verify(token, getSecret());
}

export function getAuthUser(req) {
  const header = req.headers.authorization || "";
  const [, token] = header.split(" ");
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}
