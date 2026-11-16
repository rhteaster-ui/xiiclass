"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  SquaresFour,
  Table,
  SlidersHorizontal,
  Info,
  ShieldCheck,
  Eye,
} from "@phosphor-icons/react";
import { withBasePath } from "@/lib/paths";
import { SplashScreen } from "./SplashScreen";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: SquaresFour },
  { href: "/rekap", label: "Rekap", icon: Table },
  { href: "/admin", label: "Kelola", icon: SlidersHorizontal },
  { href: "/info", label: "Info", icon: Info },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const syncSession = () => {
      fetch(withBasePath("/api/auth/session"))
        .then((r) => r.json())
        .then((d) => setIsAdmin(Boolean(d?.authenticated)))
        .catch(() => setIsAdmin(false));
    };
    syncSession();
    window.addEventListener("erekap-auth-changed", syncSession);
    return () => window.removeEventListener("erekap-auth-changed", syncSession);
  }, [pathname]);

  return (
    <>
      <SplashScreen />

      <div className="min-h-screen flex flex-col lg:flex-row text-[var(--ink)]">
        {/* Desktop Sidebar (>= 1024px) */}
        <aside className="no-print hidden lg:flex lg:w-68 lg:flex-col lg:fixed lg:inset-y-0 bg-[var(--surface)] border-r border-[var(--border-strong)] shadow-[4px_0_24px_-12px_rgba(12,20,16,0.12)] z-30">
          <div className="flex items-center gap-3.5 px-5 py-5 border-b border-[var(--border)]">
            <div className="h-11 w-11 rounded-2xl p-0.5 bg-gradient-to-br from-[#15803D] to-[#0A3622] shadow-md shrink-0">
              <img
                src={withBasePath("/icon-madrasah.jpg")}
                alt="Ikon E-Rekap"
                width={44}
                height={44}
                className="h-full w-full rounded-[14px] object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-base font-extrabold tracking-tight text-[var(--ink)] truncate">
                E-Rekap
              </p>
              <p className="text-xs font-medium text-[var(--ink-muted)] truncate">
                Sistem Rekap Kehadiran
              </p>
            </div>
          </div>

          <nav aria-label="Navigasi Utama" className="flex-1 px-3.5 py-5 space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`btn-tactile flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                    active
                      ? "bg-[#0F5132] text-white shadow-[0_6px_16px_-6px_rgba(15,81,50,0.55)]"
                      : "text-[var(--ink-muted)] hover:bg-[var(--surface-recessed)] hover:text-[var(--ink)]"
                  }`}
                >
                  <Icon size={20} weight={active ? "fill" : "regular"} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-[var(--border)]">
            <div
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                isAdmin
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] ring-1 ring-emerald-700/15"
                  : "well-recessed text-[var(--ink-muted)]"
              }`}
            >
              {isAdmin ? (
                <>
                  <ShieldCheck size={17} weight="fill" />
                  <span>Mode Admin (Akses Edit)</span>
                </>
              ) : (
                <>
                  <Eye size={17} weight="bold" />
                  <span>Mode Review (Publik)</span>
                </>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile Top Bar (< 1024px) */}
        <header className="no-print lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[var(--surface)]/90 backdrop-blur-xl border-b border-[var(--border)] shadow-[0_2px_12px_-4px_rgba(12,20,16,0.08)]">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl p-0.5 bg-gradient-to-br from-[#15803D] to-[#0A3622] shadow-sm">
              <img
                src={withBasePath("/icon-madrasah.jpg")}
                alt="Ikon E-Rekap"
                width={36}
                height={36}
                className="h-full w-full rounded-[10px] object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-extrabold leading-tight tracking-tight text-[var(--ink)]">
                E-Rekap
              </p>
              <p className="text-[11px] font-medium text-[var(--ink-muted)] leading-tight">
                Rekapitulasi Kehadiran
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-xs ${
              isAdmin
                ? "bg-[#0F5132] text-white"
                : "well-recessed text-[var(--ink-muted)]"
            }`}
          >
            {isAdmin ? <ShieldCheck size={14} weight="fill" /> : <Eye size={14} weight="bold" />}
            {isAdmin ? "Admin" : "Review"}
          </span>
        </header>

        {/* Main Content */}
        <main className="flex-1 lg:pl-68 pb-28 lg:pb-12">
          <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>

        {/* Mobile Dark Obsidian Floating Dock (< 1024px) */}
        <nav
          aria-label="Navigasi Bawah"
          className="no-print lg:hidden fixed bottom-3.5 inset-x-3.5 z-40 mx-auto max-w-md rounded-2xl bg-[#0B1712]/95 backdrop-blur-xl border border-white/15 shadow-[var(--shadow-dock)] p-1.5"
        >
          <div className="grid grid-cols-4 gap-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`btn-tactile flex flex-col items-center justify-center min-h-[48px] rounded-xl px-1 py-1.5 text-[11px] font-bold transition-colors ${
                    active
                      ? "bg-[#15803D] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_4px_12px_rgba(21,128,61,0.45)]"
                      : "text-slate-300/80 hover:text-white"
                  }`}
                >
                  <Icon size={20} weight={active ? "fill" : "regular"} />
                  <span className="mt-1 leading-none">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
