import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, isResponse } from "@/lib/session";

/** Favoritt-toggle for kurs */
export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (isResponse(user)) return user;
  const { courseId } = (await req.json().catch(() => null)) as { courseId?: string };
  if (!courseId) return NextResponse.json({ error: "Ugyldig forespørsel" }, { status: 400 });

  const existing = await db.favorite.findUnique({ where: { userId_courseId: { userId: user.id, courseId } } });
  if (existing) {
    await db.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true, favorited: false });
  }
  await db.favorite.create({ data: { userId: user.id, courseId } });
  return NextResponse.json({ ok: true, favorited: true });
}

export async function GET() {
  const user = await requireUser();
  if (isResponse(user)) return user;
  const favs = await db.favorite.findMany({ where: { userId: user.id }, select: { courseId: true } });
  return NextResponse.json({ courseIds: favs.map((f) => f.courseId) });
}
