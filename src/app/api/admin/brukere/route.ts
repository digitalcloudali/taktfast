import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole, isResponse } from "@/lib/session";

/** Brukerliste med roller og antall bookinger */
export async function GET(req: NextRequest) {
  const user = await requireRole(["ADMIN"]);
  if (isResponse(user)) return user;
  const q = req.nextUrl.searchParams.get("q")?.toLowerCase() ?? "";
  const users = await db.user.findMany({
    where: q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }] } : {},
    include: { _count: { select: { bookings: true, profiles: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({
    users: users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, bookings: u._count.bookings, profiles: u._count.profiles, createdAt: u.createdAt })),
  });
}
