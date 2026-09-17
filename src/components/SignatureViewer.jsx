import { useState } from "react";
import { Icon } from "./Icon";
import { buildReceiptImage } from "../lib/receiptImage";

export default function SignatureViewer({ withdrawal, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  if (!withdrawal) return null;

  const fileName = `comprovante-${(withdrawal.userName || "colaborador")
    .toLowerCase()
    .replace(/\s+/g, "-")}-${withdrawal.id}.png`;

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    setDownloadError("");
    try {
      const dataUrl = await buildReceiptImage(withdrawal);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      setDownloadError(e.message || "Não foi possível gerar o comprovante.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#ccdacc] rounded-lg p-5 sm:p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[#3d7a52]">
            <Icon.pen />
            <span className="text-sm font-medium mono">ASSINATURA REGISTRADA</span>
          </div>
          <button onClick={onClose} className="text-[#7a9480] hover:text-[#1a2e1c] transition-colors">
            <Icon.x />
          </button>
        </div>

        <div className="mb-3 space-y-0.5">
          <p className="text-xs mono font-medium text-[#1a2e1c]">{withdrawal.userName}</p>
          <p className="text-[10px] mono text-[#7a9480]">
            {withdrawal.equipmentName} · Tamanho {withdrawal.size}
          </p>
          <p className="text-[10px] mono text-[#7a9480]">{withdrawal.date}</p>
        </div>

        <div className="border border-[#ccdacc] rounded-md overflow-hidden bg-[#f2f7f2]">
          {withdrawal.signature ? (
            <img
              src={withdrawal.signature}
              alt={`Assinatura de ${withdrawal.userName}`}
              className="w-full aspect-[420/180] object-contain block"
            />
          ) : (
            <div className="w-full aspect-[420/180] flex items-center justify-center text-[10px] mono text-[#7a9480]">
              NENHUMA ASSINATURA REGISTRADA
            </div>
          )}
        </div>

        {downloadError && <p className="text-xs mono text-[#ef4444] mt-3">{downloadError}</p>}

        {withdrawal.signature && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-[#3d7a52] text-white text-xs font-bold mono rounded hover:bg-[#2e6342] transition-colors tracking-widest disabled:opacity-60"
          >
            {downloading ? "GERANDO…" : "BAIXAR COMPROVANTE"}
          </button>
        )}
      </div>
    </div>
  );
}
