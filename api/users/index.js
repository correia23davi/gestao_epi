import { ensureSeeded } from "../_lib/seed.js";
import { requireAdmin } from "../_lib/authGuard.js";
import { listUsers, createUser, sanitizeUser } from "../_lib/models.js";
import { readJsonBody, sendJson, methodNotAllowed } from "../_lib/http.js";

export default async function handler(req, res) {
  await ensureSeeded();
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method === "GET") {
    const users = (await listUsers()).filter((u) => u.role === "user").map(sanitizeUser);
    return sendJson(res, 200, users);
  }

  if (req.method === "POST") {
    try {
      const { name, login, age, department, position, password, confirmPassword } = await readJsonBody(req);

      if (!name || !String(name).trim()) return sendJson(res, 400, { error: "Informe o nome do colaborador." });
      if (!login || !String(login).trim()) return sendJson(res, 400, { error: "Informe o login do colaborador." });
      if (!age || Number.isNaN(Number(age))) return sendJson(res, 400, { error: "Informe a idade." });
      if (!position || !String(position).trim()) return sendJson(res, 400, { error: "Informe o cargo." });
      if (!password || String(password).length < 4) return sendJson(res, 400, { error: "Senha mínima de 4 caracteres." });
      if (password !== confirmPassword) return sendJson(res, 400, { error: "As senhas não coincidem." });

      const user = await createUser({
        name,
        login,
        password,
        role: "user",
        age: Number(age),
        department: department || "OPERAÇÃO",
        position: String(position).trim(),
      });
      return sendJson(res, 201, sanitizeUser(user));
    } catch (err) {
      if (err.code === "DUPLICATE_LOGIN") return sendJson(res, 409, { error: "Esse login já está em uso." });
      if (err.code === "INVALID_LOGIN") return sendJson(res, 400, { error: "Informe um login válido." });
      console.error("users POST", err);
      return sendJson(res, 500, { error: "Erro interno ao cadastrar colaborador." });
    }
  }

  return methodNotAllowed(res, ["GET", "POST"]);
}
