import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, isResponse } from "@/lib/session";

/** Meldinger (mock innboks) */
export async function GET() {
  const user = await requireRole(["SKOLE", "ADMIN"]);
  if (isResponse(user)) return user;
  let schoolId: string | null = null;
  if (user.role === "SKOLE") {
    const school = await db.school.findFirst({ where: { ownerId: user.id } });
    if (!school) return NextResponse.json({ error: "Fant ikke skolen din." }, { status: 404 });
    schoolId = school.id;
  }
  const messages = await db.message.findMany({
    where: schoolId ? { schoolId } : {},
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ messages });
}

const replySchema = z.object({ threadId: z.string(), body: z.string().min(2).max(1000), senderName: z.string().optional() });

export async function POST(req: NextRequest) {
  const user = await requireRole(["SKOLE", "ADMIN"]);
  if (isResponse(user)) return user;
  const parsed = replySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ugyldige data" }, { status: 400 });
  const parent = await db.message.findUnique({ where: { id: parsed.data.threadId } });
  if (!parent) return NextResponse.json({ error: "Fant ikke samtalen." }, { status: 404 });
  let schoolId = parent.schoolId;
  if (user.role === "SKOLE") {
    const school = await db.school.findFirst({ where: { ownerId: user.id } });
    if (!school || parent.schoolId !== school.id) return NextResponse.json({ error: "Ingen tilgang." }, { status: 403 });
  }
  const msg = await db.message.create({
    data: { schoolId, userId: parent.userId, fromRole: "SKOLE", senderName: user.name, subject: `Sv: ${parent.subject}`, body: parsed.data.body },
  });
  await db.notification.create({
    data: { userId: parent.userId, channel: "EMAIL", subject: "Svar fra danseskolen", body: parsed.data.body.slice(0, 200) },
  });
  return NextResponse.json({ ok: true, messageId: msg.id });
}
