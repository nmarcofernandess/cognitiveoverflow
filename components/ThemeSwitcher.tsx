"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { SunFilledIcon, MoonFilledIcon } from "./icons";

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <Button
      size="lg"
      className="font-mono font-bold backdrop-blur-lg bg-gray-500/20 border border-gray-500/50 text-gray-300 hover:bg-gray-500/30"
      onPress={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <SunFilledIcon size={20} /> : <MoonFilledIcon size={20} />}
    </Button>
  );
};
