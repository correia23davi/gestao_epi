import { getAuthUser } from "./jwt.js";
import { getUserById } from "./models.js";
import { sendJson } from "./http.js";

export async function requireUser(req, res) {
  const payload = getAuthUser(req);
  if (!payload) {
    sendJson(res, 401, { error: "Não autenticado." });
    return null;
  }
  const user = await getUserById(payload.id);
  if (!user) {
    sendJson(res, 401, { error: "Sessão inválida." });
    return null;
  }
  return user;
}

export async function requireAdmin(req, res) {
  const user = await requireUser(req, res);
  if (!user) return null;
  if (user.role !== "admin") {
    sendJson(res, 403, { error: "Acesso restrito ao administrador." });
    return null;
  }
  return user;
}
