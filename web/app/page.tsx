import { ModeToggle } from "@/components/theme-toggle";
import Image from "next/image";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <div className="absolute right-6 top-6 flex items-center gap-3">
        <a
          href="https://github.com/dev-sandip"
          target="_blank"
          rel="noreferrer"
          aria-label="Visit dev-sandip on GitHub"
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Image
            width={32}
            height={32}
            src="https://github.com/dev-sandip.png?size=64"
            alt="dev-sandip"
            className="size-8 rounded-full"
          />
          <span className="hidden sm:inline">dev-sandip</span>
        </a>
        <ModeToggle />
      </div>

      <section>
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-muted-foreground">
          Wallet Pay
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-7xl">
          Coming soon.
        </h1>
      </section>
    </main>
  );
}
