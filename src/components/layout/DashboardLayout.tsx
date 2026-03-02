import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = localStorage.getItem("clinic_auth");
    if (!auth) navigate("/login");
    // Default open on desktop
    if (window.innerWidth >= 768) setSidebarOpen(true);
  }, [navigate]);

  return (
    <div className="flex h-screen stars-bg overflow-hidden relative">
      <div className="stars-layer" />
      <div className="stars-layer stars-layer-2" />
      <div className="stars-layer stars-layer-3" />
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0 relative z-10">
        <TopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
