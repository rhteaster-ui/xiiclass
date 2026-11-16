"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle,
  FirstAidKit,
  EnvelopeSimple,
  WarningCircle,
  UsersThree,
  ArrowRight,
  CalendarBlank,
  ArrowClockwise,
  CaretRight,
} from "@phosphor-icons/react";
import { AppShell } from "@/components/AppShell";
import { withBasePath } from "@/lib/paths";

interface OverviewData {
  period: string;
  school: {
    name: string;
    npsn: string;
    address: string;
    academic_year: string;
    semester: string;
  };
  classes: Array<{
    id: number;
    name: string;
    homeroom_teacher: string;
    student_count: number;
  }>;
  summary: {
    total_students: number;
    total_hadir: number;
    total_sakit: number;
    total_izin: number;
    total_alpha: number;
    attendance_rate: number;
  };
  classBreakdown: Array<{
    id: number;
    name: string;
    homeroom_teacher: string;
    total_students: number;
    hadir: number;
    sakit: number;
    izin: number;
    alpha: number;
  }>;
}

function AttendanceRing({ rate }: { rate: number }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, rate));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative flex h-24 w-24 items-center justify-center shrink-0">
      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 84 84" aria-hidden="true">
        <circle
          cx="42"
          cy="42"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="7"
        />
        <circle
          cx="42"
          cy="42"
          r={radius}
          fill="none"
          stroke="#6EE7B7"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-num text-lg font-extrabold text-white leading-none">
          {clamped}%
        </span>
        <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-100/80">
          Hadir
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7));
  const [classId, setClassId] = useState("all");
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        withBasePath(`/api/overview?period=${encodeURIComponent(period)}&classId=${encodeURIComponent(classId)}`)
      );
      if (!res.ok) throw new Error("Gagal memuat ringkasan data.");
      const json = (await res.json()) as OverviewData;
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  }, [period, classId]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const totalSessions =
    (data?.summary.total_hadir ?? 0) +
    (data?.summary.total_sakit ?? 0) +
    (data?.summary.total_izin ?? 0) +
    (data?.summary.total_alpha ?? 0);

  const pctOf = (v: number) =>
    totalSessions > 0 ? Math.round((v / totalSessions) * 1000) / 10 : 0;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Elevated Institutional Banner Hero */}
        <section
          aria-label="Ringkasan Sistem"
          className="relative overflow-hidden rounded-3xl border border-emerald-950/30 shadow-[0_20px_45px_-16px_rgba(10,54,34,0.45)] animate-cascade"
        >
          <img
            src={withBasePath("/banner-madrasah.jpg")}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-[#072617]/96 via-[#0D442A]/90 to-[#0F5132]/75"
          />
          <div className="relative z-10 flex flex-col gap-5 p-5 sm:p-7 md:flex-row md:items-center md:justify-between text-white">
            <div className="space-y-2.5 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-bold text-emerald-100 ring-1 ring-white/20 backdrop-blur-md">
                <CalendarBlank size={14} weight="bold" />
                <span>
                  {data?.school
                    ? `TA ${data.school.academic_year} • Semester ${data.school.semester}`
                    : "Rekapitulasi Kehadiran Resmi"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Dashboard Rekapitulasi
              </h1>
              <p className="text-sm text-emerald-50/85 leading-relaxed">
                Pantau komposisi kehadiran siswa secara langsung, terstruktur per kelas dan periode bulanan.
              </p>

              {/* Segmented Composition Bar inside Hero */}
              {totalSessions > 0 && (
                <div className="pt-1 space-y-1.5">
                  <div className="flex h-2 w-full overflow-hidden rounded-full bg-black/25 p-0.5 ring-1 ring-white/10">
                    <div
                      style={{ width: `${pctOf(data?.summary.total_hadir ?? 0)}%` }}
                      className="h-full rounded-l-full bg-emerald-400"
                    />
                    <div
                      style={{ width: `${pctOf(data?.summary.total_sakit ?? 0)}%` }}
                      className="h-full bg-amber-300"
                    />
                    <div
                      style={{ width: `${pctOf(data?.summary.total_izin ?? 0)}%` }}
                      className="h-full bg-sky-300"
                    />
                    <div
                      style={{ width: `${pctOf(data?.summary.total_alpha ?? 0)}%` }}
                      className="h-full rounded-r-full bg-rose-400"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold text-emerald-100/80">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      Hadir {pctOf(data?.summary.total_hadir ?? 0)}%
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-300" />
                      Sakit {pctOf(data?.summary.total_sakit ?? 0)}%
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-sky-300" />
                      Izin {pctOf(data?.summary.total_izin ?? 0)}%
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-rose-400" />
                      Alpha {pctOf(data?.summary.total_alpha ?? 0)}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between md:justify-end gap-4 rounded-2xl bg-black/20 p-3.5 ring-1 ring-white/15 backdrop-blur-md">
              <AttendanceRing rate={loading ? 0 : data?.summary.attendance_rate ?? 0} />
              <div className="space-y-2">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-100/75">
                    Siswa Terdata
                  </p>
                  <p className="font-num text-xl font-extrabold text-white">
                    {loading ? "—" : data?.summary.total_students ?? 0}
                  </p>
                </div>
                <Link
                  href={`/rekap?period=${encodeURIComponent(period)}&classId=${encodeURIComponent(classId)}`}
                  className="btn-tactile inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-xs font-extrabold text-[#0F5132] shadow-md hover:bg-emerald-50"
                >
                  <span>Tabel Rekap</span>
                  <ArrowRight size={14} weight="bold" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Tactile Segmented Class Filter + Month Picker */}
        <section
          aria-label="Filter Periode dan Kelas"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-cascade"
          style={{ animationDelay: "40ms" }}
        >
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar rounded-2xl well-recessed p-1.5">
            <button
              type="button"
              onClick={() => setClassId("all")}
              className={`btn-tactile shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                classId === "all"
                  ? "bg-white text-[var(--ink)] shadow-sm ring-1 ring-black/5"
                  : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
              }`}
            >
              Semua Kelas
            </button>
            {data?.classes.map((cls) => {
              const active = classId === String(cls.id);
              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => setClassId(String(cls.id))}
                  className={`btn-tactile shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                    active
                      ? "bg-white text-[var(--accent)] shadow-sm ring-1 ring-emerald-900/10"
                      : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {cls.name}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 rounded-2xl card-elevated px-3.5 py-2">
            <span className="text-xs font-bold text-[var(--ink-muted)]">Periode</span>
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              aria-label="Pilih Periode Bulan"
              className="font-num bg-transparent text-sm font-bold text-[var(--ink)] focus:outline-none"
            />
          </div>
        </section>

        {/* Error State */}
        {error && (
          <div
            role="alert"
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900"
          >
            <div className="flex items-center gap-2.5 text-sm font-medium">
              <WarningCircle size={20} weight="fill" className="text-red-700 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={loadOverview}
              className="btn-tactile inline-flex items-center gap-1.5 rounded-lg bg-red-700 px-3 py-1.5 text-xs font-semibold text-white"
            >
              <ArrowClockwise size={14} />
              <span>Coba Lagi</span>
            </button>
          </div>
        )}

        {/* Tactile KPI Grid */}
        <section aria-label="Metrik Kehadiran" className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {[
            {
              label: "Total Hadir",
              code: "H",
              value: data?.summary.total_hadir ?? 0,
              icon: CheckCircle,
              wellBg: "bg-[var(--status-hadir-bg)]",
              fg: "text-[var(--status-hadir-fg)]",
              barColor: "bg-emerald-600",
              delay: "80ms",
            },
            {
              label: "Total Sakit",
              code: "S",
              value: data?.summary.total_sakit ?? 0,
              icon: FirstAidKit,
              wellBg: "bg-[var(--status-sakit-bg)]",
              fg: "text-[var(--status-sakit-fg)]",
              barColor: "bg-amber-500",
              delay: "120ms",
            },
            {
              label: "Total Izin",
              code: "I",
              value: data?.summary.total_izin ?? 0,
              icon: EnvelopeSimple,
              wellBg: "bg-[var(--status-izin-bg)]",
              fg: "text-[var(--status-izin-fg)]",
              barColor: "bg-sky-600",
              delay: "160ms",
            },
            {
              label: "Total Alpha",
              code: "A",
              value: data?.summary.total_alpha ?? 0,
              icon: WarningCircle,
              wellBg: "bg-[var(--status-alpha-bg)]",
              fg: "text-[var(--status-alpha-fg)]",
              barColor: "bg-rose-600",
              delay: "200ms",
            },
          ].map((item) => {
            const Icon = item.icon;
            const share = pctOf(item.value);
            return (
              <div
                key={item.label}
                style={{ animationDelay: item.delay }}
                className="animate-cascade card-elevated card-elevated-interactive rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-[var(--ink-muted)]">
                      {item.label}
                    </span>
                    <p className="mt-1 font-num text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--ink)]">
                      {loading ? (
                        <span className="inline-block h-8 w-14 animate-pulse rounded-lg bg-[var(--surface-recessed)]" />
                      ) : (
                        item.value.toLocaleString("id-ID")
                      )}
                    </p>
                  </div>
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${item.wellBg} ${item.fg} shadow-inner`}
                  >
                    <Icon size={20} weight="fill" />
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-[var(--ink-muted)]">Porsi {item.code}</span>
                    <span className={`font-num ${item.fg}`}>{share}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full well-recessed">
                    <div
                      style={{ width: `${Math.min(100, share)}%` }}
                      className={`h-full rounded-full ${item.barColor}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Per-Class Summary Cards (Mobile) & Ledger Table (Desktop) */}
        <section
          aria-label="Rekapitulasi Per Kelas"
          style={{ animationDelay: "240ms" }}
          className="animate-cascade space-y-3"
        >
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <UsersThree size={20} weight="fill" className="text-[var(--accent)]" />
              <h2 className="text-base font-extrabold tracking-tight text-[var(--ink)]">
                Ringkasan Per Kelas
              </h2>
            </div>
            <span className="font-num rounded-full well-recessed px-3 py-1 text-xs font-bold text-[var(--ink-muted)]">
              {data ? `${data.classes.length} Kelas` : "Memuat..."}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 w-full animate-pulse rounded-2xl card-elevated" />
              ))}
            </div>
          ) : !data || data.classBreakdown.length === 0 ? (
            <div className="card-elevated rounded-2xl p-8 text-center text-sm text-[var(--ink-muted)]">
              Belum ada data kelas terdaftar. Admin dapat menambahkan kelas melalui menu Kelola.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {data.classBreakdown.map((row) => {
                const total = row.hadir + row.sakit + row.izin + row.alpha;
                const rate = total > 0 ? Math.round((row.hadir / total) * 1000) / 10 : 0;
                return (
                  <Link
                    key={row.id}
                    href={`/rekap?classId=${row.id}&period=${encodeURIComponent(period)}`}
                    className="card-elevated card-elevated-interactive rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-base font-extrabold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
                          {row.name}
                        </p>
                        <p className="text-xs font-medium text-[var(--ink-muted)]">
                          Wali: {row.homeroom_teacher}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-soft)] px-2.5 py-1 font-num text-xs font-extrabold text-[var(--accent)]">
                        {rate}%
                        <CaretRight size={12} weight="bold" />
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      <div className="rounded-xl bg-[var(--status-hadir-bg)] py-1.5">
                        <p className="text-[10px] font-bold text-[var(--status-hadir-fg)]">H</p>
                        <p className="font-num text-sm font-extrabold text-[var(--status-hadir-fg)]">
                          {row.hadir}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[var(--status-sakit-bg)] py-1.5">
                        <p className="text-[10px] font-bold text-[var(--status-sakit-fg)]">S</p>
                        <p className="font-num text-sm font-extrabold text-[var(--status-sakit-fg)]">
                          {row.sakit}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[var(--status-izin-bg)] py-1.5">
                        <p className="text-[10px] font-bold text-[var(--status-izin-fg)]">I</p>
                        <p className="font-num text-sm font-extrabold text-[var(--status-izin-fg)]">
                          {row.izin}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[var(--status-alpha-bg)] py-1.5">
                        <p className="text-[10px] font-bold text-[var(--status-alpha-fg)]">A</p>
                        <p className="font-num text-sm font-extrabold text-[var(--status-alpha-fg)]">
                          {row.alpha}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold text-[var(--ink-muted)] pt-1 border-t border-[var(--border)]">
                      <span>Jumlah Siswa</span>
                      <span className="font-num font-bold text-[var(--ink)]">
                        {row.total_students} Siswa
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
