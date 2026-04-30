"use client";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Sidebar from "./Sidebar";
import { useAlertCount } from "@/lib/alertContext";
import { useAuth } from "@/lib/auth";
import { Bell, Settings, LogOut, User } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function MainLayout({ children, title, subtitle, actions }: MainLayoutProps) {
  const { unreadCount } = useAlertCount();
  const { user, logout } = useAuth();
  const router = useRouter();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.email ?? "ผู้ใช้งาน";
  const initials = displayName[0]?.toUpperCase() ?? "U";
  const roleLabel = user?.role_name ?? "";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside
        style={{ width: "var(--sidebar-w)", minWidth: "var(--sidebar-w)", background: "linear-gradient(180deg, #003d82 0%, #00306a 100%)" }}
        className="h-screen flex flex-col flex-shrink-0 shadow-xl"
      >
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <Sidebar alertCount={unreadCount} />
        </div>
      </aside>

      {/* ── Main column ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">

        {/* ── Topbar ───────────────────────────────────────────────────────── */}
        <header className="flex-shrink-0 h-16 bg-gradient-to-r from-[#003d82] to-[#00306a]
                           px-4 sm:px-6 flex items-center gap-3 z-20 shadow-lg text-white">

          {/* Logo + Hospital Name */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 border border-white/20 shadow-sm">
              <Image src="/logo.png" alt="Logo" width={36} height={36} className="w-full h-full object-cover" />
            </div>
            <div className="hidden lg:block">
              <p className="text-[13px] font-bold text-white leading-tight">โรงพยาบาลวัดห้วยปลากั้ง</p>
              <p className="text-[10px] text-blue-200/70 leading-tight">PharmSub — ระบบจ่ายยา</p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-white/20 flex-shrink-0 hidden lg:block" />

          {/* Page title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-white truncate leading-tight">{title}</h1>
            {subtitle && <p className="text-[11px] text-blue-200/70 truncate leading-tight">{subtitle}</p>}
          </div>

          {/* Action buttons */}
          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
            </div>
          )}

          {/* Notification Bell */}
          <button
            onClick={() => router.push("/alerts")}
            className="relative p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
            title="การแจ้งเตือน"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#003d82]" />
            )}
          </button>

          {/* User Menu */}
          <div className="relative flex-shrink-0" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(v => !v)}
              className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center
                         border border-white/20 text-white text-sm font-bold transition-all active:scale-95"
              title={displayName}
            >
              {initials}
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-[110%] w-52 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)]
                              border border-gray-100 overflow-hidden z-50 text-gray-800">
                {/* User info */}
                <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600
                                    flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{initials}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-gray-800 truncate">{displayName}</p>
                      {roleLabel && <p className="text-[10px] text-gray-400 truncate">{roleLabel}</p>}
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-1.5 space-y-0.5">
                  <button
                    onClick={() => { router.push("/settings"); setShowUserMenu(false); }}
                    className="w-full text-left px-3 py-2 text-sm font-semibold text-gray-700
                               hover:bg-gray-50 rounded-xl flex items-center gap-3 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                      <Settings size={15} className="text-gray-500 group-hover:text-blue-600" />
                    </div>
                    ตั้งค่าระบบ
                  </button>

                  <button
                    onClick={() => { logout(); setShowUserMenu(false); }}
                    className="w-full text-left px-3 py-2 text-sm font-semibold text-red-600
                               hover:bg-red-50 rounded-xl flex items-center gap-3 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                      <LogOut size={15} />
                    </div>
                    ออกจากระบบ
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ── Page content ─────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 animate-fade-in">
          {children}
        </main>

        <footer className="flex-shrink-0 px-6 py-2 border-t border-slate-100 bg-white
                           text-center text-xs text-slate-400">
          PharmSub — ระบบบริหารคลังยาย่อย
        </footer>
      </div>
    </div>
  );
}
