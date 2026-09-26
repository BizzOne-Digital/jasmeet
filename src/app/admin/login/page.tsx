"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Lock } from "lucide-react";
import {
  adminCardClass,
  adminFieldClass,
  adminLabelClass,
  adminPrimaryBtnClass,
} from "@/components/admin/admin-ui";
import { useToast } from "@/components/admin/ToastProvider";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { error: toastError, success: toastSuccess } = useToast();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("expired") === "1") {
      toastSuccess("Session expired. Please sign in again.");
    }
  }, [toastSuccess]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    setSubmitting(true);
    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "Configuration") {
          toastError(
            "Auth is not configured on the server. Check AUTH_SECRET and MONGODB_URI."
          );
        } else {
          toastError("Invalid email or password");
        }
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      toastError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.08),_transparent_55%)]" />
      <div
        className={cn(
          adminCardClass,
          "relative w-full max-w-md p-8 shadow-2xl backdrop-blur"
        )}
      >
        <div className="mb-8 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#D4AF37]">
            Admin Portal
          </p>
          <h1 className="mt-3 font-display text-2xl tracking-wide text-white">
            DAYAURA
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Sign in to manage your storefront
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className={adminLabelClass}>Email</label>
            <input
              type="email"
              autoComplete="email"
              className={adminFieldClass}
              {...register("email")}
            />
            {errors.email ? (
              <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
            ) : null}
          </div>
          <div>
            <label className={adminLabelClass}>Password</label>
            <input
              type="password"
              autoComplete="current-password"
              className={adminFieldClass}
              {...register("password")}
            />
            {errors.password ? (
              <p className="mt-1 text-xs text-red-400">
                {errors.password.message}
              </p>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className={cn(adminPrimaryBtnClass, "w-full")}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
