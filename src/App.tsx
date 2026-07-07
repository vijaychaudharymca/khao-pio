import React, { useState, useEffect } from "react";
import CustomerPanel from "./components/CustomerPanel";
import AdminPanel from "./components/AdminPanel";
import { Utensils, Shield, Sparkles, QrCode, Scan, CheckCircle2, RotateCcw, Camera } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [darkMode, setDarkMode] = useState(true);
  const [isScanned, setIsScanned] = useState(false);
  const [scanningActive, setScanningActive] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  // Listen to popstate event (browser back/forward or route pushes)
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  // Utility to push route programmatically
  const navigateTo = (path: string) => {
    window.history.pushState(null, "", path);
    setCurrentPath(path);
  };

  // Simulate scanning action
  const handleSimulateScan = () => {
    if (scanningActive || scanSuccess) return;
    setScanningActive(true);
    
    // Simulate high-tech scanning delay
    setTimeout(() => {
      setScanningActive(false);
      setScanSuccess(true);
      
      // Auto transition to unlocked state after a brief visual success confirmation
      setTimeout(() => {
        setIsScanned(true);
        setScanSuccess(false);
      }, 1000);
    }, 1500);
  };

  // Match table path like: /table/5 or /table/12
  const tableMatch = currentPath.match(/^\/table\/(\d+)/);
  const detectedTableNum = tableMatch ? parseInt(tableMatch[1], 10) : null;

  // Render Admin panel
  if (currentPath === "/admin") {
    return (
      <AdminPanel 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        onTableChange={(num) => navigateTo(`/table/${num}`)} 
      />
    );
  }

  // Render Customer panel if table matched
  if (detectedTableNum !== null) {
    return (
      <CustomerPanel 
        tableNumber={detectedTableNum} 
        onTableChange={(num) => navigateTo(`/table/${num}`)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    );
  }

  // Build the dynamic QR code URL
  // It uses a public free QR code service encoding current URL
  const currentUrl = typeof window !== 'undefined' ? window.location.href : "https://khao-pio.example.com";
  const qrCodeUrl = darkMode 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=f59e0b&bgcolor=0a0a0b&data=${encodeURIComponent(currentUrl)}` 
    : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=18181b&bgcolor=ffffff&data=${encodeURIComponent(currentUrl)}`;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-all duration-300 ${darkMode ? "bg-[#0A0A0B] text-slate-100" : "bg-[#fcf8f2] text-zinc-900"}`}>
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-xl text-center space-y-8 relative z-10">
        
        {/* LOGO & BRANDING */}
        <div className="space-y-1">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex p-4 bg-amber-500 text-black rounded-[24px] shadow-2xl shadow-amber-500/15 mb-4"
          >
            <Utensils className="w-8 h-8 stroke-[2]" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-serif font-light tracking-tight text-amber-500">
            Khao Pio
          </h1>
          <p className="text-[10px] md:text-xs font-bold tracking-[0.25em] uppercase opacity-60">
            aish karo mitaro
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!isScanned ? (
            <motion.div
              key="qr-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className={`p-8 rounded-[32px] border text-center space-y-6 relative overflow-hidden ${
                darkMode ? "bg-white/[0.02] border-white/5 shadow-2xl" : "bg-white border-orange-100 shadow-xl"
              }`}
            >
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-amber-500/10 text-amber-400">
                  <Sparkles className="w-3 h-3" />
                  Self-Service Menu
                </span>
                <h3 className="text-xl font-serif font-light">Scan To Order From Table</h3>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                  Point your phone's camera at this screen or simulate scanning to test the system.
                </p>
              </div>

              {/* QR CODE SCANNING BOX */}
              <div className="relative w-64 h-64 mx-auto flex items-center justify-center bg-transparent group">
                
                {/* Simulated Scanning Laser Line */}
                {scanningActive && (
                  <motion.div 
                    initial={{ top: "0%" }}
                    animate={{ top: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", repeatType: "reverse" }}
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent z-20 shadow-[0_0_12px_#f59e0b]"
                  />
                )}

                {/* Corner Frame Highlights */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-amber-500 rounded-tl-xl pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-amber-500 rounded-tr-xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-amber-500 rounded-bl-xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-amber-500 rounded-br-xl pointer-events-none"></div>

                {/* QR Code Canvas Frame */}
                <button
                  id="btn-qr-container"
                  onClick={handleSimulateScan}
                  className="w-[220px] h-[220px] p-2 bg-transparent rounded-2xl flex items-center justify-center transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  {scanningActive ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl z-10">
                      <Camera className="w-8 h-8 text-amber-500 animate-pulse mb-2" />
                      <span className="text-[10px] font-bold tracking-widest text-amber-500 uppercase">Scanning...</span>
                    </div>
                  ) : scanSuccess ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-500/10 backdrop-blur-sm rounded-2xl z-10">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-bounce mb-2" />
                      <span className="text-[10px] font-bold tracking-widest text-emerald-500 uppercase">Success!</span>
                    </div>
                  ) : null}
                  
                  <img
                    src={qrCodeUrl}
                    alt="QR Code Table Scanner"
                    className="w-full h-full object-contain rounded-xl opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                </button>
              </div>

              {/* ACTION BUTTON */}
              <button
                id="btn-simulate-scan"
                onClick={handleSimulateScan}
                disabled={scanningActive || scanSuccess}
                className={`w-full py-4.5 rounded-full text-xs font-bold tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  scanningActive || scanSuccess
                    ? "bg-zinc-800 text-zinc-500"
                    : (darkMode ? "bg-white text-black hover:bg-slate-200" : "bg-zinc-900 text-white hover:bg-zinc-800")
                }`}
              >
                <Scan className="w-4 h-4" />
                <span>Simulate Scan (Tap QR)</span>
              </button>

              <p className="text-[10px] text-zinc-400 font-medium">
                Tip: Scanning simulates sitting down at a restaurant table.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="control-panel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              {/* TABLE SELECTOR SIMULATOR */}
              <div className={`p-8 rounded-[32px] border text-left space-y-6 ${
                darkMode ? "bg-white/[0.02] border-white/5 shadow-2xl" : "bg-white border-orange-100 shadow-xl"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-500">
                    <QrCode className="w-5 h-5" />
                    <h3 className="text-xs font-bold uppercase tracking-widest">Select Table</h3>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">
                    Scanned Successfully
                  </span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  The QR code scanner resolved successfully! Choose which Table number you are seated at to launch your live self-ordering menu:
                </p>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <button
                      key={num}
                      id={`btn-table-${num}`}
                      onClick={() => navigateTo(`/table/${num}`)}
                      className={`py-4 rounded-2xl text-xs font-bold transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer border ${
                        darkMode 
                          ? "bg-white/5 hover:bg-white/10 text-white border-white/5 hover:border-amber-500/30" 
                          : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border-zinc-200"
                      }`}
                    >
                      Table {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* ADMIN LAUNCH PORTAL */}
              <div className={`p-6 rounded-[24px] border border-dashed flex flex-col sm:flex-row items-center justify-between gap-4 text-left ${
                darkMode ? "border-white/10 bg-white/[0.01]" : "border-orange-200 bg-orange-50/10"
              }`}>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-500 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    Live Staff Control
                  </span>
                  <p className="text-[11px] text-zinc-400">
                    Manage active orders, update menus, and run the real-time Kitchen Display System.
                  </p>
                </div>
                <button
                  id="btn-launch-admin"
                  onClick={() => navigateTo("/admin")}
                  className={`w-full sm:w-auto px-5 py-3 rounded-full text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-all cursor-pointer ${
                    darkMode ? "bg-amber-500 hover:bg-amber-400 text-black" : "bg-zinc-900 hover:bg-zinc-800 text-white"
                  }`}
                >
                  Launch Admin
                </button>
              </div>

              {/* RESET TO VIEW QR CODE */}
              <button
                id="btn-reset-scan"
                onClick={() => setIsScanned(false)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-amber-500 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Show QR Code Scanner Again</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FOOTER & THEME CONTROLS */}
        <div className="flex items-center justify-between text-[11px] text-zinc-500 font-medium px-4 pt-4 border-t border-white/5">
          <button 
            id="btn-theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            className="hover:text-amber-500 font-bold underline cursor-pointer transition-colors"
          >
            Switch to {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <span>© Khao Pio. Powered by SSE.</span>
        </div>

      </div>
    </div>
  );
}
