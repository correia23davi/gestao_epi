import { ensureSeeded } from "../_lib/seed.js";
import { requireUser } from "../_lib/authGuard.js";
import { listWithdrawals, listEquipment, decrementStock, createWithdrawal } from "../_lib/models.js";
import { formatDateTime } from "../_lib/format.js";
import { readJsonBody, sendJson, methodNotAllowed } from "../_lib/http.js";

export default async function handler(req, res) {
  await ensureSeeded();
  const user = await requireUser(req, res);
  if (!user) return;

  if (req.method === "GET") {
    const all = await listWithdrawals();
    const scoped = user.role === "admin" ? all : all.filter((w) => w.userId === user.id);
    return sendJson(res, 200, scoped);
  }

  if (req.method === "POST") {
    try {
      const { equipmentId, size, signature } = await readJsonBody(req);
      if (!equipmentId || !size) return sendJson(res, 400, { error: "Selecione o equipamento e o tamanho." });

      const equipment = (await listEquipment()).find((e) => e.id === equipmentId);
      if (!equipment) return sendJson(res, 404, { error: "Equipamento não encontrado." });

      await decrementStock(equipmentId, size);

      const withdrawal = await createWithdrawal({
        userId: user.id,
        userName: user.name,
        equipmentId,
        equipmentName: equipment.name,
        size,
        date: formatDateTime(new Date()),
        signature: signature || "",
      });

      return sendJson(res, 201, withdrawal);
    } catch (err) {
      console.error("withdrawals POST", err);
      return sendJson(res, 400, { error: err.message || "Erro ao registrar retirada." });
    }
  }

  return methodNotAllowed(res, ["GET", "POST"]);
}
