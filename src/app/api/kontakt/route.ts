import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { rateLimit, clientKey } from "@/lib/rate-limit";

const schema = z.object({
  schoolId: z.string(),
  type: z.enum(["SPORSMAL", "BRYLLUP"]),
  name: z.string().min(2, "Skriv inn navnet ditt"),
  email: z.string().email("Ugyldig e-postadresse"),
  phone: z.string().max(20).optional().or(z.literal("")),
  weddingDate: z.string().optional().or(z.literal("")),
  participants: z.number().int().min(1).max(20).optional(),
  message: z.string().min(5, "Skriv en melding").max(1500),
});

/** Kontakt skole / bryllupsdans-forespørsel (mock e-post til skole) */
export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "kontakt"), 8, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "For mange meldinger — vent litt og prøv igjen." }, { status: 429 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Ugyldige data" }, { status: 400 });
  const data = parsed.data;

  const school = await db.school.findUnique({ where: { id: data.schoolId } });
  if (!school) return NextResponse.json({ error: "Skolen ble ikke funnet." }, { status: 404 });

  const user = await getSessionUser();

  if (data.type === "BRYLLUP") {
    const req2 = await db.privateRequest.create({
      data: {
        schoolId: school.id,
        userId: user?.id ?? null,
        contactName: data.name,
        email: data.email,
        phone: data.phone || null,
        weddingDate: data.weddingDate ? new Date(data.weddingDate) : null,
        participants: data.participants ?? 2,
        preferredTimes: null,
        message: data.message,
        status: "NEW",
      },
    });
    await db.notification.create({
      data: { userId: school.ownerId, email: school.email, channel: "EMAIL", subject: "Ny bryllupsdans-forespørsel", body: `${data.name} (bryllup ${data.weddingDate ?? "dato kommer"}) har sendt forespørsel om bryllupsdans. Besvar via skolepanelet.` },
    });
    return NextResponse.json({ ok: true, id: req2.id, message: "Takk! Skolen svarer deg normalt innen 24 timer med tidsforslag ut fra bryllupsdatoen deres." });
  }

  await db.message.create({
    data: {
      schoolId: school.id,
      userId: user?.id ?? null,
      fromRole: "DANSER",
      senderName: data.name,
      subject: "Melding via Taktfast",
      body: data.message,
    },
  });
  await db.notification.create({
    data: { userId: school.ownerId, email: school.email, channel: "EMAIL", subject: "Ny melding fra danser", body: `${data.name}: ${data.message.slice(0, 120)}` },
  });
  return NextResponse.json({ ok: true, message: "Meldingen er sendt! Skolen svarer normalt innen 1–2 dager." });
}
