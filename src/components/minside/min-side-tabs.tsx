"use client";

// Taktfast /min-side — faner (shadcn Tabs). Fanen oppdateres i URL-en (?tab=…) slik at
// hver fane kan lenkes direkte; innholdet er serverrenderte noder sendt inn som props.

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MIN_SIDE_TABS, type MinSideTabValue } from "@/components/minside/chips";

export function MinSideTabs({
  defaultTab,
  antallVenteliste,
  slots,
}: {
  defaultTab: MinSideTabValue;
  antallVenteliste: number;
  slots: Record<MinSideTabValue, ReactNode>;
}) {
  const router = useRouter();

  return (
    <Tabs
      defaultValue={defaultTab}
      onValueChange={(v) =>
        router.replace(v === "mine-kurs" ? "/min-side" : `/min-side?tab=${v}`, { scroll: false })
      }
    >
      <TabsList
        className="nice-scroll h-auto! w-full! flex-wrap justify-start gap-1 rounded-md bg-tf-surface p-1 sm:flex-nowrap sm:overflow-x-auto"
        aria-label="Min side-faner"
      >
        {MIN_SIDE_TABS.map((t) => (
          <TabsTrigger
            key={t.value}
            value={t.value}
            className="min-h-11 gap-1.5 whitespace-nowrap px-3.5 py-2 text-[15px] font-semibold data-[state=active]:bg-white data-[state=active]:text-navy data-[state=active]:shadow-sm"
          >
            {t.label}
            {t.value === "venteliste" && antallVenteliste > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-navy px-1 text-[11px] font-bold text-white">
                {antallVenteliste}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      {(Object.keys(slots) as MinSideTabValue[]).map((key) => (
        <TabsContent key={key} value={key} className="mt-5">
          {slots[key]}
        </TabsContent>
      ))}
    </Tabs>
  );
}
