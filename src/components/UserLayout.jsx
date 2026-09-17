import { Icon } from "./Icon";

export default function UserLayout({ user, view, setView, onLogout, children }) {
  return (
    <div className="flex flex-col h-full bg-[#f2f7f2]">
      <header className="border-b border-[#ccdacc] bg-[#e8f0e8] px-4 sm:px-5 py-3 flex items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 flex-shrink-0 rounded bg-[#3d7a52]/10 border border-[#3d7a52]/20 flex items-center justify-center">
            <Icon.box />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] mono text-[#3d7a52] tracking-widest font-medium">GESTÃO DE EPI</p>
            <p className="text-[10px] mono text-[#7a9480] truncate">{user.name}</p>
          </div>
        </div>
        <button onClick={onLogout} className="flex-shrink-0 flex items-center gap-2 text-[10px] mono text-[#7a9480] hover:text-[#ef4444] transition-colors">
          <Icon.logout /> SAIR
        </button>
      </header>
      <main className="flex-1 overflow-auto">{children}</main>
      <nav className="border-t border-[#ccdacc] bg-[#e8f0e8] flex flex-shrink-0">
        {[
          { view: "user-request", icon: Icon.clipboard, label: "SOLICITAR" },
          { view: "user-history", icon: Icon.history, label: "HISTÓRICO" },
        ].map(item => (
          <button key={item.view} onClick={() => setView(item.view)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] mono tracking-widest transition-colors ${
              view === item.view ? "text-[#3d7a52]" : "text-[#7a9480] hover:text-[#4d6b52]"
            }`}>
            <item.icon />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
