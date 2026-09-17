import { useState } from "react";
import { api } from "../lib/api";

export default function LoginScreen({ onLogin }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const result = await api.login(login, password);
      onLogin(result);
    } catch (e) {
      setError(e.message || "Login ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center bg-[#f2f7f2] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#3d7a52]/10 border border-[#3d7a52]/20 mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="#3d7a52" strokeWidth={1.5} className="w-6 h-6">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12"/>
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-[#1a2e1c] tracking-wider mono">GESTÃO DE EQUIPAMENTOS</h1>
          <p className="text-xs text-[#7a9480] mt-1 mono">SISTEMA DE CONTROLE DE EPI</p>
        </div>

        <div className="bg-white border border-[#ccdacc] rounded-lg p-6">
          <p className="text-xs text-[#7a9480] mono mb-5 tracking-widest">ACESSO AO SISTEMA</p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[#4d6b52] mono mb-1.5 tracking-widest">LOGIN</label>
              <input
                type="text"
                value={login}
                onChange={e => setLogin(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                placeholder="seu.login"
                autoCapitalize="none"
                className="w-full bg-[#f2f7f2] border border-[#ccdacc] rounded px-3 py-2.5 text-sm mono text-[#1a2e1c] placeholder:text-[#a8bfa8] focus:outline-none focus:border-[#3d7a52]/50 transition-colors tracking-wider"
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div>
              <label className="block text-xs text-[#4d6b52] mono mb-1.5 tracking-widest">SENHA</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#f2f7f2] border border-[#ccdacc] rounded px-3 py-2.5 text-sm mono text-[#1a2e1c] placeholder:text-[#a8bfa8] focus:outline-none focus:border-[#3d7a52]/50 transition-colors"
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
            </div>
            {error && <p className="text-xs text-[#ef4444] mono">{error}</p>}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-2.5 bg-[#3d7a52] text-white text-xs font-bold mono rounded hover:bg-[#2e6342] transition-colors tracking-widest disabled:opacity-60"
            >
              {loading ? "ENTRANDO…" : "ENTRAR"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
