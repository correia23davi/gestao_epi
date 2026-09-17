const TOKEN_KEY = "epi_token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

async function request(path, { method = "GET", body } = {}) {
  const token = getToken();

  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    throw new Error((data && data.error) || "Não foi possível completar a operação.");
  }
  return data;
}

export const api = {
  login: (login, password) => request("/auth/login", { method: "POST", body: { login, password } }),
  me: () => request("/auth/me"),

  listUsers: () => request("/users"),
  createUser: (payload) => request("/users", { method: "POST", body: payload }),
  changePassword: (id, password, confirmPassword) =>
    request(`/users/${id}`, { method: "PATCH", body: { password, confirmPassword } }),
  deleteUser: (id) => request(`/users/${id}`, { method: "DELETE" }),

  listEquipment: () => request("/equipment"),
  addStock: (payload) => request("/equipment", { method: "POST", body: payload }),

  listWithdrawals: () => request("/withdrawals"),
  createWithdrawal: (payload) => request("/withdrawals", { method: "POST", body: payload }),
};
