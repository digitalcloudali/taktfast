"use client";

// Taktfast — QR-kort for innsjekk (qrcode.react). Skolen scanner koden = bekreftelseskoden.

import { QRCodeSVG } from "qrcode.react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QrCard({ kode, disabled = false }: { kode: string; disabled?: boolean }) {
  return (
    <section
      aria-label="Innsjekkings-QR"
      className="rounded-md border border-[#CCD2DE] bg-white p-5 text-center sm:p-6"
    >
      <p className="font-display font-bold text-navy">Innsjekkings-QR</p>

      {disabled ? (
        <p className="py-8 text-sm text-tf-muted">
          QR-koden er deaktivert fordi bestillingen er avbestilt.
        </p>
      ) : (
        <>
          <div
            className="mx-auto mt-4 w-fit rounded-md border border-[#CCD2DE] bg-white p-3"
            role="img"
            aria-label={`QR-kode for bekreftelseskode ${kode}`}
          >
            <QRCodeSVG value={kode} size={180} fgColor="#00205B" />
          </div>
          <p className="mt-3 text-sm text-tf-muted">
            Vis denne koden ved innsjekk — skolen scanner den
          </p>
        </>
      )}

      <Button variant="outline" className="mt-4 w-full" onClick={() => window.print()}>
        <Printer className="h-4 w-4" aria-hidden="true" />
        Skriv ut bekreftelsen
      </Button>
    </section>
  );
}
