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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0F5132] text-white ${
        phase === "exiting" ? "animate-splash-exit pointer-events-none" : ""
      }`}
    >
      <div className="flex flex-col items-center gap-4 px-6 text-center">
        <div className="h-20 w-20 overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-2xl">
          <img
            src={withBasePath("/icon-madrasah.jpg")}
            alt="Logo E-Rekap"
            width={80}
            height={80}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xl font-bold tracking-tight text-white">E-Rekap</p>
          <p className="text-xs font-medium tracking-wider uppercase text-emerald-100/80">
            Sistem Rekapitulasi Kehadiran
          </p>
        </div>
      </div>
    </div>
  );
}
