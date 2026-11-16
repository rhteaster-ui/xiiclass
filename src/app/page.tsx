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
  Funnel,
  ArrowClockwise,
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

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Institutional Banner Header */}
        <section
          aria-label="Ringkasan Sistem"
          className="relative overflow-hidden rounded-2xl border border-[var(--border)] shadow-[var(--shadow-tactile)] animate-cascade"
        >
          <img
            src={withBasePath("/banner-madrasah.jpg")}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#0A3622]/95 via-[#0F5132]/88 to-[#0F5132]/72"
          />
          <div className="relative z-10 flex flex-col gap-4 p-5 sm:p-7 md:flex-row md:items-end md:justify-between text-white">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-emerald-50 backdrop-blur-sm">
                <CalendarBlank size={14} weight="bold" />
                <span>
                  {data?.school
                    ? `TA ${data.school.academic_year} • Semester ${data.school.semester}`
                    : "Rekapitulasi Kehadiran Resmi"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Dashboard Rekapitulasi
              </h1>
              <p className="text-sm text-emerald-50/90 leading-relaxed">
                Pantau rekapitulasi kehadiran siswa secara real-time, terstruktur per kelas dan periode bulanan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl bg-white/12 px-4 py-2.5 backdrop-blur-sm border border-white/15">
                <p className="text-[11px] uppercase tracking-wider text-emerald-100/80 font-semibold">
                  Tingkat Kehadiran
                </p>
                <p className="font-num text-2xl font-bold text-white">
                  {loading ? "—" : `${data?.summary.attendance_rate ?? 0}%`}
                </p>
              </div>
              <Link
                href={`/rekap?period=${encodeURIComponent(period)}&classId=${encodeURIComponent(classId)}`}
                className="btn-tactile inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#0F5132] shadow-sm hover:bg-emerald-50"
              >
                <span>Buka Tabel Rekap</span>
                <ArrowRight size={16} weight="bold" />
              </Link>
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <section
          aria-label="Filter Periode dan Kelas"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-[var(--surface)] p-4 border border-[var(--border)] shadow-[var(--shadow-tactile)] animate-cascade"
          style={{ animationDelay: "40ms" }}
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
            <Funnel size={18} className="text-[var(--accent)]" />
            <span>Filter Ringkasan</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-[var(--ink-muted)]">
              <span>Kelas</span>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)] px-3 py-2 text-sm font-semibold text-[var(--ink)] min-h-[40px]"
              >
                <option value="all">Semua Kelas</option>
                {data?.classes.map((cls) => (
                  <option key={cls.id} value={String(cls.id)}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-[var(--ink-muted)]">
              <span>Periode</span>
              <input
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="font-num rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)] px-3 py-2 text-sm font-semibold text-[var(--ink)] min-h-[40px]"
              />
            </label>
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

        {/* Metric KPI Grid */}
        <section aria-label="Metrik Kehadiran" className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {[
            {
              label: "Total Hadir (H)",
              value: data?.summary.total_hadir ?? 0,
              icon: CheckCircle,
              badgeBg: "bg-[var(--status-hadir-bg)]",
              badgeFg: "text-[var(--status-hadir-fg)]",
              delay: "80ms",
            },
            {
              label: "Total Sakit (S)",
              value: data?.summary.total_sakit ?? 0,
              icon: FirstAidKit,
              badgeBg: "bg-[var(--status-sakit-bg)]",
              badgeFg: "text-[var(--status-sakit-fg)]",
              delay: "120ms",
            },
            {
              label: "Total Izin (I)",
              value: data?.summary.total_izin ?? 0,
              icon: EnvelopeSimple,
              badgeBg: "bg-[var(--status-izin-bg)]",
              badgeFg: "text-[var(--status-izin-fg)]",
              delay: "160ms",
            },
            {
              label: "Total Alpha (A)",
              value: data?.summary.total_alpha ?? 0,
              icon: WarningCircle,
              badgeBg: "bg-[var(--status-alpha-bg)]",
              badgeFg: "text-[var(--status-alpha-fg)]",
              delay: "200ms",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                style={{ animationDelay: item.delay }}
                className="animate-cascade rounded-2xl bg-[var(--surface)] p-4 sm:p-5 border border-[var(--border)] shadow-[var(--shadow-tactile)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[var(--ink-muted)]">
                    {item.label}
                  </span>
                  <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${item.badgeBg} ${item.badgeFg}`}>
                    <Icon size={18} weight="fill" />
                  </span>
                </div>
                <p className="mt-3 font-num text-2xl sm:text-3xl font-bold text-[var(--ink)]">
                  {loading ? (
                    <span className="inline-block h-8 w-16 animate-pulse rounded-lg bg-[var(--surface-muted)]" />
                  ) : (
                    item.value.toLocaleString("id-ID")
                  )}
                </p>
              </div>
            );
          })}
        </section>

        {/* Per-Class Breakdown */}
        <section
          aria-label="Rekapitulasi Per Kelas"
          style={{ animationDelay: "240ms" }}
          className="animate-cascade rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-tactile)] overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2.5">
              <UsersThree size={20} weight="fill" className="text-[var(--accent)]" />
              <h2 className="text-base font-bold text-[var(--ink)]">
                Ringkasan Per Kelas
              </h2>
            </div>
            <span className="font-num text-xs font-semibold text-[var(--ink-muted)]">
              {data ? `${data.classes.length} Kelas` : "Memuat..."}
            </span>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 w-full animate-pulse rounded-xl bg-[var(--surface-muted)]" />
              ))}
            </div>
          ) : !data || data.classBreakdown.length === 0 ? (
            <div className="p-8 text-center text-sm text-[var(--ink-muted)]">
              Belum ada data kelas terdaftar. Admin dapat menambahkan kelas melalui menu Kelola.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--surface-raised)] border-b border-[var(--border)] text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                    <th className="py-3 px-5">Kelas</th>
                    <th className="py-3 px-4">Wali Kelas</th>
                    <th className="py-3 px-4 text-right">Siswa</th>
                    <th className="py-3 px-3 text-right">H</th>
                    <th className="py-3 px-3 text-right">S</th>
                    <th className="py-3 px-3 text-right">I</th>
                    <th className="py-3 px-3 text-right">A</th>
                    <th className="py-3 px-5 text-right">Kehadiran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] text-sm">
                  {data.classBreakdown.map((row) => {
                    const total = row.hadir + row.sakit + row.izin + row.alpha;
                    const rate = total > 0 ? Math.round((row.hadir / total) * 1000) / 10 : 0;
                    return (
                      <tr
                        key={row.id}
                        className="hover:bg-[var(--surface-raised)] transition-colors"
                      >
                        <td className="py-3.5 px-5 font-bold text-[var(--ink)]">
                          <Link
                            href={`/rekap?classId=${row.id}&period=${encodeURIComponent(period)}`}
                            className="hover:text-[var(--accent)] hover:underline underline-offset-4"
                          >
                            {row.name}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-[var(--ink-muted)]">
                          {row.homeroom_teacher}
                        </td>
                        <td className="py-3.5 px-4 text-right font-num font-semibold">
                          {row.total_students}
                        </td>
                        <td className="py-3.5 px-3 text-right font-num font-semibold text-[var(--status-hadir-fg)]">
                          {row.hadir}
                        </td>
                        <td className="py-3.5 px-3 text-right font-num font-semibold text-[var(--status-sakit-fg)]">
                          {row.sakit}
                        </td>
                        <td className="py-3.5 px-3 text-right font-num font-semibold text-[var(--status-izin-fg)]">
                          {row.izin}
                        </td>
                        <td className="py-3.5 px-3 text-right font-num font-semibold text-[var(--status-alpha-fg)]">
                          {row.alpha}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <span className="font-num inline-flex items-center rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-bold text-[var(--accent)]">
                            {rate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
