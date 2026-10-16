import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, clientKey } from "@/lib/rate-limit";

const schema = z.object({
  amount: z
    .number({ message: "Velg et beløp" })
    .int("Beløpet må være et rundt tall")
    .min(250, "Minimum beløp er 250,-")
    .max(5000, "Maksimum beløp er 5 000,-"),
  email: z.string().email("Ugyldig e-postadresse"),
  message: z.string().max(300).optional().or(z.literal("")),
});

/** Kjøp gavekort (demo) — oppretter gavekort med saldo og returnerer koden */
export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "gavekort"), 5, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "For mange forsøk — vent et minutt og prøv igjen." }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Ugyldige data" }, { status: 400 });
  }
  const { amount, email } = parsed.data;

  // sørg for unik kode (5 tegn, TF-XXXXX)
  let code = "";
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = "TF-" + Math.random().toString(36).slice(2, 7).toUpperCase().replace(/[^A-Z0-9]/g, "X");
    const exists = await db.giftCard.findUnique({ where: { code: candidate } });
    if (!exists) {
      code = candidate;
      break;
    }
  }
  if (!code) return NextResponse.json({ error: "Kunne ikke lage gavekort akkurat nå — prøv igjen." }, { status: 500 });

  await db.giftCard.create({
    data: {
      code,
      amount,
      balance: amount,
      buyerEmail: email.toLowerCase().trim(),
      active: true,
      expiresAt: new Date(Date.now() + 3 * 365 * 86400000),
    },
  });

  await db.notification.create({
    data: {
      email: email.toLowerCase().trim(),
      channel: "EMAIL",
      subject: `Ditt Taktfast-gavekort ${code}`,
      body: `Hei! Gavekortet ditt på ${amount} kr er klart. Koden er ${code} og brukes i steg 4 i bookingflyten på taktfast.no. Gavekortet er gyldig i 3 år.`,
    },
  });

  return NextResponse.json({ ok: true, code, amount });
}
