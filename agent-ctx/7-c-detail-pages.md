# Task ID: 7-c — agent: detail-pages (Z.ai Code subagent)

## Oppgave
Detaljsider for danseskoler (/danseskoler/[slug]) og kurs (/kurs/[slug]) med BookingWidget, Leaflet-kart, kontakt- og venteliste-flyt — all UI-tekst på norsk bokmål.

## Filer opprettet
- src/app/danseskoler/[slug]/page.tsx — serverpage: hero (16/6-bilde + overlappende infokort, «Verifisert skole»-badge, adresse, Stars), galleri (4 thumbs), Om skolen (2-kol + fasilitetchips), instruktørkort, studioer, timeplan gruppert på ukedag (tabell med RoleBalanceBar for PAR-kurs, «Meld deg på ›»), pristabell (avledet fra kurs + Prøvetime 100,- + Klippekort 1 690,-), anmeldelser med «Svar fra skolen» i sky-pale boks, Leaflet-kart, kontaktskjema, JSON-LD (DanceSchool/LocalBusiness + geo + aggregateRating + openingHours 17:00-22:00), brødsmulesti, generateMetadata.
- src/app/kurs/[slug]/page.tsx — serverpage: 2-kol lg (main 2/3 + sticky sidebar top-24), chips (StyleChip/nivå/alder), Ribbon-rekke, skolelenke, 16/9-bilde, InfoBox «Dette lærer du»/«Påkledning og sko», «Alle datoene» (nb-NO-ukedag + statusprikker PLANLAGT/AVLYST + varslinje), ledige plasser (partner: RoleBalanceBar + balanseregel + ventelistetall; ellers «Z av N ledige» + Progress), prisboks (student/honnør/drop-in/prøvetimekreditt), kursanmeldelser, instruktørkort, «Andre kurs hos samme skole» (snap-row med CourseCard), BookingWidget i sidebar, InfoBox «Fullt — still deg i kø» + WaitlistButton ved fullt ikke-partnerkurs, JSON-LD Course + CourseInstance + BreadcrumbList, generateMetadata.
- src/components/school/school-map.tsx — «use client», react-leaflet (MapContainer/TileLayer/CircleMarker marinblå + Popup), leaflet.css importert.
- src/components/school/school-map-wrapper.tsx — «use client», next/dynamic ssr:false + Skeleton.
- src/components/school/contact-form.tsx — «use client», POST /api/kontakt (SPORSMAL), Labels, suksess-toast + reset.
- src/components/course/waitlist-button.tsx — «use client», Dialog med profilvalg fra /api/me, POST /api/venteliste med rolle «FOLGER», 401 → /logg-inn?callbackUrl=.

## Kritiske tverrgående fikser (blokkerte HELE siten, dokumentert i worklog)
1. SessionProvider kastet «React Context is unavailable in Server Components» på ALLE sider (next-auth v4.24.13 dist mangler «use client»). Fiks: ny src/components/auth/session-providers.tsx («use client») + 3-linjers endring i layout.tsx.
2. prisma/schema.prisma manglet relasjonsfeltene Course.studio/Instructor (kun FK-kolonner) mens lib/data.ts getCourseDetail inkluderer dem → PrismaClientValidationError. La til studio/instructor-relasjoner + back-relations, kjørte db:push (ingen datatap) + generate.
3. .env manglet NEXTAUTH_SECRET/NEXTAUTH_URL → JWEDecryptionFailed i route handlers (api/me 401 tross gyldig innlogging). La til begge; auth fungerer nå end-to-end (testet login + /api/me + POST /api/venteliste = position 6, ryddet opp etter test).
4. next.config.ts: la til serverExternalPackages ["@prisma/client", ".prisma/client"] slik at prisma generate slår gjennom i dev uten restart (Turbopack hadde bakt gammelt DMMF inn i chunks).

## Verifisert
- Alle sider 200: skole, kurs (KURSREKKE/DROPIN/PRIVATTIME/fullt kurs), 404 ved ukjent slug.
- JSON-LD validerer (parset med bun), norsk bokmål overalt, ingen dyr/bingo-referanser.
- bun run lint: eneste gjenstående feil er i src/components/site/header.tsx (annet agent-område).
