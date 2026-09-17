const FONT = "'JetBrains Mono', monospace";

export function buildReceiptImage(withdrawal) {
  return new Promise((resolve, reject) => {
    const width = 480;
    const height = 360;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Não foi possível gerar o comprovante."));
      return;
    }

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#ccdacc";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);

    ctx.fillStyle = "#1a2e1c";
    ctx.font = `bold 15px ${FONT}`;
    ctx.fillText("COMPROVANTE DE RETIRADA DE EPI", 24, 36);

    ctx.strokeStyle = "#ccdacc";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(24, 48);
    ctx.lineTo(width - 24, 48);
    ctx.stroke();

    const fields = [
      ["COLABORADOR", withdrawal.userName || "-"],
      ["EQUIPAMENTO", `${withdrawal.equipmentName || "-"}${withdrawal.size ? ` (${withdrawal.size})` : ""}`],
      ["DATA/HORA", withdrawal.date || "-"],
    ];

    let y = 74;
    fields.forEach(([label, value]) => {
      ctx.fillStyle = "#7a9480";
      ctx.font = `10px ${FONT}`;
      ctx.fillText(label, 24, y);
      ctx.fillStyle = "#1a2e1c";
      ctx.font = `13px ${FONT}`;
      ctx.fillText(value, 24, y + 17);
      y += 44;
    });

    y += 4;
    ctx.fillStyle = "#7a9480";
    ctx.font = `10px ${FONT}`;
    ctx.fillText("ASSINATURA", 24, y);
    y += 10;

    const boxX = 24;
    const boxY = y;
    const boxW = width - 48;
    const boxH = height - boxY - 24;
    ctx.fillStyle = "#f2f7f2";
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = "#ccdacc";
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    const finish = () => resolve(canvas.toDataURL("image/png"));

    if (!withdrawal.signature) {
      finish();
      return;
    }

    const img = new Image();
    img.onload = () => {
      const pad = 10;
      const innerW = boxW - pad * 2;
      const innerH = boxH - pad * 2;
      const scale = Math.min(innerW / img.width, innerH / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const drawX = boxX + (boxW - drawW) / 2;
      const drawY = boxY + (boxH - drawH) / 2;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      finish();
    };
    img.onerror = () => reject(new Error("Não foi possível carregar a imagem da assinatura."));
    img.src = withdrawal.signature;
  });
}
