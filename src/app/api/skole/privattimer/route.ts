import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, isResponse } from "@/lib/session";

/** Privattime-forespørsler (bryllupsdans osv.) */
export async function GET() {
  const user = await requireRole(["SKOLE", "ADMIN"]);
  if (isResponse(user)) return user;
  let schoolId: string | null = null;
  if (user.role === "SKOLE") {
    const school = await db.school.findFirst({ where: { ownerId: user.id } });
    if (!school) return NextResponse.json({ error: "Fant ikke skolen din." }, { status: 404 });
    schoolId = school.id;
  }
  const requests = await db.privateRequest.findMany({
    where: schoolId ? { schoolId } : {},
    include: { weddingPackage: { select: { name: true } }, school: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ requests });
}

const patchSchema = z.object({ id: z.string(), status: z.enum(["NEW", "CONTACTED", "BOOKED"]) });

export async function PATCH(req: NextRequest) {
  const user = await requireRole(["SKOLE", "ADMIN"]);
  if (isResponse(user)) return user;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ugyldige data" }, { status: 400 });
  const { id, status } = parsed.data;
  const request = await db.privateRequest.findUnique({ where: { id } });
  if (!request) return NextResponse.json({ error: "Fant ikke forespørselen." }, { status: 404 });
  if (user.role === "SKOLE") {
    const school = await db.school.findFirst({ where: { ownerId: user.id } });
    if (!school || request.schoolId !== school.id) return NextResponse.json({ error: "Ingen tilgang." }, { status: 403 });
  }
  await db.privateRequest.update({ where: { id }, data: { status } });
  if (status === "CONTACTED") {
    await db.notification.create({
      data: { userId: request.userId, email: request.email, channel: "EMAIL", subject: "Skolen har besvart bryllupsdans-forespørselen din", body: `${request.schoolId ? "Danseskolen" : "Skolen"} har kontaktet deg om forespørselen. Sjekk e-posten din for tidsforslag.` },
    });
  }
  return NextResponse.json({ ok: true });
}
