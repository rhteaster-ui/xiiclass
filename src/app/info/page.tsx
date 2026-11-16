"use client";

import { useEffect, useState } from "react";
import {
  Globe,
  GithubLogo,
  TiktokLogo,
  ArrowUpRight,
  ShieldCheck,
  Database,
  Printer,
  FileXls,
  Buildings,
  MapPin,
  IdentificationCard,
} from "@phosphor-icons/react";
import { AppShell } from "@/components/AppShell";
import { AmbientBackdrop } from "@/components/AmbientBackdrop";
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
        {/* Canopy Header — Focus on Web App Details */}
        <section className="relative overflow-hidden rounded-b-[28px] lg:rounded-3xl bg-[#0A3D26] px-5 pt-6 pb-14 sm:px-7 sm:pt-7 text-white shadow-[0_18px_40px_-14px_rgba(7,41,25,0.45)] animate-cascade">
          <AmbientBackdrop variant="canopy" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/15 p-1 ring-1 ring-white/25 shrink-0">
              <img
                src={withBasePath("/icon-madrasah.jpg")}
                alt="Ikon E-Rekap"
                width={56}
                height={56}
                className="h-full w-full rounded-xl object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#A3E635]">
                Detail Aplikasi Web
              </p>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                E-Rekap — Sistem Rekapitulasi Kehadiran
              </h1>
            </div>
          </div>
        </section>

        {/* Overlapping Content Stack */}
        <div className="relative z-20 -mt-9 px-3.5 lg:px-0 space-y-5">
          {/* 1. TOP: Detail & Spesifikasi Aplikasi */}
          <section
            aria-label="Detail Aplikasi"
            className="sheet-overlap rounded-3xl p-5 sm:p-6 space-y-5 animate-cascade"
            style={{ animationDelay: "40ms" }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-extrabold text-[var(--ink)]">
                  Tentang Aplikasi E-Rekap
                </h2>
                <p className="text-xs sm:text-sm text-[var(--ink-muted)] mt-0.5">
                  Platform rekapitulasi kehadiran siswa berbasis web dengan akses Review Publik dan Panel Admin terproteksi.
                </p>
              </div>
              <span className="font-num self-start rounded-full bg-[#0B1410] px-3 py-1 text-xs font-extrabold text-white">
                Versi 1.0.0
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {[
                {
                  icon: ShieldCheck,
                  title: "Review & Admin",
                  desc: "Siswa/guru bebas meninjau rekap; perubahan data hanya melalui login Admin.",
                },
                {
                  icon: Database,
                  title: "SQLite Persisten",
                  desc: "Seluruh data kelas, siswa, No. Absen, dan rekap tersimpan aman di server.",
                },
                {
                  icon: FileXls,
                  title: "Backup XLSX (Import/Export)",
                  desc: "Ekspor laporan serta impor restore data spreadsheet .xlsx di panel Admin.",
                },
                {
                  icon: Printer,
                  title: "Siap Cetak A4 Landscape",
                  desc: "Format tabel formal standar sekolah lengkap dengan Kop Surat resmi.",
                },
              ].map((spec) => {
                const Icon = spec.icon;
                return (
                  <div key={spec.title} className="rounded-2xl bg-[var(--bg)] p-4 space-y-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-mint)] text-[var(--canopy)]">
                      <Icon size={19} weight="fill" />
                    </span>
                    <p className="text-sm font-extrabold text-[var(--ink)]">{spec.title}</p>
                    <p className="text-xs text-[var(--ink-muted)] leading-relaxed">{spec.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 2. MIDDLE: Lembaga Terdaftar (Compact) */}
          <section
            aria-label="Informasi Lembaga"
            className="card-pro rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-cascade"
            style={{ animationDelay: "100ms" }}
          >
            <div className="flex items-start sm:items-center gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--surface-mint)] text-[var(--canopy)]">
                <Buildings size={22} weight="fill" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                  Lembaga Terdaftar
                </p>
                <p className="text-sm font-extrabold text-[var(--ink)]">
                  {school?.name || "MA NU Islamiyah Asembagus"}
                </p>
                <p className="text-xs text-[var(--ink-muted)] flex items-center gap-1 mt-0.5">
                  <MapPin size={13} weight="fill" className="text-[var(--canopy)] shrink-0" />
                  <span>
                    {school?.address ||
                      "Jl. Raya No. 170 Asembagus, Desa Trigonco, Kec. Asembagus, Kab. Situbondo"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg)] px-3 py-1.5 font-num text-xs font-bold text-[var(--ink)]">
                <IdentificationCard size={14} weight="fill" className="text-[var(--canopy)]" />
                NPSN {school?.npsn || "20584645"}
              </span>
              <span className="rounded-full bg-[var(--surface-mint)] px-3 py-1.5 font-num text-xs font-bold text-[var(--canopy)]">
                TA {school?.academic_year || "2026/2027"} ({school?.semester || "Ganjil"})
              </span>
            </div>
          </section>

          {/* 3. BOTTOM: Personal Branding & Profil Pengembang (Rohmatulloh / R_HMT OFC) */}
          <section
            aria-label="Profil Pengembang"
            className="card-pro rounded-3xl p-5 sm:p-6 space-y-5 animate-cascade"
            style={{ animationDelay: "160ms" }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 rounded-2xl p-0.5 bg-gradient-to-br from-[#A3E635] via-[#115737] to-[#072919] shadow-lg">
                  <img
                    src={withBasePath("/pp-dev.webp")}
                    alt="Foto Profil Rohmatulloh (R_HMT OFC)"
                    width={80}
                    height={80}
                    className="h-full w-full rounded-[14px] object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <span className="inline-flex items-center rounded-full bg-[var(--surface-mint)] px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[var(--canopy)]">
                    Pelajar MA • Web & Agentic Dev
                  </span>
                  <h2 className="text-xl font-extrabold tracking-tight text-[var(--ink)]">
                    Rohmatulloh <span className="text-[var(--canopy)]">(R_HMT OFC)</span>
                  </h2>
                  <p className="text-xs font-semibold text-[var(--ink-muted)]">
                    Personal Branding: <span className="font-bold text-[var(--ink)]">rhmt ofc</span> • Indonesia
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href="https://rhmt.biz.id"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-tactile inline-flex items-center gap-2 rounded-full bg-[#A3E635] px-4 py-2.5 text-xs font-extrabold text-[#072919] shadow-sm hover:bg-[#BEF264]"
                >
                  <Globe size={16} weight="bold" />
                  <span>rhmt.biz.id</span>
                  <ArrowUpRight size={14} weight="bold" />
                </a>

                <a
                  href="https://github.com/rhmt-ofc"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-tactile inline-flex items-center gap-2 rounded-full bg-[#0B1410] px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                >
                  <GithubLogo size={16} weight="fill" />
                  <span>github.com/rhmt-ofc</span>
                </a>

                <a
                  href="https://www.tiktok.com/@rhmtofc"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-tactile inline-flex items-center gap-2 rounded-full bg-[var(--surface-mint)] px-4 py-2.5 text-xs font-bold text-[var(--canopy)] hover:bg-[#d7efe0]"
                >
                  <TiktokLogo size={16} weight="fill" />
                  <span>@rhmtofc</span>
                </a>
              </div>
            </div>

            <p className="text-sm text-[var(--ink-muted)] leading-relaxed border-t border-[var(--border)] pt-4">
              Saya <strong>R_HMT OFC</strong>, pelajar MA yang mendalami pengembangan web modern, automasi sistem, dan kolaborasi bersama AI. <strong>E-Rekap</strong> dibangun dengan arsitektur Next.js + SQLite untuk menghadirkan pengalaman aplikasi native yang rapi dan berstandar sekolah.
            </p>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
