import React from "react";
import { Accordion, AccordionItem, Button, Badge } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

interface SectionAccordionProps {
  title: string;
  icon: string;
  color: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const SectionAccordion: React.FC<SectionAccordionProps> = ({
  title,
  icon,
  color,
  isOpen,
  onToggle,
  children
}) => {
  // Map color string to tailwind classes
  const colorMap: Record<string, { border: string, bg: string, text: string, glow: string, badge: string }> = {
    red: { 
      border: "border-red-500/70", 
      bg: "bg-red-950/80 hover:bg-red-950/90", 
      text: "text-red-400",
      glow: "shadow-[0_0_20px_rgba(239,68,68,0.3)]",
      badge: "bg-red-500/20 text-red-400 border-red-500"
    },
    orange: { 
      border: "border-orange-500/70", 
      bg: "bg-orange-950/80 hover:bg-orange-950/90", 
      text: "text-orange-400",
      glow: "shadow-[0_0_20px_rgba(249,115,22,0.3)]",
      badge: "bg-orange-500/20 text-orange-400 border-orange-500"
    },
    purple: { 
      border: "border-purple-500/70", 
      bg: "bg-purple-950/80 hover:bg-purple-950/90", 
      text: "text-purple-400",
      glow: "shadow-[0_0_20px_rgba(168,85,247,0.3)]",
      badge: "bg-purple-500/20 text-purple-400 border-purple-500"
    },
    green: { 
      border: "border-green-500/70", 
      bg: "bg-green-950/80 hover:bg-green-950/90", 
      text: "text-green-400",
      glow: "shadow-[0_0_20px_rgba(34,197,94,0.3)]",
      badge: "bg-green-500/20 text-green-400 border-green-500"
    },
    white: { 
      border: "border-white/50", 
      bg: "bg-gray-900/90 hover:bg-gray-800/95", 
      text: "text-yellow-400",
      glow: "shadow-[0_0_20px_rgba(255,255,255,0.2)]",
      badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500"
    },
  };
  
  const colorClasses = colorMap[color] || colorMap.white;
  
  return (
    <motion.div 
      className={`mb-8 border-2 rounded-lg overflow-hidden matrix-accordion ${colorClasses.border} ${colorClasses.glow}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Accordion 
        selectedKeys={isOpen ? new Set(["1"]) : new Set([])}
        onSelectionChange={() => onToggle()}
        className="w-full"
        showDivider={false}
        variant="shadow"
      >
        <AccordionItem
          key="1"
          aria-label={title}
          classNames={{
            base: "group",
            title: "text-2xl font-bold flex items-center gap-3 matrix-title",
            trigger: `w-full p-6 transition-all ${colorClasses.bg} backdrop-blur-md`,
            indicator: "text-white",
            content: "p-6 bg-black/90 backdrop-blur-md"
          }}
          startContent={
            <div className="flex items-center gap-3">
              <Badge 
                className={`border ${colorClasses.badge}`}
                variant="flat"
                size="sm"
              >
                MATRIX
              </Badge>
              <Icon icon={icon} className={`${colorClasses.text} text-2xl matrix-icon`} />
            </div>
          }
          title={title}
        >
          {children}
        </AccordionItem>
      </Accordion>
    </motion.div>
  );
};