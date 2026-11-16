"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import * as XLSX from "xlsx";
import {
  MagnifyingGlass,
  Printer,
  FileXls,
  ArrowsDownUp,
  WarningCircle,
  ArrowClockwise,
} from "@phosphor-icons/react";
import { AppShell } from "@/components/AppShell";
import { withBasePath } from "@/lib/paths";

interface RekapRow {
  student_id: number;
  nis: string;
  name: string;
  gender: "L" | "P";
  class_id: number;
  class_name: string;
  homeroom_teacher: string;
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
  total: number;
  percentage: number;
  note: string;
}

interface SchoolInfo {
  name: string;
  npsn: string;
  address: string;
  academic_year: string;
  semester: string;
}

interface ClassInfo {
  id: number;
  name: string;
  homeroom_teacher: string;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function RekapContent() {
  const searchParams = useSearchParams();
  const [period, setPeriod] = useState(
    () => searchParams.get("period") || new Date().toISOString().slice(0, 7)
  );
  const [classId, setClassId] = useState(() => searchParams.get("classId") || "all");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "percentage">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [rows, setRows] = useState<RekapRow[]>([]);
  const [school, setSchool] = useState<SchoolInfo | null>(null);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeta = useCallback(async () => {
    try {
      const [sRes, cRes] = await Promise.all([
        fetch(withBasePath("/api/school")),
        fetch(withBasePath("/api/classes")),
      ]);
      if (sRes.ok) {
        const sd = await sRes.json();
        setSchool(sd.school);
      }
      if (cRes.ok) {
        const cd = await cRes.json();
        setClasses(cd.classes || []);
      }
    } catch {
      // handled in main table fetch
    }
  }, []);

  const fetchRekap = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = withBasePath(
        `/api/rekap?period=${encodeURIComponent(period)}&classId=${encodeURIComponent(classId)}&q=${encodeURIComponent(query)}`
      );
      const res = await fetch(url);
      if (!res.ok) throw new Error("Gagal mengambil data rekap.");
      const data = await res.json();
      setRows(data.rows || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  }, [period, classId, query]);

  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchRekap();
    }, 150);
    return () => clearTimeout(t);
  }, [fetchRekap]);

  const sortedRows = [...rows].sort((a, b) => {
    if (sortBy === "percentage") {
      return sortDir === "asc" ? a.percentage - b.percentage : b.percentage - a.percentage;
    }
    return sortDir === "asc"
      ? a.name.localeCompare(b.name, "id")
      : b.name.localeCompare(a.name, "id");
  });

  const handleSort = (col: "name" | "percentage") => {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir(col === "percentage" ? "desc" : "asc");
    }
  };

  const handleExportExcel = () => {
    const exportData = sortedRows.map((r, idx) => ({
      No: idx + 1,
      "NIS/NISN": r.nis,
      "Nama Siswa": r.name,
      Kelas: r.class_name,
      "L/P": r.gender,
      "Hadir (H)": r.hadir,
      "Sakit (S)": r.sakit,
      "Izin (I)": r.izin,
      "Alpha (A)": r.alpha,
      "Persentase (%)": `${r.percentage}%`,
      Keterangan: r.note || "-",
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Kehadiran");
    const clsName =
      classId === "all"
        ? "Semua-Kelas"
        : classes.find((c) => String(c.id) === classId)?.name.replace(/\s+/g, "-") || "Kelas";
    XLSX.writeFile(wb, `Rekap-Kehadiran-${clsName}-${period}.xlsx`);
  };

  const selectedClassName =
    classId === "all"
      ? "Semua Kelas"
      : classes.find((c) => String(c.id) === classId)?.name || "-";

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Formal Kop Surat (Visible in Print Mode Only — No Signature Block) */}
        <div className="hidden print-only mb-4 border-b-2 border-black pb-3 text-center">
          <p className="text-base font-bold uppercase tracking-wide">
            {school?.name || "MA NU Islamiyah Asembagus"}
          </p>
          <p className="text-xs">
            NPSN: {school?.npsn || "20584645"} • {school?.address || ""}
          </p>
          <p className="mt-2 text-sm font-bold uppercase">
            REKAPITULASI KEHADIRAN SISWA ({selectedClassName}) — PERIODE {period}
          </p>
          <p className="text-xs">
            Tahun Ajaran {school?.academic_year || "2026/2027"} • Semester {school?.semester || "Ganjil"}
          </p>
        </div>

        {/* Screen Header & Action Controls */}
        <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-cascade">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)]">
              Rekapitulasi Kehadiran
            </h1>
            <p className="text-sm text-[var(--ink-muted)]">
              Data resmi terverifikasi — siap cetak A4 dan ekspor spreadsheet.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={sortedRows.length === 0}
              className="btn-tactile inline-flex items-center gap-2 rounded-xl card-elevated px-4 py-2.5 text-sm font-bold text-[var(--ink)] disabled:opacity-50"
            >
              <FileXls size={18} weight="bold" className="text-[var(--accent)]" />
              <span>Ekspor Excel</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              disabled={sortedRows.length === 0}
              className="btn-tactile inline-flex items-center gap-2 rounded-xl bg-[#0F5132] px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_18px_-6px_rgba(15,81,50,0.55)] hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              <Printer size={18} weight="bold" />
              <span>Cetak A4</span>
            </button>
          </div>
        </div>

        {/* Search + Pill Filters */}
        <section
          aria-label="Filter Rekap"
          className="no-print space-y-3 animate-cascade"
          style={{ animationDelay: "40ms" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-2">
              <MagnifyingGlass
                size={18}
                weight="bold"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] pointer-events-none"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama siswa atau NIS/NISN..."
                aria-label="Cari nama atau NIS"
                className="w-full rounded-2xl card-elevated pl-10 pr-4 py-2.5 text-sm font-medium text-[var(--ink)] min-h-[44px]"
              />
            </div>

            <div className="flex items-center justify-between gap-2 rounded-2xl card-elevated px-3.5 py-2 min-h-[44px]">
              <span className="text-xs font-bold text-[var(--ink-muted)]">Periode</span>
              <input
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                aria-label="Pilih Periode Bulan"
                className="font-num bg-transparent text-sm font-bold text-[var(--ink)] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar rounded-2xl well-recessed p-1.5">
            <button
              type="button"
              onClick={() => setClassId("all")}
              className={`btn-tactile shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold ${
                classId === "all"
                  ? "bg-white text-[var(--ink)] shadow-sm"
                  : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
              }`}
            >
              Semua Kelas
            </button>
            {classes.map((cls) => {
              const active = classId === String(cls.id);
              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => setClassId(String(cls.id))}
                  className={`btn-tactile shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold ${
                    active
                      ? "bg-white text-[var(--accent)] shadow-sm"
                      : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {cls.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* Error State */}
        {error && (
          <div
            role="alert"
            className="no-print flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
          >
            <div className="flex items-center gap-2">
              <WarningCircle size={18} weight="fill" className="text-red-700" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={fetchRekap}
              className="inline-flex items-center gap-1 rounded-lg bg-red-700 px-3 py-1.5 text-xs font-semibold text-white"
            >
              <ArrowClockwise size={14} />
              <span>Muat Ulang</span>
            </button>
          </div>
        )}

        {/* Loading / Empty */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 w-full animate-pulse rounded-2xl card-elevated" />
            ))}
          </div>
        ) : sortedRows.length === 0 ? (
          <div className="card-elevated rounded-2xl p-10 text-center space-y-1">
            <p className="text-sm font-bold text-[var(--ink)]">Data siswa tidak ditemukan</p>
            <p className="text-xs text-[var(--ink-muted)]">
              Coba ubah kata kunci pencarian atau pilih kelas lain.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Native Card List (< 768px, hidden on Print) */}
            <section
              aria-label="Kartu Rekapitulasi Mobile"
              className="no-print md:hidden space-y-3 animate-cascade"
              style={{ animationDelay: "80ms" }}
            >
              <div className="flex items-center justify-between px-1 text-xs font-bold text-[var(--ink-muted)]">
                <span>{sortedRows.length} Siswa</span>
                <button
                  type="button"
                  onClick={() => handleSort(sortBy === "name" ? "percentage" : "name")}
                  className="inline-flex items-center gap-1 text-[var(--accent)]"
                >
                  <ArrowsDownUp size={14} weight="bold" />
                  <span>Urut: {sortBy === "name" ? "Nama" : "Persentase"}</span>
                </button>
              </div>

              {sortedRows.map((row) => (
                <article
                  key={row.student_id}
                  className="card-elevated rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] font-num text-xs font-extrabold text-[var(--accent)]">
                        {initialsOf(row.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-[var(--ink)] truncate">
                          {row.name}
                        </p>
                        <p className="font-num text-[11px] font-medium text-[var(--ink-muted)]">
                          {row.nis} • {row.class_name} ({row.gender})
                        </p>
                      </div>
                    </div>

                    <span className="font-num shrink-0 rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-extrabold text-[var(--accent)]">
                      {row.percentage}%
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <div className="rounded-xl bg-[var(--status-hadir-bg)] py-1.5">
                      <p className="text-[10px] font-bold text-[var(--status-hadir-fg)]">Hadir</p>
                      <p className="font-num text-sm font-extrabold text-[var(--status-hadir-fg)]">
                        {row.hadir}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[var(--status-sakit-bg)] py-1.5">
                      <p className="text-[10px] font-bold text-[var(--status-sakit-fg)]">Sakit</p>
                      <p className="font-num text-sm font-extrabold text-[var(--status-sakit-fg)]">
                        {row.sakit}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[var(--status-izin-bg)] py-1.5">
                      <p className="text-[10px] font-bold text-[var(--status-izin-fg)]">Izin</p>
                      <p className="font-num text-sm font-extrabold text-[var(--status-izin-fg)]">
                        {row.izin}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[var(--status-alpha-bg)] py-1.5">
                      <p className="text-[10px] font-bold text-[var(--status-alpha-fg)]">Alpha</p>
                      <p className="font-num text-sm font-extrabold text-[var(--status-alpha-fg)]">
                        {row.alpha}
                      </p>
                    </div>
                  </div>

                  {row.note && (
                    <p className="rounded-xl well-recessed px-3 py-1.5 text-xs text-[var(--ink-muted)]">
                      Catatan: <span className="font-semibold text-[var(--ink)]">{row.note}</span>
                    </p>
                  )}
                </article>
              ))}
            </section>

            {/* Desktop Formal Ledger Table (>= 768px & Always Visible on Print) */}
            <section
              aria-label="Daftar Rekapitulasi Siswa"
              className="hidden md:block print-only card-elevated rounded-2xl overflow-hidden animate-cascade"
              style={{ animationDelay: "80ms" }}
            >
              <div className="overflow-x-auto">
                <table className="print-table w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[var(--surface-raised)] border-b border-[var(--border-strong)] text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                      <th className="py-3.5 px-4 text-right w-12">No</th>
                      <th className="py-3.5 px-3.5">NIS/NISN</th>
                      <th
                        className="py-3.5 px-3.5"
                        aria-sort={
                          sortBy === "name"
                            ? sortDir === "asc"
                              ? "ascending"
                              : "descending"
                            : "none"
                        }
                      >
                        <button
                          type="button"
                          onClick={() => handleSort("name")}
                          className="inline-flex items-center gap-1 hover:text-[var(--ink)]"
                        >
                          <span>Nama Siswa</span>
                          <ArrowsDownUp size={13} />
                        </button>
                      </th>
                      <th className="py-3.5 px-3">Kelas</th>
                      <th className="py-3.5 px-2.5 text-center">L/P</th>
                      <th className="py-3.5 px-3 text-right">H</th>
                      <th className="py-3.5 px-3 text-right">S</th>
                      <th className="py-3.5 px-3 text-right">I</th>
                      <th className="py-3.5 px-3 text-right">A</th>
                      <th
                        className="py-3.5 px-4 text-right"
                        aria-sort={
                          sortBy === "percentage"
                            ? sortDir === "asc"
                              ? "ascending"
                              : "descending"
                            : "none"
                        }
                      >
                        <button
                          type="button"
                          onClick={() => handleSort("percentage")}
                          className="inline-flex items-center justify-end gap-1 hover:text-[var(--ink)] ml-auto"
                        >
                          <span>%</span>
                          <ArrowsDownUp size={13} />
                        </button>
                      </th>
                      <th className="py-3.5 px-4">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] text-sm">
                    {sortedRows.map((row, index) => (
                      <tr
                        key={row.student_id}
                        className="hover:bg-[var(--surface-raised)] transition-colors"
                      >
                        <td className="py-3 px-4 text-right font-num text-[var(--ink-muted)]">
                          {index + 1}
                        </td>
                        <td className="py-3 px-3.5 font-num text-xs font-semibold text-[var(--ink-muted)]">
                          {row.nis}
                        </td>
                        <td className="py-3 px-3.5 font-bold text-[var(--ink)] whitespace-nowrap">
                          {row.name}
                        </td>
                        <td className="py-3 px-3 text-xs font-bold text-[var(--ink-muted)] whitespace-nowrap">
                          {row.class_name}
                        </td>
                        <td className="py-3 px-2.5 text-center font-num text-xs font-bold">
                          {row.gender}
                        </td>
                        <td className="py-3 px-3 text-right font-num font-extrabold text-[var(--status-hadir-fg)]">
                          {row.hadir}
                        </td>
                        <td className="py-3 px-3 text-right font-num font-bold text-[var(--status-sakit-fg)]">
                          {row.sakit}
                        </td>
                        <td className="py-3 px-3 text-right font-num font-bold text-[var(--status-izin-fg)]">
                          {row.izin}
                        </td>
                        <td className="py-3 px-3 text-right font-num font-bold text-[var(--status-alpha-fg)]">
                          {row.alpha}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-num inline-flex items-center rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-extrabold text-[var(--accent)]">
                            {row.percentage}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-[var(--ink-muted)] max-w-[200px] truncate">
                          {row.note || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}

export default function RekapPage() {
  return (
    <Suspense fallback={<AppShell><div className="p-8 text-sm">Memuat rekap...</div></AppShell>}>
      <RekapContent />
    </Suspense>
  );
}
