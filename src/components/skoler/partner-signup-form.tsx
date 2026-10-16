'use client';

// Partnersøknad fra danseskoler (demo — varsler post@taktfast.no)
import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export function PartnerSignupForm() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [styles, setStyles] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), city: city.trim(), styles: styles.trim(), message: message.trim() }),
      });
      const j = await res.json();
      if (!res.ok) {
        toast({ title: "Søknaden ble ikke sendt", description: j.error ?? "Prøv igjen.", variant: "destructive" });
        return;
      }
      toast({ title: "Takk!", description: "Vi tar kontakt innen 2 virkedager." });
      setName(""); setEmail(""); setCity(""); setStyles(""); setMessage("");
    } catch {
      toast({ title: "Noe gikk galt", description: "Sjekk internettforbindelsen og prøv igjen.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-md border border-[#CCD2DE] bg-white p-6 shadow-sm sm:grid-cols-2" aria-label="Partnersøknad for danseskoler">
      <div className="space-y-1.5">
        <Label htmlFor="pt-name">Skolens navn</Label>
        <Input id="pt-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="F.eks. Danseriet Grünerløkka" required minLength={2} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pt-email">E-post</Label>
        <Input id="pt-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="post@danskolen.no" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pt-city">By/sted</Label>
        <Input id="pt-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="F.eks. Oslo" required minLength={2} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pt-styles">Stiler dere underviser i</Label>
        <Input id="pt-styles" value={styles} onChange={(e) => setStyles(e.target.value)} placeholder="F.eks. salsa, bachata, brudevals" required minLength={2} />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="pt-message">Litt om skolen</Label>
        <Textarea
          id="pt-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          required
          minLength={5}
          placeholder="Antall instruktører, lokale, hvorfor dere vil være med på Taktfast …"
        />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={loading} className="w-full sm:w-auto" size="lg">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Sender …
            </>
          ) : (
            <>
              <Send className="h-4 w-4" aria-hidden="true" /> Send partnersøknad
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
