import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export type SessionUser = { id: string; email: string; name: string; role: string };

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const u = session.user as { id?: string; email?: string; name?: string; role?: string };
  if (!u.id || !u.email) return null;
  return { id: u.id, email: u.email, name: u.name ?? "", role: u.role ?? "DANSER" };
}

export async function requireUser(): Promise<SessionUser | NextResponse> {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Du må logge inn først." }, { status: 401 });
  }
  return user;
}

export async function requireRole(roles: string[]): Promise<SessionUser | NextResponse> {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Du må logge inn først." }, { status: 401 });
  }
  if (!roles.includes(user.role)) {
    return NextResponse.json({ error: "Du har ikke tilgang til denne funksjonen." }, { status: 403 });
  }
  return user;
}

export function isResponse(x: unknown): x is NextResponse {
  return x instanceof NextResponse;
}
