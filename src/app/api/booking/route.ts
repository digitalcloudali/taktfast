import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, isResponse } from "@/lib/session";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { EXTRAS, PROVETIME_CREDIT } from "@/lib/constants";

const schema = z.object({
  kind: z.enum(["KURS", "DROPIN", "KVELD", "PRIVATTIME", "PROVETIME", "PAKKE"]),
  courseId: z.string().optional(),
  dateId: z.string().optional(),
  nightId: z.string().optional(),
  packageId: z.string().optional(),
  seats: z
    .array(
      z.object({
        profileId: z.string(),
        role: z.enum(["FORER", "FOLGER", "INGEN", "BEGGE"]).default("INGEN"),
        partnerName: z.string().max(80).optional(),
      })
    )
    .min(1, "Velg minst én deltaker"),
  extras: z.array(z.string()).default([]),
  couponCode: z.string().max(30).optional(),
  giftCardCode: z.string().max(30).optional(),
  klippekortId: z.string().optional(),
});

type SeatInput = z.infer<typeof schema>["seats"][number];

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (isResponse(user)) return user;
  const rl = rateLimit(clientKey(req, `booking:${user.id}`), 12, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "For mange bestillinger på kort tid — vent litt." }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Ugyldige data" }, { status: 400 });
  }
  const data = parsed.data;

  try {
    return await db.$transaction(async (tx) => {
      // ---------- last inn objekt ----------
      let amountPerSeat = 0;
      let pricePerPar: number | null = null;
      let schoolId = "";
      let title = "";
      let extraInfo: Record<string, unknown> = {};

      if (data.kind === "KURS" || data.kind === "DROPIN" || data.kind === "PROVETIME" || data.kind === "PRIVATTIME") {
        if (!data.courseId) throw new Error("Mangler kurs");
        const course = await tx.course.findUnique({ where: { id: data.courseId }, include: { school: true } });
        if (!course || course.school.status !== "APPROVED") throw new Error("Kurset finnes ikke");
        if (course.status === "AVLYST") throw new Error("Kurset er avlyst");
        schoolId = course.schoolId;
        title = course.title;

        if (data.kind === "KURS") {
          if (course.format === "PRIVATTIME") throw new Error("Privattime bookes med egne felt");
          amountPerSeat = course.price;
          if (course.pricePer === "PAR") {
            pricePerPar = course.price;
            amountPerSeat = Math.round(course.price / 2);
          }
        } else if (data.kind === "DROPIN") {
          if (!course.dropInPrice) throw new Error("Dette kurset tilbyr ikke drop-in");
          if (!data.dateId) throw new Error("Velg dato for drop-in");
          const cd = await tx.courseDate.findUnique({ where: { id: data.dateId } });
          if (!cd || cd.courseId !== course.id) throw new Error("Ugyldig dato");
          if (cd.date.getTime() < Date.now() + 60 * 60 * 1000) {
            throw new Error("Drop-in kan bestilles senest 1 time før timen starter.");
          }
          amountPerSeat = course.dropInPrice;
          extraInfo = { dateId: data.dateId, date: cd.date.toISOString() };
        } else if (data.kind === "PROVETIME") {
          amountPerSeat = 100;
          if (!data.dateId) throw new Error("Velg dato for prøvetimen");
        } else if (data.kind === "PRIVATTIME") {
          amountPerSeat = course.price; // per par
          pricePerPar = course.price;
          if (data.seats.length > 1) throw new Error("Privattime bestilles som én enhet (par/gruppe)");
        }

        // ---------- kapasitet & rollebalanse ----------
        if (course.unit === "PAR") {
          // forere/fologere nå
          const grouped = await tx.booking.groupBy({
            by: ["role"],
            where: { courseId: course.id, status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN"] } },
            _count: { _all: true },
          });
          let forere = 0, folgere = 0;
          for (const g of grouped) {
            if (g.role === "FORER") forere = g._count._all;
            if (g.role === "FOLGER") folgere = g._count._all;
          }
          if (data.kind === "PRIVATTIME") {
            if (forere + folgere + 2 > course.capacity * 2) throw new Error("Ingen ledige privattime-slots");
            forere += 1;
            folgere += 1;
          } else {
            for (const seat of data.seats) {
              if (seat.role === "FORER") {
                if (forere + 1 > course.capacity) throw new Error("Ingen ledige førerplasser — bli med på venteliste.");
                if (Math.abs(forere + 1 - folgere) > 2)
                  throw new Error("Balanse mellom førere og følgere kan avvike med maks 2. Velg følgere-plass eller venteliste.");
                forere++;
              } else if (seat.role === "FOLGER") {
                if (folgere + 1 > course.capacity) throw new Error("Ingen ledige følgerplasser — bli med på venteliste.");
                if (Math.abs(forere - (folgere + 1)) > 2)
                  throw new Error("Balanse mellom førere og følgere kan avvike med maks 2. Velg fører-plass eller venteliste.");
                folgere++;
              } else {
                throw new Error("Velg rolle (fører eller følger) for hvert deltakernavn.");
              }
            }
          }
          extraInfo = { ...extraInfo, forere, folgere };
        } else {
          const booked = await tx.booking.count({
            where: { courseId: course.id, dateId: data.kind === "DROPIN" ? data.dateId : undefined, status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN"] } },
          });
          if (booked + data.seats.length > course.capacity) throw new Error("Det er ikke flere ledige plasser på dette kurset.");
        }

        // ---------- alder & samtykke ----------
        const profiles = await tx.deltakerProfile.findMany({ where: { id: { in: data.seats.map((s) => s.profileId) }, userId: user.id } });
        if (profiles.length !== new Set(data.seats.map((s) => s.profileId)).size) throw new Error("Ugyldig deltakerprofil");
        for (const p of profiles) {
          if (p.isChild) {
            if (!p.consent) throw new Error(`${p.name} mangler foresatt-samtykke. Legg det til på Min side.`);
            if (p.birthYear) {
              const age = new Date().getFullYear() - p.birthYear;
              if (course.ageGroup === "ALDER_3_6" && (age < 3 || age > 6)) throw new Error(`${p.name} (${age}) passer ikke i aldersgruppen 3–6 år.`);
              if (course.ageGroup === "ALDER_7_12" && (age < 7 || age > 12)) throw new Error(`${p.name} (${age}) passer ikke i aldersgruppen 7–12 år.`);
            }
          }
        }
      } else if (data.kind === "KVELD") {
        if (!data.nightId) throw new Error("Mangler dansekveld");
        const night = await tx.danceNight.findUnique({ where: { id: data.nightId }, include: { school: true } });
        if (!night || night.status !== "AKTIV") throw new Error("Dansekvelden finnes ikke");
        if (night.date.getTime() < Date.now()) throw new Error("Dansekvelden har allerede funnet sted");
        schoolId = night.schoolId;
        title = night.title;
        amountPerSeat = night.price;
        const booked = await tx.booking.count({ where: { nightId: night.id, status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN"] } } });
        if (booked + data.seats.length > night.capacity) throw new Error("Dansekvelden er utsolgt.");
      } else if (data.kind === "PAKKE") {
        if (!data.packageId) throw new Error("Mangler pakke");
        const pack = await tx.weddingPackage.findUnique({ where: { id: data.packageId }, include: { school: true } });
        if (!pack) throw new Error("Pakken finnes ikke");
        schoolId = pack.schoolId;
        title = pack.name;
        amountPerSeat = pack.price;
        if (data.seats.length > 1) throw new Error("Pakken bestilles som én enhet (per par)");
        extraInfo = { weddingDate: true };
      } else {
        throw new Error("Ugyldig bookingtype");
      }

      // ---------- tillegg ----------
      const extraItems = (data.extras ?? [])
        .map((id) => EXTRAS.find((e) => e.id === id))
        .filter(Boolean)
        .map((e) => ({ name: e!.name, price: e!.price }));
      const extrasSum = extraItems.reduce((s, e) => s + e.price, 0);

      // ---------- rabatter ----------
      let subtotal = amountPerSeat * data.seats.length + extrasSum;
      if (pricePerPar && data.kind !== "KURS") subtotal = pricePerPar + extrasSum;

      // student/honnørpris per profil
      let studentApplied = false;
      if (data.kind === "KURS" || data.kind === "DROPIN") {
        const course = await tx.course.findUnique({ where: { id: data.courseId! } });
        if (course) {
          const profiles = await tx.deltakerProfile.findMany({ where: { id: { in: data.seats.map((s) => s.profileId) } } });
          let adjusted = 0;
          for (const seat of data.seats) {
            const p = profiles.find((x) => x.id === seat.profileId);
            const age = p?.birthYear ? new Date().getFullYear() - p.birthYear : null;
            let seatPrice = amountPerSeat;
            if (course.studentPrice && age != null && age <= 30 && p && !p.isChild) { seatPrice = course.studentPrice; studentApplied = true; }
            else if (course.seniorPrice && age != null && age >= 60 && p && !p.isChild) seatPrice = course.seniorPrice;
            adjusted += seatPrice;
          }
          subtotal = adjusted + extrasSum;
        }
      }

      let discount = 0;
      let couponCodeUsed: string | null = null;
      let giftCardUsed: string | null = null;
      let klippUsed = 0;

      // provetime-kreditt: 100,- som kreditt ved kjøp av kursrekke hos samme skole
      if (data.kind === "KURS") {
        const provetime = await tx.booking.findFirst({
          where: { userId: user.id, schoolId, kind: "PROVETIME", paymentStatus: "PAID", createdAt: { gte: new Date(Date.now() - 180 * 86400000) } },
        });
        if (provetime) {
          discount += PROVETIME_CREDIT;
          extraInfo = { ...extraInfo, provetimeKreditt: PROVETIME_CREDIT };
        }
      }

      // kupong
      if (data.couponCode) {
        const coupon = await tx.coupon.findUnique({ where: { code: data.couponCode.toUpperCase().trim() } });
        if (!coupon || !coupon.active || coupon.uses >= coupon.maxUses) throw new Error("Rabattkoden er ugyldig eller brukt opp.");
        if (coupon.percentOff > 0) discount += Math.round((subtotal * coupon.percentOff) / 100);
        if (coupon.amountOff > 0) discount += coupon.amountOff;
        couponCodeUsed = coupon.code;
        await tx.coupon.update({ where: { code: coupon.code }, data: { uses: { increment: 1 } } });
      }

      // klippekort (kun drop-in / kveld): 1 klipp per person
      let klippekortId: string | undefined;
      if (data.klippekortId) {
        if (data.kind !== "DROPIN" && data.kind !== "KVELD") throw new Error("Klippekort kan brukes på drop-in og dansekvelder.");
        const kort = await tx.klippekort.findUnique({ where: { id: data.klippekortId } });
        if (!kort || kort.userId !== user.id) throw new Error("Klippekortet ble ikke funnet.");
        if (kort.expiresAt && kort.expiresAt.getTime() < Date.now()) throw new Error("Klippekortet har utløpt.");
        const remaining = kort.clips - kort.used;
        if (remaining < data.seats.length) throw new Error(`Klippekortet har bare ${remaining} klipp igjen — trenger ${data.seats.length}.`);
        klippUsed = data.seats.length;
        klippekortId = kort.id;
        discount += amountPerSeat * klippUsed;
      }

      const payable = Math.max(0, subtotal - discount);

      // gavekort dekker resten (maks saldo)
      let giftRemaining = 0;
      if (data.giftCardCode) {
        const gc = await tx.giftCard.findUnique({ where: { code: data.giftCardCode.toUpperCase().trim() } });
        if (!gc || !gc.active || gc.balance <= 0) throw new Error("Gavekortet er ugyldig eller brukt opp.");
        giftCardUsed = gc.code;
        giftRemaining = gc.balance;
      }

      const code = "TF-" + Math.random().toString(36).slice(2, 7).toUpperCase();
      const amountPaidNow = Math.max(0, payable - Math.min(giftRemaining, payable));

      // ---------- opprett bookinger (PENDING) ----------
      const created: { id: string; seatLabel: string | null }[] = [];
      let forerNo = 0, folgerNo = 0;
      for (const seat of data.seats) {
        let seatLabel: string | null = null;
        if (seat.role === "FORER") seatLabel = `Fører ${++forerNo}`;
        else if (seat.role === "FOLGER") seatLabel = `Følger ${++folgerNo}`;
        else if (seat.role === "BEGGE") seatLabel = "Par";
        const b = await tx.booking.create({
          data: {
            code,
            userId: user.id,
            profileId: seat.profileId,
            schoolId,
            courseId: data.courseId ?? null,
            dateId: data.dateId ?? null,
            nightId: data.nightId ?? null,
            packageId: data.packageId ?? null,
            kind: data.kind,
            role: seat.role,
            seatLabel,
            amount: data.kind === "PAKKE" || data.kind === "PRIVATTIME" ? Math.round(payable / data.seats.length) : Math.round((amountPerSeat * data.seats.length + extrasSum) / data.seats.length),
            discount: Math.round(discount / data.seats.length),
            klippUsed,
            klippekortId: klippekortId ?? null,
            couponCode: couponCodeUsed,
            giftCardCode: giftCardUsed,
            extras: JSON.stringify(extraItems),
            partnerName: seat.partnerName ?? null,
            weddingDate: body?.weddingDate ? new Date(body.weddingDate) : null,
            note: body?.note ? String(body.note).slice(0, 500) : null,
            status: "PENDING",
            paymentStatus: "PENDING",
          },
        });
        created.push({ id: b.id, seatLabel });
      }

      if (giftRemaining > 0) {
        const deduct = Math.min(giftRemaining, payable);
        await tx.giftCard.update({ where: { code: giftCardUsed! }, data: { balance: { decrement: deduct }, active: giftRemaining - deduct > 0 } });
      }

      return NextResponse.json({
        ok: true,
        code,
        amount: payable,
        amountToPay: amountPaidNow,
        studentApplied,
        bookings: created.length,
        title,
      });
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Kunne ikke fullføre bestillingen";
    const status = /må logge inn|tilgang/.test(msg) ? 401 : /ikke flere|Fullt|Ingen ledige|Balanse|venteliste/.test(msg) ? 409 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
