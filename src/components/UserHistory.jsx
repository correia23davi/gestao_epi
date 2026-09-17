import { useState } from "react";
import { Icon } from "./Icon";
import SignatureViewer from "./SignatureViewer";

export default function UserHistory({ withdrawals }) {
  const [preview, setPreview] = useState(null);
  const history = [...withdrawals].reverse();

  return (
    <div className="p-5">
      <SignatureViewer withdrawal={preview} onClose={() => setPreview(null)} />

      <p className="text-[10px] mono tracking-widest text-[#7a9480] mb-4">HISTÓRICO DE RETIRADAS</p>
      {history.length === 0 ? (
        <div className="text-center py-16 text-[#7a9480] mono text-xs">Nenhuma retirada registrada.</div>
      ) : (
        <div className="space-y-2">
          {history.map(w => (
            <div key={w.id} className="bg-white border border-[#ccdacc] rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-sm mono font-medium text-[#1a2e1c]">{w.equipmentName}</p>
                <p className="text-[10px] mono text-[#7a9480] mt-0.5">Tamanho: {w.size}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] mono text-[#7a9480]">{w.date}</p>
                {w.signature ? (
                  <button
                    onClick={() => setPreview(w)}
                    className="flex items-center gap-1 justify-end mt-1 ml-auto text-[#2d7d4a] hover:text-[#1a2e1c] transition-colors"
                  >
                    <Icon.check />
                    <span className="text-[10px] mono">Ver assinatura</span>
                  </button>
                ) : (
                  <p className="text-[10px] mono text-[#a8bfa8] mt-1">Sem assinatura</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
