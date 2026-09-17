import { useState } from "react";
import { Icon } from "./Icon";
import SignaturePad from "./SignaturePad";
import { api } from "../lib/api";

export default function UserRequest({ equipment, onWithdrawn }) {
  const [selectedEq, setSelectedEq] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [showSig, setShowSig] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const eq = equipment.find(e => e.id === selectedEq);
  const availSizes = eq ? eq.sizes.filter(s => s.quantity > 0) : [];

  const handleRequest = () => {
    if (!selectedEq) { setError("Selecione um equipamento."); return; }
    if (!selectedSize) { setError("Selecione um tamanho."); return; }
    setError(""); setShowSig(true);
  };

  const handleSign = async (sig) => {
    if (loading) return;
    setLoading(true);
    try {
      await api.createWithdrawal({ equipmentId: selectedEq, size: selectedSize, signature: sig });
      setShowSig(false); setSelectedEq(""); setSelectedSize("");
      setSuccess(`${eq?.name} (${selectedSize}) retirado com sucesso!`);
      await onWithdrawn();
      setTimeout(() => setSuccess(""), 4000);
    } catch (e) {
      setShowSig(false);
      setError(e.message || "Não foi possível registrar a retirada.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 max-w-md mx-auto">
      {showSig && <SignaturePad onSave={handleSign} onCancel={() => setShowSig(false)} />}

      <div className="mb-6">
        <p className="text-[10px] mono tracking-widest text-[#7a9480] mb-1">SOLICITAÇÃO DE EQUIPAMENTO</p>
        <p className="text-xs text-[#4d6b52]">Selecione o item e assine para confirmar o recebimento.</p>
      </div>

      {success && (
        <div className="mb-4 flex items-center gap-2 bg-[#2d7d4a]/10 border border-[#2d7d4a]/20 rounded-lg px-4 py-3">
          <Icon.check />
          <p className="text-xs mono text-[#2d7d4a]">{success}</p>
        </div>
      )}

      <div className="bg-white border border-[#ccdacc] rounded-lg p-5 space-y-4">
        <div>
          <label className="block text-[10px] mono text-[#4d6b52] mb-2 tracking-widest">EQUIPAMENTO</label>
          <select value={selectedEq} onChange={e => { setSelectedEq(e.target.value); setSelectedSize(""); }}
            className="w-full bg-[#f2f7f2] border border-[#ccdacc] rounded px-3 py-2.5 text-xs mono text-[#1a2e1c] focus:outline-none focus:border-[#3d7a52]/50 transition-colors">
            <option value="">Selecione um equipamento...</option>
            {equipment.map(e => {
              const avail = e.sizes.reduce((s, sz) => s + sz.quantity, 0);
              return <option key={e.id} value={e.id} disabled={avail === 0}>{e.name}{avail === 0 ? " (ESGOTADO)" : ""}</option>;
            })}
          </select>
        </div>

        {eq && (
          <div>
            <label className="block text-[10px] mono text-[#4d6b52] mb-2 tracking-widest">TAMANHO</label>
            {availSizes.length === 0 ? (
              <p className="text-xs mono text-[#ef4444]">Sem estoque disponível para este equipamento.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {eq.sizes.map(sz => (
                  <button key={sz.size} disabled={sz.quantity === 0}
                    onClick={() => setSelectedSize(sz.size)}
                    className={`px-3 py-2 rounded border text-xs mono transition-colors ${
                      selectedSize === sz.size
                        ? "border-[#3d7a52] bg-[#3d7a52]/10 text-[#3d7a52]"
                        : sz.quantity === 0
                        ? "border-[#ccdacc] text-[#a8bfa8] cursor-not-allowed"
                        : "border-[#ccdacc] text-[#4d6b52] hover:border-[#b4c8b4] hover:text-[#1a2e1c]"
                    }`}>
                    {sz.size}
                    <span className="ml-1 text-[10px] opacity-60">({sz.quantity})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {error && <p className="text-xs mono text-[#ef4444]">{error}</p>}

        <button onClick={handleRequest}
          className="w-full py-3 bg-[#3d7a52] text-white text-xs font-bold mono rounded hover:bg-[#2e6342] transition-colors tracking-widest flex items-center justify-center gap-2">
          <Icon.pen /> ASSINAR E RETIRAR
        </button>
      </div>
    </div>
  );
}
