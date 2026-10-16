import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, isResponse } from "@/lib/session";

const createSchema = z.object({
  name: z.string().min(2).max(80),
  birthYear: z.number().int().min(1900).max(new Date().getFullYear()).nullable().optional(),
  isChild: z.boolean().default(false),
  consent: z.boolean().optional(),
});

export async function GET() {
  const user = await requireUser();
  if (isResponse(user)) return user;
  const profiles = await db.deltakerProfile.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });
  return NextResponse.json({ profiles });
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (isResponse(user)) return user;
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Ugyldige data" }, { status: 400 });
  const { name, birthYear, isChild, consent } = parsed.data;
  if (isChild && !consent) {
    return NextResponse.json({ error: "Barn må ha foresatt-samtykke." }, { status: 400 });
  }
  const profile = await db.deltakerProfile.create({
    data: { userId: user.id, name, birthYear: birthYear ?? null, isChild, consent: !!consent },
  });
  return NextResponse.json({ ok: true, profile });
}

export async function PATCH(req: NextRequest) {
  const user = await requireUser();
  if (isResponse(user)) return user;
  const body = (await req.json().catch(() => null)) as { id?: string; consent?: boolean; name?: string; birthYear?: number | null };
  if (!body?.id) return NextResponse.json({ error: "Ugyldig forespørsel" }, { status: 400 });
  const data: Record<string, unknown> = {};
  if (typeof body.consent === "boolean") data.consent = body.consent;
  if (body.name) data.name = body.name;
  if (body.birthYear !== undefined) data.birthYear = body.birthYear;
  await db.deltakerProfile.updateMany({ where: { id: body.id, userId: user.id }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const user = await requireUser();
  if (isResponse(user)) return user;
  const { id } = (await req.json().catch(() => null)) as { id?: string };
  if (!id) return NextResponse.json({ error: "Ugyldig forespørsel" }, { status: 400 });
  const used = await db.booking.count({ where: { profileId: id, status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN"] } } });
  if (used > 0) return NextResponse.json({ error: "Profilen har aktive kurs og kan ikke slettes." }, { status: 409 });
  await db.deltakerProfile.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
