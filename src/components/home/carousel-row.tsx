"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Horisontal karusellrad med runde pilknapper (43px) – barna scroller med snap */
export function CarouselRow({
  children,
  label,
  className,
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function scroll(dir: -1 | 1) {
    ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  }

  const arrowCls =
    "absolute top-1/2 z-20 hidden h-[43px] w-[43px] -translate-y-1/2 items-center justify-center rounded-full border border-[#CCD2DE] bg-white text-navy shadow-sm transition-colors hover:bg-sky-pale md:flex";

  return (
    <div className={className}>
      <div ref={ref} className="snap-row -mx-4 px-4" role="group" aria-label={label}>
        {children}
      </div>
      <button
        type="button"
        onClick={() => scroll(-1)}
        aria-label="Bla bakover"
        className={`${arrowCls} -left-2`}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => scroll(1)}
        aria-label="Bla videre"
        className={`${arrowCls} -right-2`}
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}
