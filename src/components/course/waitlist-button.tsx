"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Clock3 } from "lucide-react";

type Profile = { id: string; name: string; isChild: boolean; birthYear: number | null; consent: boolean };

type WaitlistButtonProps = {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
};

/** Venteliste-knapp for fullte, ikke-partnerkurs: velg profil, still deg i kø (rolle FØLGER) */
export function WaitlistButton({ courseId, courseSlug, courseTitle }: WaitlistButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profileId, setProfileId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Hent profiler fra /api/me når dialogen åpnes
  useEffect(() => {
    if (!open || profiles.length > 0) return;
    let cancelled = false;
    setFetching(true);
    fetch("/api/me")
      .then((r) => {
        if (r.status === 401) {
          router.push(`/logg-inn?callbackUrl=/kurs/${encodeURIComponent(courseSlug)}`);
          return null;
        }
        return r.ok ? r.json() : null;
      })
      .then((d) => {
        if (cancelled || !d) return;
        const list: Profile[] = d.profiles ?? [];
        setProfiles(list);
        if (list[0]) setProfileId(list[0].id);
      })
      .catch(() => {
        if (!cancelled) toast({ title: "Kunne ikke hente profilene dine", variant: "destructive" });
      })
      .finally(() => {
        if (!cancelled) setFetching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, profiles.length, router, courseSlug]);

  async function join() {
    if (!profileId) {
      toast({ title: "Velg hvem som skal stå i kø", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/venteliste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, profileId, role: "FOLGER" }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string; position?: number } | null;
      if (res.status === 401) {
        router.push(`/logg-inn?callbackUrl=/kurs/${encodeURIComponent(courseSlug)}`);
        return;
      }
      if (!res.ok) {
        toast({
          title: "Kunne ikke stille deg i kø",
          description: data?.error ?? "Prøv igjen om litt.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Du står på venteliste!",
        description: `Du er nummer ${data?.position ?? 1} i køen for «${courseTitle}». Vi varsler deg hvis en plass åpner seg.`,
      });
      setOpen(false);
    } catch {
      toast({ title: "Noe gikk galt", description: "Prøv igjen om litt.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button variant="outline" className="w-full" onClick={() => setOpen(true)} type="button">
        <Clock3 className="h-4 w-4" aria-hidden="true" />
        Still deg i kø på venteliste
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-navy">Venteliste – {courseTitle}</DialogTitle>
            <DialogDescription>
              Kurset er fullt. Vi gir deg beskjed på e-post hvis en plass blir ledig — tilbudet gjelder i 24 timer.
            </DialogDescription>
          </DialogHeader>

          {fetching ? (
            <p className="text-sm text-[#6B6B6B]">Henter profilene dine …</p>
          ) : profiles.length === 0 ? (
            <p className="text-sm text-[#6B6B6B]">
              Du har ingen deltakerprofiler ennå. Logg inn og legg til en profil under Min side.
            </p>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="venteliste-profil" className="text-sm font-semibold text-navy">
                Hvem skal stå i køen?
              </Label>
              <RadioGroup id="venteliste-profil" value={profileId} onValueChange={setProfileId}>
                {profiles.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-3 rounded-md border border-[#CCD2DE] p-3 hover:bg-sky-pale has-[[data-state=checked]]:border-navy"
                  >
                    <RadioGroupItem value={p.id} data-state={profileId === p.id ? "checked" : "unchecked"} />
                    <span>
                      <span className="block text-sm font-semibold text-navy">{p.name}</span>
                      <span className="block text-xs text-[#6B6B6B]">
                        {p.isChild
                          ? `Barn${p.birthYear ? `, født ${p.birthYear}` : ""}`
                          : p.birthYear
                            ? `Født ${p.birthYear}`
                            : "Voksen"}{" "}
                        · står i kø som følger
                      </span>
                    </span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} type="button">
              Avbryt
            </Button>
            <Button onClick={join} disabled={loading || fetching || profiles.length === 0} type="button">
              {loading ? "Registrerer …" : "Bli med på venteliste"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
