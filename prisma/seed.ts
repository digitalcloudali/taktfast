/**
 * Taktfast seed — realistisk norsk demodata (fiktive skoler, instruktører og personer)
 * Kjøres med: bun prisma/seed.ts
 */
import { PrismaClient } from "@prisma/client";
import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { DANCE_STYLES, CITIES, levelLabel } from "../src/lib/constants";

const db = new PrismaClient();

// ---------- deterministisk tilfeldighet ----------
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20261016);
const ri = (min: number, max: number) => Math.floor(rnd() * (max - min + 1)) + min;
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)];
const chance = (p: number) => rnd() < p;
const uuid = () => randomBytes(12).toString("hex") + Date.now().toString(36);
const bcode = () => "TF-" + Math.random().toString(36).slice(2, 7).toUpperCase();

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

// ---------- navnepooler ----------
const FEMALE = ["Kari", "Ingrid", "Sofie", "Martine", "Hedda", "Amalie", "Nora", "Selma", "Thea", "Maja", "Emma", "Olivia", "Sara", "Leah", "Hanna", "Ida", "Silje", "Cathrine", "Anette", "Lene", "Camilla", "Maria", "Julie", "Frida", "Mathilde", "Eline", "Victoria", "Rebecca", "Astrid", "Guro", "Synnøve", "Kaja", "Oda", "Tuva", "Vilde", "Anna", "Elise", "Live", "Randi", "Berit"];
const MALE = ["Ola", "Nordahl", "Emil", "Jonas", "Magnus", "Filip", "Sander", "Mathias", "Kristian", "Henrik", "Lars", "Anders", "Erik", "Nikolai", "Adrian", "Daniel", "Tobias", "Aleksander", "Marius", "Oliver", "William", "Lucas", "Isak", "Johannes", "Elias", "Even", "Halvor", "Øystein", "Bjørn", "Espen", "Tor", "Steinar", "Kjetil", "Frode", "Petter", "Andreas", "Vetle", "Håvard", "Terje", "Geir"];
const SURNAMES = ["Hansen", "Johansen", "Olsen", "Larsen", "Andersen", "Pedersen", "Nilsen", "Kristiansen", "Jensen", "Karlsen", "Johnsen", "Pettersen", "Eriksen", "Berg", "Haugen", "Hagen", "Johannessen", "Andreassen", "Jacobsen", "Dahl", "Jørgensen", "Halvorsen", "Henriksen", "Lund", "Sørensen", "Moen", "Gundersen", "Iversen", "Aas", "Bakken", "Solberg", "Lie", "Fredriksen", "Paulsen", "Borge", "Kristoffersen", "Lien", "Nesheim", "Fjeld", "Vold", "Rygg", "Sandvik", "Holm", "Tanum", "Kleppe", "Storli", "Nygaard", "Wold", "Myhre", "Hauge"];
const BARNENAVN = ["Emil", "Olivia", "Noah", "Ella", "Liam", "Sofia", "Oliver", "Nora", "Jakob", "Inga", "Henrik", "Alma", "Magnus", "Selma", "Theodor", "Hedda", "Aksel", "Maja", "Johannes", "Vilde", "Oskar", "Tiril", "Eirik", "Live", "Frida", "Storm", "Vega", "Jenny"];

// skolenavn
const SCHOOL_BASE = ["Takt & Tone Dans", "Rytmefabrikken", "Danseloftet", "Gledesdans Studio", "Taktlossen", "Fotfest Dansestudio", "Rytmehuset", "Salsakompaniet", "Dans & Co", "Gulvhøyde Dans", "Steg for Steg Dans", "Dansetuppen", "Beat Dans & Bevegelse", "Tresko Dans", "Brygga Dansecenter", "Pirum Dansesenter", "Kinetik Dans", "Tempo Dans Studio", "Muskedans", "Vingeskudd Danseverk", "Smil & Sving", "Parlokk Dans", "Dansebølgen", "Hjerteslag Dans", "Rytmeboxen", "Glansdans Studio", "Spinn Danseverk", "NorDan Studio", "Lykkehjul Dans", "Solstraale Dansestudio", "Nordavind Dans", "FjellroDans", "Dansekroken", "Puls & Pause", "Basen Dans", "Fender Danseloft", "Skyvs Studio", "Kastanje Dans", "Danseteltet", "Taket Dans", "Rytmisk Senter", "Lokomotiv Dans", "Svai Studio", "Blanke Ark Dans", "Mosaik Dans"];

// Oslo bydeler m.m.
const DISTRICTS: Record<string, string[]> = {
  oslo: ["Grünerløkka", "Majorstuen", "Frogner", "Torshov", "Nydalen", "Bjørvika", "Sagene", "Gamle Oslo"],
  berum: ["Sandvika", "Lysaker", "Fornebu", "Bekkestua"],
  bergen: ["Bryggen", "Fana", "Årstad", "Ytrebygda", "Nesttun"],
  trondheim: ["Midtbyen", "Bakklandet", "Moholt", "Sluppen"],
};

const REVIEW_TEXTS = [
  "Fantastisk lærer som får alle til å våge. Kom alene og ble tatt imot med åpne armer!",
  "God stemning, tydelig instruksjon og masse latter. Anbefales til alle som vil begynne med dans.",
  "Har gått flere kurs her — progresjonen kommer fort og miljøet er inkluderende.",
  "Ble imponert over hvordan instruktøren fikk oss nervøse brudepar til å le av oss selv og danse med stil.",
  "Flotte lokaler med god garderobe. Timene er godt planlagt og gøy fra første minutt.",
  "Datteren min elsker timene! Trygt miljø og dyktige, tålmodige instruktører.",
  "Perfekt tempo for nybegynnere. Følte meg danseduglig etter tre timer.",
  "Superfin introduksjon til salsa. Kommer garantert tilbake til neste kursrekke!",
  "Ingen mas om prestasjon — her danses for gleden. Sosialdansen etterpå er et plusstegn.",
  "God balanse mellom teknikk og moro. Fikk bruke figurene direkte på dansekvelden.",
  "Bra oppfølging, små grupper og hyggelige meddansende. Verdt hver krone.",
  "Vi tok privattimer før bryllupet — koreografien ble tilpasset oss og valsen satt som støpt!",
  "Litt høyt tempo for helt ferske, men instruktøren tok oss inn på venteliste-nivå med ekstra gjennomgang.",
  "Nydelig lokale med speilvegg og god parkering. Prisene er transparente — akkurat som loves.",
  "Klippetkortet er fininvest! Drop-in på tirsdager redder hverdagen min.",
  "K-pop-gruppa har blitt datterens favoritttime i uka. Oppvisningen til slutt var stas!",
  "Barnas første ballettsemester var en ren glede. Foresatt-samtykke og alt ordnet seg enkelt via appen.",
  "Tango-timene er nesten meditasjon. Riktig sted for de som vil dypere inn i pardansen.",
  "Godt med drop-in-muligheter, og det er enkelt å se ledige plasser per rolle.",
  "Seniordansen har gitt både bevegelse og nye venner. Kaffen etterpå er like viktig!",
  "Dyktig instruktør som forklarer føring så alle forstår. Balansen mellom førere og følgere holdt seg jevn hele kurset.",
  "Zumba her er treningsglede på høyt nivå — svette, smil og gode basser.",
];

const NIGHT_TITLES = ["Sosialdans med nybegynnertime", "Salsa noche", "Bachata night", "Swing dinner & dance", "Fredagsdans for alle", "Tango practica", "Lørdagsdans", "Milongåsen", "Latinfest"];

const COURSE_TITLE_PATTERNS: Record<string, string[]> = {
  salsa: ["Salsa nybegynner", "Salsa viderekommen", "Salsa intensiv helg", "Salsa LA-stil"],
  bachata: ["Bachata nybegynner", "Bachata fortsetter", "Bachata sensual"],
  kizomba: ["Kizomba nybegynner", "Kizomba flow"],
  "lindy-hop": ["Lindy hop nybegynner", "Swing/lindy videre", "Charleston crashkurs"],
  "west-coast-swing": ["West coast swing nybegynner", "WCS improver"],
  tango: ["Tango nybegynner", "Tango milongero"],
  "foxtrot-danse-vanlig": ["Danse vanlig / foxtrot", "Gammeldans for alle", "Selskapsdans refresher"],
  bryllupsdans: ["Brudevals gruppekurs", "Bryllupsdans intensiv"],
  barnedans: ["Barnedans 3–5 år med foresatt", "Barnedans 5–7 år", "Barnedans 8–10 år"],
  hiphop: ["Hiphop barn 7–12 år", "Hiphop ungdom 13–17", "Streetdance voksen nybegynner"],
  "k-pop": ["K-pop dance teen", "K-pop voksen"],
  ballett: ["Ballett barn 4–6 år", "Ballett barn 7–10 år", "Ballett voksen nybegynner", "Barre-fitness"],
  jazz: ["Jazzdans voksen", "Jazz ungdom"],
  moderne: ["Moderne dans ungdom", "Samtidsdans voksen"],
  linedance: ["Linedance nybegynner", "Linedance improve"],
  zumba: ["Zumba drop-in", "Zumba gold", "Danstrening for alle"],
  seniordans: ["Seniordans 60+", "Seniordans & bevegelse"],
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/æ/g, "ae").replace(/ø/g, "o").replace(/å/g, "a")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const AMENITIES_POOL = ["Garderobe med dusj", "Parkering ved lokal", "Kafé/lobby", "Speilvegg", "Gulv til trening", "Buss/nær sentrum", "Trinnfritt", "Sykkelparkering"];

function dateAt(daysAhead: number, hour: number, min = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, min, 0, 0);
  return d;
}
const hhmm = (h: number, m = 0) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

async function main() {
  console.log("⏳ Rydder eksisterende data …");
  await db.klippekortUse.deleteMany();
  await db.klippekort.deleteMany();
  await db.notification.deleteMany();
  await db.message.deleteMany();
  await db.favorite.deleteMany();
  await db.waitlistEntry.deleteMany();
  await db.booking.deleteMany();
  await db.review.deleteMany();
  await db.privateRequest.deleteMany();
  await db.weddingPackage.deleteMany();
  await db.danceNight.deleteMany();
  await db.courseDate.deleteMany();
  await db.course.deleteMany();
  await db.instructor.deleteMany();
  await db.studio.deleteMany();
  await db.school.deleteMany();
  await db.deltakerProfile.deleteMany();
  await db.user.deleteMany();
  await db.coupon.deleteMany();
  await db.giftCard.deleteMany();
  await db.danceStyle.deleteMany();
  await db.city.deleteMany();
  await db.payment.deleteMany();

  console.log("🎨 Dansestiler og byer …");
  await db.danceStyle.createMany({
    data: DANCE_STYLES.map((s, i) => ({
      slug: s.slug, name: s.name, family: s.family,
      tint: { PARDANS: "#FFF2E5", BRYLLUP: "#FDF6D8", BARNE_UNG: "#FEEFF6", HIPHOP_STREET: "#EEF5FC", BALLETT_JAZZ: "#F1E6EF", TRENING: "#EDF5D9", LINEDANCE: "#D9F3F5", SENIOR: "#F3EEE8" }[s.family] ?? "#EEF5FC",
      image: s.image, description: s.short, longDescription: s.long,
      komAlene: s.komAlene, requiresPartner: s.requiresPartner, sortOrder: i,
    })),
  });
  await db.city.createMany({
    data: CITIES.map((c) => ({ slug: c.slug, name: c.name, county: c.county, lat: c.lat, lng: c.lng, image: `/images/by-${c.slug}.png`, blurb: c.blurb })),
  });

  // ---------- brukere ----------
  console.log("👥 Brukere …");
  const pwHash = hashPassword("demo1234");
  const demoDanser = { id: uuid(), email: "danser@taktfast.no", passwordHash: pwHash, name: "Kari Danselyst", phone: "900 55 512", role: "DANSER" };
  const demoSkole = { id: uuid(), email: "skole@taktfast.no", passwordHash: pwHash, name: "Ola Taktmann", phone: "900 55 513", role: "SKOLE" };
  const demoAdmin = { id: uuid(), email: "admin@taktfast.no", passwordHash: pwHash, name: "Ada Adminsen", phone: "900 55 514", role: "ADMIN" };
  await db.user.createMany({ data: [demoDanser, demoSkole, demoAdmin] });

  type NewUser = { id: string; email: string; passwordHash: string; name: string; phone?: string; role: string };
  const dancerUsers: NewUser[] = [];
  const usedEmails = new Set<string>(["danser@taktfast.no", "skole@taktfast.no", "admin@taktfast.no"]);
  for (let i = 0; i < 140; i++) {
    const first = chance(0.55) ? pick(FEMALE) : pick(MALE);
    const last = pick(SURNAMES);
    let email = `${slugify(first)}.${slugify(last)}${i}@example.no`;
    if (usedEmails.has(email)) email += "x";
    usedEmails.add(email);
    dancerUsers.push({ id: uuid(), email, passwordHash: pwHash, name: `${first} ${last}`, phone: `9${ri(10, 99)} ${ri(10, 99)} ${ri(10, 99)}`, role: "DANSER" });
  }
  await db.user.createMany({ data: dancerUsers });

  // deltakerprofiler (inkl. barn)
  type NewProfile = { id: string; userId: string; name: string; birthYear: number; isChild: boolean; consent: boolean };
  const profiles: NewProfile[] = [];
  const profilesByUser = new Map<string, NewProfile[]>();
  function addProfile(userId: string, name: string, birthYear: number, isChild: boolean) {
    const p: NewProfile = { id: uuid(), userId, name, birthYear, isChild, consent: isChild ? true : false };
    profiles.push(p);
    const arr = profilesByUser.get(userId) ?? [];
    arr.push(p);
    profilesByUser.set(userId, arr);
  }
  for (const u of [demoDanser as unknown as NewUser, ...dancerUsers]) {
    addProfile(u.id, u.name, ri(1960, 2005), false);
    const nKids = chance(0.45) ? (chance(0.4) ? 2 : 1) : 0;
    for (let k = 0; k < nKids; k++) {
      addProfile(u.id, `${pick(BARNENAVN)} ${u.name.split(" ").slice(-1)[0]}`, ri(2013, 2023), true);
    }
  }
  await db.deltakerProfile.createMany({ data: profiles });

  // ---------- skoler ----------
  console.log("🏫 Danseskoler …");
  const cityPlan: { slug: string; count: number }[] = [
    { slug: "oslo", count: 11 }, { slug: "bergen", count: 6 }, { slug: "trondheim", count: 4 },
    { slug: "stavanger", count: 3 }, { slug: "drammen", count: 3 }, { slug: "berum", count: 3 },
    { slug: "kristiansand", count: 2 }, { slug: "tromso", count: 2 }, { slug: "fredrikstad", count: 2 },
    { slug: "asker", count: 2 }, { slug: "lillestrom", count: 2 }, { slug: "sandnes", count: 2 },
    { slug: "bodo", count: 1 }, { slug: "hamar", count: 1 }, { slug: "lillehammer", count: 1 },
    { slug: "tonsberg", count: 2 }, { slug: "sandefjord", count: 1 }, { slug: "alesund", count: 1 },
    { slug: "mo-i-rana", count: 1 }, { slug: "arendal", count: 1 },
  ];
  // 52 skoler totalt

  type SchoolRec = {
    id: string; ownerId: string; name: string; slug: string; city: string; citySlug: string;
    district: string | null; lat: number; lng: number; styles: string[]; verified: boolean; status: string;
    ratingAvg: number; ratingCount: number;
  };
  const schools: SchoolRec[] = [];
  const baseNames = [...SCHOOL_BASE];
  let schoolIdx = 0;

  for (const plan of cityPlan) {
    const city = CITIES.find((c) => c.slug === plan.slug)!;
    for (let i = 0; i < plan.count; i++) {
      schoolIdx++;
      const base = baseNames[(schoolIdx * 7 + i * 3) % baseNames.length];
      let name = `${base} ${city.name}`;
      if (i === 0 && plan.slug !== "oslo") name = base;
      if (chance(0.35)) name = `${base}`;
      // unikt navn
      if (schools.some((s) => s.name === name)) name = `${name} ${city.name}`;
      const districtPool = DISTRICTS[plan.slug] ?? [null];
      const district = plan.slug === "oslo" || chance(0.4) ? pick(districtPool) ?? null : null;
      // Første skole i Oslo eies av demo-skolebrukeren
      const ownerId = plan.slug === "oslo" && i === 0 ? demoSkole.id : dancerUsers[(schoolIdx * 5) % dancerUsers.length].id;
      const styleCount = plan.slug === "oslo" ? ri(4, 6) : ri(2, 5);
      const styles: string[] = [];
      while (styles.length < styleCount) {
        const s = pick(DANCE_STYLES).slug;
        if (!styles.includes(s)) styles.push(s);
      }
      // sørg for at noen skoler har pardans-spesialisering
      if (i === 0) { styles[0] = "salsa"; }
      const verified = chance(0.88);
      const status = verified ? "APPROVED" : chance(0.6) ? "PENDING" : "APPROVED";
      schools.push({
        id: uuid(), ownerId, name, slug: `${slugify(name)}-${schoolIdx}`, city: city.name, citySlug: city.slug,
        district, lat: city.lat + (rnd() - 0.5) * 0.06, lng: city.lng + (rnd() - 0.5) * 0.06,
        styles, verified, status, ratingAvg: 0, ratingCount: 0,
      });
    }
  }

  const schoolRows = schools.map((s) => {
    const tagline = pick([
      "Dansegleden i hjertet av byen", "Fra første steg til sosialdans", "Dans for alle aldre og nivåer",
      "Vi finner partneren din — kom alene!", "Teknikk, glede og gode gulv", "Norges hyggeligste dansestudio",
    ]);
    return {
      id: s.id, ownerId: s.ownerId, name: s.name, slug: s.slug, tagline,
      description: `${s.name} tilbyr dansekurs i ${s.styles.slice(0, 3).join(", ")} og mer — for alle som vil lære å danse, alene eller med partner.`,
      about: `${s.name} ble startet av ildsjeler som ville gi byen et varmt og inkluderende dansemiljø. I dag underviser vi i ${s.styles.length} stiler med fokus på trygghet, progresjon og glede på gulvet. Vi mener alle kan lære å danse — uansett alder, kropp og erfaring. Kom alene eller med partner: i pardanskursene våre bytter vi partnere gjennom timen, og vi balanserer alltid førere og følgere.`,
      address: `${pick(["Dansegata", "Rytmeveien", "Taktgata", "Dansesvingen", "Parkveien", "Storgata", "Kirkegata", "Bergsjøveien"])} ${ri(2, 60)}`,
      postalCode: ri(1, 99) * 100 + ri(0, 99) < 1000 ? String(ri(155, 999) * 10) : String(ri(1550, 9990)),
      city: s.city, citySlug: s.citySlug, district: s.district,
      lat: s.lat, lng: s.lng,
      phone: `+47 ${ri(400, 999)} ${ri(10, 99)} ${ri(10, 99)}`,
      email: `post@${slugify(s.name)}.no`,
      website: `https://${slugify(s.name)}.no`,
      coverImage: `/images/${pick(["studio-interior", "studio-interior-2", "klasse-salsa", "klasse-bachata", "klasse-lindyhop"])}.png`,
      gallery: JSON.stringify(["/images/studio-interior.png", "/images/studio-interior-2.png", "/images/dansesko.png", "/images/socialdans.png"]),
      styles: JSON.stringify(s.styles),
      amenities: JSON.stringify([...AMENITIES_POOL].sort(() => rnd() - 0.5).slice(0, ri(4, 7))),
      verified: s.verified, status: s.status, commissionRate: 0.1,
    };
  });
  await db.school.createMany({ data: schoolRows });

  // studier og instruktører
  type StudioRec = { id: string; schoolId: string; name: string; description: string; floorType: string; dressingRooms: boolean; parking: boolean };
  const studios: StudioRec[] = [];
  type InstrRec = { id: string; schoolId: string; name: string; bio: string; styles: string; imageUrl: string; since: number };
  const instructors: InstrRec[] = [];
  for (const s of schools) {
    const nStudios = s.citySlug === "oslo" ? ri(2, 4) : ri(1, 3);
    for (let i = 0; i < nStudios; i++) {
      studios.push({
        id: uuid(), schoolId: s.id,
        name: `${pick(["Hovedsalen", "Studio A", "Studio B", "Speilsalen", "Lilla sal", "Parkettsalen", "Svingen"])}${i > 0 ? ` ${i + 1}` : ""}`,
        description: pick(["Lys sal med speilvegg, sprungulv og god plass til 20 par.", "Koselig mindre sal med varme i gulvet — perfekt til privattimer.", "Stor sal med barre, høyt tak og bedre lydanlegg."]),
        floorType: pick(["Sprungulv i eik", "Parkett", "Vinylgulv til trening"]),
        dressingRooms: chance(0.85), parking: chance(0.6),
      });
    }
    const nInstr = ri(2, 4);
    for (let i = 0; i < nInstr; i++) {
      const first = chance(0.5) ? pick(FEMALE) : pick(MALE);
      const nm = `${first} ${pick(SURNAMES)}`;
      const st = s.styles.slice(0, ri(1, Math.min(3, s.styles.length)));
      instructors.push({
        id: uuid(), schoolId: s.id, name: nm,
        bio: `${nm} har danset siden barndommen og underviser i ${st.join(" og ")}. ${pick(["Utdannet fra Bårdar Akademiet (demo).", "Tidligere konkurransedanser.", "Elsker å få nybegynnere til å våge.", "Certifisert sosialdans-instruktør (demo).", "Underviser med vekt på musikalitet og glede."])}`,
        styles: JSON.stringify(st),
        imageUrl: `/images/${pick(["for-skoler-instructor", "privaattime", "provetime", "oppvisning"])}.png`,
        since: ri(2008, 2023),
      });
    }
  }
  await db.studio.createMany({ data: studios });
  await db.instructor.createMany({ data: instructors });

  // ---------- kurs ----------
  console.log("📚 Kurs og timelister …");
  type CourseRec = {
    id: string; schoolId: string; studioId: string | null; instructorId: string | null;
    styleSlug: string; title: string; slug: string; level: string; format: string; ageGroup: string;
    capacity: number; unit: string; price: number; dropInPrice: number | null; studentPrice: number | null;
    seniorPrice: number | null; pricePer: string; weekday: number; startTime: string; startDate: Date;
    sessions: number; imageUrl: string; komAlene: boolean; seatsPlanned: number; // planlagt fyllgrad
    description: string; learnWhat: string; clothing: string; durationMin: number;
  };
  const courses: CourseRec[] = [];
  const usedSlugs = new Set<string>();
  let courseCounter = 0;

  for (const s of schools) {
    const schoolStudios = studios.filter((x) => x.schoolId === s.id);
    const schoolInstr = instructors.filter((x) => x.schoolId === s.id);
    const nCourses = s.citySlug === "oslo" ? ri(7, 9) : ri(5, 8);
    for (let i = 0; i < nCourses; i++) {
      courseCounter++;
      const style = s.styles[i % s.styles.length];
      const styleDef = DANCE_STYLES.find((x) => x.slug === style)!;
      const formatPool = styleDef.requiresPartner
        ? ["KURSREKKE", "KURSREKKE", "KURSREKKE", "DROPIN", "PROVETIME", "PRIVATTIME", "WORKSHOP"]
        : ["KURSREKKE", "KURSREKKE", "DROPIN", "DROPIN", "WORKSHOP", "PROVETIME"];
      const format = pick(formatPool);
      const isKid = ["barnedans", "hiphop", "k-pop", "ballett"].includes(style);
      const ageGroup = style === "barnedans" ? pick(["ALDER_3_6", "ALDER_7_12"]) : style === "seniordans" ? "SENIOR" : isKid ? (style === "hiphop" || style === "k-pop" ? pick(["ALDER_7_12", "ALDER_13_17"]) : pick(["ALDER_3_6", "ALDER_7_12"])) : style === "zumba" ? "ALLE" : "VOKSEN";
      const level = format === "DROPIN" ? pick(["NYBEGYNNER", "LETT_VIDEREKOMMEN"]) : pick(["NYBEGYNNER", "NYBEGYNNER", "NYBEGYNNER", "LETT_VIDEREKOMMEN", "VIDEREKOMMEN"]);

      let title = pick(COURSE_TITLE_PATTERNS[style] ?? [`${styleDef.name} ${levelLabel(level).toLowerCase()}`]);
      if (format === "PRIVATTIME") title = "Privattime (brudevals/tema)";
      if (format === "PROVETIME") title = `Prøvetime ${styleDef.name.toLowerCase()}`;
      if (format === "WORKSHOP") title = `${styleDef.name}-workshop`;

      const isPartner = styleDef.requiresPartner;
      const unit = isPartner ? "PAR" : "PERSON";
      const capacity = format === "PRIVATTIME" ? 2 : isPartner ? ri(10, 15) : ri(12, 24);

      let price = 0, studentPrice: number | null = null, seniorPrice: number | null = null, dropInPrice: number | null = null;
      let pricePer: string = "PERSON";
      let sessions = 6, weekday = ri(1, 7), startTime = pick(["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"]);

      if (format === "KURSREKKE") {
        if (isKid) { sessions = ri(10, 14); price = ri(14, 28) * 100; pricePer = "PERSON"; }
        else if (style === "bryllupsdans" || style === "foxtrot-danse-vanlig") { sessions = ri(4, 8); price = ri(70, 95) * 10; }
        else { sessions = pick([6, 6, 6, 8]); price = sessions === 6 ? ri(85, 110) * 10 : ri(110, 160) * 10; }
        studentPrice = chance(0.7) ? ri(52, 65) * 10 : null;
        seniorPrice = chance(0.35) ? ri(60, 75) * 10 : null;
        dropInPrice = isPartner || style === "zumba" ? ri(15, 22) * 10 : null;
      } else if (format === "DROPIN") {
        sessions = 1; price = ri(15, 22) * 10; studentPrice = ri(10, 14) * 10;
        seniorPrice = style === "seniordans" || style === "zumba" ? ri(10, 14) * 10 : null;
        dropInPrice = price;
      } else if (format === "PRIVATTIME") {
        sessions = 1; price = ri(95, 140) * 10; pricePer = "PAR";
      } else if (format === "PROVETIME") {
        sessions = 1; price = 100; studentPrice = 100; dropInPrice = null;
      } else if (format === "WORKSHOP") {
        sessions = 1; price = ri(30, 55) * 10; studentPrice = ri(20, 35) * 10;
      }

      const startDate =
        format === "PRIVATTIME" ? dateAt(ri(3, 45), ri(10, 20))
          : format === "DROPIN" ? dateAt(ri(1, 10), parseInt(startTime))
            : format === "PROVETIME" ? dateAt(ri(1, 25), ri(17, 19))
              : format === "WORKSHOP" ? dateAt(ri(2, 40), ri(12, 15))
                : dateAt(ri(2, 45), parseInt(startTime));

      const imgMap: Record<string, string> = {
        salsa: "klasse-salsa", bachata: "klasse-bachata", kizomba: "stil-kizomba", "lindy-hop": "klasse-lindyhop",
        "west-coast-swing": "stil-wcs", tango: "klasse-tango", "foxtrot-danse-vanlig": "stil-foxtrot",
        bryllupsdans: "privaattime", barnedans: "klasse-barn", hiphop: "klasse-hiphop", "k-pop": "stil-kpop",
        ballett: "stil-ballett", jazz: "stil-jazz", moderne: "stil-moderne", linedance: "stil-linedance",
        zumba: "klasse-zumba", seniordans: "klasse-senior",
      };
      const imageUrl = `/images/${imgMap[style] ?? "studio-interior"}.png`;

      let slug = `${style}-${slugify(s.name).slice(0, 30)}-${courseCounter}`;
      if (usedSlugs.has(slug)) slug += "b";
      usedSlugs.add(slug);

      const fillTarget = chance(0.12) ? 1.0 : chance(0.2) ? 0.9 : ri(30, 85) / 100;

      courses.push({
        id: uuid(), schoolId: s.id,
        studioId: schoolStudios.length ? pick(schoolStudios).id : null,
        instructorId: schoolInstr.length ? pick(schoolInstr).id : null,
        styleSlug: style, title, slug, level, format, ageGroup,
        description: `${title} hos ${s.name}. ${styleDef.short} Timene varer 75 minutter og passer ${levelLabel(level).toLowerCase()}${isPartner ? " — kom alene eller med partner, vi balanserer førere og følgere." : "."}`,
        learnWhat: pick(["Grunnsteg, føring/følging og 4–6 klassiske figurer du kan bruke med en gang.", "Teknikk, turneringer og musikkforståelse — steg for steg.", "Trygg føring, rytme og en ferdig mini-koreografi til slutt.", "Grunnholdning, balanse og lekre vendinger tilpasset gruppen."]),
        clothing: pick(["Komfortable klær og rene indendørssko.", "Treningsklær; dansesko eller sko med glatt såle anbefales.", "Bruk det du beveger deg godt i — vi hjelper med skovalg."]),
        capacity, unit, price, dropInPrice, studentPrice, seniorPrice,
        pricePer: format === "PRIVATTIME" ? "PAR" : unit === "PAR" && style !== "bryllupsdans" ? "PERSON" : unit === "PAR" ? "PAR" : "PERSON",
        weekday, startTime, startDate, sessions, imageUrl, durationMin: 75,
        komAlene: styleDef.komAlene && (isPartner ? chance(0.85) : true),
        seatsPlanned: fillTarget,
      });
    }
  }

  const courseRows = courses.map((c) => {
    const s = schools.find((x) => x.id === c.schoolId)!;
    return {
      id: c.id, schoolId: c.schoolId, studioId: c.studioId, instructorId: c.instructorId,
      styleSlug: c.styleSlug, title: c.title, slug: c.slug, level: c.level, format: c.format,
      ageGroup: c.ageGroup, description: c.description, learnWhat: c.learnWhat, clothing: c.clothing,
      capacity: c.capacity, unit: c.unit, price: c.price, dropInPrice: c.dropInPrice,
      studentPrice: c.studentPrice, seniorPrice: c.seniorPrice, pricePer: c.pricePer,
      durationMin: 75, weekday: c.weekday, startTime: c.startTime, startDate: c.startDate,
      sessions: c.sessions, imageUrl: c.imageUrl, komAlene: c.komAlene,
      status: "AKTIV",
    };
  });
  await db.course.createMany({ data: courseRows });

  // kursdatoer for neste 60 dager
  type DateRec = { id: string; courseId: string; date: Date; startTime: string; endTime: string };
  const courseDates: DateRec[] = [];
  const datesByCourse = new Map<string, DateRec[]>();
  for (const c of courses) {
    if (c.format === "PRIVATTIME") continue;
    const startH = parseInt(c.startTime);
    const endH = startH + (c.durationMin > 60 ? 2 : 1);
    const list: DateRec[] = [];
    const count = c.format === "KURSREKKE" ? c.sessions : c.format === "DROPIN" ? ri(7, 9) : 1;
    let first = new Date(c.startDate);
    if (c.format === "KURSREKKE") {
      // juster til riktig ukedag
      while (first.getDay() === 0 ? 7 !== c.weekday : first.getDay() !== c.weekday) {
        first = new Date(first.getTime() + 86400000);
        if (first.getTime() - Date.now() > 86400000 * 70) break;
      }
    }
    for (let i = 0; i < count; i++) {
      const d = new Date(first.getTime() + i * 7 * 86400000);
      if (d.getTime() > Date.now() + 61 * 86400000) break;
      const dr: DateRec = { id: uuid(), courseId: c.id, date: d, startTime: c.startTime, endTime: hhmm(endH, 0) };
      list.push(dr);
      courseDates.push(dr);
    }
    datesByCourse.set(c.id, list);
  }
  for (let i = 0; i < courseDates.length; i += 500) {
    await db.courseDate.createMany({ data: courseDates.slice(i, i + 500) });
  }

  // ---------- bookinger ----------
  console.log("🎟️  Bookinger …");
  type BookingRec = {
    id: string; code: string; userId: string; profileId: string; schoolId: string; courseId: string | null;
    dateId: string | null; nightId?: string | null; kind: string; role: string; seatLabel: string | null; amount: number;
    paymentMethod: string; paymentStatus: string; status: string; extras: string; createdAt: Date;
    checkedInAt: Date | null; klippekortId?: string;
  };
  const bookings: BookingRec[] = [];
  const payments: { id: string; bookingCode: string; method: string; amount: number; status: string; reference: string; createdAt: Date }[] = [];
  const seenCourseFill = new Map<string, { forere: number; folgere: number }>();
  const fullCourseIds: string[] = [];

  for (const c of courses) {
    const styleDef = DANCE_STYLES.find((x) => x.slug === c.styleSlug)!;
    const isPartner = styleDef.requiresPartner && c.format !== "PRIVATTIME";
    const seatCap = isPartner ? c.capacity * 2 : c.capacity;
    const targetSeats = Math.min(seatCap, Math.round(seatCap * c.seatsPlanned));
    const dates = datesByCourse.get(c.id) ?? [];
    const s = schools.find((x) => x.id === c.schoolId)!;

    let forere = 0, folgere = 0;

    if (c.format === "PROVETIME" || c.format === "WORKSHOP") {
      const n = Math.round(targetSeats * (c.format === "PROVETIME" ? 0.9 : 1));
      for (let i = 0; i < n; i++) {
        const u = pick(dancerUsers);
        bookings.push({
          id: uuid(), code: bcode(), userId: u.id, profileId: profilesByUser.get(u.id)![0].id,
          schoolId: c.schoolId, courseId: c.id, dateId: dates[0]?.id ?? null,
          kind: c.format === "PROVETIME" ? "PROVETIME" : "KURS", role: "INGEN", seatLabel: null,
          amount: c.price, paymentMethod: chance(0.7) ? "VIPPS" : "KORT", paymentStatus: "PAID",
          status: "CONFIRMED", extras: "[]", createdAt: dateAt(-ri(1, 30), 12), checkedInAt: null,
        });
      }
      seenCourseFill.set(c.id, { forere: n, folgere: 0 });
      continue;
    }

    if (c.format === "PRIVATTIME") {
      const nBook = chance(0.6) ? 1 : 0;
      for (let i = 0; i < nBook; i++) {
        const u = pick(dancerUsers);
        const wd = dateAt(ri(14, 120), 18);
        bookings.push({
          id: uuid(), code: bcode(), userId: u.id, profileId: profilesByUser.get(u.id)![0].id,
          schoolId: c.schoolId, courseId: c.id, dateId: null, kind: "PRIVATTIME", role: "BEGGE",
          seatLabel: "Par", amount: c.price, paymentMethod: chance(0.5) ? "VIPPS" : "KORT",
          paymentStatus: "PAID", status: "CONFIRMED", extras: JSON.stringify([{ name: "Brudesang", price: 0 }]),
          createdAt: dateAt(-ri(2, 40), 14), checkedInAt: null,
        });
      }
      continue;
    }

    // fyll kurs medDansere
    let seatIdx = 0;
    while (seatIdx < targetSeats) {
      const u = pick(dancerUsers);
      const profs = profilesByUser.get(u.id)!;
      const useKid = !isPartner && (c.ageGroup.startsWith("ALDER")) && profs.some((p) => p.isChild);
      const prof = useKid ? profs.find((p) => p.isChild)! : profs[0];
      // rolle
      let role = "INGEN";
      if (isPartner) {
        if (forere <= folgere) { role = "FORER"; forere++; } else { role = "FOLGER"; folgere++; }
      }
      // gruppering: par-bokinger deler kode
      const code = bcode();
      const amount = c.format === "DROPIN" ? c.price : c.pricePer === "PERSON" ? c.price : Math.round(c.price / 2);
      const created = dateAt(-ri(1, 170), ri(9, 21));
      const upcoming = dates.length > 0 && dates[dates.length - 1].date.getTime() > Date.now();
      const status = upcoming ? "CONFIRMED" : "COMPLETED";
      const kidConsent = prof.isChild ? { } : {};
      bookings.push({
        id: uuid(), code, userId: u.id, profileId: prof.id, schoolId: c.schoolId, courseId: c.id,
        dateId: c.format === "DROPIN" ? pick(dates)?.id ?? null : null,
        kind: c.format === "DROPIN" ? "DROPIN" : "KURS", role, seatLabel: isPartner ? (role === "FORER" ? `Fører ${forere}` : `Følger ${folgere}`) : null,
        amount, paymentMethod: chance(0.72) ? "VIPPS" : "KORT", paymentStatus: "PAID",
        status, extras: chance(0.2) ? JSON.stringify([{ name: "Leie av dansesko", price: 50 }]) : "[]",
        createdAt: created, checkedInAt: null, ...kidConsent,
      });
      payments.push({ id: uuid(), bookingCode: code, method: chance(0.72) ? "VIPPS" : "KORT", amount, status: "PAID", reference: `vipps-${ri(100000, 999999)}`, createdAt: created });
      seatIdx++;
      // 50% sjanse for å booke to seter (par) med samme kode
      if (isPartner && seatIdx < targetSeats && chance(0.5)) {
        const otherRole = role === "FORER" ? "FOLGER" : "FORER";
        if (otherRole === "FORER") forere++; else folgere++;
        const u2 = pick(dancerUsers);
        bookings.push({
          id: uuid(), code, userId: u2.id, profileId: profilesByUser.get(u2.id)![0].id, schoolId: c.schoolId,
          courseId: c.id, dateId: c.format === "DROPIN" ? pick(dates)?.id ?? null : null,
          kind: c.format === "DROPIN" ? "DROPIN" : "KURS", role: otherRole,
          seatLabel: isPartner ? (otherRole === "FORER" ? `Fører ${forere}` : `Følger ${folgere}`) : null,
          amount, paymentMethod: chance(0.72) ? "VIPPS" : "KORT", paymentStatus: "PAID",
          status, extras: "[]", createdAt: created, checkedInAt: null,
        });
        payments.push({ id: uuid(), bookingCode: code, method: chance(0.72) ? "VIPPS" : "KORT", amount, status: "PAID", reference: `vipps-${ri(100000, 999999)}`, createdAt: created });
        seatIdx++;
      }
    }
    seenCourseFill.set(c.id, { forere, folgere });
    if (targetSeats >= seatCap) fullCourseIds.push(c.id);
  }

  // dansekvelder
  console.log("🎶 Dansekvelder …");
  type NightRec = { id: string; schoolId: string; title: string; slug: string; date: Date; startTime: string; endTime: string; price: number; description: string; dresscode: string; freeBeginnerClass: boolean; styles: string; capacity: number; imageUrl: string; status: string; bookings: number };
  const nights: NightRec[] = [];
  const danceSchools = schools.filter((s) => s.styles.some((x) => ["salsa", "bachata", "kizomba", "lindy-hop", "tango", "west-coast-swing"].includes(x)));
  let nightCounter = 0;
  for (const s of danceSchools) {
    const n = ri(1, 3);
    for (let i = 0; i < n; i++) {
      nightCounter++;
      // helgedager fremover
      let d = dateAt(ri(2, 55), 19);
      while (d.getDay() !== 5 && d.getDay() !== 6) d = new Date(d.getTime() + 86400000);
      const styleList = s.styles.filter((x) => ["salsa", "bachata", "kizomba", "lindy-hop", "tango"].includes(x));
      const title = pick(NIGHT_TITLES);
      const past = chance(0.25);
      if (past) d = dateAt(-ri(5, 60), 19);
      nights.push({
        id: uuid(), schoolId: s.id, title: `${title} · ${s.name.split(" ")[0]}`,
        slug: `${slugify(title)}-${slugify(s.city)}-${nightCounter}`,
        date: d, startTime: "19:00", endTime: "23:00", price: ri(10, 18) * 10,
        description: `Sosialdans med ${styleList.slice(0, 2).join(" og ")} i hyggelige omgivelser. ${chance(0.5) ? "Gratis nybegynnertime en time før — vi finner partner til deg!" : "DJ tar oss trygt gjennom kvelden, alle danser med alle."}`,
        dresscode: pick(["Klærs du beveger deg godt i", "Fint (valgfritt)", "Vintage swing", "Treningsklær ok"]),
        freeBeginnerClass: chance(0.55), styles: JSON.stringify(styleList.length ? styleList : ["salsa"]),
        capacity: ri(60, 120), imageUrl: `/images/${pick(["dansekveld-hero", "socialdans", "klasse-lindyhop"])}.png`,
        status: past ? "GJENNOMFORT" : "AKTIV", bookings: ri(15, 70),
      });
    }
  }
  await db.danceNight.createMany({ data: nights.map(({ bookings: _b, ...r }) => r) });

  // bookinger på dansekvelder
  for (const n of nights) {
    const cnt = Math.min(n.bookings, n.capacity);
    for (let i = 0; i < cnt; i++) {
      const u = pick(dancerUsers);
      const code = bcode();
      const amount = n.price;
      bookings.push({
        id: uuid(), code, userId: u.id, profileId: profilesByUser.get(u.id)![0].id,
        schoolId: n.schoolId, courseId: null, dateId: null, nightId: n.id,
        kind: "KVELD", role: "INGEN", seatLabel: null, amount,
        paymentMethod: chance(0.6) ? "VIPPS" : "KORT", paymentStatus: "PAID",
        status: n.status === "GJENNOMFORT" ? "COMPLETED" : "CONFIRMED",
        extras: "[]", createdAt: new Date(n.date.getTime() - ri(1, 20) * 86400000), checkedInAt: null,
      });
      payments.push({ id: uuid(), bookingCode: code, method: "VIPPS", amount, status: "PAID", reference: `vipps-${ri(100000, 999999)}`, createdAt: bookings[bookings.length - 1].createdAt });
    }
  }

  for (let i = 0; i < bookings.length; i += 500) {
    await db.booking.createMany({ data: bookings.slice(i, i + 500) as never });
  }
  for (let i = 0; i < payments.length; i += 500) {
    await db.payment.createMany({ data: payments.slice(i, i + 500) });
  }
  console.log(`   ${bookings.length} bookinger, ${payments.length} betalinger`);

  // venteliste på fulle pardanskurs
  const waitlist: { id: string; courseId: string; userId: string; profileId: string; role: string; position: number; status: string; createdAt: Date }[] = [];
  for (const cid of fullCourseIds.slice(0, 22)) {
    const c = courses.find((x) => x.id === cid)!;
    const fill = seenCourseFill.get(cid)!;
    const n = ri(2, 5);
    for (let i = 0; i < n; i++) {
      const u = pick(dancerUsers);
      const role = fill.forere > fill.folgere ? "FOLGER" : "FORER";
      waitlist.push({ id: uuid(), courseId: cid, userId: u.id, profileId: profilesByUser.get(u.id)![0].id, role, position: i + 1, status: "ACTIVE", createdAt: dateAt(-ri(1, 20), 10) });
    }
  }
  await db.waitlistEntry.createMany({ data: waitlist });

  // ---------- bryllupspakker & forespørsler ----------
  console.log("💍 Bryllupspakker …");
  type PackRec = { id: string; schoolId: string; name: string; slug: string; type: string; sessions: number; durationMin: number; price: number; priceUnit: string; description: string; features: string; image: string };
  const packs: PackRec[] = [];
  const weddingSchools = schools.filter((s) => s.styles.includes("bryllupsdans") || chance(0.25)).slice(0, 18);
  let packCounter = 0;
  const PACK_TEMPLATES: { name: string; type: string; sessions: number; price: [number, number]; priceUnit: string; desc: string; feats: string[] }[] = [
    { name: "Brudevals gruppekurs", type: "GRUPPEKURS", sessions: 2, price: [70, 90], priceUnit: "PER_PAR", desc: "Lær brudevalsen sammen med andre par i samme situasjon — trygt, sosialt og effektivt.", feats: ["2 × 90 min i gruppe", "Grundig gjennomgang av grunnsteg og vendinger", "Maks 10 par", "Kaffe og kanelboller inkludert"] },
    { name: "Privattimer 2×", type: "PRIVATTIMER", sessions: 2, price: [180, 230], priceUnit: "PER_PAR", desc: "To private timer der instruktøren tilpasser alt deres sang og nivå.", feats: ["2 × 60 min, kun dere", "Koreografi til deres sang", "Videoopptak av koreografien"] },
    { name: "Privattimer 3×", type: "PRIVATTIMER", sessions: 3, price: [280, 340], priceUnit: "PER_PAR", desc: "Tre private timer — nok til en trygg og elegant brudevals med litt ekstra pynt.", feats: ["3 × 60 min, kun dere", "Koreografi til deres sang", "Innøving til inngang og sluttposisjon", "Videoopptak"] },
    { name: "Privattimer 4× + koreografi", type: "PRIVATTIMER", sessions: 4, price: [380, 460], priceUnit: "PER_PAR", desc: "Komplett pakke med ferdig koreografert overraskelsesdans.", feats: ["4 × 60 min, kun dere", "Ferdig koreografi til deres sang", "Oppfølging på video", "Generalprøve i brudesko"] },
    { name: "Koreografi til egen sang", type: "KOREOGRAFI", sessions: 1, price: [290, 490], priceUnit: "PER_PAR", desc: "Vi koreograferer hele dansen til deres sang — dere lærer den i to økter.", feats: ["Ferdig koreografi", "2 økter inkludert", "Musikk-klipping ved behov"] },
    { name: "Far–datter / mor–sønn dans", type: "FAR_DATTER", sessions: 2, price: [75, 110], priceUnit: "PER_PAR", desc: "En rørende dans med pappa eller mamma — enkel, elegant og lett å lære.", feats: ["2 × 45 min", "Enkel koreografi til valgt sang", "Passer alle nivåer"] },
  ];
  for (const s of weddingSchools) {
    const n = ri(1, 3);
    for (let i = 0; i < n; i++) {
      packCounter++;
      const t = PACK_TEMPLATES[(packCounter + i) % PACK_TEMPLATES.length];
      packs.push({
        id: uuid(), schoolId: s.id, name: t.name,
        slug: `${slugify(t.name)}-${slugify(s.city)}-${packCounter}`,
        type: t.type, sessions: t.sessions, durationMin: t.type === "GRUPPEKURS" ? 90 : 60,
        price: ri(t.price[0], t.price[1]) * 10, priceUnit: t.priceUnit,
        description: t.desc, features: JSON.stringify(t.feats),
        image: `/images/${pick(["privaattime", "stil-brudevals", "bryllupsdans-hero"])}.png`,
      });
    }
  }
  await db.weddingPackage.createMany({ data: packs });

  const privReqs = Array.from({ length: 16 }, (_, i) => {
    const s = pick(weddingSchools);
    const p = pick(packs.filter((x) => x.schoolId === s.id));
    const u = chance(0.5) ? pick(dancerUsers) : null;
    return {
      id: uuid(), schoolId: s.id, packageId: p?.id ?? null, userId: u?.id ?? null,
      contactName: u?.name ?? `${pick(FEMALE)} & ${pick(MALE)} ${pick(SURNAMES)}`,
      email: u?.email ?? `bryllup${i}@example.no`, phone: `+47 ${ri(400, 999)} ${ri(10, 99)} ${ri(10, 99)}`,
      weddingDate: dateAt(ri(30, 200), 14), participants: 2,
      preferredTimes: pick(["Hverdager etter 17", "Helger", "Torsdager", "Fleksibelt"]),
      message: pick(["Vi skal danse brudevals til <sang> — kan dere hjelpe?", "Vi vil gjerne ha en morsom overraskelsesdans!", "Ingen av oss har danset før, så vi trenger start fra bunnen av."]),
      status: pick(["NEW", "NEW", "CONTACTED", "BOOKED"]),
      createdAt: dateAt(-ri(1, 45), 11),
    };
  });
  await db.privateRequest.createMany({ data: privReqs });

  // ---------- anmeldelser ----------
  console.log("⭐ Anmeldelser …");
  const reviews: { id: string; schoolId: string; courseId: string | null; userId: string | null; authorName: string; rating: number; text: string; status: string; reply: string | null; createdAt: Date }[] = [];
  const coursesWithBookings = new Set(bookings.filter((b) => b.courseId).map((b) => b.courseId!));
  for (const cid of coursesWithBookings) {
    const c = courses.find((x) => x.id === cid)!;
    const n = ri(0, 3);
    for (let i = 0; i < n; i++) {
      const u = pick(dancerUsers);
      const rating = chance(0.72) ? 5 : chance(0.6) ? 4 : 3;
      reviews.push({
        id: uuid(), schoolId: c.schoolId, courseId: cid, userId: u.id,
        authorName: u.name.split(" ")[0] + " " + u.name.split(" ").slice(-1)[0].slice(0, 1) + ".",
        rating, text: pick(REVIEW_TEXTS),
        status: chance(0.93) ? "APPROVED" : "PENDING",
        reply: chance(0.3) ? pick(["Takk for fine ord — vi gleder oss til å se deg på neste kurs!", "Så hyggelig! Hils instruktøren fra oss 😊", "Takk! Vi legger dette videre til teamet."]) : null,
        createdAt: dateAt(-ri(1, 150), 13),
      });
    }
  }
  // skole-nivå anmeldelser
  for (const s of schools) {
    const n = ri(0, 2);
    for (let i = 0; i < n; i++) {
      const u = pick(dancerUsers);
      const rating = chance(0.75) ? 5 : 4;
      reviews.push({
        id: uuid(), schoolId: s.id, courseId: null, userId: u.id,
        authorName: u.name.split(" ")[0] + " " + u.name.split(" ").slice(-1)[0].slice(0, 1) + ".",
        rating, text: pick(REVIEW_TEXTS), status: chance(0.95) ? "APPROVED" : "PENDING",
        reply: chance(0.25) ? "Takk for tilbakemeldingen!" : null, createdAt: dateAt(-ri(1, 160), 13),
      });
    }
  }
  await db.review.createMany({ data: reviews });

  // oppdater skolers rating
  for (const s of schools) {
    const agg = await db.review.aggregate({ where: { schoolId: s.id, status: "APPROVED" }, _avg: { rating: true }, _count: true });
    await db.school.update({ where: { id: s.id }, data: { ratingAvg: Math.round((agg._avg.rating ?? 4.4) * 10) / 10, ratingCount: agg._count } });
  }
  // kurs-ratings
  for (const cid of coursesWithBookings) {
    const agg = await db.review.aggregate({ where: { courseId: cid, status: "APPROVED" }, _avg: { rating: true }, _count: true });
    if (agg._count > 0) {
      await db.course.update({ where: { id: cid }, data: { ratingAvg: Math.round((agg._avg.rating ?? 4.5) * 10) / 10, ratingCount: agg._count } });
    }
  }

  // ---------- klippekort, gavekort, kuponger ----------
  console.log("💳 Kort, kuponger, varsler …");
  const klippekort = dancerUsers.slice(0, 40).map((u, i) => ({
    id: uuid(), userId: u.id, schoolId: null, clips: 10, used: ri(0, 6), price: 1690,
    purchasedAt: dateAt(-ri(10, 120), 12), expiresAt: dateAt(ri(100, 300), 12),
  }));
  await db.klippekort.createMany({ data: klippekort });
  // demo-danser klippekort
  await db.klippekort.create({ data: { id: uuid(), userId: demoDanser.id, schoolId: null, clips: 10, used: 3, price: 1690, purchasedAt: dateAt(-40, 12), expiresAt: dateAt(320, 12) } });

  await db.giftCard.create({ data: { code: "TF-DEMO-500", amount: 500, balance: 500, buyerEmail: "giver@example.no", active: true } });
  await db.giftCard.create({ data: { code: "TF-DEMO-1000", amount: 1000, balance: 1000, buyerEmail: "giver@example.no", active: true } });
  await db.coupon.create({ data: { code: "TAKT10", percentOff: 10, amountOff: 0, active: true, maxUses: 1000, uses: 34, description: "10 % rabatt — kampanje nydansere" } });
  await db.coupon.create({ data: { code: "STUDENT5", percentOff: 5, amountOff: 0, active: true, maxUses: 500, uses: 12, description: "5 % ekstra for studenter" } });

  const notifications = [
    { email: "danser@taktfast.no", channel: "EMAIL", subject: "Bekreftelse: Salsa nybegynner hos Takt & Tone", body: "Hei Kari! Din plass er bekreftet. Vi gleder oss til å se deg!", userId: demoDanser.id, createdAt: dateAt(-3, 9) },
    { email: "skole@taktfast.no", channel: "EMAIL", subject: "Ny bestilling: Bachata nybegynner", body: "En ny deltaker har meldt seg på kurset deres.", userId: demoSkole.id, createdAt: dateAt(-2, 15) },
    { email: "danser@taktfast.no", channel: "SMS", subject: "Påminnelse: dansetime i morgen", body: "Hei! Du har danseklubb i morgen kl. 19:00. Husk rene indendørssko 😊", userId: demoDanser.id, createdAt: dateAt(-1, 18) },
    { email: "admin@taktfast.no", channel: "EMAIL", subject: "Ny skole venter på godkjenning", body: "En ny danseskole har registrert seg og venter på verifisering.", userId: demoAdmin.id, createdAt: dateAt(-1, 11) },
  ];
  await db.notification.createMany({ data: notifications });

  const messages = [
    { schoolId: schools[0].id, userId: demoDanser.id, fromRole: "DANSER", senderName: "Kari Danselyst", subject: "Kan jeg komme alene?", body: "Hei! Jeg har ingen partner — er det greit å melde seg alene på kurs?", createdAt: dateAt(-5, 10) },
    { schoolId: schools[0].id, userId: demoDanser.id, fromRole: "SKOLE", senderName: "Takt & Tone", subject: "Sv: Kan jeg komme alene?", body: "Hei Kari! Absolutt — vi balanserer førere og følgere, og du kan bytte partner i timene. Velkommen!", createdAt: dateAt(-4, 9) },
    { schoolId: schools[0].id, userId: dancerUsers[3].id, fromRole: "DANSER", senderName: dancerUsers[3].name, subject: "Venteliste", body: "Er det håp om plass på fredagskurset?", createdAt: dateAt(-3, 16) },
  ];
  await db.message.createMany({ data: messages });

  // favoritter
  const favs: { id: string; userId: string; courseId: string }[] = [];
  for (let i = 0; i < 60; i++) {
    const u = i < 5 ? demoDanser : pick(dancerUsers);
    const c = pick(courses);
    if (favs.some((f) => f.userId === u.id && f.courseId === c.id)) continue;
    favs.push({ id: uuid(), userId: u.id, courseId: c.id });
  }
  await db.favorite.createMany({ data: favs });

  // ---------- demo-brukerens kurs ----------
  console.log("🌟 Demo-datasett (gullsti) …");
  // Finn/gjør demo-skolens kurs: ett nesten fullt pardanskurs i dag (til innsjekk), ett fullt med venteliste
  const demoSchool = schools.find((s) => s.ownerId === demoSkole.id)!;
  const demoCourses = courses.filter((c) => c.schoolId === demoSchool.id);
  const salsaCourse = demoCourses.find((c) => c.format === "KURSREKKE") ?? demoCourses[0];

  // demo-danserens kommende bookinger
  const demoProfile = profilesByUser.get(demoDanser.id)![0];
  await db.booking.create({
    data: {
      id: uuid(), code: "TF-DEMO1", userId: demoDanser.id, profileId: demoProfile.id,
      schoolId: salsaCourse.schoolId, courseId: salsaCourse.id, dateId: (datesByCourse.get(salsaCourse.id) ?? [])[0]?.id ?? null,
      kind: "KURS", role: "FOLGER", seatLabel: "Følger 1", amount: salsaCourse.price,
      paymentMethod: "VIPPS", paymentStatus: "PAID", status: "CONFIRMED",
      extras: "[]", createdAt: dateAt(-6, 10),
    },
  });
  const dropinCourse = demoCourses.find((c) => c.format === "DROPIN");
  if (dropinCourse) {
    const dd = (datesByCourse.get(dropinCourse.id) ?? [])[0];
    if (dd) {
      await db.booking.create({
        data: {
          id: uuid(), code: "TF-DEMO2", userId: demoDanser.id, profileId: demoProfile.id,
          schoolId: dropinCourse.schoolId, courseId: dropinCourse.id, dateId: dd.id,
          kind: "DROPIN", role: "INGEN", seatLabel: null, amount: dropinCourse.price,
          paymentMethod: "VIPPS", paymentStatus: "PAID", status: "CONFIRMED", extras: "[]", createdAt: dateAt(-2, 10),
        },
      });
    }
  }

  // gjør én pardans-kurs på demo-skolen FULLT med venteliste (til "tilby plass")
  const fullCandidate = demoCourses.find((c) => DANCE_STYLES.find((x) => x.slug === c.styleSlug)?.requiresPartner && c.format === "KURSREKKE" && c.id !== salsaCourse.id);
  if (fullCandidate) {
    const existing = await db.booking.findMany({ where: { courseId: fullCandidate.id, status: { in: ["CONFIRMED", "COMPLETED", "CHECKED_IN"] } } });
    let forere = existing.filter((b) => b.role === "FORER").length;
    let folgere = existing.filter((b) => b.role === "FOLGER").length;
    const cap = fullCandidate.capacity * 2;
    let guard = 0;
    while (forere + folgere < cap && guard < 100) {
      guard++;
      const u = pick(dancerUsers);
      const role = forere <= folgere ? "FORER" : "FOLGER";
      if (role === "FORER") forere++; else folgere++;
      await db.booking.create({
        data: {
          id: uuid(), code: bcode(), userId: u.id, profileId: profilesByUser.get(u.id)![0].id,
          schoolId: fullCandidate.schoolId, courseId: fullCandidate.id, dateId: null,
          kind: "KURS", role, seatLabel: `${role === "FORER" ? "Fører" : "Følger"} ${role === "FORER" ? forere : folgere}`,
          amount: fullCandidate.price, paymentMethod: "VIPPS", paymentStatus: "PAID",
          status: "CONFIRMED", extras: "[]", createdAt: dateAt(-ri(1, 30), 12),
        },
      });
    }
    await db.course.update({ where: { id: fullCandidate.id }, data: { status: "AKTIV" } });
    // venteliste
    const wlUsers = dancerUsers.slice(60, 63);
    await db.waitlistEntry.createMany({
      data: wlUsers.map((u, i) => ({
        id: uuid(), courseId: fullCandidate.id, userId: u.id, profileId: profilesByUser.get(u.id)![0].id,
        role: forere > folgere ? "FOLGER" : "FORER", position: i + 1, status: "ACTIVE", createdAt: dateAt(-(10 - i), 12),
      })),
    });
  }

  // én skole som venter på godkjenning (til admin-gullsti)
  if (!schools.some((s) => s.status === "PENDING")) {
    // legg til en ekstra pending-skole
    const city = CITIES[3];
    const pending = {
      id: uuid(), ownerId: dancerUsers[20].id, name: "Nye Toner Dansestudio", slug: "nye-toner-dansestudio-99",
      tagline: "Ferskt dansemiljø midt i byen", description: "Ny dansestudio som ønsker å være med på Taktfast.",
      about: "Vi startet i høst og vil gjerne nå flere danselystne. Kursholderne våre har lang erfaring fra både Norge og utlandet.",
      address: "Danseveien 12", postalCode: "4013", city: city.name, citySlug: city.slug, district: null,
      lat: city.lat, lng: city.lng, phone: "+47 940 12 340", email: "post@nyetoner.no", website: "https://nyetoner.no",
      coverImage: "/images/studio-interior-2.png", gallery: JSON.stringify(["/images/studio-interior.png", "/images/dansesko.png"]),
      styles: JSON.stringify(["salsa", "bachata", "zumba"]), amenities: JSON.stringify(["Garderobe med dusj", "Speilvegg"]),
      verified: false, status: "PENDING", commissionRate: 0.1,
    };
    await db.school.create({ data: pending });
  }

  // oppsummering
  const counts = {
    skoler: await db.school.count(),
    instruktorer: await db.instructor.count(),
    kurs: await db.course.count(),
    kursdatoer: await db.courseDate.count(),
    bookinger: await db.booking.count(),
    anmeldelser: await db.review.count(),
    dansekvelder: await db.danceNight.count(),
    bryllupspakker: await db.weddingPackage.count(),
    venteliste: await db.waitlistEntry.count(),
    profiler: await db.deltakerProfile.count(),
    brukere: await db.user.count(),
  };
  console.log("✅ Seed ferdig:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
