"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function NewsletterSignup({
  ctaLabel = "Subscribe",
  className,
}: {
  ctaLabel?: string;
  className?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Subscription failed");
      }
      setStatus("success");
      setMessage("You’re on the list — check your inbox for 10% off.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Unable to subscribe");
    }
  }

  return (
    <form onSubmit={onSubmit} className={className || "mt-8 flex flex-col gap-3 sm:flex-row"}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        className="h-11 flex-1 border border-current/20 bg-transparent px-4 text-sm outline-none focus:border-gold"
      />
      <Button type="submit" loading={status === "loading"} className="shrink-0">
        {ctaLabel}
      </Button>
      {message ? (
        <p
          className={`w-full text-sm ${status === "success" ? "text-gold" : "text-red-400"}`}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
