import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Logg inn",
  description:
    "Logg inn på Taktfast for å se dine kurs, bookinger, ventelister og favoritter. Bruk e-post og passordet ditt.",
  alternates: { canonical: "/logg-inn" },
};

function safeCallbackUrl(raw: string | string[] | undefined): string | undefined {
  const value = Array.isArray(raw) ? raw[0] : raw;
  // Kun relative stier – hindrer åpen redirect
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return undefined;
}

export default async function LoggInnPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const callbackUrl = safeCallbackUrl(sp.callbackUrl);

  return (
    <div className="flex flex-col">
      {/* ---------- Hero ---------- */}
      <section className="bg-sky-pale" aria-labelledby="logg-inn-h1">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
          <h1 id="logg-inn-h1">Logg inn</h1>
          <p className="mt-3 max-w-2xl text-[17px] text-tf-body">
            Velkommen tilbake – klare for neste steg?
          </p>
        </div>
      </section>

      {/* ---------- Innloggingsskjema ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        <LoginForm callbackUrl={callbackUrl} />
      </section>
    </div>
  );
}
