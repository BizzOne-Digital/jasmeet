"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          subject: data.subject,
          orderNumber: data.orderNumber || undefined,
          message: data.message,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Something went wrong");
      }
      setStatus("success");
      setMessage("Thank you — we’ll respond within 24 hours.");
      form.reset();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Unable to send message.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Input name="name" label="Name" required placeholder="Your name" />
      <Input name="email" type="email" label="Email" required placeholder="you@email.com" />
      <Input name="phone" label="Phone" placeholder="Optional" />
      <Input name="subject" label="Subject" required placeholder="How can we help?" />
      <Input name="orderNumber" label="Order number" placeholder="Optional" />
      <Textarea name="message" label="Message" required placeholder="Tell us more..." />
      {message ? (
        <p
          className={
            status === "success" ? "text-sm text-gold" : "text-sm text-red-400"
          }
          role="status"
        >
          {message}
        </p>
      ) : null}
      <Button type="submit" loading={status === "loading"} fullWidth>
        Send message
      </Button>
    </form>
  );
}
