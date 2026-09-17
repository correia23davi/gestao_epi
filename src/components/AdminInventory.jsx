import { useState } from "react";
import { Icon } from "./Icon";
import { api } from "../lib/api";

export default function AdminInventory({ equipment, onStockAdded }) {
  const [filter, setFilter] = useState("ALL");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSize, setNewSize] = useState("");
  const [newQty, setNewQty] = useState("");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const allRows = equipment.flatMap(e =>
    e.sizes.map(sz => ({ eqId: e.id, eqName: e.name, size: sz.size, quantity: sz.quantity }))
  );

  const rows = allRows.filter(r => {
    if (filter === "AVAILABLE") return r.quantity > 0;
    if (filter === "OUT") return r.quantity === 0;
    return true;
  });

  const getStatus = (q) => {
    if (q === 0) return { label: "ESGOTADO", cls: "text-[#ef4444]", dot: "bg-[#ef4444]", row: "bg-[#ef4444]/5" };
    if (q <= 3)  return { label: "CRÍTICO",  cls: "text-[#c07a1a]", dot: "bg-[#c07a1a]", row: "bg-[#c07a1a]/5" };
    return              { label: "OK",        cls: "text-[#2d7d4a]", dot: "bg-[#2d7d4a]", row: "" };
  };

  const handleAdd = async () => {
    if (loading) return;
    const n = newName.toUpperCase().trim();
    const s = newSize.trim();
    const q = parseInt(newQty, 10);
    if (!n) { setAddError("Informe o nome do equipamento."); return; }
    if (!s) { setAddError("Selecione o tamanho."); return; }
    if (isNaN(q) || q < 0) { setAddError("Informe uma quantidade válida."); return; }

    setLoading(true);
    setAddError("");
    try {
      await api.addStock({ name: n, size: s, quantity: q });
      setNewName(""); setNewSize(""); setNewQty("");
      setAddSuccess(`${n} — tamanho ${s} atualizado (+${q} unidades).`);
      await onStockAdded();
      setTimeout(() => setAddSuccess(""), 3000);
    } catch (e) {
      setAddError(e.message || "Não foi possível atualizar o estoque.");
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { key: "ALL", label: "TODOS" }, { key: "AVAILABLE", label: "DISPONÍVEIS" }, { key: "OUT", label: "EM FALTA" },
  ];

  let prevName = "";

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1">
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 text-[10px] mono tracking-widest rounded transition-colors ${
                filter === f.key ? "bg-[#3d7a52] text-white font-bold" : "border border-[#ccdacc] text-[#7a9480] hover:text-[#4d6b52]"
              }`}>
              {f.label}
            </button>
          ))}
          <span className="ml-2 text-[10px] mono text-[#7a9480]">{rows.length} itens</span>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-3 py-1.5 text-[10px] mono tracking-widest border border-[#3d7a52]/30 text-[#3d7a52] rounded hover:bg-[#3d7a52]/10 transition-colors">
          <Icon.plus /> INSERIR EQUIPAMENTO
        </button>
      </div>

      {showAdd && (
        <div className="bg-white border border-[#ccdacc] rounded-lg p-5">
          <p className="text-[10px] mono tracking-widest text-[#7a9480] mb-4">ENTRADA DE ESTOQUE</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-[10px] mono text-[#4d6b52] mb-1.5 tracking-widest">EQUIPAMENTO</label>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value.toUpperCase())}
                placeholder="Ex: CAPACETE DE SEGURANÇA"
                list="eq-names"
                className="w-full bg-[#f2f7f2] border border-[#ccdacc] rounded px-3 py-2 text-xs mono text-[#1a2e1c] placeholder:text-[#a8bfa8] focus:outline-none focus:border-[#3d7a52]/50 transition-colors" />
              <datalist id="eq-names">
                {equipment.map(e => <option key={e.id} value={e.name} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-[10px] mono text-[#4d6b52] mb-1.5 tracking-widest">TAMANHO</label>
              <select value={newSize} onChange={e => setNewSize(e.target.value)}
                className="w-full bg-[#f2f7f2] border border-[#ccdacc] rounded px-3 py-2 text-xs mono text-[#1a2e1c] focus:outline-none focus:border-[#3d7a52]/50 transition-colors">
                <option value="">Selecione...</option>
                {["P", "M", "G", "GG", "XG", "ÚNICO"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] mono text-[#4d6b52] mb-1.5 tracking-widest">QUANTIDADE</label>
              <input type="number" value={newQty} onChange={e => setNewQty(e.target.value)} min={0}
                className="w-full bg-[#f2f7f2] border border-[#ccdacc] rounded px-3 py-2 text-xs mono text-[#1a2e1c] focus:outline-none focus:border-[#3d7a52]/50 transition-colors" />
            </div>
          </div>
          {addError && <p className="text-xs mono text-[#ef4444] mb-2">{addError}</p>}
          {addSuccess && <p className="text-xs mono text-[#2d7d4a] mb-2">{addSuccess}</p>}
          <button onClick={handleAdd} disabled={loading}
            className="px-4 py-2 bg-[#3d7a52] text-white text-[10px] font-bold mono rounded hover:bg-[#2e6342] transition-colors tracking-widest disabled:opacity-60">
            {loading ? "SALVANDO…" : "CONFIRMAR ENTRADA"}
          </button>
        </div>
      )}

      <div className="bg-white border border-[#ccdacc] rounded-lg overflow-x-auto">
        <table className="w-full min-w-[480px] text-xs">
          <thead>
            <tr className="border-b border-[#ccdacc]">
              {["EQUIPAMENTO", "TAMANHO", "QUANTIDADE", "STATUS"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] mono text-[#7a9480] tracking-widest font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const st = getStatus(r.quantity);
              const showName = r.eqName !== prevName;
              prevName = r.eqName;
              return (
                <tr key={`${r.eqId}-${r.size}`}
                  className={`border-b border-[#ccdacc]/40 hover:bg-[#deeade]/50 transition-colors ${st.row} ${showName && i > 0 ? "border-t border-[#b4c8b4]" : ""}`}>
                  <td className="px-4 py-2.5 mono text-[#1a2e1c] text-xs font-medium">
                    {showName ? r.eqName : <span className="text-[#a8bfa8]">—</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="mono text-[10px] bg-[#dde8dd] text-[#4d6b52] px-2 py-0.5 rounded font-medium">{r.size}</span>
                  </td>
                  <td className="px-4 py-2.5 mono font-semibold text-sm" style={{ color: r.quantity === 0 ? "#c0392b" : r.quantity <= 3 ? "#c07a1a" : "#1a2e1c" }}>
                    {r.quantity}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      <span className={`text-[10px] mono ${st.cls}`}>{st.label}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-10 text-center mono text-xs text-[#7a9480]">Nenhum item para este filtro.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
