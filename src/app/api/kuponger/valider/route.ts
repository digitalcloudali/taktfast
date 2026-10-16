import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, isResponse } from "@/lib/session";

/** Valider rabattkode / gavekort / klippekort før betaling */
export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (isResponse(user)) return user;
  const body = await req.json().catch(() => null);
  const { code, klippekortId } = (body ?? {}) as { code?: string; klippekortId?: string };

  if (klippekortId) {
    const kort = await db.klippekort.findUnique({ where: { id: klippekortId } });
    if (!kort || kort.userId !== user.id) return NextResponse.json({ error: "Klippekortet ble ikke funnet." }, { status: 404 });
    return NextResponse.json({ type: "KLIPPEKORT", clipsLeft: kort.clips - kort.used, label: `Klippekort (${kort.clips - kort.used} klipp igjen)` });
  }

  if (!code) return NextResponse.json({ error: "Skriv inn en kode." }, { status: 400 });
  const clean = code.toUpperCase().trim();

  const coupon = await db.coupon.findUnique({ where: { code: clean } });
  if (coupon && coupon.active && coupon.uses < coupon.maxUses) {
    return NextResponse.json({ type: "KUPONG", code: coupon.code, percentOff: coupon.percentOff, amountOff: coupon.amountOff, label: `${coupon.percentOff > 0 ? `${coupon.percentOff} % rabatt` : `${coupon.amountOff} kr rabatt`} (${coupon.code})` });
  }

  const gift = await db.giftCard.findUnique({ where: { code: clean } });
  if (gift && gift.active && gift.balance > 0) {
    return NextResponse.json({ type: "GAVEKORT", code: gift.code, balance: gift.balance, label: `Gavekort ${gift.code} — ${gift.balance} kr igjen` });
  }

  return NextResponse.json({ error: "Koden ble ikke funnet eller er brukt opp." }, { status: 404 });
}
