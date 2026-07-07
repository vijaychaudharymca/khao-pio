import React, { useState, useEffect } from "react";
import { 
  BarChart3, Plus, Edit, Trash2, Settings, Layers, TableProperties, 
  ClipboardList, ChefHat, Bell, LogOut, Download, Search, CheckCircle2, 
  XCircle, AlertTriangle, TrendingUp, Users, QrCode, Printer, Clock, 
  Lock, User, Check, Play, ShieldAlert, CheckSquare, RefreshCw, Sparkles, DollarSign
} from "lucide-react";
import { MenuItem, Category, Table, Order, AssistanceRequest, Feedback, SystemNotification, RestaurantSettings, AuditLog } from "../types";
import { playNotificationSound } from "../utils/audio";
import { motion } from "motion/react";

interface AdminPanelProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onTableChange: (num: number) => void;
}

export default function AdminPanel({ darkMode, setDarkMode, onTableChange }: AdminPanelProps) {
  // Authentication state
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("khao_pio_admin_token"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Navigation: 'dashboard' | 'orders' | 'kitchen' | 'menu' | 'categories' | 'tables' | 'assistance' | 'analytics' | 'settings' | 'audit'
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Core Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [assistanceRequests, setAssistanceRequests] = useState<AssistanceRequest[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Analytics Stats
  const [stats, setStats] = useState({
    todaySales: 0,
    todayOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    revenue: 0,
    averageOrderValue: 0,
    liveCustomers: 0,
    tablesOccupied: 0,
    kitchenQueue: 0,
    onlinePayments: 0,
    cashPayments: 0,
    bestSellingItems: [] as any[],
    leastSellingItems: [] as any[],
    avgRating: "5.0"
  });

  // Modal / Form state editors
  const [itemEditing, setItemEditing] = useState<MenuItem | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [categoryEditing, setCategoryEditing] = useState<Category | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState<number>(0);

  // Search/Filters in Admin list views
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'>('all');
  const [menuSearch, setMenuSearch] = useState("");

  // Sound notification state
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Change Password fields
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passSuccess, setPassSuccess] = useState("");
  const [passError, setPassError] = useState("");

  // Trigger loading state on CRUD
  const [loading, setLoading] = useState(false);

  // Load Admin settings & data once logged in
  useEffect(() => {
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    const loadAll = async () => {
      try {
        const [resSet, resCat, resMenu, resTables, resOrders, resAssistance, resFeedback, resNotif, resLogs, resStats] = await Promise.all([
          fetch("/api/settings").then(r => r.json()),
          fetch("/api/categories").then(r => r.json()),
          fetch("/api/menu").then(r => r.json()),
          fetch("/api/tables").then(r => r.json()),
          fetch("/api/orders", { headers }).then(r => r.json()),
          fetch("/api/assistance").then(r => r.json()),
          fetch("/api/feedback").then(r => r.json()),
          fetch("/api/notifications", { headers }).then(r => r.json()),
          fetch("/api/audit-logs", { headers }).then(r => r.json()),
          fetch("/api/analytics", { headers }).then(r => r.json()),
        ]);

        setSettings(resSet);
        setCategories(resCat);
        setMenuItems(resMenu);
        setTables(resTables);
        setOrders(resOrders);
        setAssistanceRequests(resAssistance);
        setFeedbacks(resFeedback);
        setNotifications(resNotif);
        setAuditLogs(resLogs);
        setStats(resStats);
      } catch (e) {
        console.error("Failed to load admin data", e);
      }
    };

    loadAll();

    // SSE EventSource for live admin dashboard sync
    const eventSource = new EventSource("/api/updates");
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "new_order") {
          // Play notification chime!
          if (soundEnabled) {
            playNotificationSound();
          }
          // Incrementally update
          setOrders(prev => [payload.data, ...prev]);
        }
        if (payload.type === "new_assistance") {
          if (soundEnabled) {
            playNotificationSound();
          }
          setAssistanceRequests(prev => [payload.data, ...prev]);
        }
        // Force refresh table/settings/menu if changed
        if (payload.type === "menu") setMenuItems(payload.data);
        if (payload.type === "categories") setCategories(payload.data);
        if (payload.type === "tables") setTables(payload.data);
        if (payload.type === "feedback") setFeedbacks(payload.data);
        if (payload.type === "notifications") setNotifications(payload.data);
        if (payload.type === "assistance") setAssistanceRequests(payload.data);
        if (payload.type === "settings") setSettings(payload.data);
        
        // Always refresh analytics on order changes
        fetch("/api/analytics", { headers }).then(r => r.json()).then(setStats);
        fetch("/api/orders", { headers }).then(r => r.json()).then(setOrders);
      } catch (e) {
        console.error("SSE sync error", e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [token, soundEnabled]);

  // LOGIN FUNCTION
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.ok ? await res.json() : null;
      if (data && data.token) {
        setToken(data.token);
        localStorage.setItem("khao_pio_admin_token", data.token);
        // Clear login form fields
        setUsername("");
        setPassword("");
      } else {
        const err = await res.json();
        setLoginError(err.error || "Incorrect login credentials");
      }
    } catch {
      setLoginError("Failed to connect to backend server");
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("khao_pio_admin_token");
  };

  // --- ORDER PROGRESS BUTTON ACTIONS ---
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: Order['status']) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Resolve Help Waiter request
  const handleResolveAssistance = async (id: string) => {
    try {
      const res = await fetch(`/api/assistance/${id}/resolve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setAssistanceRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- MENU CRUD OPERATIONS ---
  const handleSaveMenuItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: Number(formData.get("price")),
      categoryId: formData.get("categoryId") as string,
      image: formData.get("image") as string,
      isVeg: formData.get("isVeg") === "true",
      isAvailable: formData.get("isAvailable") === "true",
      isChefSpecial: formData.get("isChefSpecial") === "true",
      isPopular: formData.get("isPopular") === "true",
      prepTime: Number(formData.get("prepTime") || 15)
    };

    try {
      const method = itemEditing ? "PUT" : "POST";
      const url = itemEditing ? `/api/menu/${itemEditing.id}` : "/api/menu";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsItemModalOpen(false);
        setItemEditing(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMenuItems(prev => prev.filter(item => item.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- CATEGORY CRUD OPERATIONS ---
  const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      order: Number(formData.get("order") || 1)
    };

    try {
      const method = categoryEditing ? "PUT" : "POST";
      const url = categoryEditing ? `/api/categories/${categoryEditing.id}` : "/api/categories";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsCategoryModalOpen(false);
        setCategoryEditing(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- TABLE MANAGER OPERATIONS ---
  const handleAddTable = async () => {
    if (!newTableNumber) return;
    try {
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ number: newTableNumber })
      });
      if (res.ok) {
        setNewTableNumber(0);
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTable = async (id: string) => {
    if (!confirm("Delete this table QR?")) return;
    try {
      await fetch(`/api/tables/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Update table occupancy status
  const handleUpdateTableStatus = async (id: string, status: Table['status']) => {
    try {
      await fetch(`/api/tables/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
    } catch (e) {
      console.error(e);
    }
  };

  // --- SETTINGS SAVE ---
  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      restaurantName: formData.get("restaurantName") as string,
      address: formData.get("address") as string,
      phone: formData.get("phone") as string,
      openingHours: formData.get("openingHours") as string,
      gstPercentage: Number(formData.get("gstPercentage")),
      serviceChargePercentage: Number(formData.get("serviceChargePercentage")),
      currency: formData.get("currency") as string,
      themeColor: formData.get("themeColor") as string
    };

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsSettingsModalOpen(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- PASSWORD UPDATE ---
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      if (res.ok) {
        setPassSuccess("Password updated securely!");
        setOldPassword("");
        setNewPassword("");
      } else {
        const err = await res.json();
        setPassError(err.error || "Failed to update password");
      }
    } catch (e) {
      setPassError("Network connection failed");
    }
  };

  // --- DOWNLOAD CSV REPORT ---
  const handleDownloadCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Token,Table,Items,Subtotal,GST,Service Charge,Grand Total,Status,Payment,Date\n"
      + orders.map(o => {
        const dishSummary = o.items.map(item => `${item.menuItem.name} (x${item.quantity})`).join(" | ");
        return `${o.tokenNumber},${o.tableNumber},"${dishSummary}",${o.subtotal},${o.gst},${o.serviceCharge},${o.total},${o.status},${o.paymentStatus},"${o.createdAt}"`;
      }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `KhaoPio_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter orders
  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  // Filter menu
  const filteredMenu = menuItems.filter(item => 
    item.name.toLowerCase().includes(menuSearch.toLowerCase()) || 
    item.description.toLowerCase().includes(menuSearch.toLowerCase())
  );

  // If NOT authenticated, render beautiful dark admin login portal
  if (!token) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all ${darkMode ? "bg-[#0A0A0B] text-slate-100" : "bg-zinc-50 text-zinc-950"}`}>
        
        <form 
          onSubmit={handleLogin}
          className={`w-full max-w-md p-8 rounded-[32px] border shadow-2xl space-y-6 ${darkMode ? "bg-white/[0.03] border-white/5" : "bg-white border-zinc-200"}`}
        >
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-amber-500 text-black rounded-2xl shadow-xl shadow-amber-500/20">
              <Lock className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h2 className="text-2xl font-serif font-light">KDS & <span className="italic text-amber-500">Owner Access</span></h2>
            <p className="text-xs text-zinc-400">Authenticate credentials to manage Khao Pio Aish Karo</p>
          </div>

          <div className="space-y-4">
            
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  id="admin-username-input"
                  type="text" 
                  required
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-amber-500 ${darkMode ? "bg-white/5 border-white/10 text-white" : "bg-white border-zinc-200"}`}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  id="admin-password-input"
                  type="password" 
                  required
                  placeholder="admin123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-amber-500 ${darkMode ? "bg-white/5 border-white/10 text-white" : "bg-white border-zinc-200"}`}
                />
              </div>
            </div>

          </div>

          {loginError && (
            <div className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl text-red-500 font-bold text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              id="admin-login-submit"
              type="submit"
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-2xl shadow-lg shadow-amber-500/10 transition-all cursor-pointer"
            >
              Unlock Dashboard
            </button>
          </div>

          <p className="text-[10px] text-zinc-500 text-center uppercase tracking-wider">Default credentials: admin / admin123</p>
        </form>

      </div>
    );
  }

  // --- MAIN ADMIN LAYOUT ---
  return (
    <div className={`min-h-screen font-sans flex transition-colors duration-300 ${darkMode ? "bg-[#0A0A0B] text-slate-100" : "bg-zinc-50 text-zinc-900"}`}>
      
      {/* SIDEBAR NAVIGATION CONTROLS */}
      <aside className={`w-64 border-r hidden lg:flex flex-col justify-between flex-shrink-0 ${darkMode ? "bg-white/[0.02] border-white/5" : "bg-white border-zinc-200"}`}>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-500 text-black rounded-lg">
              <ChefHat className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-serif font-medium leading-tight">Khao Pio</h3>
              <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-400">Admin Control</span>
            </div>
          </div>

          {/* Nav groups */}
          <nav className="space-y-1">
            {[
              { id: "dashboard", label: "Overview Stats", icon: BarChart3 },
              { id: "orders", label: "Live Orders", icon: ClipboardList, badge: orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length },
              { id: "kitchen", label: "Kitchen display (KDS)", icon: ChefHat },
              { id: "menu", label: "Menu Catalog", icon: Sparkles },
              { id: "categories", label: "Dish Categories", icon: Layers },
              { id: "tables", label: "Tables & QR", icon: TableProperties },
              { id: "assistance", label: "Waiter Pings", icon: Bell, badge: assistanceRequests.filter(r => r.status === 'pending').length },
              { id: "settings", label: "Restaurant settings", icon: Settings }
            ].map(item => (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${activeTab === item.id ? "bg-amber-500 text-black shadow-lg shadow-amber-500/15" : (darkMode ? "text-zinc-400 hover:bg-zinc-800" : "text-zinc-600 hover:bg-zinc-100")}`}
              >
                <span className="flex items-center gap-2.5">
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </span>
                {item.badge ? (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === item.id ? "bg-black text-amber-500" : "bg-red-500 text-white animate-pulse"}`}>{item.badge}</span>
                ) : null}
              </button>
            ))}
          </nav>
        </div>

        {/* User Info footer */}
        <div className="p-6 border-t border-zinc-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-amber-500">AD</div>
            <div className="text-left">
              <p className="text-xs font-bold leading-none">System Owner</p>
              <button 
                onClick={() => {
                  setOldPassword("");
                  setNewPassword("");
                  setPassSuccess("");
                  setPassError("");
                  setIsSettingsModalOpen(true);
                }} 
                className="text-[9px] text-amber-500 font-bold hover:underline"
              >
                Change password
              </button>
            </div>
          </div>

          <button
            id="admin-logout-btn"
            onClick={handleLogout}
            className="w-full py-2.5 rounded-xl border border-dashed border-red-500/40 text-red-500 hover:bg-red-500/10 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout Session
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER FOR SMALLER SCREENS */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-zinc-950 border-b border-zinc-800 p-3 flex items-center justify-between">
        <span className="text-xs font-black text-amber-500 tracking-tight">Khao Pio Admin</span>
        <div className="flex gap-1">
          <button onClick={() => setActiveTab('dashboard')} className="p-1.5 text-zinc-400 hover:text-white"><BarChart3 className="w-4 h-4" /></button>
          <button onClick={() => setActiveTab('orders')} className="p-1.5 text-zinc-400 hover:text-white relative">
            <ClipboardList className="w-4 h-4" />
            {orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length > 0 && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
          </button>
          <button onClick={() => setActiveTab('kitchen')} className="p-1.5 text-zinc-400 hover:text-white"><ChefHat className="w-4 h-4" /></button>
          <button onClick={() => setActiveTab('menu')} className="p-1.5 text-zinc-400 hover:text-white"><Sparkles className="w-4 h-4" /></button>
          <button onClick={() => setActiveTab('tables')} className="p-1.5 text-zinc-400 hover:text-white"><TableProperties className="w-4 h-4" /></button>
          <button onClick={() => setActiveTab('assistance')} className="p-1.5 text-zinc-400 hover:text-white relative">
            <Bell className="w-4 h-4" />
            {assistanceRequests.filter(r => r.status === 'pending').length > 0 && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>}
          </button>
          <button onClick={handleLogout} className="p-1.5 text-red-500"><LogOut className="w-4 h-4" /></button>
        </div>
      </div>

      {/* CORE VIEW SCREEN CONTAINER */}
      <main className="flex-1 overflow-y-auto p-6 pt-20 lg:pt-6 max-w-7xl mx-auto w-full space-y-6">

        {/* --- TAB 1: OVERVIEW DASHBOARD STATS --- */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight flex items-center gap-1.5">
                  <BarChart3 className="w-6 h-6 text-amber-500" />
                  <span>Restaurant Operations</span>
                </h1>
                <p className="text-xs text-zinc-400">Live analytics metrics from Khao Pio Aish Karo Mitro</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${soundEnabled ? "bg-amber-500/10 border-amber-500 text-amber-500" : "border-zinc-800 text-zinc-400"}`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  Sound: {soundEnabled ? "On" : "Muted"}
                </button>

                <button 
                  onClick={handleDownloadCSV}
                  className="bg-amber-500 text-black px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer hover:bg-amber-400"
                >
                  <Download className="w-4 h-4" />
                  Export CSV Report
                </button>
              </div>
            </div>

            {/* STATS GRID CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className={`p-5 rounded-2xl border ${darkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200"}`}>
                <p className="text-[10px] uppercase font-mono text-zinc-400 tracking-wider">Today's Revenue</p>
                <h3 className="text-2xl font-black text-amber-500 mt-1">{settings?.currency || "₹"}{stats.revenue}</h3>
                <span className="text-[9px] text-emerald-500 font-bold block mt-1">Live payments logged</span>
              </div>

              <div className={`p-5 rounded-2xl border ${darkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200"}`}>
                <p className="text-[10px] uppercase font-mono text-zinc-400 tracking-wider">Total Orders Today</p>
                <h3 className="text-2xl font-black text-zinc-200 mt-1">{stats.todayOrders}</h3>
                <span className="text-[9px] text-zinc-400 block mt-1">Token receipts printed</span>
              </div>

              <div className={`p-5 rounded-2xl border ${darkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200"}`}>
                <p className="text-[10px] uppercase font-mono text-zinc-400 tracking-wider">Occupied Tables</p>
                <h3 className="text-2xl font-black text-zinc-200 mt-1">{stats.tablesOccupied} / {tables.length}</h3>
                <span className="text-[9px] text-cyan-500 font-bold block mt-1">Active customer plates</span>
              </div>

              <div className={`p-5 rounded-2xl border ${darkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200"}`}>
                <p className="text-[10px] uppercase font-mono text-zinc-400 tracking-wider">Average Ticket Size</p>
                <h3 className="text-2xl font-black text-amber-500 mt-1">{settings?.currency || "₹"}{stats.averageOrderValue}</h3>
                <span className="text-[9px] text-zinc-400 block mt-1">Per table completed bill</span>
              </div>

            </div>

            {/* DETAILED SPLIT GRAPHICS (Payment Method & Best Sellers) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* payment analysis */}
              <div className={`p-6 rounded-3xl border space-y-4 ${darkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200"}`}>
                <h3 className="text-sm font-black tracking-tight uppercase tracking-wider text-zinc-400">Payment Settlements</h3>
                
                <div className="space-y-4 pt-2">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>Online Gateway (UPI/Card)</span>
                      <span className="text-emerald-500">{settings?.currency}{stats.onlinePayments}</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${stats.revenue ? (stats.onlinePayments/stats.revenue)*100 : 0}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>Cash at Counter (Pay Later)</span>
                      <span className="text-amber-500">{settings?.currency}{stats.cashPayments}</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${stats.revenue ? (stats.cashPayments/stats.revenue)*100 : 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* dish popular ranks */}
              <div className={`p-6 rounded-3xl border space-y-4 ${darkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200"}`}>
                <h3 className="text-sm font-black tracking-tight uppercase tracking-wider text-zinc-400">Top Dish Sellers</h3>
                
                <div className="space-y-2.5">
                  {stats.bestSellingItems.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-6">Pending order completions to show rank stats.</p>
                  ) : (
                    stats.bestSellingItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-xs">
                        <span className="font-bold text-zinc-300">#{index+1} {item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">{item.count} items sold</span>
                          <span className="font-extrabold text-amber-500">{settings?.currency}{item.revenue}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* --- TAB 2: LIVE ORDERS MANAGER --- */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight flex items-center gap-1.5">
                  <ClipboardList className="w-6 h-6 text-amber-500" />
                  <span>Incoming Table Orders</span>
                </h1>
                <p className="text-xs text-zinc-400">Live kitchen tracking and flow control</p>
              </div>

              {/* Order tabs filter */}
              <div className="flex gap-1 border border-zinc-800 p-1 rounded-xl bg-zinc-950 overflow-x-auto scrollbar-none max-w-full">
                {['all', 'pending_payment', 'accepted', 'preparing', 'ready', 'served', 'completed', 'cancelled'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setOrderFilter(tab as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize whitespace-nowrap cursor-pointer ${orderFilter === tab ? "bg-amber-500 text-black" : "text-zinc-400 hover:text-white"}`}
                  >
                    {tab.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders list */}
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 rounded-3xl border border-zinc-800/40 bg-zinc-900/10">
                <p className="text-sm text-zinc-400">No active orders found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredOrders.map((order) => (
                  <div 
                    key={order.id}
                    id={`admin-order-${order.id}`}
                    className={`rounded-3xl p-6 border relative space-y-4 ${darkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200"}`}
                  >
                    
                    {/* Top status bar */}
                    <div className="flex justify-between items-center pb-3 border-b border-zinc-800/60">
                      <div>
                        <span className="text-xs font-mono font-bold text-amber-500">Token #{order.tokenNumber}</span>
                        <h4 className="text-base font-black">Table {order.tableNumber}</h4>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 block">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider block mt-1 ${
                          order.status === 'completed' ? "bg-emerald-500/15 text-emerald-500" :
                          order.status === 'cancelled' ? "bg-red-500/15 text-red-500" : "bg-amber-500/15 text-amber-500"
                        }`}>{order.status.replace('_', ' ')}</span>
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="space-y-1.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span className="font-semibold text-zinc-300">
                            {item.menuItem.name} <span className="text-amber-500 font-black">x{item.quantity}</span>
                            {item.selectedVariants && (
                              <span className="block text-[10px] text-zinc-500">
                                {item.selectedVariants.spicyLevel && `🌶️ ${item.selectedVariants.spicyLevel} `}
                                {item.selectedVariants.extraCheese && `🧀 Cheese `}
                                {item.selectedVariants.extraButter && `🧈 Butter`}
                              </span>
                            )}
                          </span>
                          <span className="text-zinc-400">{settings?.currency}{item.menuItem.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {order.instructions && (
                      <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-xs text-amber-500">
                        <strong className="block font-bold">Chef Note:</strong> {order.instructions}
                      </div>
                    )}

                    {/* Cost breakdown */}
                    <div className="pt-3 border-t border-dashed border-zinc-800/80 flex justify-between text-xs">
                      <span className="text-zinc-400">Total Price ({order.paymentStatus.toUpperCase()})</span>
                      <strong className="text-sm font-black text-amber-500">{settings?.currency}{order.total}</strong>
                    </div>

                    {/* Control workflow buttons */}
                    <div className="pt-2 grid grid-cols-3 gap-2">
                      {order.status === 'pending_payment' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'accepted')}
                          className="col-span-3 bg-emerald-500 text-black py-2.5 rounded-xl font-bold text-xs"
                        >
                          Confirm Cash Payment & Accept
                        </button>
                      )}
                      
                      {order.status === 'accepted' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                          className="col-span-3 bg-amber-500 text-black py-2.5 rounded-xl font-bold text-xs"
                        >
                          Start Cooking
                        </button>
                      )}

                      {order.status === 'preparing' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
                          className="col-span-3 bg-cyan-500 text-black py-2.5 rounded-xl font-bold text-xs"
                        >
                          Mark Ready (Food Ready)
                        </button>
                      )}

                      {order.status === 'ready' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'served')}
                          className="col-span-3 bg-indigo-500 text-white py-2.5 rounded-xl font-bold text-xs"
                        >
                          Mark Served to Table
                        </button>
                      )}

                      {order.status === 'served' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                          className="col-span-3 bg-emerald-500 text-black py-2.5 rounded-xl font-bold text-xs"
                        >
                          Close Ticket (Completed)
                        </button>
                      )}

                      {/* Cancel override */}
                      {!['completed', 'cancelled'].includes(order.status) && (
                        <button
                          onClick={() => {
                            if (confirm("Cancel this order?")) {
                              handleUpdateOrderStatus(order.id, 'cancelled');
                            }
                          }}
                          className="col-span-3 border border-red-500/30 text-red-500 py-2 rounded-xl text-xs font-bold hover:bg-red-500/10 mt-1"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* --- TAB 3: KITCHEN DISPLAY SYSTEM (KDS) --- */}
        {activeTab === "kitchen" && (
          <div className="space-y-6">
            
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black tracking-tight flex items-center gap-1.5">
                  <ChefHat className="w-6 h-6 text-amber-500" />
                  <span>Kitchen Display Screen (KDS)</span>
                </h1>
                <p className="text-xs text-zinc-400">High-visibility ticket rail for the chefs</p>
              </div>
              <span className="text-xs bg-zinc-900 px-3 py-1 rounded-full text-zinc-400 border border-zinc-800">Live Auto-Sync</span>
            </div>

            {/* Cooking Tickets Grid */}
            {orders.filter(o => ['accepted', 'preparing', 'ready'].includes(o.status)).length === 0 ? (
              <div className="text-center py-24 rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/5">
                <ChefHat className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-sm text-zinc-400 font-bold">Kitchen is empty! All customer bellies are full.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {orders.filter(o => ['accepted', 'preparing', 'ready'].includes(o.status)).map((order) => (
                  <div 
                    key={order.id}
                    className="bg-black border-2 border-zinc-800 rounded-2xl flex flex-col justify-between overflow-hidden shadow-2xl min-h-[300px]"
                  >
                    {/* Header Ticket banner */}
                    <div className={`p-4 flex justify-between items-center ${
                      order.status === 'ready' ? "bg-cyan-950 text-cyan-400 border-b border-cyan-800" : "bg-zinc-900 text-zinc-300 border-b border-zinc-800"
                    }`}>
                      <div>
                        <h4 className="text-xl font-black">Table #{order.tableNumber}</h4>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Token {order.tokenNumber}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-extrabold">
                        <Clock className="w-4 h-4 text-amber-500 animate-spin" />
                        <span>{order.estimatedTime}m</span>
                      </div>
                    </div>

                    {/* Cooking list */}
                    <div className="p-4 flex-1 space-y-3.5">
                      <div className="space-y-1.5 border-b border-dashed border-zinc-800 pb-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-start text-sm">
                            <span className="font-extrabold text-zinc-200">
                              • {item.menuItem.name} 
                              {item.selectedVariants && (
                                <span className="block text-xs text-red-500 font-bold">
                                  {item.selectedVariants.spicyLevel && `🌶️ ${item.selectedVariants.spicyLevel} `}
                                  {item.selectedVariants.extraCheese && `🧀 Cheese `}
                                  {item.selectedVariants.extraButter && `🧈 Butter`}
                                </span>
                              )}
                            </span>
                            <span className="text-base font-black text-amber-500">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {order.instructions && (
                        <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 text-xs text-amber-500 font-bold leading-relaxed">
                          ⚠️ NOTE: {order.instructions}
                        </div>
                      )}
                    </div>

                    {/* Quick chef update actions */}
                    <div className="p-4 bg-zinc-950 border-t border-zinc-900 flex gap-2">
                      {order.status === 'accepted' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                          className="w-full bg-amber-500 text-black py-3 rounded-xl font-black text-xs cursor-pointer"
                        >
                          COOK NOW (Preparing)
                        </button>
                      )}

                      {order.status === 'preparing' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
                          className="w-full bg-emerald-500 text-black py-3 rounded-xl font-black text-xs cursor-pointer"
                        >
                          READY TO SERVE (Ready)
                        </button>
                      )}

                      {order.status === 'ready' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'served')}
                          className="w-full bg-indigo-500 text-white py-3 rounded-xl font-black text-xs cursor-pointer"
                        >
                          SERVED (Done)
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* --- TAB 4: MENU CRUD MANAGER --- */}
        {activeTab === "menu" && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight flex items-center gap-1.5">
                  <Sparkles className="w-6 h-6 text-amber-500" />
                  <span>Menu Catalog</span>
                </h1>
                <p className="text-xs text-zinc-400">Add, edit, or adjust prices of items</p>
              </div>

              <button
                id="btn-admin-add-dish"
                onClick={() => { setItemEditing(null); setIsItemModalOpen(true); }}
                className="bg-amber-500 text-black px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 hover:bg-amber-400 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Add New Dish
              </button>
            </div>

            {/* Menu List Table */}
            <div className={`border rounded-2xl overflow-hidden ${darkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200"}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-950 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      <th className="p-4">Dish</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-xs">
                    {filteredMenu.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-800/10">
                        <td className="p-4 flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                          <div>
                            <span className="font-extrabold block">{item.name}</span>
                            <span className="text-[10px] text-zinc-500 line-clamp-1">{item.description}</span>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-zinc-400 uppercase tracking-wide">
                          {categories.find(c => c.id === item.categoryId)?.name || "Uncategorized"}
                        </td>
                        <td className="p-4 font-extrabold text-amber-500">{settings?.currency}{item.price}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${item.isVeg ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-400'}`}>
                            {item.isVeg ? "Veg" : "Non-Veg"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${item.isAvailable ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            {item.isAvailable ? "Available" : "Sold Out"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => { setItemEditing(item); setIsItemModalOpen(true); }}
                              className="p-1.5 text-zinc-400 hover:text-amber-500 rounded-lg hover:bg-zinc-800/40"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMenuItem(item.id)}
                              className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-zinc-800/40"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* --- TAB 5: CATEGORY CRUD MANAGER --- */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black tracking-tight flex items-center gap-1.5">
                  <Layers className="w-6 h-6 text-amber-500" />
                  <span>Dish Categories</span>
                </h1>
                <p className="text-xs text-zinc-400">Organize restaurant dishes into groups</p>
              </div>

              <button
                onClick={() => { setCategoryEditing(null); setIsCategoryModalOpen(true); }}
                className="bg-amber-500 text-black px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 hover:bg-amber-400 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>

            {/* Categories List Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div 
                  key={cat.id}
                  className={`p-5 rounded-2xl border flex justify-between items-center ${darkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200"}`}
                >
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wide text-amber-500">{cat.name}</h4>
                    <p className="text-xs text-zinc-400 mt-1">{cat.description}</p>
                    <span className="text-[10px] font-mono text-zinc-500 mt-3 block">Display Order: {cat.order}</span>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => { setCategoryEditing(cat); setIsCategoryModalOpen(true); }}
                      className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-2 rounded-xl bg-zinc-800 text-red-500 hover:bg-red-500/15 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* --- TAB 6: TABLE & QR MANAGER --- */}
        {activeTab === "tables" && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight flex items-center gap-1.5">
                  <TableProperties className="w-6 h-6 text-amber-500" />
                  <span>Tables & QR Codes</span>
                </h1>
                <p className="text-xs text-zinc-400">Generate, print, or manage dynamic QR-Code table routes</p>
              </div>

              {/* Add Table box */}
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="Table #"
                  value={newTableNumber || ""}
                  onChange={(e) => setNewTableNumber(Number(e.target.value))}
                  className="px-3 py-2 rounded-xl text-xs bg-zinc-900 border border-zinc-800 text-white w-24 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  onClick={handleAddTable}
                  className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl text-xs font-black cursor-pointer"
                >
                  Add Table QR
                </button>
              </div>
            </div>

            {/* Tables Grid view */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {tables.map((table) => (
                <div 
                  key={table.id}
                  className={`rounded-2xl p-5 border text-center space-y-4 ${darkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200"}`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      table.status === 'occupied' ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                    }`}>{table.status}</span>
                    
                    <button 
                      onClick={() => handleDeleteTable(table.id)}
                      className="p-1 text-zinc-500 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-lg font-black">Table No. {table.number}</h3>

                  {/* QR Image Display */}
                  <div className="bg-white p-3 rounded-xl inline-block shadow-inner">
                    <img 
                      src={table.qrUrl} 
                      alt={`Table ${table.number} QR`} 
                      className="w-32 h-32"
                    />
                  </div>

                  <div className="flex gap-2">
                    {/* Simulator router launcher */}
                    <button
                      onClick={() => onTableChange(table.number)}
                      className="flex-1 py-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] uppercase font-black rounded-xl hover:bg-amber-500/20"
                    >
                      Launch Customer site
                    </button>

                    {/* Print QR Code */}
                    <button
                      onClick={() => {
                        const win = window.open();
                        if (win) {
                          win.document.write(`
                            <div style="text-align: center; font-family: sans-serif; padding: 40px;">
                              <h1>Khao Pio Aish Karo Mitro</h1>
                              <h2>Table No. ${table.number}</h2>
                              <img src="${table.qrUrl}" style="width: 300px; height: 300px; margin: 20px;" />
                              <p>Scan to view Menu & Order instantly</p>
                              <script>window.onload = function() { window.print(); }</script>
                            </div>
                          `);
                          win.document.close();
                        }
                      }}
                      className="p-2 bg-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-700"
                      title="Print QR"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* --- TAB 7: WAITER PINGS & ASSISTANCES --- */}
        {activeTab === "assistance" && (
          <div className="space-y-6">
            
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black tracking-tight flex items-center gap-1.5">
                  <Bell className="w-6 h-6 text-amber-500" />
                  <span>Waiter Service Pings</span>
                </h1>
                <p className="text-xs text-zinc-400">Real-time table assistance requests</p>
              </div>
            </div>

            {/* Assistance Requests table */}
            {assistanceRequests.length === 0 ? (
              <div className="text-center py-20 rounded-3xl border border-zinc-800 bg-zinc-900/10">
                <p className="text-sm text-zinc-400">All customer requests have been resolved!</p>
              </div>
            ) : (
              <div className={`border rounded-2xl overflow-hidden ${darkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200"}`}>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-950 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      <th className="p-4">Table</th>
                      <th className="p-4">Request Type</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Time Logged</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-zinc-800/40">
                    {assistanceRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-zinc-800/10">
                        <td className="p-4 font-black text-sm">Table #{req.tableNumber}</td>
                        <td className="p-4">
                          <span className="font-extrabold flex items-center gap-1 text-amber-500 uppercase">
                            {req.type === 'water' ? '💦 Water' : req.type === 'bill' ? '🧾 Request Bill' : '🙋 Assistance'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            req.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-400'
                          }`}>{req.status}</span>
                        </td>
                        <td className="p-4 text-zinc-400">{new Date(req.createdAt).toLocaleTimeString()}</td>
                        <td className="p-4 text-right">
                          {req.status === 'pending' && (
                            <button
                              onClick={() => handleResolveAssistance(req.id)}
                              className="bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1.5 rounded-lg text-xs font-bold"
                            >
                              Resolve Ping
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}

        {/* --- TAB 8: GLOBAL RESTAURANT SETTINGS & SECURITY --- */}
        {activeTab === "settings" && settings && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Restaurant Profile Settings */}
            <form 
              onSubmit={handleSaveSettings}
              className={`p-6 rounded-3xl border space-y-4 ${darkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200"}`}
            >
              <h3 className="text-sm font-black uppercase tracking-wider text-amber-500 pb-2 border-b border-zinc-800">Restaurant Settings</h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Restaurant Name</label>
                  <input type="text" name="restaurantName" required defaultValue={settings.restaurantName} className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white" />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Address Location</label>
                  <input type="text" name="address" required defaultValue={settings.address} className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Phone Number</label>
                    <input type="text" name="phone" required defaultValue={settings.phone} className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Opening Hours</label>
                    <input type="text" name="openingHours" required defaultValue={settings.openingHours} className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">GST Tax %</label>
                    <input type="number" name="gstPercentage" required defaultValue={settings.gstPercentage} className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Srv Charge %</label>
                    <input type="number" name="serviceChargePercentage" required defaultValue={settings.serviceChargePercentage} className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Currency Symbol</label>
                    <input type="text" name="currency" required defaultValue={settings.currency} className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black rounded-2xl transition-all cursor-pointer mt-2"
              >
                Save Restaurant Profile
              </button>
            </form>

            {/* Security Settings panel */}
            <form 
              onSubmit={handleUpdatePassword}
              className={`p-6 rounded-3xl border space-y-4 ${darkMode ? "bg-zinc-900/40 border-zinc-800" : "bg-white border-zinc-200"}`}
            >
              <h3 className="text-sm font-black uppercase tracking-wider text-amber-500 pb-2 border-b border-zinc-800">Security Credentials</h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Current Password</label>
                  <input 
                    type="password" 
                    required
                    placeholder="Enter current password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white" 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">New Secure Password</label>
                  <input 
                    type="password" 
                    required
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white" 
                  />
                </div>
              </div>

              {passError && <p className="text-red-500 font-bold text-[10px]">{passError}</p>}
              {passSuccess && <p className="text-emerald-500 font-bold text-[10px]">{passSuccess}</p>}

              <button
                type="submit"
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-black rounded-2xl transition-all cursor-pointer mt-2"
              >
                Change Admin Password
              </button>
            </form>

          </div>
        )}

      </main>

      {/* DISH ADD/EDIT FORM MODAL */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form 
            onSubmit={handleSaveMenuItem}
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-xs text-white space-y-4"
          >
            <h3 className="text-base font-black tracking-tight text-amber-500 border-b border-zinc-800 pb-2">{itemEditing ? 'Edit Dish details' : 'Add New Dish to Menu'}</h3>

            <div className="space-y-3 overflow-y-auto max-h-[70vh]">
              <div>
                <label className="text-[10px] uppercase font-mono tracking-wider block mb-1">Dish Name</label>
                <input type="text" name="name" required defaultValue={itemEditing?.name || ""} className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white" />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono tracking-wider block mb-1">Description</label>
                <input type="text" name="description" required defaultValue={itemEditing?.description || ""} className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-mono tracking-wider block mb-1">Price (₹)</label>
                  <input type="number" name="price" required defaultValue={itemEditing?.price || ""} className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono tracking-wider block mb-1">Prep Time (minutes)</label>
                  <input type="number" name="prepTime" required defaultValue={itemEditing?.prepTime || 15} className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white" />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono tracking-wider block mb-1">Category</label>
                <select name="categoryId" required defaultValue={itemEditing?.categoryId || categories[0]?.id} className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white">
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono tracking-wider block mb-1">Image URL</label>
                <input type="text" name="image" required defaultValue={itemEditing?.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500"} className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-mono tracking-wider block mb-1">Food Type</label>
                  <select name="isVeg" defaultValue={itemEditing?.isVeg ? "true" : "false"} className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white">
                    <option value="true">Vegetarian (Veg)</option>
                    <option value="false">Non-Vegetarian (Non-Veg)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono tracking-wider block mb-1">Availability</label>
                  <select name="isAvailable" defaultValue={itemEditing?.isAvailable ? "true" : "false"} className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white">
                    <option value="true">In Stock (Available)</option>
                    <option value="false">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 font-bold cursor-pointer text-zinc-300">
                  <input type="checkbox" name="isChefSpecial" defaultChecked={itemEditing?.isChefSpecial} value="true" className="rounded bg-zinc-950 border-zinc-800" />
                  👨‍🍳 Chef Special
                </label>
                <label className="flex items-center gap-2 font-bold cursor-pointer text-zinc-300">
                  <input type="checkbox" name="isPopular" defaultChecked={itemEditing?.isPopular} value="true" className="rounded bg-zinc-950 border-zinc-800" />
                  🔥 Popular Item
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-750 text-white font-extrabold rounded-xl text-xs transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
              >
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Save Dish
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CATEGORY ADD/EDIT FORM MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form 
            onSubmit={handleSaveCategory}
            className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-xs text-white space-y-4"
          >
            <h3 className="text-base font-black tracking-tight text-amber-500 border-b border-zinc-800 pb-2">{categoryEditing ? 'Edit Category' : 'Create New Category'}</h3>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-mono tracking-wider block mb-1">Category Name</label>
                <input type="text" name="name" required placeholder="e.g. STARTERS" defaultValue={categoryEditing?.name || ""} className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white" />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono tracking-wider block mb-1">Description Summary</label>
                <input type="text" name="description" placeholder="e.g. Hot and fresh tandoori baked breads" defaultValue={categoryEditing?.description || ""} className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white" />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono tracking-wider block mb-1">Sort Order index</label>
                <input type="number" name="order" required defaultValue={categoryEditing?.order || 1} className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white" />
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="flex-1 py-2.5 bg-zinc-800 text-white rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-500 text-black rounded-xl text-xs font-bold"
              >
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
