import { GitHub } from "@/components/icons/github";
import { ModeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowRight,
  ArrowLeftRight,
  BookOpen,
  ShieldCheck,
  History,
  Repeat2,
  Wallet,
  Database,
  GitBranch,
  Code2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

const concepts = [
  {
    icon: Repeat2,
    title: "Idempotency",
    description:
      "Requests can be retried without accidentally creating duplicate transfers. Each request is identified using a unique idempotency key scoped to a user and operation.",
  },
  {
    icon: BookOpen,
    title: "Double-entry ledger",
    description:
      "Every transfer produces corresponding debit and credit entries. Each movement of money is recorded, making transactions traceable and balanced.",
  },
  {
    icon: ShieldCheck,
    title: "Transaction integrity",
    description:
      "Related database operations are designed to execute atomically, preventing partial transfers and inconsistent financial records.",
  },
  {
    icon: History,
    title: "Audit logging",
    description:
      "Important actions are recorded with their actor, resource, timestamps, metadata, and previous or updated values.",
  },
];

const technologies = [
  "Node.js",
  "TypeScript",
  "PostgreSQL",
  "Drizzle ORM",
  "Nest Js",
  "Next.js",
  "Better Auth",
];

export default function WalletPayLanding() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="border-b border-border">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            <span className="text-lg font-semibold tracking-tight">
              WalletPay
            </span>
          </Link>

          <div className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#about" className="hover:text-foreground">
              About
            </a>
            <a href="#concepts" className="hover:text-foreground">
              Concepts
            </a>
            <a href="#architecture" className="hover:text-foreground">
              Architecture
            </a>
          </div>

          <div className="flex items-center gap-3">
            <ModeToggle />

            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Login
              <ArrowRight size={15} />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section id="about" className="mx-auto max-w-6xl px-5 py-24 md:py-32">
        <div className="max-w-3xl">
          <p className="mb-5 text-sm font-medium text-muted-foreground">
            A digital wallet engineering project
          </p>

          <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
            Understanding how money moves through a system.
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
            WalletPay is a digital wallet project built to explore the
            fundamentals of payment systems, including idempotency, double-entry
            bookkeeping, transaction consistency, and financial audit trails.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
            >
              Get started
              <ArrowRight size={16} />
            </Link>

            <a
              href="#concepts"
              className="rounded-md border border-border px-5 py-3 text-sm font-medium hover:bg-muted"
            >
              Explore concepts
            </a>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">01 / Overview</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              What is WalletPay?
            </h2>
          </div>

          <div className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>
              WalletPay is an educational backend project that models
              wallet-to-wallet transfers and the underlying financial records
              required to track them.
            </p>
            <p>
              Rather than treating a transfer as a simple balance update, the
              system explores how financial operations can be represented
              through transfer records, ledger transactions, and individual
              ledger entries.
            </p>
            <p>
              The goal is to understand the design decisions that make financial
              applications consistent, traceable, and reliable.
            </p>
          </div>
        </div>
      </section>

      {/* Core concepts */}
      <section id="concepts" className="mx-auto max-w-6xl px-5 py-20">
        <div className="max-w-xl">
          <p className="text-sm text-muted-foreground">02 / Core concepts</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">
            Principles behind the system.
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            The project focuses on four important concepts used when designing
            financial transaction systems.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {concepts.map((concept, index) => {
            const Icon = concept.icon;

            return (
              <article
                key={concept.title}
                className="border-t border-border pt-6"
              >
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    0{index + 1}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-semibold">{concept.title}</h3>

                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {concept.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Ledger explanation */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <p className="text-sm text-muted-foreground">03 / Ledger example</p>

          <div className="mt-4 grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">
                Every transfer has two sides.
              </h2>
              <p className="mt-5 text-sm leading-7 text-muted-foreground">
                In double-entry bookkeeping, transferring money between two
                wallets requires recording a debit from the sender and a credit
                to the receiver.
              </p>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Both entries belong to one ledger transaction, allowing the
                movement of funds to be understood as a single financial event.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-background p-6">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-sm font-medium">Example transaction</span>
                <span className="text-xs text-muted-foreground">USD</span>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Raghav&apos;s wallet</p>
                    <p className="text-xs text-muted-foreground">Debit</p>
                  </div>
                  <span className="font-mono text-sm">-25.00</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Sandip&apos;s wallet</p>
                    <p className="text-xs text-muted-foreground">Credit</p>
                  </div>
                  <span className="font-mono text-sm">+25.00</span>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total debits</span>
                    <span className="font-mono">25.00</span>
                  </div>
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Total credits</span>
                    <span className="font-mono">25.00</span>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium">
                    <ShieldCheck size={16} />
                    Balanced transaction
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="mx-auto max-w-6xl px-5 py-20">
        <p className="text-sm text-muted-foreground">04 / Architecture</p>

        <h2 className="mt-4 text-3xl font-semibold tracking-tight">
          How the data is organized.
        </h2>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
          The database separates transfer information, ledger records,
          idempotency tracking, and audit history into dedicated tables.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: ArrowLeftRight,
              name: "ledger_transactions",
              description: "Groups ledger entries and references a transfer.",
            },
            {
              icon: BookOpen,
              name: "ledger_entries",
              description: "Stores wallet debit and credit records.",
            },
            {
              icon: Database,
              name: "idempotency_keys",
              description: "Stores request keys, hashes, and responses.",
            },
            {
              icon: GitBranch,
              name: "audit_logs",
              description: "Tracks actions and resource changes.",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.name}
                className="rounded-lg border border-border p-5"
              >
                <Icon className="h-5 w-5 text-muted-foreground" />
                <h3 className="mt-5 break-all font-mono text-sm font-medium">
                  {item.name}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Technologies */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">05 / Technology</p>
              <h2 className="mt-3 text-2xl font-semibold">
                Built with familiar backend tools.
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {technologies.map((technology) => (
                <span
                  key={technology}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  {technology}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Developer */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className="text-sm text-muted-foreground">06 / Developer</p>

          <div className="mt-7 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage
                  src="https://github.com/dev-sandip.png"
                  alt="dev-sandip"
                />
                <AvatarFallback>SS</AvatarFallback>
              </Avatar>

              <div>
                <h3 className="text-lg font-semibold">dev-sandip</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Developer & creator of WalletPay
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://github.com/dev-sandip"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                <GitHub className="size-4" />
                GitHub Profile
                <ExternalLink size={13} />
              </a>

              <a
                href="https://github.com/dev-sandip/wallet-pay"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Code2 size={16} />
                View Repository
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          <p className="mt-8 max-w-2xl text-sm leading-7 text-muted-foreground">
            WalletPay is an independent learning project developed to understand
            the fundamentals of backend engineering, financial transactions, and
            reliable wallet systems.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span className="font-medium text-foreground">WalletPay</span>
        <span>
          An educational project exploring payment system fundamentals.
        </span>
      </footer>
    </main>
  );
}
