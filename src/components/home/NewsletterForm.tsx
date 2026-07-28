"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export interface NewsletterFormProps {
  variant?: "footer" | "section";
  className?: string;
  discountText?: string;
}

export function NewsletterForm({
  variant = "section",
  className,
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Something went wrong");
      }
      setStatus("success");
      setMessage("You're on the list. Welcome to DAYAURA.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Unable to subscribe");
    }
  };

  return (
    <form onSubmit={onSubmit} className={cn("space-y-3", className)}>
      <div
        className={cn(
          "flex flex-col gap-3",
          variant === "section" && "sm:flex-row"
        )}
      >
        <Input
          type="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          aria-label="Email"
          className={cn(variant === "section" && "bg-black/20")}
        />
        <Button
          type="submit"
          loading={status === "loading"}
          className={cn(variant === "section" ? "sm:w-auto" : "w-full")}
        >
          Subscribe
        </Button>
      </div>
      {message ? (
        <p
          className={cn(
            "text-xs",
            status === "success" ? "text-[#D4AF37]" : "text-red-400"
          )}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
