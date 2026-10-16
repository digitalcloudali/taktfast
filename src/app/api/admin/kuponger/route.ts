import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, isResponse } from "@/lib/session";

export async function GET() {
  const user = await requireRole(["ADMIN"]);
  if (isResponse(user)) return user;
  const [coupons, gifts] = await Promise.all([db.coupon.findMany({ orderBy: { code: "asc" } }), db.giftCard.findMany({ orderBy: { code: "asc" } })]);
  return NextResponse.json({ coupons, gifts });
}

const createSchema = z.object({
  code: z.string().min(3).max(20),
  percentOff: z.number().int().min(0).max(100).default(0),
  amountOff: z.number().int().min(0).max(5000).default(0),
  description: z.string().max(200).default(""),
});

export async function POST(req: NextRequest) {
  const user = await requireRole(["ADMIN"]);
  if (isResponse(user)) return user;
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ugyldige data" }, { status: 400 });
  const { code, percentOff, amountOff, description } = parsed.data;
  try {
    const coupon = await db.coupon.create({ data: { code: code.toUpperCase(), percentOff, amountOff, description, active: true } });
    return NextResponse.json({ ok: true, coupon });
  } catch {
    return NextResponse.json({ error: "Koden finnes allerede." }, { status: 409 });
  }
}

const patchSchema = z.object({ code: z.string(), active: z.boolean().optional() });

export async function PATCH(req: NextRequest) {
  const user = await requireRole(["ADMIN"]);
  if (isResponse(user)) return user;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ugyldige data" }, { status: 400 });
  await db.coupon.update({ where: { code: parsed.data.code }, data: { active: parsed.data.active } });
  return NextResponse.json({ ok: true });
}
