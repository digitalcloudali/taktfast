// Taktfast — redaksjonelle guider (Tips og råd)
// Alt innhold er demo-tekst skrevet for Taktfast, med realistiske priser fra vår seed-data.

export type Guide = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  readMinutes: number;
  tag: string;
  sections: { heading: string; body: string }[];
};

export const GUIDES: Guide[] = [
  {
    slug: "hva-koster-dansekurs-i-oslo",
    title: "Hva koster dansekurs i Oslo? Prisoversikt 2025",
    excerpt:
      "Kursrekke, drop-in, privattime eller klippekort? Her får du en ærlig oversikt over hva dans faktisk koster i Oslo — og hvordan du får mest dans for pengene.",
    image: "/images/guide-priser.png",
    readMinutes: 5,
    tag: "Priser",
    sections: [
      {
        heading: "Kursrekke: fra rundt 910 kroner for seks ganger",
        body: "En vanlig kursrekke på seks ganger koster fra rundt 910,- hos de fleste Oslo-skoler. Er du student, ligger prisen ofte på rundt 570,- — flere skoler har egne studentpriser så lenge du kan vise gyldig bevis. Regner du det ut per time, ender du ofte på under 160 kroner for 75 minutter med undervisning.",
      },
      {
        heading: "Drop-in og kveldsbilletter",
        body: "Vil du prøve før du forplikter deg, er drop-in timene fine: de ligger typisk på rundt 180,- per gang. Dansekvelder med kveldsbillett koster ofte rundt 270,-, og da får du som regel tilgang til alle kurs og sosialdans samme kveld. Gratis nybegynnertime før festen er ikke uvanlig — se etter merket på kveldskortene.",
      },
      {
        heading: "Brudevals og bryllupsdans",
        body: "Skal dere lære brudevalsen før den store dagen, koster gruppekurs for par typisk rundt 750,- per par for to ganger. Privattimer med egen koreografi ligger fra rundt 950,- til 1 250,- per time. Det høres kanskje mye ut, men med en instruktør som skreddersyr dansen til sangen deres sparer dere ofte for flere timers gruppeundervisning.",
      },
      {
        heading: "Klippekort lønner seg hvis du kommer jevnlig",
        body: "Danser du ofte, er klippekortet ofte rimeligst: ti klipp koster rundt 1 690,-, altså 169,- per gang. Klippene kan brukes på drop-in og dansekvelder, og er som regel gyldige i et år. Har du et gavekort fra Taktfast, brukes saldoen automatisk i siste steg i bookingflyten.",
      },
      {
        heading: "Tre ting å sjekke før du betaler",
        body: "For det første: se om prisen er per person eller per par — det varierer mellom skolene, og Taktfast viser alltid hvilken enhet som gjelder. For det andre: sjekk om det finnes student- eller honnørrabatt. For det tredje: bruk prøvetimen. Mange skoler tilbyr prøvetimer for 100 kroner, og krediteres deg hvis du melder deg på kurset hos samme skole etterpå.",
      },
    ],
  },
  {
    slug: "salsa-eller-bachata",
    title: "Salsa eller bachata? Slik velger du riktig pardans",
    excerpt:
      "Begge er latinske, begge er sosiale — men opplevelsen er ganske ulik. Her er en enkel veiviser for å finne ut hvilken stil som passer deg best.",
    image: "/images/guide-salsa-eller-bachata.png",
    readMinutes: 4,
    tag: "Velge stil",
    sections: [
      {
        heading: "Salsa: energi, vendinger og rask rytme",
        body: "Salsa er den mest populære pardansen på dansegulvet, med rask musikk og masse vendinger. Du lærer grunnsteget fort, og etter noen få timer kan du faktisk danse hele sanger. Liker du energi, presisjon og litt svette på pannen, er salsa et trygt valg.",
      },
      {
        heading: "Bachata: mykt, romantisk og lett å starte med",
        body: "Bachata fra Den dominikanske republikk danses i fire rolige takter med myke hoftebevegelser. Det er kanskje den enkleste pardansen å begynne med, og mange føler seg «ferdige» allerede etter første time. Liker du nærhet, ro og musikk du kan kjenne deg igjen i, bør du prøve bachata først.",
      },
      {
        heading: "Musikken avgjør ofte for deg",
        body: "Spør deg selv hva du hører på i bilen. Salsamusikken er varm og energisk med trommer i front, mens bachata er mer popaktig og romantisk. Danser du til musikk du allerede liker, går progresjonen dobbelt så fort — det gjelder faktisk alle stiler.",
      },
      {
        heading: "Gode nyheter: du trenger ikke velge for godt",
        body: "Grunnprinsippene i føring og følging er de samme i begge stiler, så alt du lærer i salsa hjelper deg i bachata — og omvendt. Mange skoler kombinerer stilene i samme kursrekke, eller har kveldsbilletter der du kan prøve begge samme kveld. Start med én, bytt gjerne etter seks uker.",
      },
      {
        heading: "Vår anbefaling",
        body: "Er du helt ny og litt usikker: start med bachata, den er godhjertet og tilgivende for nybegynnere. Vil du ha et fysisk, lekent prosjekt: velg salsa. Og husk — begge stiler kan danses med eller uten fast partner, med partnerbytte i timene.",
      },
    ],
  },
  {
    slug: "kan-jeg-ga-pa-dansekurs-alene",
    title: "Kan jeg gå på dansekurs alene? (Ja — her er hvordan)",
    excerpt:
      "Du trenger absolutt ikke en partner for å begynne å danse. Slik fungerer partnerbytte, rollebalanse og å komme alene på pardanskurs.",
    image: "/images/guide-alene.png",
    readMinutes: 4,
    tag: "Nybegynner",
    sections: [
      {
        heading: "Kort svar: ja, kom alene!",
        body: "Halvparten av alle som melder seg på pardanskurs kommer alene. Skolene er bygget for det: de roterer partnere gjennom timen, så du danser med mange ulike mennesker og lærer raskere av det. Ingen står alene i hjørnet — det lover vi.",
      },
      {
        heading: "Slik fungerer partnerbyttet",
        body: "Etter hver figur roterer rekka én plass, så du får prøvd det du nettopp lærte med en ny partner. Det høres skummelt ut, men er faktisk det som gjør timene sosiale og morsomme. Du blir flinkere til å føre eller følge når du må tilpasse deg ulike dansere — og du blir kjent med hele gruppa på én kveld.",
      },
      {
        heading: "Balanse mellom førere og følgere",
        body: "Skolene passer på at det er omtrent like mange førere som følgere i hver gruppe. På Taktfast ser du alltid hvor mange ledige plasser det er i hver rolle før du bestiller, og hvis en rolle er full kan du melde deg på venteliste. Dermed slipper du å stå halve timen uten partner.",
      },
      {
        heading: "Stiler der alle kommer alene",
        body: "Linedance, zumba, hiphop, ballett og seniordans krever ingen partner i det hele tatt — der danser alle i rekker eller gruppe. Men selv i pardans-stiler som salsa, swing og tango er «kom alene» helt normalt. Filteret «Kom alene» i søket på Taktfast viser bare kurs der dette er spesielt innbydende.",
      },
      {
        heading: "Tre tips for din første alene-time",
        body: "Skriv at du kommer alene i meldingen til skolen — da forbereder de rotasjonen. Still deg gjerne i en annen rekke enn vennene dine, så du tvinges til å danse med nye. Og si ja til sosialdansen etter timen: det er der vennskapene på dans faktisk oppstår.",
      },
    ],
  },
  {
    slug: "brudevals-pa-3-timer",
    title: "Brudevals på 3 timer: dere kan faktisk klare det",
    excerpt:
      "Tre timer er nok til en ærverdig brudevals — hvis dere bruker dem riktig. Her er timeplanen instruktørene selv anbefaler.",
    image: "/images/guide-brudevals-3t.png",
    readMinutes: 4,
    tag: "Bryllup",
    sections: [
      {
        heading: "Time 1: grunnsteg og åndedrett",
        body: "Første time handler om grunnsteget: gå i takt, hold taktfast omfavnelse og pust. Det virker banalt, men 80 prosent av nervøsiteten på bryllupsdagen forsvinner når gåingen sitter. Instruktøren finner også ut hvilken versjon av valsen som passer dere — klassisk bokserserie eller en enklere gåvals.",
      },
      {
        heading: "Time 2: vendinger og inn i musikken",
        body: "Andre time brukes på vendingene, og viktigere: på deres egen sang. Dere setter på brudevalsmelodien og øver inn hvor i sangen vendingene kommer. Lær dere å «lese» sangen deres — når skal dere snu, når skal dere stoppe, hvor er klimakset? Da danser dere ikke bare en vals, men deres vals.",
      },
      {
        heading: "Time 3: generalprøven",
        body: "Tredje time er generalprøven: full koreografi fra første til siste tone, med klesdrakt og sko som ligner det dere har på bryllupsdagen. Bruden bør øve i noe som ligner kjolens bevegelse, og brudgommen med skoene han skal bruke. Ta opp video — dere glemmer mer enn dere tror.",
      },
      {
        heading: "Praktisk: tre timer kan fordeles ulikt",
        body: "Noen skoler kjører tre privattimer á 60 minutter, andre en intensivkveld på tre timer rett før bryllupet. Erfaringene er at to timer før og én time rett før den store dagen fungerer best — muskelen sitter bedre når det er kort tid mellom generalprøven og forestillingen. Husk at gruppekurs i brudevals er det rimeligste alternativet hvis dere ikke trenger egen koreografi.",
      },
      {
        heading: "Hvis alt går i basker på dagen",
        body: "Glem koreografien og bare gå i takt, hold omfavnelsen og smil. Ingen i salen vet hva dere hadde planlagt — de ser to mennesker som danser og elsker hverandre. En enkel vals som danses med trygghet slår alltid en avansert koreografi danset i panikk.",
      },
    ],
  },
  {
    slug: "barnedans-fra-hvilken-alder",
    title: "Barnedans: fra hvilken alder kan barna begynne?",
    excerpt:
      "Tre år eller tretten? Her er en aldersguide for barne- og ungdomsdans — med hva som faktisk skjer på timene i hver aldersgruppe.",
    image: "/images/guide-barnedans-alder.png",
    readMinutes: 4,
    tag: "Barn",
    sections: [
      {
        heading: "3–6 år: lek med musikk, med foresatt i nærheten",
        body: "For de minste handler dans om lek: hopping, spinning, bounce og de første ballett-stegene til musikk de kjenner. Timene varer som regel 30–45 minutter, og foreldre er velkomne til å se på fra sidelinjen — noen skoler oppfordrer til det, spesielt for treåringene. Det viktigste barna lærer er ikke steg, men motorikk, rytme og å tørre stå fremfor andre.",
      },
      {
        heading: "7–12 år: teknikken kommer, men leken forblir",
        body: "Fra sju-årsalderen kan barna følge lengre instruksjoner, og timene blir mer strukturerte: oppvarming, teknikkblokk og en liten koreografi de bygger på gjennom semesteret. Dette er også alderen der mange finner sin stil — barnedans, hiphop eller ballett. Prøvetime er gratis eller billig hos mange skoler, så barna kan teste flere stiler før dere forplikter dere.",
      },
      {
        heading: "13–17 år: egne stiler, egne krav",
        body: "Ungdomsscene er helt sin egen verden: hiphop, streetdance, K-pop og jazz dominerer, og forventningene til progresjon er høyere. Mange skoler har egne ungdomsgrupper med oppvisning til slutt i semesteret. La ungdommen selv velge stil — motivasjonen dobles når det er deres valg.",
      },
      {
        heading: "Hva bør du som foresatt sjekke før du melder på?",
        body: "Se etter aldersgruppen på kurset (Taktfast viser den på hvert kort) og sjekk at skolen krever foresatt-samtykke for barn — det er et tegn på seriøsitet. Spør om maks antall barn per instruktør; under tolv er en god tommelregel for de minste. Og husk at du legger til barneprofiler med samtykke under Min side på Taktfast før du bestiller.",
      },
      {
        heading: "Når er det for tidlig?",
        body: "Under tre år er det sjelden nødvendig — da er musikk- og bevegelsestilbud i kommunen et bedre førstesteg. Og hvis barnet står på dørtersken og ikke vil inn: prøv igjen neste semester. Dansen løper ikke bort, men dårlige førsteopplevelser gjør det.",
      },
    ],
  },
  {
    slug: "hva-har-jeg-pa-meg",
    title: "Hva har jeg på meg? Klar for første dansetime",
    excerpt:
      "Du trenger ikke danseko eller sko med hælkule. Her er hva som faktisk er lurt å ha med — og hva du kan la ligge.",
    image: "/images/guide-pakking.png",
    readMinutes: 3,
    tag: "Første time",
    sections: [
      {
        heading: "Sko: det eneste som faktisk betyr noe",
        body: "Ta med rene, myke sko med glatt såle — lær eller skinn er best, for gummisåler «kliker» fast i gulvet og belaster knærne når du snur. Har du ikke det: vanlige sneakers fungerer fint de første ukene, bare unngå joggesko med mye grep. Mange skoler har sko til leie for rundt 50 kroner, og det er en fin måte å teste om pardans er noe for deg før du kjøper sko.",
      },
      {
        heading: "Klær: komfort over stil",
        body: "Bruk klær du kan bevege deg fritt i — det du ville brukt på en gåtur, fungerer. T-skjorte og bukser med litt stretch er helt greit, og på salsa- og bachatatimer er mange i vanlige «festlige» plagg. Kjole fungerer utmerket, men gjerne en du kan snurre i. Danser du i en varm sal, ta med tynn genser til pause.",
      },
      {
        heading: "I baggen: tre ting du ikke angrer på",
        body: "Vannflaske — du svetter mer enn du tror. Lite håndkle eller ekstra t-skjorte å bytte i etterpå. Og mynter eller kort til kaffen etter timen: sosialdelen etter undervisningen er halve opplevelsen, og det er der du blir kjent i gruppa.",
      },
      {
        heading: "Hva du kan la ligge hjemme",
        body: "Du trenger ingen danseko, ingen glitter og ingen teknikk for video. Enkelte skoler filmer figurer til etterarbeid, men det er instruktøren som gjør det. Og skal du på bryllupsdans-timer: bytt til skoene du skal bruke på dagen i timen 2 og 3, men ha dem rene — noen saler har skoregler.",
      },
    ],
  },
];

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug);
