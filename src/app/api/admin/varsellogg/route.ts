import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole, isResponse } from "@/lib/session";

/** Varsellogg (mock e-post/SMS) */
export async function GET(req: NextRequest) {
  const user = await requireRole(["ADMIN"]);
  if (isResponse(user)) return user;
  const take = Math.min(200, Number(req.nextUrl.searchParams.get("antall") ?? 60));
  const notifications = await db.notification.findMany({ orderBy: { createdAt: "desc" }, take });
  return NextResponse.json({ notifications });
}
