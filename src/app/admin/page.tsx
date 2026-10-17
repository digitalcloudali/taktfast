import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { getSessionUser } from "@/lib/session";
import { AdminApp } from "@/components/admin/admin-app";

export const metadata = {
  title: "Administrasjon",
  description: "Adminpanelet til Taktfast — skoler, brukere, kuponger, anmeldelser og varsellogg.",
};

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/logg-inn?callbackUrl=/admin");

  if (user.role !== "ADMIN") {
    return (
      <section className="flex flex-1 items-center justify-center bg-sky-pale px-4 py-16">
        <div className="w-full max-w-md rounded-md border border-[#CCD2DE] bg-white p-8 text-center shadow-sm" role="alert">
          <ShieldAlert className="mx-auto mb-4 size-10 text-[#a13a2c]" aria-hidden="true" />
          <h1 className="text-xl font-bold text-navy">Bare for administratorer</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#4a5468]">
            Kontoen din ({user.email}) har ikke tilgang til administrasjonspanelet. Logg inn med en
            administratorkonto, eller kontakt oss på <span className="font-semibold">post@taktfast.no</span> hvis du
            mener dette er en feil.
          </p>
        </div>
      </section>
    );
  }

  return <AdminApp userName={user.name} />;
}
