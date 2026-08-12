"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createRequest } from "@/lib/api";

export function RequestIntakeForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientReference, setClientReference] = useState("");
  const [submittedBy, setSubmittedBy] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const request = await createRequest({
        title,
        description,
        client_reference: clientReference,
        submitted_by: submittedBy,
      });
      router.push(`/requests/${request.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create Request");
      setSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-2xl gap-0 rounded-sm border border-border py-0 shadow-none">
      <CardHeader className="border-b border-border px-3 py-2.5">
        <CardTitle className="text-[15px] font-medium tracking-tight">
          Jauns Request
        </CardTitle>
        <p className="text-[12px] text-muted-foreground">
          Iesniedz Power BI pieprasījumu — Mock Pipeline sāks automātiski.
        </p>
      </CardHeader>
      <CardContent className="p-3">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-muted-foreground">Nosaukums</span>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-8 rounded-sm text-[13px]"
              placeholder="BC pārdošanas KPI pa reģioniem"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-muted-foreground">Apraksts</span>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-24 rounded-sm border border-input bg-transparent px-2.5 py-2 text-[13px] outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/30"
              placeholder="Detalizēts pieprasījuma apraksts…"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] text-muted-foreground">Client</span>
              <Input
                required
                value={clientReference}
                onChange={(e) => setClientReference(e.target.value)}
                className="h-8 rounded-sm text-[13px]"
                placeholder="UPB"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] text-muted-foreground">Iesniedzējs</span>
              <Input
                required
                value={submittedBy}
                onChange={(e) => setSubmittedBy(e.target.value)}
                className="h-8 rounded-sm text-[13px]"
                placeholder="M. Ozoliņš"
              />
            </label>
          </div>
          {error ? (
            <p className="text-[12px] text-destructive">{error}</p>
          ) : null}
          <Button
            type="submit"
            disabled={submitting}
            className="h-8 w-fit rounded-sm text-[12px]"
          >
            {submitting ? "Iesniedz…" : "Iesniegt Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
