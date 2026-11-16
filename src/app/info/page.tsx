"use client";

import { useEffect, useState } from "react";
import {
  Buildings,
  MapPin,
  IdentificationCard,
  UserCheck,
  CalendarBlank,
  Code,
  Globe,
  ShieldCheck,
  ArrowUpRight,
} from "@phosphor-icons/react";
import { AppShell } from "@/components/AppShell";
import { withBasePath } from "@/lib/paths";

interface SchoolData {
  name: string;
  npsn: string;
  address: string;
  headmaster: string;
  academic_year: string;
  semester: string;
}

export default function InfoPage() {
  const [school, setSchool] = useState<SchoolData | null>(null);

  useEffect(() => {
    fetch(withBasePath("/api/school"))
      .then((r) => r.json())
      .then((d) => setSchool(d.school))
      .catch(() => {});
  }, []);

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Canopy Header */}
        <section className="relative overflow-hidden rounded-b-[28px] lg:rounded-3xl bg-[#0A3D26] px-5 pt-6 pb-14 sm:px-7 sm:pt-7 text-white shadow-[0_18px_40px_-14px_rgba(7,41,25,0.45)] animate-cascade">
          <img
            src={withBasePath("/banner-madrasah.jpg")}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-55"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-[#072919]/95 via-[#0A3D26]/88 to-[#115737]/72"
          />
          <div className="relative z-10 flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/15 p-1 ring-1 ring-white/25 shrink-0">
              <img
                src={withBasePath("/icon-madrasah.jpg")}
                alt="Logo Sekolah"
                width={56}
                height={56}
                className="h-full w-full rounded-xl object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-lime-200/90">
                Profil Resmi Lembaga
              </p>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {school?.name || "MA NU Islamiyah Asembagus"}
              </h1>
            </div>
          </div>
        </section>

        {/* Overlapping White Profile Sheet */}
        <div className="relative z-20 -mt-9 px-3.5 lg:px-0 grid grid-cols-1 lg:grid-cols-3 gap-5">
          <section
            aria-label="Profil Sekolah"
            className="lg:col-span-2 sheet-overlap rounded-3xl p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-cascade"
            style={{ animationDelay: "50ms" }}
          >
            <div className="flex items-start gap-3 rounded-2xl bg-[var(--bg)] p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-mint)] text-[var(--canopy)] shrink-0">
                <IdentificationCard size={20} weight="fill" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                  NPSN
                </p>
                <p className="font-num text-sm font-extrabold text-[var(--ink)]">
                  {school?.npsn || "20584645"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-[var(--bg)] p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-mint)] text-[var(--canopy)] shrink-0">
                <UserCheck size={20} weight="fill" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                  Kepala Madrasah
                </p>
                <p className="text-sm font-bold text-[var(--ink)]">
                  {school?.headmaster || "Drs. H. Ahmad Fauzi, M.Pd.I"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-[var(--bg)] p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-mint)] text-[var(--canopy)] shrink-0">
                <CalendarBlank size={20} weight="fill" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                  Tahun Ajaran
                </p>
                <p className="font-num text-sm font-bold text-[var(--ink)]">
                  {school ? `${school.academic_year} (${school.semester})` : "2026/2027 (Ganjil)"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-[var(--bg)] p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-mint)] text-[var(--canopy)] shrink-0">
                <Buildings size={20} weight="fill" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                  Jenjang
                </p>
                <p className="text-sm font-bold text-[var(--ink)]">
                  Madrasah Aliyah (MA)
                </p>
              </div>
            </div>

            <div className="sm:col-span-2 flex items-start gap-3 rounded-2xl bg-[var(--bg)] p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-mint)] text-[var(--canopy)] shrink-0">
                <MapPin size={20} weight="fill" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                  Alamat Sekolah
                </p>
                <p className="text-sm font-medium text-[var(--ink)] leading-relaxed">
                  {school?.address ||
                    "Jl. Raya No. 170 Asembagus, Desa Trigonco, Kec. Asembagus, Kab. Situbondo, Jawa Timur"}
                </p>
              </div>
            </div>
          </section>

          {/* Info Developer */}
          <section
            aria-label="Informasi Developer"
            className="card-pro rounded-3xl p-5 sm:p-6 flex flex-col justify-between gap-5 animate-cascade"
            style={{ animationDelay: "100ms" }}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0A3D26] text-[#A3E635]">
                  <Code size={21} weight="bold" />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                    Pengembang Sistem
                  </p>
                  <h2 className="text-lg font-extrabold text-[var(--ink)]">RHMT OFC</h2>
                </div>
              </div>

              <p className="text-sm text-[var(--ink-muted)] leading-relaxed">
                <strong>E-Rekap</strong> dibangun menggunakan Next.js, database SQLite persisten, dan pemisahan hak akses publik vs Admin.
              </p>

              <div className="space-y-2.5 pt-1">
                <div className="flex items-center gap-2.5 text-xs font-bold text-[var(--ink)]">
                  <ShieldCheck size={17} weight="fill" className="text-[var(--canopy)]" />
                  <span>Mode Review Publik & Edit Admin</span>
                </div>
                <a
                  href="https://rhmt.biz.id"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-tactile inline-flex items-center gap-2 rounded-full bg-[#A3E635] px-4 py-2 text-xs font-extrabold text-[#072919] shadow-sm hover:bg-[#BEF264]"
                >
                  <Globe size={15} weight="bold" />
                  <span>rhmt.biz.id</span>
                  <ArrowUpRight size={14} weight="bold" />
                </a>
              </div>
            </div>

            <div className="rounded-2xl bg-[var(--bg)] px-4 py-3 text-xs font-medium text-[var(--ink-muted)]">
              Versi <span className="font-num font-extrabold text-[var(--ink)]">1.0.0</span> • Siap cetak A4 & Ekspor Excel.
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
