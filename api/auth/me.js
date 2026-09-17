import { requireUser } from "../_lib/authGuard.js";
import { sanitizeUser } from "../_lib/models.js";
import { sendJson, methodNotAllowed } from "../_lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  const user = await requireUser(req, res);
  if (!user) return;

  return sendJson(res, 200, { user: sanitizeUser(user) });
}
