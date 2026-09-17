import { ensureSeeded } from "../_lib/seed.js";
import { findUserByLogin, sanitizeUser } from "../_lib/models.js";
import { verifyPassword } from "../_lib/passwords.js";
import { signToken } from "../_lib/jwt.js";
import { readJsonBody, sendJson, methodNotAllowed } from "../_lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  try {
    await ensureSeeded();
    const { login, password } = await readJsonBody(req);
    if (!login || !password) {
      return sendJson(res, 400, { error: "Informe login e senha." });
    }

    const user = await findUserByLogin(login);
    const valid = user ? await verifyPassword(password, user.passwordHash) : false;
    if (!valid) {
      return sendJson(res, 401, { error: "Login ou senha inválidos." });
    }

    const token = signToken({ id: user.id, role: user.role });
    return sendJson(res, 200, { token, user: sanitizeUser(user) });
  } catch (err) {
    console.error("auth/login", err);
    return sendJson(res, 500, { error: "Erro interno ao autenticar." });
  }
}
