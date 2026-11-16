import crypto from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "erekap_admin_session";
const SECRET = process.env.SESSION_SECRET || "erekap-manu-asembagus-secret-key-2026";

export interface AdminSession {
  adminId: number;
  username: string;
  displayName: string;
  exp: number;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function createSessionToken(data: Omit<AdminSession, "exp">): string {
  const session: AdminSession = {
    ...data,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  };
  const payload = Buffer.from(JSON.stringify(session), "utf-8").toString("base64url");
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string | undefined): AdminSession | null {
  if (!token || !token.includes(".")) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8")) as AdminSession;
    if (!parsed.exp || parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
