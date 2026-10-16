import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, isResponse } from "@/lib/session";

/** Godkjenn/avslå/verifiser danseskoler */
export async function GET(req: NextRequest) {
  const user = await requireRole(["ADMIN"]);
  if (isResponse(user)) return user;
  const status = req.nextUrl.searchParams.get("status") ?? "PENDING";
  const schools = await db.school.findMany({
    where: status === "ALLE" ? {} : { status },
    include: { _count: { select: { courses: true, reviews: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ schools });
}

const patchSchema = z.object({
  schoolId: z.string(),
  action: z.enum(["APPROVE", "REJECT", "VERIFY", "PENDING"]),
});

export async function PATCH(req: NextRequest) {
  const user = await requireRole(["ADMIN"]);
  if (isResponse(user)) return user;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ugyldige data" }, { status: 400 });
  const { schoolId, action } = parsed.data;
  const school = await db.school.findUnique({ where: { id: schoolId } });
  if (!school) return NextResponse.json({ error: "Skolen ble ikke funnet." }, { status: 404 });

  const data =
    action === "APPROVE" ? { status: "APPROVED", verified: true } :
    action === "REJECT" ? { status: "REJECTED", verified: false } :
    action === "VERIFY" ? { verified: true } :
    { status: "PENDING", verified: false };

  await db.school.update({ where: { id: schoolId }, data });
  await db.notification.create({
    data: {
      userId: school.ownerId,
      email: school.email,
      channel: "EMAIL",
      subject: action === "APPROVE" ? "Din danseskole er godkjent på Taktfast! 🎉" : action === "REJECT" ? "Søknad avslått" : "Oppdatering på din skoleprofil",
      body: action === "APPROVE" ? `${school.name} er nå godkjent og synlig for alle dansere. Lykke til!` : action === "REJECT" ? `Vi kunne dessverre ikke godkjenne ${school.name} for øyeblikket. Kontakt oss for detaljer.` : `Profilen til ${school.name} er oppdatert.`,
    },
  });
  return NextResponse.json({ ok: true, status: data.status ?? school.status });
}
