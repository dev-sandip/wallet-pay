"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // Fixes React 19 / Next.js 16+ warning by changing the client-side
  // script type to a non-executable format ("application/json")
  const clientScriptProps =
    typeof window === "undefined"
      ? undefined
      : ({ type: "application/json" } as const);

  return (
    <NextThemesProvider {...props} scriptProps={clientScriptProps}>
      {children}
    </NextThemesProvider>
  );
}
