"use client";

import { useEffect, useState } from "react";
import { withBasePath } from "@/lib/paths";

export function SplashScreen() {
  const [phase, setPhase] = useState<"checking" | "show" | "exiting" | "done">("checking");

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem("erekap_splashed");
      if (seen) {
        setPhase("done");
        return;
      }
      setPhase("show");
      sessionStorage.setItem("erekap_splashed", "1");

      const exitTimer = setTimeout(() => setPhase("exiting"), 650);
      const doneTimer = setTimeout(() => setPhase("done"), 950);
      return () => {
        clearTimeout(exitTimer);
        clearTimeout(doneTimer);
      };
    } catch {
      setPhase("done");
    }
  }, []);

  if (phase === "checking" || phase === "done") return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#092E1C] text-white ${
        phase === "exiting" ? "animate-splash-exit pointer-events-none" : ""
      }`}
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 42%, rgba(21, 128, 61, 0.42), rgba(9, 46, 28, 1) 70%)",
      }}
    >
      <div className="flex flex-col items-center gap-5 px-6 text-center">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-white/10 p-1.5 ring-1 ring-white/25 shadow-2xl">
          <img
            src={withBasePath("/icon-madrasah.jpg")}
            alt="Logo E-Rekap"
            width={88}
            height={88}
            loading="eager"
            decoding="sync"
            className="h-full w-full rounded-2xl object-cover"
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-2xl font-extrabold tracking-tight text-white">E-Rekap</p>
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-emerald-200/80">
            Rekapitulasi Kehadiran
          </p>
        </div>
      </div>
    </div>
  );
}
