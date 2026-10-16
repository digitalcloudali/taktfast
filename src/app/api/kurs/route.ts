import { NextRequest, NextResponse } from "next/server";
import { searchCourses } from "@/lib/data";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const f = {
    q: sp.get("q") ?? undefined,
    style: sp.get("stil") ?? undefined,
    family: sp.get("familie") ?? undefined,
    city: sp.get("by") ?? undefined,
    day: sp.get("dag") ? Number(sp.get("dag")) : undefined,
    timeOfDay: (sp.get("tid") as "dag" | "kveld") ?? undefined,
    level: sp.get("niva") ?? undefined,
    age: sp.get("alder") ?? undefined,
    komAlene: sp.get("komAlene") === "1",
    role: sp.get("rolle") ?? undefined,
    format: sp.get("format") ?? undefined,
    maxPrice: sp.get("maksPris") ? Number(sp.get("maksPris")) : undefined,
    student: sp.get("student") === "1",
    minRating: sp.get("minRating") ? Number(sp.get("minRating")) : undefined,
    ledig: sp.get("ledig") === "1",
    page: sp.get("side") ? Number(sp.get("side")) : 1,
    pageSize: sp.get("antall") ? Number(sp.get("antall")) : 12,
  };
  const res = await searchCourses(f);
  return NextResponse.json(res);
}
