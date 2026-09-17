import {
  listUsers,
  createUser,
  listEquipment,
  saveEquipmentItem,
  decrementStock,
  createWithdrawal,
} from "./models.js";
import { formatDateTime } from "./format.js";

const SEED_EQUIPMENT = [
  { name: "CAPACETE DE SEGURANÇA", sizes: [{ size: "P", quantity: 12 }, { size: "M", quantity: 8 }, { size: "G", quantity: 3 }, { size: "GG", quantity: 0 }, { size: "XG", quantity: 0 }] },
  { name: "LUVA DE PROTEÇÃO", sizes: [{ size: "P", quantity: 20 }, { size: "M", quantity: 15 }, { size: "G", quantity: 2 }, { size: "GG", quantity: 0 }, { size: "XG", quantity: 0 }] },
  { name: "BOTA DE SEGURANÇA", sizes: [{ size: "P", quantity: 5 }, { size: "M", quantity: 4 }, { size: "G", quantity: 6 }, { size: "GG", quantity: 1 }, { size: "XG", quantity: 0 }] },
  { name: "COLETE REFLETIVO", sizes: [{ size: "P", quantity: 0 }, { size: "M", quantity: 7 }, { size: "G", quantity: 9 }, { size: "GG", quantity: 4 }, { size: "XG", quantity: 0 }] },
  { name: "ÓCULOS DE PROTEÇÃO", sizes: [{ size: "ÚNICO", quantity: 1 }] },
  { name: "PROTETOR AURICULAR", sizes: [{ size: "ÚNICO", quantity: 30 }] },
  { name: "CINTO DE SEGURANÇA", sizes: [{ size: "P", quantity: 0 }, { size: "M", quantity: 0 }, { size: "G", quantity: 2 }, { size: "GG", quantity: 0 }, { size: "XG", quantity: 0 }] },
];

function slugId(name) {
  return (
    "e-" +
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  );
}

let seeded = false;

export async function ensureSeeded() {
  if (seeded) return;

  let equipment = await listEquipment();
  if (equipment.length === 0) {
    for (const item of SEED_EQUIPMENT) {
      await saveEquipmentItem({
        id: slugId(item.name),
        name: item.name,
        sizes: item.sizes.map((s) => ({ ...s })),
      });
    }
    equipment = await listEquipment();
  }

  const users = await listUsers();
  if (users.length === 0) {
    await createUser({
      name: process.env.SEED_ADMIN_NAME || "ADMIN",
      login: process.env.SEED_ADMIN_LOGIN || "admin",
      password: process.env.SEED_ADMIN_PASSWORD || "admin123",
      role: "admin",
      age: 35,
      department: "T.I",
      position: "Administrador do Sistema",
    });

    if (String(process.env.SEED_DEMO_DATA).toLowerCase() === "true") {
      const demo = [
        { name: "CARLOS SILVA", login: "carlos.silva", age: 28, department: "OPERAÇÃO", position: "Operador de Campo", eq: "CAPACETE DE SEGURANÇA", size: "M" },
        { name: "MARIANA COSTA", login: "mariana.costa", age: 32, department: "RH", position: "Analista de RH", eq: "LUVA DE PROTEÇÃO", size: "P" },
        { name: "FELIPE SANTOS", login: "felipe.santos", age: 24, department: "T.I", position: "Técnico de Suporte", eq: "ÓCULOS DE PROTEÇÃO", size: "ÚNICO" },
        { name: "ANA LIMA", login: "ana.lima", age: 41, department: "OPERAÇÃO", position: "Supervisora", eq: "BOTA DE SEGURANÇA", size: "G" },
      ];

      for (const d of demo) {
        const user = await createUser({
          name: d.name,
          login: d.login,
          password: "1234",
          role: "user",
          age: d.age,
          department: d.department,
          position: d.position,
        });
        const eqItem = equipment.find((e) => e.name === d.eq);
        if (eqItem) {
          await decrementStock(eqItem.id, d.size);
          await createWithdrawal({
            userId: user.id,
            userName: user.name,
            equipmentId: eqItem.id,
            equipmentName: eqItem.name,
            size: d.size,
            date: formatDateTime(new Date()),
            signature: "",
          });
        }
      }
    }
  }

  seeded = true;
}
