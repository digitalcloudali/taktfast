"use client";

import { SessionProvider } from "next-auth/react";

/** Klient-wrapper rundt SessionProvider — nødvendig fordi next-auth/react v4
 *  mangler "use client"-direktiv og kaster ellers «React Context is unavailable
 *  in Server Components» når den importeres direkte i en serverkomponent (layout). */
export function SessionProviders({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
