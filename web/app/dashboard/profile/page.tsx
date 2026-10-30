"use client";

import { type FormEvent, useState } from "react";
import { authClient } from "@/lib/auth";
import Image from "next/image";

export default function ProfilePage() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <main className="mx-auto max-w-2xl p-6 text-sm text-muted-foreground">
        Loading profile…
      </main>
    );
  }

  if (!session) {
    return (
      <main className="mx-auto max-w-2xl p-6 text-sm text-muted-foreground">
        Please sign in to edit your profile.
      </main>
    );
  }

  return <ProfileForm session={session} />;
}

function ProfileForm({
  session,
}: {
  session: NonNullable<ReturnType<typeof authClient.useSession>["data"]>;
}) {
  const [name, setName] = useState(session.user.name ?? "");
  const [image, setImage] = useState(session.user.image ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");

    const { error } = await authClient.updateUser({
      name: name.trim(),
      image: image.trim() || null,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message || "Unable to update your profile.");
      return;
    }

    setStatus("success");
    setMessage("Your profile has been updated.");
  }

  return (
    <main className="mx-auto max-w-2xl bg-background p-6 text-foreground sm:p-10">
      <div className="mb-8">
        <p className="text-sm font-medium text-primary">Account settings</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Your profile
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Update the information shown on your account.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border bg-card p-6 text-card-foreground shadow-sm sm:p-8"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xl font-semibold text-primary">
            {image ? (
              <Image
                width={64}
                height={64}
                src={image}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              name.charAt(0).toUpperCase() || "?"
            )}
          </div>
          <div>
            <p className="font-medium">{session.user.email}</p>
            <p className="text-sm text-muted-foreground">
              Your email address cannot be changed here.
            </p>
          </div>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium">Name</span>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2.5 outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            placeholder="Your name"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium">
            Profile image URL{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </span>
          <input
            type="url"
            value={image}
            onChange={(event) => setImage(event.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2.5 outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            placeholder="https://example.com/avatar.jpg"
          />
        </label>

        <div className="flex items-center justify-between gap-4 border-t pt-5">
          <p
            role="status"
            className={`text-sm ${status === "error" ? "text-destructive" : "text-muted-foreground"}`}
          >
            {message}
          </p>
          <button
            type="submit"
            disabled={status === "saving"}
            className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "saving" ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </main>
  );
}
