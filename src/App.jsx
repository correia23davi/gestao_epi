import { useState, useEffect, useCallback } from "react";
import { api, getToken, setToken } from "./lib/api";

import LoginScreen from "./components/LoginScreen";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./components/AdminDashboard";
import AdminInventory from "./components/AdminInventory";
import AdminUsers from "./components/AdminUsers";
import AdminRegister from "./components/AdminRegister";
import UserLayout from "./components/UserLayout";
import UserRequest from "./components/UserRequest";
import UserHistory from "./components/UserHistory";

export default function App() {
  const [booting, setBooting] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState("login");

  const [users, setUsers] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [dataError, setDataError] = useState("");

  useEffect(() => {
    (async () => {
      if (!getToken()) { setBooting(false); return; }
      try {
        const { user } = await api.me();
        setCurrentUser(user);
        setView(user.role === "admin" ? "admin-dashboard" : "user-request");
      } catch {
        setToken(null);
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const refreshEquipment = useCallback(async () => {
    try { setEquipment(await api.listEquipment()); } catch (e) { setDataError(e.message); }
  }, []);
  const refreshWithdrawals = useCallback(async () => {
    try { setWithdrawals(await api.listWithdrawals()); } catch (e) { setDataError(e.message); }
  }, []);
  const refreshUsers = useCallback(async () => {
    try { setUsers(await api.listUsers()); } catch (e) { setDataError(e.message); }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    setDataError("");
    refreshEquipment();
    refreshWithdrawals();
    if (currentUser.role === "admin") refreshUsers();
  }, [currentUser, refreshEquipment, refreshWithdrawals, refreshUsers]);

  const handleLogin = ({ token, user }) => {
    setToken(token);
    setCurrentUser(user);
    setView(user.role === "admin" ? "admin-dashboard" : "user-request");
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    setUsers([]); setEquipment([]); setWithdrawals([]);
    setView("login");
  };

  if (booting) {
    return (
      <div className="min-h-full flex items-center justify-center bg-[#f2f7f2] text-xs mono text-[#7a9480]">
        CARREGANDO…
      </div>
    );
  }

  if (view === "login") {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (currentUser?.role === "admin") {
    return (
      <AdminLayout user={currentUser} view={view} setView={setView} onLogout={handleLogout}>
        {dataError && <p className="px-6 pt-4 text-xs mono text-[#ef4444]">{dataError}</p>}
        {view === "admin-dashboard" && <AdminDashboard equipment={equipment} withdrawals={withdrawals} users={users} />}
        {view === "admin-inventory" && <AdminInventory equipment={equipment} onStockAdded={refreshEquipment} />}
        {view === "admin-users" && <AdminUsers users={users} withdrawals={withdrawals} onUsersChanged={refreshUsers} />}
        {view === "admin-register" && <AdminRegister users={users} onUserCreated={refreshUsers} />}
      </AdminLayout>
    );
  }

  if (currentUser?.role === "user") {
    return (
      <UserLayout user={currentUser} view={view} setView={setView} onLogout={handleLogout}>
        {dataError && <p className="px-5 pt-4 text-xs mono text-[#ef4444]">{dataError}</p>}
        {view === "user-request" && (
          <UserRequest
            equipment={equipment}
            onWithdrawn={async () => { await refreshEquipment(); await refreshWithdrawals(); }}
          />
        )}
        {view === "user-history" && <UserHistory withdrawals={withdrawals} />}
      </UserLayout>
    );
  }

  return null;
}
