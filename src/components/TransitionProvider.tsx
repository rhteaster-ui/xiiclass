"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { withBasePath } from "@/lib/paths";

interface TransitionCtxValue {
  navigateWithCurtain: (href: string, label?: string) => void;
}

const TransitionContext = createContext<TransitionCtxValue>({
  navigateWithCurtain: () => {},
});

export function useCurtainNavigation() {
  return useContext(TransitionContext);
}

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [stage, setStage] = useState<"idle" | "entering" | "hold" | "leaving">("idle");
  const [subtitle, setSubtitle] = useState("MEMBUKA DASHBOARD");

  const navigateWithCurtain = useCallback(
    (href: string, label = "MEMBUKA RUANG REKAP") => {
      const reduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduced) {
        router.push(href);
        return;
      }

      setSubtitle(label);
      setStage("entering");

      setTimeout(() => {
        setStage("hold");
        router.push(href);
      }, 280);

      setTimeout(() => {
        setStage("leaving");
      }, 760);

      setTimeout(() => {
        setStage("idle");
      }, 1080);
    },
    [router]
  );

  return (
    <TransitionContext.Provider value={{ navigateWithCurtain }}>
      {children}

      {stage !== "idle" && (
        <div
          aria-hidden="true"
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#062315] text-white ${
            stage === "entering"
              ? "curtain-enter"
              : stage === "leaving"
              ? "curtain-leave pointer-events-none"
              : ""
          }`}
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 45%, rgba(163, 230, 53, 0.14), rgba(6, 35, 21, 1) 62%)",
          }}
        >
          <div className="flex flex-col items-center gap-5 px-6 text-center">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <span className="curtain-halo absolute inset-0 rounded-3xl ring-2 ring-[#A3E635]/50" />
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-white/10 p-1 ring-1 ring-white/25 shadow-2xl">
                <img
                  src={withBasePath("/icon-madrasah.jpg")}
                  alt=""
                  width={80}
                  height={80}
                  className="h-full w-full rounded-xl object-cover"
                />
              </div>
            </div>

            <div className="overflow-hidden space-y-1.5">
              <p className="curtain-title text-3xl font-extrabold tracking-tight text-white">
                E-Rekap
              </p>
              <p className="curtain-sub font-num text-[11px] font-bold tracking-[0.24em] uppercase text-[#A3E635]">
                {subtitle}
              </p>
            </div>
          </div>
        </div>
      )}
    </TransitionContext.Provider>
  );
}
