import { useState } from "react";
import { Icon } from "./Icon";
import SignatureViewer from "./SignatureViewer";
import { api } from "../lib/api";

const DEPT_COLOR = {
  "T.I": "text-[#2471a3] border-[#2471a3]/20 bg-[#2471a3]/5",
  "RH": "text-[#2d7d4a] border-[#2d7d4a]/20 bg-[#2d7d4a]/5",
  "OPERAÇÃO": "text-[#3d7a52] border-[#3d7a52]/20 bg-[#3d7a52]/5",
};

export default function AdminUsers({ users, withdrawals, onUsersChanged }) {
  const [selected, setSelected] = useState(null);
  const [preview, setPreview] = useState(null);

  const [editingPassword, setEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const userHistory = selected
    ? withdrawals.filter(w => w.userId === selected.id).reverse()
    : [];

  const selectUser = (u) => {
    const next = selected?.id === u.id ? null : u;
    setSelected(next);
    setEditingPassword(false);
    setConfirmingDelete(false);
    setPwError(""); setPwSuccess(""); setDeleteError("");
    setNewPassword(""); setConfirmPassword("");
  };

  const handleChangePassword = async () => {
    if (pwLoading) return;
    setPwError("");
    if (newPassword.length < 8) { setPwError("Senha mínima de 8 caracteres."); return; }
    if (newPassword !== confirmPassword) { setPwError("As senhas não coincidem."); return; }

    setPwLoading(true);
    try {
      await api.changePassword(selected.id, newPassword, confirmPassword);
      setPwSuccess("Senha alterada com sucesso.");
      setNewPassword(""); setConfirmPassword("");
      setTimeout(() => { setEditingPassword(false); setPwSuccess(""); }, 2000);
    } catch (e) {
      setPwError(e.message || "Não foi possível alterar a senha.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteLoading) return;
    setDeleteError("");
    setDeleteLoading(true);
    try {
      await api.deleteUser(selected.id);
      setSelected(null);
      setConfirmingDelete(false);
      await onUsersChanged();
    } catch (e) {
      setDeleteError(e.message || "Não foi possível apagar o colaborador.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <SignatureViewer withdrawal={preview} onClose={() => setPreview(null)} />
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] mono tracking-widest text-[#7a9480]">GESTÃO DE USUÁRIOS</p>
          <p className="text-xs mono text-[#4d6b52] mt-0.5">{users.length} colaboradores cadastrados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          {users.map(u => {
            const hist = withdrawals.filter(w => w.userId === u.id).length;
            return (
              <button key={u.id} onClick={() => selectUser(u)}
                className={`w-full text-left bg-white border rounded-lg p-4 hover:border-[#b4c8b4] transition-colors ${
                  selected?.id === u.id ? "border-[#3d7a52]/40" : "border-[#ccdacc]"
                }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm mono font-medium text-[#1a2e1c]">{u.name}</p>
                    <p className="text-[10px] mono text-[#7a9480] mt-0.5">@{u.login} · {u.position}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] mono border px-2 py-0.5 rounded ${DEPT_COLOR[u.department]}`}>
                      {u.department}
                    </span>
                    <Icon.chevronRight />
                  </div>
                </div>
                <div className="flex gap-4 mt-2">
                  <span className="text-[10px] mono text-[#7a9480]">{u.age} anos</span>
                  <span className="text-[10px] mono text-[#7a9480]">{hist} retiradas</span>
                </div>
              </button>
            );
          })}
          {users.length === 0 && (
            <p className="text-xs mono text-[#7a9480] py-8 text-center">Nenhum colaborador cadastrado.</p>
          )}
        </div>

        {selected && (
          <div className="bg-white border border-[#ccdacc] rounded-lg p-5">
            <div className="mb-4 pb-4 border-b border-[#ccdacc]">
              <p className="text-sm mono font-medium text-[#1a2e1c]">{selected.name}</p>
              <p className="text-[10px] mono text-[#3d7a52] mt-1">@{selected.login}</p>
              <p className="text-[10px] mono text-[#7a9480] mt-1">{selected.position} · {selected.department}</p>
              <p className="text-[10px] mono text-[#7a9480]">{selected.age} anos</p>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => { setEditingPassword(!editingPassword); setConfirmingDelete(false); }}
                className="px-3 py-1.5 text-[10px] mono tracking-widest border border-[#3d7a52]/30 text-[#3d7a52] rounded hover:bg-[#3d7a52]/10 transition-colors"
              >
                ALTERAR SENHA
              </button>
              <button
                onClick={() => { setConfirmingDelete(!confirmingDelete); setEditingPassword(false); }}
                className="px-3 py-1.5 text-[10px] mono tracking-widest border border-[#ef4444]/30 text-[#ef4444] rounded hover:bg-[#ef4444]/10 transition-colors"
              >
                APAGAR COLABORADOR
              </button>
            </div>

            {editingPassword && (
              <div className="mb-4 bg-[#f2f7f2] border border-[#ccdacc] rounded-lg p-4 space-y-3">
                <div>
                  <label className="block text-[10px] mono text-[#4d6b52] mb-1.5 tracking-widest">NOVA SENHA</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full bg-white border border-[#ccdacc] rounded px-3 py-2 text-xs mono text-[#1a2e1c] placeholder:text-[#a8bfa8] focus:outline-none focus:border-[#3d7a52]/50 transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] mono text-[#4d6b52] mb-1.5 tracking-widest">CONFIRMAR SENHA</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleChangePassword()}
                    className="w-full bg-white border border-[#ccdacc] rounded px-3 py-2 text-xs mono text-[#1a2e1c] focus:outline-none focus:border-[#3d7a52]/50 transition-colors" />
                </div>
                {pwError && <p className="text-xs mono text-[#ef4444]">{pwError}</p>}
                {pwSuccess && <p className="text-xs mono text-[#2d7d4a]">{pwSuccess}</p>}
                <button onClick={handleChangePassword} disabled={pwLoading}
                  className="w-full py-2 bg-[#3d7a52] text-white text-[10px] font-bold mono rounded hover:bg-[#2e6342] transition-colors tracking-widest disabled:opacity-60">
                  {pwLoading ? "SALVANDO…" : "SALVAR NOVA SENHA"}
                </button>
              </div>
            )}

            {confirmingDelete && (
              <div className="mb-4 bg-[#ef4444]/5 border border-[#ef4444]/20 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <Icon.alert />
                  <p className="text-xs mono text-[#1a2e1c]">
                    Apagar <span className="font-semibold">{selected.name}</span>? Essa ação não pode ser desfeita.
                    O histórico de retiradas já feitas por esse colaborador é mantido para fins de auditoria.
                  </p>
                </div>
                {deleteError && <p className="text-xs mono text-[#ef4444]">{deleteError}</p>}
                <div className="flex gap-2">
                  <button onClick={() => setConfirmingDelete(false)}
                    className="flex-1 py-2 text-[10px] mono text-[#7a9480] border border-[#ccdacc] rounded hover:text-[#4d6b52] transition-colors">
                    CANCELAR
                  </button>
                  <button onClick={handleDelete} disabled={deleteLoading}
                    className="flex-1 py-2 bg-[#ef4444] text-white text-[10px] font-bold mono rounded hover:bg-[#c0392b] transition-colors tracking-widest disabled:opacity-60">
                    {deleteLoading ? "APAGANDO…" : "SIM, APAGAR"}
                  </button>
                </div>
              </div>
            )}

            <p className="text-[10px] mono tracking-widest text-[#7a9480] mb-3">HISTÓRICO DE RETIRADAS</p>
            <div className="space-y-2 max-h-96 overflow-auto">
              {userHistory.map(w => (
                <div key={w.id} className="flex items-start justify-between py-2 border-b border-[#ccdacc]/50">
                  <div>
                    <p className="text-xs mono text-[#1a2e1c]">{w.equipmentName}</p>
                    <p className="text-[10px] mono text-[#7a9480]">Tamanho: {w.size}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] mono text-[#7a9480]">{w.date}</p>
                    {w.signature ? (
                      <button
                        onClick={() => setPreview(w)}
                        className="text-[10px] mono text-[#3d7a52] hover:text-[#2e6342] transition-colors underline underline-offset-2 mt-0.5"
                      >
                        VER ASSINATURA
                      </button>
                    ) : (
                      <p className="text-[10px] mono text-[#a8bfa8] mt-0.5">Sem assinatura</p>
                    )}
                  </div>
                </div>
              ))}
              {userHistory.length === 0 && (
                <p className="text-xs mono text-[#7a9480] py-4 text-center">Nenhuma retirada registrada.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
