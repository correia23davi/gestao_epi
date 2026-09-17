import { Icon } from "./Icon";

const NAV_ITEMS = [
  { view: "admin-dashboard", label: "PAINEL", icon: Icon.dashboard },
  { view: "admin-inventory", label: "ESTOQUE", icon: Icon.box },
  { view: "admin-users", label: "USUÁRIOS", icon: Icon.users },
  { view: "admin-register", label: "CADASTRAR", icon: Icon.plus },
];

export default function AdminLayout({ user, view, setView, onLogout, children }) {
  return (
    <div className="flex flex-col md:flex-row h-full bg-[#f2f7f2]">
      <header className="md:hidden flex items-center justify-between gap-2 border-b border-[#ccdacc] bg-[#e8f0e8] px-4 py-3 flex-shrink-0">
        <div className="min-w-0">
          <p className="text-[10px] text-[#3d7a52] mono tracking-widest font-medium">GESTÃO DE EPI</p>
          <p className="text-[10px] text-[#7a9480] mono truncate">{user.name}</p>
        </div>
        <button onClick={onLogout}
          className="flex-shrink-0 flex items-center gap-2 text-[10px] mono text-[#7a9480] hover:text-[#ef4444] transition-colors">
          <Icon.logout /> SAIR
        </button>
      </header>

      <aside className="hidden md:flex w-52 flex-shrink-0 border-r border-[#ccdacc] flex-col bg-[#e8f0e8]">
        <div className="px-4 py-5 border-b border-[#ccdacc]">
          <p className="text-[10px] text-[#3d7a52] mono tracking-widest font-medium">GESTÃO DE EPI</p>
          <p className="text-[10px] text-[#7a9480] mono mt-0.5">ADMINISTRADOR</p>
        </div>
        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {NAV_ITEMS.map(item => (
            <button key={item.view} onClick={() => setView(item.view)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs mono tracking-widest transition-colors ${
                view === item.view
                  ? "bg-[#3d7a52]/10 text-[#3d7a52] border border-[#3d7a52]/20"
                  : "text-[#7a9480] hover:text-[#4d6b52] hover:bg-white"
              }`}>
              <item.icon />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-[#ccdacc]">
          <p className="text-[10px] mono text-[#4d6b52] mb-1 truncate">{user.name}</p>
          <button onClick={onLogout}
            className="flex items-center gap-2 text-[10px] mono text-[#7a9480] hover:text-[#ef4444] transition-colors tracking-widest">
            <Icon.logout /> SAIR
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto min-w-0">{children}</main>

      <nav className="md:hidden border-t border-[#ccdacc] bg-[#e8f0e8] flex flex-shrink-0">
        {NAV_ITEMS.map(item => (
          <button key={item.view} onClick={() => setView(item.view)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[9px] mono transition-colors ${
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
