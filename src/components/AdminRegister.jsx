import { useState } from "react";
import { Icon } from "./Icon";
import { api } from "../lib/api";

const DEPT_COLOR = {
  "T.I": "text-[#2471a3] border-[#2471a3]/20 bg-[#2471a3]/5",
  "RH": "text-[#2d7d4a] border-[#2d7d4a]/20 bg-[#2d7d4a]/5",
  "OPERAÇÃO": "text-[#3d7a52] border-[#3d7a52]/20 bg-[#3d7a52]/5",
};

function suggestLogin(fullName) {
  return fullName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9.]/g, "");
}

export default function AdminRegister({ users, onUserCreated }) {
  const [name, setName] = useState("");
  const [login, setLogin] = useState("");
  const [loginTouched, setLoginTouched] = useState(false);
  const [age, setAge] = useState("");
  const [department, setDepartment] = useState("OPERAÇÃO");
  const [position, setPosition] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setName(""); setLogin(""); setLoginTouched(false);
    setAge(""); setDepartment("OPERAÇÃO"); setPosition("");
    setPassword(""); setConfirm("");
  };

  const handleNameChange = (value) => {
    setName(value.toUpperCase());
    if (!loginTouched) setLogin(suggestLogin(value));
  };

  const handleLoginChange = (value) => {
    setLoginTouched(true);
    setLogin(value.toLowerCase().replace(/\s+/g, ""));
  };

  const handleRegister = async () => {
    if (loading) return;
    setError("");

    const upperName = name.toUpperCase().trim();
    const cleanLogin = login.trim();
    if (!upperName) { setError("Informe o nome do colaborador."); return; }
    if (!cleanLogin) { setError("Informe o login do colaborador."); return; }
    if (!age || isNaN(Number(age))) { setError("Informe a idade."); return; }
    if (!position.trim()) { setError("Informe o cargo."); return; }
    if (password.length < 8) { setError("Senha mínima de 8 caracteres."); return; }
    if (password !== confirm) { setError("As senhas não coincidem."); return; }

    setLoading(true);
    try {
      await api.createUser({
        name: upperName, login: cleanLogin, age, department, position,
        password, confirmPassword: confirm,
      });
      setSuccess(`Usuário ${upperName} (login: ${cleanLogin}) cadastrado com sucesso.`);
      reset();
      await onUserCreated();
      setTimeout(() => setSuccess(""), 5000);
    } catch (e) {
      setError(e.message || "Não foi possível cadastrar o colaborador.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#ccdacc] rounded-lg p-6">
          <p className="text-[10px] mono tracking-widest text-[#7a9480] mb-5">NOVO COLABORADOR</p>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] mono text-[#4d6b52] mb-1.5 tracking-widest">NOME COMPLETO</label>
              <input type="text" value={name} onChange={e => handleNameChange(e.target.value)}
                placeholder="NOME EM MAIÚSCULAS"
                className="w-full bg-[#f2f7f2] border border-[#ccdacc] rounded px-3 py-2.5 text-sm mono text-[#1a2e1c] placeholder:text-[#a8bfa8] focus:outline-none focus:border-[#3d7a52]/50 transition-colors tracking-wider" />
            </div>

            <div>
              <label className="block text-[10px] mono text-[#4d6b52] mb-1.5 tracking-widest">LOGIN (usado para entrar no sistema)</label>
              <input type="text" value={login} onChange={e => handleLoginChange(e.target.value)}
                placeholder="ex: carlos.silva"
                className="w-full bg-[#f2f7f2] border border-[#ccdacc] rounded px-3 py-2.5 text-sm mono text-[#1a2e1c] placeholder:text-[#a8bfa8] focus:outline-none focus:border-[#3d7a52]/50 transition-colors" />
              <p className="text-[10px] mono text-[#a8bfa8] mt-1">Sugerido a partir do nome — pode editar livremente.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] mono text-[#4d6b52] mb-1.5 tracking-widest">IDADE</label>
                <input type="number" value={age} onChange={e => setAge(e.target.value)} min={16} max={80}
                  className="w-full bg-[#f2f7f2] border border-[#ccdacc] rounded px-3 py-2.5 text-sm mono text-[#1a2e1c] focus:outline-none focus:border-[#3d7a52]/50 transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] mono text-[#4d6b52] mb-1.5 tracking-widest">ÁREA</label>
                <select value={department} onChange={e => setDepartment(e.target.value)}
                  className="w-full bg-[#f2f7f2] border border-[#ccdacc] rounded px-3 py-2.5 text-sm mono text-[#1a2e1c] focus:outline-none focus:border-[#3d7a52]/50 transition-colors">
                  <option>T.I</option><option>RH</option><option>OPERAÇÃO</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] mono text-[#4d6b52] mb-1.5 tracking-widest">CARGO</label>
              <input type="text" value={position} onChange={e => setPosition(e.target.value)}
                placeholder="Ex: Operador de Campo"
                className="w-full bg-[#f2f7f2] border border-[#ccdacc] rounded px-3 py-2.5 text-sm mono text-[#1a2e1c] placeholder:text-[#a8bfa8] focus:outline-none focus:border-[#3d7a52]/50 transition-colors" />
            </div>

            <div>
              <label className="block text-[10px] mono text-[#4d6b52] mb-1.5 tracking-widest">SENHA INICIAL</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full bg-[#f2f7f2] border border-[#ccdacc] rounded px-3 py-2.5 text-sm mono text-[#1a2e1c] placeholder:text-[#a8bfa8] focus:outline-none focus:border-[#3d7a52]/50 transition-colors" />
            </div>

            <div>
              <label className="block text-[10px] mono text-[#4d6b52] mb-1.5 tracking-widest">CONFIRMAR SENHA</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleRegister()}
                className="w-full bg-[#f2f7f2] border border-[#ccdacc] rounded px-3 py-2.5 text-sm mono text-[#1a2e1c] focus:outline-none focus:border-[#3d7a52]/50 transition-colors" />
            </div>

            {error && <p className="text-xs mono text-[#ef4444]">{error}</p>}
            {success && (
              <div className="flex items-center gap-2 bg-[#2d7d4a]/10 border border-[#2d7d4a]/20 rounded px-3 py-2">
                <Icon.check /><p className="text-xs mono text-[#2d7d4a]">{success}</p>
              </div>
            )}

            <button onClick={handleRegister} disabled={loading}
              className="w-full py-2.5 bg-[#3d7a52] text-white text-xs font-bold mono rounded hover:bg-[#2e6342] transition-colors tracking-widest disabled:opacity-60">
              {loading ? "CADASTRANDO…" : "CADASTRAR COLABORADOR"}
            </button>
          </div>
        </div>

        <div>
          <p className="text-[10px] mono tracking-widest text-[#7a9480] mb-3">{users.length} COLABORADORES NO SISTEMA</p>
          <div className="space-y-2 max-h-[520px] overflow-auto">
            {users.map(u => (
              <div key={u.id} className="bg-white border border-[#ccdacc] rounded-lg px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs mono font-medium text-[#1a2e1c]">{u.name}</p>
                  <p className="text-[10px] mono text-[#7a9480] mt-0.5">@{u.login} · {u.position}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] mono text-[#7a9480]">{u.age}a</span>
                  <span className={`text-[10px] mono border px-2 py-0.5 rounded ${DEPT_COLOR[u.department]}`}>{u.department}</span>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-xs mono text-[#7a9480] py-8 text-center">Nenhum colaborador cadastrado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
