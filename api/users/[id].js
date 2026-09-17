import { requireAdmin } from "../_lib/authGuard.js";
import { getUserById, updateUserPassword, deleteUser, sanitizeUser } from "../_lib/models.js";
import { readJsonBody, sendJson, methodNotAllowed } from "../_lib/http.js";

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const { id } = req.query;
  if (!id) return sendJson(res, 400, { error: "Colaborador não informado." });

  if (req.method === "PATCH") {
    try {
      const target = await getUserById(id);
      if (!target) return sendJson(res, 404, { error: "Colaborador não encontrado." });
      if (target.role === "admin") {
        return sendJson(res, 403, { error: "Não é possível alterar a senha do administrador por aqui." });
      }

      const { password, confirmPassword } = await readJsonBody(req);
      if (!password || String(password).length < 8) {
        return sendJson(res, 400, { error: "Senha mínima de 8 caracteres." });
      }
      if (password !== confirmPassword) {
        return sendJson(res, 400, { error: "As senhas não coincidem." });
      }

      const updated = await updateUserPassword(id, password);
      return sendJson(res, 200, sanitizeUser(updated));
    } catch (err) {
      if (err.code === "NOT_FOUND") return sendJson(res, 404, { error: "Colaborador não encontrado." });
      console.error("users/[id] PATCH", err);
      return sendJson(res, 500, { error: "Erro interno ao alterar a senha." });
    }
  }

  if (req.method === "DELETE") {
    try {
      const target = await getUserById(id);
      if (!target) return sendJson(res, 404, { error: "Colaborador não encontrado." });
      if (target.role === "admin") {
        return sendJson(res, 403, { error: "Não é possível apagar uma conta de administrador." });
      }

      await deleteUser(id);
      return sendJson(res, 200, { deleted: true });
    } catch (err) {
      if (err.code === "NOT_FOUND") return sendJson(res, 404, { error: "Colaborador não encontrado." });
      console.error("users/[id] DELETE", err);
      return sendJson(res, 500, { error: "Erro interno ao apagar o colaborador." });
    }
  }

  return methodNotAllowed(res, ["PATCH", "DELETE"]);
}
