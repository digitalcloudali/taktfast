import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, clientKey } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(2, "Skriv inn navnet ditt").max(120),
  email: z.string().email("Ugyldig e-postadresse"),
  city: z.string().min(2, "Skriv inn by/sted").max(80),
  styles: z.string().min(2, "Skriv hvilke stiler dere underviser i").max(200),
  phone: z.string().max(20).optional().or(z.literal("")),
  message: z.string().min(5, "Skriv en kort melding").max(1500),
});

/** Partnersøknad fra danseskoler — varsler Taktfast-teamet (demo) */
export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "partner"), 5, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "For mange forsøk — vent et minutt og prøv igjen." }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Ugyldige data" }, { status: 400 });
  }
  const { name, email, city, styles, message } = parsed.data;

  await db.notification.create({
    data: {
      email: "post@taktfast.no",
      channel: "EMAIL",
      subject: "Ny partnersøknad",
      body: `${name} (${email}, ${city}) ønsker å bli partner. Stiler: ${styles}. Melding: ${message}`,
    },
  });

  return NextResponse.json({ ok: true });
}
