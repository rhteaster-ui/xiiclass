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

      <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--bg)] text-[var(--ink)]">
        {/* Desktop Sidebar (>= 1024px) */}
        <aside className="no-print hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[var(--surface)] border-r border-[var(--border)] z-30">
          <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--border)]">
            <img
              src={withBasePath("/icon-madrasah.jpg")}
              alt="Ikon E-Rekap"
              width={40}
              height={40}
              className="h-10 w-10 rounded-xl object-cover border border-[var(--border)] shrink-0"
            />
            <div className="min-w-0">
              <p className="text-base font-bold tracking-tight text-[var(--ink)] truncate">
                E-Rekap
              </p>
              <p className="text-xs text-[var(--ink-muted)] truncate">
                Rekap Kehadiran Siswa
              </p>
            </div>
          </div>

          <nav aria-label="Navigasi Utama" className="flex-1 px-3 py-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    active
                      ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "text-[var(--ink-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]"
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
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${
                isAdmin
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "bg-[var(--surface-muted)] text-[var(--ink-muted)]"
              }`}
            >
              {isAdmin ? (
                <>
                  <ShieldCheck size={16} weight="fill" />
                  <span>Mode Admin (Akses Edit)</span>
                </>
              ) : (
                <>
                  <Eye size={16} weight="regular" />
                  <span>Mode Review (Publik)</span>
                </>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile Top Bar (< 1024px) */}
        <header className="no-print lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <img
              src={withBasePath("/icon-madrasah.jpg")}
              alt="Ikon E-Rekap"
              width={34}
              height={34}
              className="h-8.5 w-8.5 rounded-lg object-cover border border-[var(--border)]"
            />
            <div>
              <p className="text-sm font-bold leading-tight text-[var(--ink)]">E-Rekap</p>
              <p className="text-[11px] text-[var(--ink-muted)] leading-tight">
                Rekapitulasi Kehadiran
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isAdmin
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                : "bg-[var(--surface-muted)] text-[var(--ink-muted)]"
            }`}
          >
            {isAdmin ? <ShieldCheck size={14} weight="fill" /> : <Eye size={14} />}
            {isAdmin ? "Admin" : "Review"}
          </span>
        </header>

        {/* Main Content */}
        <main className="flex-1 lg:pl-64 pb-24 lg:pb-10">
          <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>

        {/* Mobile Floating Bottom Navigation (< 1024px) */}
        <nav
          aria-label="Navigasi Bawah"
          className="no-print lg:hidden fixed bottom-3 inset-x-3 z-40 mx-auto max-w-md rounded-2xl bg-[var(--surface)]/95 backdrop-blur-lg border border-[var(--border-strong)] shadow-[var(--shadow-float)] px-2 py-1.5"
        >
          <div className="grid grid-cols-4 gap-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center min-h-[46px] rounded-xl px-1 py-1 text-[11px] font-semibold transition-colors ${
                    active
                      ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  <Icon size={21} weight={active ? "fill" : "regular"} />
                  <span className="mt-0.5 leading-none">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
