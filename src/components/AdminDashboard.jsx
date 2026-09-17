import { useState } from "react";
import { Icon } from "./Icon";
import SignatureViewer from "./SignatureViewer";

export default function AdminDashboard({ equipment, withdrawals, users }) {
  const [preview, setPreview] = useState(null);
  const totalItems = equipment.reduce((s, e) => s + e.sizes.reduce((ss, sz) => ss + sz.quantity, 0), 0);

  const allRows = equipment.flatMap(e =>
    e.sizes.map(sz => ({ name: e.name, size: sz.size, quantity: sz.quantity }))
  );
  const lowRows = allRows.filter(r => r.quantity > 0 && r.quantity <= 3);
  const outRows = allRows.filter(r => r.quantity === 0);

  const recent = [...withdrawals].reverse().slice(0, 8);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <SignatureViewer withdrawal={preview} onClose={() => setPreview(null)} />
      <div>
        <h2 className="text-xs mono tracking-widest text-[#7a9480] mb-4">PAINEL GERAL</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">

          <div className="bg-white border border-[#ccdacc] rounded-lg p-4">
            <p className="text-[10px] mono tracking-widest text-[#7a9480] mb-2">TOTAL EM ESTOQUE</p>
            <p className="text-3xl font-bold mono text-[#1a2e1c]">{totalItems}</p>
            <p className="text-[10px] text-[#7a9480] mt-1 mono">{equipment.length} tipos · {allRows.length} variações</p>
          </div>

          <div className="bg-white border border-[#c07a1a]/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#c07a1a]"><Icon.alert /></span>
              <p className="text-[10px] mono tracking-widest text-[#c07a1a]">ESTOQUE BAIXO</p>
            </div>
            <p className="text-3xl font-bold mono text-[#c07a1a] mb-3">{lowRows.length}</p>
            <div className="space-y-1.5 max-h-48 overflow-auto">
              {lowRows.map((r, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <p className="text-[10px] mono text-[#4d6b52] truncate flex-1">{r.name}</p>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[10px] mono bg-[#fef3e2] text-[#7a9480] px-1.5 py-0.5 rounded">{r.size}</span>
                    <span className="text-[10px] mono font-semibold text-[#c07a1a]">{r.quantity}</span>
                  </div>
                </div>
              ))}
              {lowRows.length === 0 && <p className="text-[10px] mono text-[#2d7d4a]">Nenhum item crítico</p>}
            </div>
          </div>

          <div className="bg-white border border-[#ef4444]/20 rounded-lg p-4">
            <p className="text-[10px] mono tracking-widest text-[#ef4444] mb-2">SEM ESTOQUE</p>
            <p className="text-3xl font-bold mono text-[#ef4444] mb-3">{outRows.length}</p>
            <div className="space-y-1.5 max-h-48 overflow-auto">
              {outRows.map((r, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <p className="text-[10px] mono text-[#4d6b52] truncate flex-1">{r.name}</p>
                  <span className="text-[10px] mono bg-[#ef4444]/10 text-[#ef4444]/80 px-1.5 py-0.5 rounded flex-shrink-0">{r.size}</span>
                </div>
              ))}
              {outRows.length === 0 && <p className="text-[10px] mono text-[#2d7d4a]">Nenhum item esgotado</p>}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[10px] mono tracking-widest text-[#7a9480] mb-3">ÚLTIMAS RETIRADAS</h3>
        <div className="bg-white border border-[#ccdacc] rounded-lg overflow-x-auto">
          <table className="w-full min-w-[640px] text-xs">
            <thead>
              <tr className="border-b border-[#ccdacc]">
                {["USUÁRIO", "EQUIPAMENTO", "TAMANHO", "DATA/HORA", "ASSINATURA"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] mono text-[#7a9480] tracking-widest font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((w, i) => {
                const u = users.find(u => u.id === w.userId);
                return (
                  <tr key={w.id} className={`border-b border-[#ccdacc]/50 hover:bg-[#deeade]/50 transition-colors ${i % 2 === 0 ? "" : "bg-[#e8f0e8]/30"}`}>
                    <td className="px-4 py-3">
                      <p className="mono text-[#1a2e1c] text-xs">{w.userName}</p>
                      {u && <p className="mono text-[10px] text-[#7a9480]">{u.department}</p>}
                    </td>
                    <td className="px-4 py-3 mono text-[#4d6b52] text-xs">{w.equipmentName}</td>
                    <td className="px-4 py-3">
                      <span className="mono text-[10px] bg-[#dde8dd] text-[#4d6b52] px-2 py-0.5 rounded">{w.size}</span>
                    </td>
                    <td className="px-4 py-3 mono text-[10px] text-[#7a9480]">{w.date}</td>
                    <td className="px-4 py-3">
                      {w.signature ? (
                        <button
                          onClick={() => setPreview(w)}
                          className="text-[10px] mono text-[#3d7a52] hover:text-[#2e6342] transition-colors underline underline-offset-2"
                        >
                          VER
                        </button>
                      ) : (
                        <span className="text-[10px] mono text-[#a8bfa8]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {recent.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center mono text-xs text-[#7a9480]">Nenhuma retirada registrada</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
