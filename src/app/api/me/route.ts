import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, isResponse } from "@/lib/session";

/** Rask økt-info til klient (navn, rolle, profiler, klippekort) */
export async function GET() {
  const user = await requireUser();
  if (isResponse(user)) return user;
  const [profiles, klippekort] = await Promise.all([
    db.deltakerProfile.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
    db.klippekort.findMany({ where: { userId: user.id } }),
  ]);
  const klippLeft = klippekort.reduce((s, k) => s + (k.clips - k.used), 0);
  return NextResponse.json({ user, profiles, klippLeft });
}
