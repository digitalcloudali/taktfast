import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { SkolepanelApp } from "@/components/skolepanel/skolepanel-app";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Skolepanel",
  description: "Administrer timer, kurs, ventelister og kommunikasjon for din danseskole.",
};

export default async function SkolepanelPage() {
  const user = await getSessionUser();
  if (!user) redirect("/logg-inn?callbackUrl=/skolepanel");

  if (user.role !== "SKOLE" && user.role !== "ADMIN") {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="rounded-md border border-[#CCD2DE] bg-sky-pale p-8 text-center">
          <h1 className="font-display text-2xl font-extrabold text-navy">
            Dette panelet er for danseskoler
          </h1>
          <p className="mt-2 text-sm text-[#374151]">
            Kontoen din (<span className="font-semibold">{user.email}</span>) har ikke tilgang til
            skolepanelet. Som danser finner du kursene og bookingene dine på Min side.
          </p>
          <Button asChild className="mt-6">
            <Link href="/">Til forsiden</Link>
          </Button>
        </div>
      </div>
    );
  }

  const school =
    user.role === "SKOLE"
      ? await db.school.findFirst({ where: { ownerId: user.id }, select: { name: true } })
      : null;

  return <SkolepanelApp schoolName={school?.name ?? "Alle skoler (admin)"} userName={user.name} />;
}
