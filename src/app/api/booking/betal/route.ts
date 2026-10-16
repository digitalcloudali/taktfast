import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, isResponse } from "@/lib/session";
import { rateLimit, clientKey } from "@/lib/rate-limit";

const schema = z.object({
  code: z.string().min(4),
  method: z.enum(["VIPPS", "KORT"]).default("VIPPS"),
  fail: z.boolean().optional(), // demo: simuler feilet betaling
});

/** Mock Vipps/kort-betaling — markerer bookinger som betalt */
export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (isResponse(user)) return user;
  const rl = rateLimit(clientKey(req, `pay:${user.id}`), 20, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "For mange forsøk — vent litt." }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ugyldige data" }, { status: 400 });
  const { code, method, fail } = parsed.data;

  const bookings = await db.booking.findMany({ where: { code, userId: user.id } });
  if (bookings.length === 0) return NextResponse.json({ error: "Bestillingen ble ikke funnet." }, { status: 404 });
  if (bookings[0].paymentStatus === "PAID") return NextResponse.json({ error: "Denne bestillingen er allerede betalt." }, { status: 409 });

  const amount = bookings.reduce((s, b) => s + b.amount, 0);

  if (fail) {
    await db.payment.create({ data: { bookingCode: code, method, amount, status: "FAILED", reference: `fail-${Date.now()}` } });
    return NextResponse.json({ error: "Betalingen feilet (demo). Prøv igjen." }, { status: 402 });
  }

  await db.$transaction([
    db.booking.updateMany({ where: { code, userId: user.id }, data: { paymentStatus: "PAID", status: "CONFIRMED" } }),
    db.payment.create({ data: { bookingCode: code, method, amount, status: "PAID", reference: `${method.toLowerCase()}-${Date.now()}` } }),
    db.notification.create({
      data: {
        userId: user.id,
        email: user.email,
        channel: "EMAIL",
        subject: `Bekreftelse ${code}: ${bookings[0].kind === "KVELD" ? "dansekveld" : "dansetilmelding"}`,
        body: `Hei ${user.name}! Betalingen på ${amount} kr er gjennomført (${method === "VIPPS" ? "Vipps" : "kort"}). Se QR-koden din på bekreftelsessiden. Gratis avbestilling inntil 48 t før start.`,
      },
    }),
  ]);

  return NextResponse.json({ ok: true, code, amount });
}
