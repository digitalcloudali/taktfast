import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Registrer deg",
  description:
    "Opprett gratis konto hos Taktfast – Norges markedsplass for dansekurs. Book kurs hos verifiserte danseskoler i hele landet.",
  alternates: { canonical: "/registrer" },
};

export default function RegistrerPage() {
  return (
    <div className="flex flex-col">
      {/* ---------- Hero ---------- */}
      <section className="bg-sky-pale" aria-labelledby="registrer-h1">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
          <h1 id="registrer-h1">Registrer deg</h1>
          <p className="mt-3 max-w-2xl text-[17px] text-tf-body">
            Opprett en konto og book ditt første dansekurs på minutter.
          </p>
        </div>
      </section>

      {/* ---------- Registreringsskjema ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <RegisterForm />
      </section>
    </div>
  );
}
