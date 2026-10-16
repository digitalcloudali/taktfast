// Taktfast — felles konstanter (deler mellom seed, API og UI)
// Merk: "enums" er strenger fordi Prisma+SQLite ikke støtter enums.

export const ROLES = ["DANSER", "SKOLE", "ADMIN"] as const;
export type UserRole = (typeof ROLES)[number];

export const LEVELS = [
  { value: "NYBEGYNNER", label: "Nybegynner" },
  { value: "LETT_VIDEREKOMMEN", label: "Lett viderekommen" },
  { value: "VIDEREKOMMEN", label: "Viderekommen" },
  { value: "AVANSERT", label: "Avansert" },
] as const;
export type Level = (typeof LEVELS)[number]["value"];
export const levelLabel = (l: string) => LEVELS.find((x) => x.value === l)?.label ?? l;

export const FORMATS = [
  { value: "KURSREKKE", label: "Kursrekke" },
  { value: "DROPIN", label: "Drop-in" },
  { value: "PRIVATTIME", label: "Privattime" },
  { value: "WORKSHOP", label: "Workshop" },
  { value: "PROVETIME", label: "Prøvetime" },
] as const;
export type Format = (typeof FORMATS)[number]["value"];
export const formatLabel = (f: string) => FORMATS.find((x) => x.value === f)?.label ?? f;

export const AGE_GROUPS = [
  { value: "ALDER_3_6", label: "3–6 år" },
  { value: "ALDER_7_12", label: "7–12 år" },
  { value: "ALDER_13_17", label: "13–17 år" },
  { value: "VOKSEN", label: "Voksen" },
  { value: "SENIOR", label: "60+" },
  { value: "ALLE", label: "Alle aldre" },
] as const;
export type AgeGroup = (typeof AGE_GROUPS)[number]["value"];
export const ageLabel = (a: string) => AGE_GROUPS.find((x) => x.value === a)?.label ?? a;

export const ROLES_SEAT = ["FORER", "FOLGER", "BEGGE", "INGEN"] as const;
export type SeatRole = (typeof ROLES_SEAT)[number];
export const seatRoleLabel = (r: string) =>
  r === "FORER" ? "Fører" : r === "FOLGER" ? "Følger" : r === "BEGGE" ? "Par" : "Ingen rolle";

// Dansefamilier med pastellfarge
export const FAMILIES = [
  { value: "PARDANS", label: "Pardans", tint: "var(--tint-peach)", tintHex: "#FFF2E5" },
  { value: "BRYLLUP", label: "Bryllupsdans", tint: "var(--tint-butter)", tintHex: "#FDF6D8" },
  { value: "BARNE_UNG", label: "Barn & ungdom", tint: "var(--tint-pink)", tintHex: "#FEEFF6" },
  { value: "HIPHOP_STREET", label: "Hiphop & street", tint: "var(--tint-sky)", tintHex: "#EEF5FC" },
  { value: "BALLETT_JAZZ", label: "Ballett & jazz", tint: "var(--tint-lilac)", tintHex: "#F1E6EF" },
  { value: "TRENING", label: "Danstrening", tint: "var(--tint-mint)", tintHex: "#EDF5D9" },
  { value: "LINEDANCE", label: "Linedance", tint: "var(--tint-aqua)", tintHex: "#D9F3F5" },
  { value: "SENIOR", label: "Seniordans", tint: "var(--tint-sand)", tintHex: "#F3EEE8" },
] as const;
export type Family = (typeof FAMILIES)[number]["value"];
export const familyLabel = (f: string) => FAMILIES.find((x) => x.value === f)?.label ?? f;
export const familyTint = (f: string) => FAMILIES.find((x) => x.value === f)?.tintHex ?? "#EEF5FC";

// 17 dansestiler (slug, navn, familie, kom alene, krever partner)
export const DANCE_STYLES: {
  slug: string; name: string; family: Family; komAlene: boolean; requiresPartner: boolean;
  short: string; long: string; image: string;
}[] = [
  {
    slug: "salsa", name: "Salsa", family: "PARDANS", komAlene: true, requiresPartner: true,
    short: "Karibisk energi, enkelt fotarbeid og masse vendinger.",
    long: "Salsa er den mest populære pardansen på dansegulvet. Du lærer grunnsteget, føring og følging, og enkle figurer som raskt blir dansbare på sosialdans. Musikken er varm og energisk, og stemningen på timene alltid høy — alle kan lære å danse salsa, med eller uten partner.",
    image: "/images/stil-salsa.png",
  },
  {
    slug: "bachata", name: "Bachata", family: "PARDANS", komAlene: true, requiresPartner: true,
    short: "Myk og romantisk dominikansk pardans — lett å komme i gang.",
    long: "Bachata fra Den dominikanske republikk er kanskje den enkleste pardansen å starte med: fire takter, myke hoftebevegelser og naturlig nærhet. Perfekt for nybegynnere, og sosialdansen er like hyggelig som timene.",
    image: "/images/stil-bachata.png",
  },
  {
    slug: "kizomba", name: "Kizomba", family: "PARDANS", komAlene: true, requiresPartner: true,
    short: "Langsom, angolansk pardans med flyt og nærhet.",
    long: "Kizomba danses tett og rolig til afro-portugisiske rytmer. Fokus er på flyt, balanse og kontakt — en deilig kontrast til tempoet i salsa og bachata.",
    image: "/images/stil-kizomba.png",
  },
  {
    slug: "lindy-hop", name: "Swing / Lindy hop", family: "PARDANS", komAlene: true, requiresPartner: true,
    short: "Gammeldagens glede: swingout, Charleston og jazz.",
    long: "Lindy hop er swungansen fra 1930-tallet — full av hoppende rytme, spill og improvisasjon. Det er en av de mest sosiale danseformene, med egne dansekvelder og vintage-stemning.",
    image: "/images/stil-lindyhop.png",
  },
  {
    slug: "west-coast-swing", name: "West coast swing", family: "PARDANS", komAlene: true, requiresPartner: true,
    short: "Moderne, glidende swing — danses til alt fra pop til blues.",
    long: "West coast swing danses i en slottbane og til nesten all moderne musikk. Det er teknisk, smidig og fullt av lek mellom fører og følger.",
    image: "/images/stil-wcs.png",
  },
  {
    slug: "tango", name: "Argentine tango", family: "PARDANS", komAlene: true, requiresPartner: true,
    short: "Dramatisk og elegant — danses i tett omfavnelse.",
    long: "Tango handler om kontakt, åndedrett og nærvær. Du lærer gangemønster, ochos og omfavnelser, og opplever en danseform som blir bedre og dypere med alder.",
    image: "/images/stil-tango.png",
  },
  {
    slug: "foxtrot-danse-vanlig", name: "Foxtrot / «danse vanlig»", family: "SENIOR", komAlene: true, requiresPartner: true,
    short: "Den klassiske selskapsdansen — perfekt til bryllup og fest.",
    long: "«Å danse vanlig» betyr i Norge foxtrot og gammeldans: trygg føring, rolig flyt og musikk alle kjenner. Dette er dansen du bruker på bryllup, julebord og danseborde hele livet.",
    image: "/images/stil-foxtrot.png",
  },
  {
    slug: "bryllupsdans", name: "Bryllupsdans", family: "BRYLLUP", komAlene: false, requiresPartner: true,
    short: "Deres første dans: brudevals eller koreografi til egen sang.",
    long: "Bryllupsdans-timer gjør den store dagen lettere. Dere velger sangen, og instruktøren lager en koreografi som passer deres nivå — fra enkel brudevals til fullt koreografert overraskelsesdans. Gruppekurs og privattimer, også for far–datter- og mor–sønn-dans.",
    image: "/images/stil-brudevals.png",
  },
  {
    slug: "barnedans", name: "Barnedans", family: "BARNE_UNG", komAlene: true, requiresPartner: false,
    short: "Lek, musikk og motorikk for de minste (3–9 år).",
    long: "Barnedans er lek med musikk: hopping, spinning, bounce og første ballett-steg. Timene bygger motorikk, rytme og sosial trygghet — og foreldre kan se på fra sidelinjen.",
    image: "/images/stil-barnedans.png",
  },
  {
    slug: "hiphop", name: "Hiphop / streetdance", family: "HIPHOP_STREET", komAlene: true, requiresPartner: false,
    short: "Bounce, grooves og fri stil for barn, ungdom og voksne.",
    long: "Streetdance er energi, identitet og attitude. Du lærer grooves, isolasjoner og koreografi til aktuell musikk — og får prøve freestyle i trygge omgivelser.",
    image: "/images/stil-hiphop.png",
  },
  {
    slug: "k-pop", name: "K-pop", family: "HIPHOP_STREET", komAlene: true, requiresPartner: false,
    short: "Lær koreografien fra favorittvideoene — i presis gruppe.",
    long: "K-pop-kurs lærer deg koreografien fra ekte K-pop-MV-er, steg for steg. Gøy, presist og sosialt — ofte med oppvisning til slutt i semesteret.",
    image: "/images/stil-kpop.png",
  },
  {
    slug: "ballett", name: "Ballett", family: "BALLETT_JAZZ", komAlene: true, requiresPartner: false,
    short: "Klassisk teknikk, heldning og grasiøsitet — 4 år til voksen.",
    long: "Ballett gir fundamentet for all dans: holdning, styrke og musicalitet. Vi har grupper fra barn til voksne, med vekt på glede og progresjon.",
    image: "/images/stil-ballett.png",
  },
  {
    slug: "jazz", name: "Jazzdans", family: "BALLETT_JAZZ", komAlene: true, requiresPartner: false,
    short: "Uttrykksfull, leken og teknisk — fra Broadway til dagens hits.",
    long: "Jazzdans kombinerer teknikk med showmanship: isolasjoner, piruetter og store bevegelser til musikk med drive.",
    image: "/images/stil-jazz.png",
  },
  {
    slug: "moderne", name: "Moderne / samtidsdans", family: "BALLETT_JAZZ", komAlene: true, requiresPartner: false,
    short: "Flyt, gulvarbeid og uttrykk i eget språk.",
    long: "Samtidsdans utforsker vekt, flyt og pust. Teknikk blandes med improvisasjon og egne bevegelsesvalg — en fin motvekt til teknikk-tunge stiler.",
    image: "/images/stil-moderne.png",
  },
  {
    slug: "linedance", name: "Linedance", family: "LINEDANCE", komAlene: true, requiresPartner: false,
    short: "Dans i rekker med cowboy-boots — ingen partner nødvendig.",
    long: "Linedance er sosial dans i rekker til country-musikk: ferdige stegsekvenser som læres steg for steg. Kom alene — det er hele poenget!",
    image: "/images/stil-linedance.png",
  },
  {
    slug: "zumba", name: "Zumba / danstrening", family: "TRENING", komAlene: true, requiresPartner: false,
    short: "Trening som føles som fest — svett og smil.",
    long: "Zumba og danstrening blander latin, afro og pop til en effektiv kardiotime. Ingen parring, ingen presisjon — bare energi, svette og latter.",
    image: "/images/stil-zumba.png",
  },
  {
    slug: "seniordans", name: "Seniordans", family: "SENIOR", komAlene: true, requiresPartner: false,
    short: "Rolig og sosial dans for 60+ — bevegelse og fellesskap.",
    long: "Seniordans holder kropp og hode i takt: gangemønster, balanse og gammeldans i rolig tempo, med kaffe og prat etterpå. Kom alene eller med vennen din.",
    image: "/images/stil-seniordans.png",
  },
];
export const styleName = (slug: string) => DANCE_STYLES.find((s) => s.slug === slug)?.name ?? slug;
export const styleFamily = (slug: string) => DANCE_STYLES.find((s) => s.slug === slug)?.family ?? "PARDANS";

export const CITIES: { slug: string; name: string; county: string; lat: number; lng: number; blurb: string }[] = [
  { slug: "oslo", name: "Oslo", county: "Oslo", lat: 59.9139, lng: 10.7522, blurb: "Norges dansehovedstad med et hav av skoler i alle bydeler — fra Grünerløkka til Majorstuen." },
  { slug: "bergen", name: "Bergen", county: "Vestland", lat: 60.3913, lng: 5.3221, blurb: "Regnfulle gater og tørre dansegulv — Bergens salsascene er blant landets beste." },
  { slug: "trondheim", name: "Trondheim", county: "Trøndelag", lat: 63.4305, lng: 10.3951, blurb: "Studentbyen med sterk swing- og folkedans-tradisjon." },
  { slug: "stavanger", name: "Stavanger", county: "Rogaland", lat: 58.9700, lng: 5.7331, blurb: "Swing, bachata og bryllupsdans i oljehovedstaden." },
  { slug: "kristiansand", name: "Kristiansand", county: "Agder", lat: 58.1467, lng: 7.9956, blurb: "Sørlandsk sommerstemning og trivelige dansekvelder." },
  { slug: "tromso", name: "Tromsø", county: "Troms", lat: 69.6492, lng: 18.9553, blurb: "Dansegleden holder varmen — tango og bachata under nordlyset." },
  { slug: "drammen", name: "Drammen", county: "Buskerud", lat: 59.7440, lng: 10.2045, blurb: "Kort til Oslo, egne skoler og en voksende sosialdans-scene." },
  { slug: "fredrikstad", name: "Fredrikstad", county: "Østfold", lat: 59.2181, lng: 10.9298, blurb: "Gamlebyen byr på swing i historiske lokaler." },
  { slug: "alesund", name: "Ålesund", county: "Møre og Romsdal", lat: 62.4722, lng: 6.1495, blurb: "Jugendbyen med aktivt danselag og gammeldans." },
  { slug: "bodo", name: "Bodø", county: "Nordland", lat: 67.2804, lng: 14.4049, blurb: "Ildsjel-danselag og studentkultur nord for polarvirvelen." },
  { slug: "hamar", name: "Hamar", county: "Innlandet", lat: 60.7962, lng: 11.0683, blurb: "Mjøsbyen med gammeldans og danse vanlig-tradisjon." },
  { slug: "lillehammer", name: "Lillehammer", county: "Innlandet", lat: 61.1153, lng: 10.4663, blurb: "OL-byen med rolig tempo og hyggelige kurs." },
  { slug: "tonsberg", name: "Tønsberg", county: "Vestfold", lat: 59.2675, lng: 10.4076, blurb: "Norges eldste by — og en ung danse-ungdomsscene." },
  { slug: "sandefjord", name: "Sandefjord", county: "Vestfold", lat: 59.1311, lng: 10.2214, blurb: "Havnebyen med brudevals-kurs hele året." },
  { slug: "lillestrom", name: "Lillestrøm", county: "Akershus", lat: 59.9500, lng: 11.0500, blurb: "Ti minutter fra Oslo med egne swing- og salsa-timer." },
  { slug: "sandnes", name: "Sandnes", county: "Rogaland", lat: 58.8544, lng: 5.7353, blurb: "Barnedans og hiphop for hele Stavanger-regionen." },
  { slug: "berum", name: "Bærum", county: "Akershus", lat: 59.8939, lng: 10.5244, blurb: "Sandvika og omegn har Oslo-fyllets tetteste ballett-tilbud." },
  { slug: "asker", name: "Asker", county: "Akershus", lat: 59.8339, lng: 10.4356, blurb: "Asker Danser!: folkedans, swing og barnetime i sentrum." },
  { slug: "mo-i-rana", name: "Mo i Rana", county: "Nordland", lat: 66.3151, lng: 14.1419, blurb: "Fjellbyen med aktivt danseutvalg og linedance." },
  { slug: "arendal", name: "Arendal", county: "Agder", lat: 58.4615, lng: 8.7687, blurb: "Sørlandets salsaperle ved havnen." },
];

export const cityBySlug = (slug: string) => CITIES.find((c) => c.slug === slug);

export const AMENITIES = ["Garderobe med dusj", "Parkering ved lokal", "Kafé/lobby", "Speilvegg", "Gulv til trening", "Buss/barnehage-nær", "Trinnfritt/invalidvennlig", "Sykkelparkering"] as const;

export const EXTRAS = [
  { id: "skoleie", name: "Leie av dansesko", price: 50, desc: "Nydelige latinskotilpasning i timen — vi har i alle størrelser." },
  { id: "video", name: "Video av koreografi", price: 150, desc: "Innspilt gjennomgang av timens figur, tilgjengelig i 30 dager." },
  { id: "privat-follow-up", name: "Oppfølgingstime (rabattert)", price: 700, desc: "Book en privat oppfølging med 30% rabatt." },
] as const;

export const COMMISSION_RATE = 0.1; // demo-provisjon i admin
export const PROVETIME_CREDIT = 100; // prøvetime 100,- som kreditt ved kurskjøp

export const NORWEGIAN_WEEKDAYS = ["", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag", "søndag"];
export const weekdayName = (n: number) => NORWEGIAN_WEEKDAYS[n] ?? String(n);

export const MONTHS_NB = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"];

export function formatNok(n: number): string {
  return `${n.toLocaleString("nb-NO")},-`;
}

export function formatDateNb(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${date.getDate()}. ${MONTHS_NB[date.getMonth()]}`;
}

export function formatDateTimeNb(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const time = date.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
  return `${formatDateNb(date)} kl. ${time}`;
}
