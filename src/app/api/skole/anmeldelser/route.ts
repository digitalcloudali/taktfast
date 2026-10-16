import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, isResponse } from "@/lib/session";

/** Anmeldelser for egne skoler — med mulighet til å svare */
export async function GET() {
  const user = await requireRole(["SKOLE", "ADMIN"]);
  if (isResponse(user)) return user;
  let schoolId: string | null = null;
  if (user.role === "SKOLE") {
    const school = await db.school.findFirst({ where: { ownerId: user.id } });
    if (!school) return NextResponse.json({ error: "Fant ikke skolen din." }, { status: 404 });
    schoolId = school.id;
  }
  const reviews = await db.review.findMany({
    where: schoolId ? { schoolId } : {},
    include: { school: { select: { name: true } }, course: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ reviews });
}

const replySchema = z.object({ reviewId: z.string(), reply: z.string().min(2).max(800) });

export async function POST(req: NextRequest) {
  const user = await requireRole(["SKOLE", "ADMIN"]);
  if (isResponse(user)) return user;
  const parsed = replySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ugyldige data" }, { status: 400 });
  const review = await db.review.findUnique({ where: { id: parsed.data.reviewId } });
  if (!review) return NextResponse.json({ error: "Fant ikke anmeldelsen." }, { status: 404 });
  if (user.role === "SKOLE") {
    const school = await db.school.findFirst({ where: { ownerId: user.id } });
    if (!school || review.schoolId !== school.id) return NextResponse.json({ error: "Ingen tilgang." }, { status: 403 });
  }
  await db.review.update({ where: { id: review.id }, data: { reply: parsed.data.reply, repliedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
