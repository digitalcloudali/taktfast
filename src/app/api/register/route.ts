import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { rateLimit, clientKey } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(2, "Skriv inn navnet ditt").max(80),
  email: z.string().email("Ugyldig e-postadresse"),
  password: z.string().min(8, "Passordet må være minst 8 tegn"),
  phone: z.string().max(20).optional().or(z.literal("")),
  terms: z.literal(true, { message: "Du må godta vilkårene" }),
});

export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "register"), 10, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "For mange forsøk — vent litt og prøv igjen." }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Ugyldige data" }, { status: 400 });
  }
  const { name, email, password, phone } = parsed.data;
  const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "Det finnes allerede en bruker med denne e-postadressen." }, { status: 409 });
  }
  const user = await db.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      phone: phone || null,
      role: "DANSER",
    },
  });
  // opprett standard deltakerprofil
  await db.deltakerProfile.create({ data: { userId: user.id, name, birthYear: 1990, isChild: false } });
  return NextResponse.json({ ok: true });
}
