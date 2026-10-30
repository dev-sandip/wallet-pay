"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { EyeIcon } from "@/components/ui/morphing-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth";
import Link from "next/link";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setAuthError(null);

    try {
      const { error, data } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: "/dashboard",
      });

      if (error) {
        setAuthError(error.message || "Unable to sign in.");
        return;
      }
      console.log("Successfully signed in", data);
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setAuthError(
        "Unable to connect to the authentication server. Please try again.",
      );
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm py-10">
        <div>
          <h3 className="text-balance text-center font-semibold text-foreground text-lg">
            Welcome Back
          </h3>

          <p className="text-pretty text-center text-muted-foreground text-sm">
            Enter your credentials to access your account.
          </p>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email-login">Email</Label>

            <Input
              {...register("email")}
              id="email-login"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-login-error" : undefined}
            />

            {errors.email && (
              <p
                id="email-login-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password with animated visibility toggle */}
          <div className="space-y-2">
            <Label htmlFor="password-login">Password</Label>

            <div className="relative">
              <Input
                {...register("password")}
                id="password-login"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                className="pr-10"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-login-error" : undefined
                }
              />

              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                <EyeIcon size={18} closed={!showPassword} aria-hidden="true" />
              </button>
            </div>

            {errors.password && (
              <p
                id="password-login-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Authentication error */}
          {authError && (
            <p role="alert" className="text-sm text-destructive">
              {authError}
            </p>
          )}

          {/* Submit */}
          <Button
            className="mt-4 w-full py-2 font-medium"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        {/* Password reset */}
        <p className="mt-6 text-pretty text-muted-foreground text-sm">
          New here?{" "}
          <Link
            className="font-medium text-primary hover:text-primary/90"
            href="/signup"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
