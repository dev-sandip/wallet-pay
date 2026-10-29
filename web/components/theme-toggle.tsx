"use client";

import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { ThemeIcon } from "@/components/ui/morphing-icons";
import { SoundEffects } from "./ui/sound";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  return (
    <SoundEffects>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      >
        <ThemeIcon dark={isDark} size={20} strokeWidth={1.75} />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </SoundEffects>
  );
}
