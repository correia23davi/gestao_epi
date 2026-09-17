import { dbGet, dbSet, dbDel } from "./db.js";
import { encrypt, decrypt, blindIndex } from "./crypto.js";
import { hashPassword } from "./passwords.js";

const USER_IDS_KEY = "epi:index:userIds";
const EQUIPMENT_IDS_KEY = "epi:index:equipmentIds";
const WITHDRAWAL_IDS_KEY = "epi:index:withdrawalIds";

function newId(prefix) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

async function getIdList(key) {
  const ids = await dbGet(key);
  return Array.isArray(ids) ? ids : [];
}

async function addId(key, id) {
  const ids = await getIdList(key);
  if (!ids.includes(id)) {
    ids.push(id);
    await dbSet(key, ids);
  }
}

async function removeId(key, id) {
  const ids = await getIdList(key);
  const next = ids.filter((x) => x !== id);
  await dbSet(key, next);
}

export async function listUsers() {
  const ids = await getIdList(USER_IDS_KEY);
  const users = await Promise.all(ids.map((id) => getUserById(id)));
  return users.filter(Boolean);
}

export async function getUserById(id) {
  const blob = await dbGet(`epi:user:${id}`);
  if (!blob) return null;
  try {
    return { id, ...decrypt(blob) };
  } catch {
    return null;
  }
}

export async function findUserByLogin(login) {
  const id = await dbGet(`epi:idx:login:${blindIndex(login)}`);
  if (!id) return null;
  return getUserById(id);
}

export async function createUser({ name, login, password, role, age, department, position }) {
  const cleanName = String(name).trim().toUpperCase();
  const cleanLogin = String(login).trim().toLowerCase().replace(/\s+/g, "");

  if (!cleanLogin) {
    const err = new Error("Informe um login.");
    err.code = "INVALID_LOGIN";
    throw err;
  }

  if (await findUserByLogin(cleanLogin)) {
    const err = new Error("Esse login já está em uso.");
    err.code = "DUPLICATE_LOGIN";
    throw err;
  }

  const id = newId("u");
  const passwordHash = await hashPassword(password);
  const record = {
    name: cleanName,
    login: cleanLogin,
    age: Number(age),
    department,
    position,
    role,
    passwordHash,
  };

  await dbSet(`epi:user:${id}`, encrypt(record));
  await dbSet(`epi:idx:login:${blindIndex(cleanLogin)}`, id);
  await addId(USER_IDS_KEY, id);

  return { id, ...record };
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

export async function updateUserPassword(id, newPassword) {
  const existing = await getUserById(id);
  if (!existing) {
    const err = new Error("Colaborador não encontrado.");
    err.code = "NOT_FOUND";
    throw err;
  }
  const { id: _drop, ...record } = existing;
  record.passwordHash = await hashPassword(newPassword);
  await dbSet(`epi:user:${id}`, encrypt(record));
  return { id, ...record };
}

export async function deleteUser(id) {
  const existing = await getUserById(id);
  if (!existing) {
    const err = new Error("Colaborador não encontrado.");
    err.code = "NOT_FOUND";
    throw err;
  }
  await dbDel(`epi:user:${id}`);
  await dbDel(`epi:idx:login:${blindIndex(existing.login)}`);
  await removeId(USER_IDS_KEY, id);
  return true;
}

export async function listEquipment() {
  const ids = await getIdList(EQUIPMENT_IDS_KEY);
  const items = await Promise.all(ids.map((id) => dbGet(`epi:equipment:${id}`)));
  return items.filter(Boolean);
}

export async function saveEquipmentItem(item) {
  await dbSet(`epi:equipment:${item.id}`, item);
  await addId(EQUIPMENT_IDS_KEY, item.id);
  return item;
}

export async function upsertStock({ name, size, quantity }) {
  const upperName = String(name).toUpperCase().trim();
  const all = await listEquipment();
  const existing = all.find((e) => e.name === upperName);

  if (existing) {
    const hasSize = existing.sizes.find((s) => s.size === size);
    existing.sizes = hasSize
      ? existing.sizes.map((s) =>
          s.size === size ? { ...s, quantity: s.quantity + quantity } : s
        )
      : [...existing.sizes, { size, quantity }];
    await saveEquipmentItem(existing);
    return existing;
  }

  const created = { id: newId("e"), name: upperName, sizes: [{ size, quantity }] };
  await saveEquipmentItem(created);
  return created;
}

export async function decrementStock(equipmentId, size) {
  const all = await listEquipment();
  const item = all.find((e) => e.id === equipmentId);
  if (!item) throw new Error("Equipamento não encontrado.");

  const sizeRow = item.sizes.find((s) => s.size === size);
  if (!sizeRow || sizeRow.quantity <= 0) {
    throw new Error("Sem estoque disponível para este tamanho.");
  }

  item.sizes = item.sizes.map((s) =>
    s.size === size ? { ...s, quantity: s.quantity - 1 } : s
  );
  await saveEquipmentItem(item);
  return item;
}

export async function listWithdrawals() {
  const ids = await getIdList(WITHDRAWAL_IDS_KEY);
  const items = await Promise.all(ids.map((id) => getWithdrawalById(id)));
  return items.filter(Boolean);
}

export async function getWithdrawalById(id) {
  const blob = await dbGet(`epi:withdrawal:${id}`);
  if (!blob) return null;
  try {
    return { id, ...decrypt(blob) };
  } catch {
    return null;
  }
}

export async function createWithdrawal(record) {
  const id = newId("w");
  await dbSet(`epi:withdrawal:${id}`, encrypt(record));
  await addId(WITHDRAWAL_IDS_KEY, id);
  return { id, ...record };
}
