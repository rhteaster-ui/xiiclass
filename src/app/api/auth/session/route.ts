import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, admin: null });
  }
  return NextResponse.json({
    authenticated: true,
    admin: {
      username: session.username,
      displayName: session.displayName,
    },
  });
}
