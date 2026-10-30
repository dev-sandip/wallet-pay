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

const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters.")
      .max(50, "Name must be at most 50 characters."),

    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Enter a valid email address."),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password must be at most 128 characters."),

    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: SignupFormValues) {
    setAuthError(null);

    try {
      const { error, data } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        callbackURL: "/dashboard",
      });

      if (error) {
        setAuthError(error.message || "Unable to create your account.");
        return;
      }

      console.log("Successfully signed up", data);

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
        {/* Header */}

        <div>
          <h3 className="text-balance text-center font-semibold text-foreground text-lg">
            Create an Account
          </h3>

          <p className="text-pretty text-center text-muted-foreground text-sm">
            Enter your details below to get started.
          </p>
        </div>

        {/* Form */}

        <form
          className="mt-6 space-y-4"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {/* Name */}

          <div className="space-y-2">
            <Label htmlFor="name-signup">Full Name</Label>

            <Input
              {...register("name")}
              id="name-signup"
              type="text"
              autoComplete="name"
              placeholder="John Doe"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-signup-error" : undefined}
            />

            {errors.name && (
              <p
                id="name-signup-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}

          <div className="space-y-2">
            <Label htmlFor="email-signup">Email</Label>

            <Input
              {...register("email")}
              id="email-signup"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-signup-error" : undefined}
            />

            {errors.email && (
              <p
                id="email-signup-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}

          <div className="space-y-2">
            <Label htmlFor="password-signup">Password</Label>

            <div className="relative">
              <Input
                {...register("password")}
                id="password-signup"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Create a password"
                className="pr-10"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-signup-error" : undefined
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
                id="password-signup-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}

          <div className="space-y-2">
            <Label htmlFor="confirm-password-signup">Confirm Password</Label>

            <div className="relative">
              <Input
                {...register("confirmPassword")}
                id="confirm-password-signup"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Confirm your password"
                className="pr-10"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={
                  errors.confirmPassword
                    ? "confirm-password-signup-error"
                    : undefined
                }
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((visible) => !visible)}
                className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
                aria-pressed={showConfirmPassword}
              >
                <EyeIcon
                  size={18}
                  closed={!showConfirmPassword}
                  aria-hidden="true"
                />
              </button>
            </div>

            {errors.confirmPassword && (
              <p
                id="confirm-password-signup-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Authentication Error */}

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
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>

        {/* Login Link */}

        <p className="mt-6 text-pretty text-muted-foreground text-sm">
          Already have an account?{" "}
          <a
            className="font-medium text-primary hover:text-primary/90"
            href="/login"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
