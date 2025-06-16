import React from "react";
import { Button, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  
  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };
  
  return (
    <Tooltip content={`Mudar para tema ${isDark ? "claro" : "escuro"}`}>
      <Button
        isIconOnly
        variant="flat"
        color="default"
        onPress={toggleTheme}
        aria-label="Alternar tema"
      >
        <Icon 
          icon={isDark ? "lucide:sun" : "lucide:moon"} 
          className="text-lg" 
        />
      </Button>
    </Tooltip>
  );
};

export default ThemeSwitcher;