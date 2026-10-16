import Image from "next/image";

/** Bybilder ligger som /images/by-[slug].png med to unntak i filnavn */
const CITY_IMG_OVERRIDE: Record<string, string> = {
  tonsberg: "/images/by-tonsvberg.png",
  berum: "/images/by-berum.png",
};

export const cityImageSrc = (slug: string) => CITY_IMG_OVERRIDE[slug] ?? `/images/by-${slug}.png`;

/** Bybanner/-flis-bilde med next/image fill – bruk innenfor en relativ container */
export function CityImage({
  slug,
  name,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw",
  className,
}: {
  slug: string;
  name: string;
  sizes?: string;
  className?: string;
}) {
  return (
    <Image
      src={cityImageSrc(slug)}
      alt={`${name} – bybilde`}
      fill
      sizes={sizes}
      className={className ?? "object-cover"}
    />
  );
}
