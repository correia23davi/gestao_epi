import { ensureSeeded } from "../_lib/seed.js";
import { requireUser, requireAdmin } from "../_lib/authGuard.js";
import { listEquipment, upsertStock } from "../_lib/models.js";
import { readJsonBody, sendJson, methodNotAllowed } from "../_lib/http.js";

export default async function handler(req, res) {
  await ensureSeeded();

  if (req.method === "GET") {
    const user = await requireUser(req, res);
    if (!user) return;
    return sendJson(res, 200, await listEquipment());
  }

  if (req.method === "POST") {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    try {
      const { name, size, quantity } = await readJsonBody(req);
      const qty = parseInt(quantity, 10);

      if (!name || !String(name).trim()) return sendJson(res, 400, { error: "Informe o nome do equipamento." });
      if (!size || !String(size).trim()) return sendJson(res, 400, { error: "Selecione o tamanho." });
      if (Number.isNaN(qty) || qty < 0) return sendJson(res, 400, { error: "Informe uma quantidade válida." });

      const updated = await upsertStock({ name, size: String(size).trim(), quantity: qty });
      return sendJson(res, 200, updated);
    } catch (err) {
      console.error("equipment POST", err);
      return sendJson(res, 500, { error: "Erro interno ao atualizar estoque." });
    }
  }

  return methodNotAllowed(res, ["GET", "POST"]);
}
