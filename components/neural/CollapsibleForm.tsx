"use client";

import React from 'react';
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from "framer-motion";

interface CollapsibleFormProps {
  title: string;
  buttonText: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  icon?: string;
  buttonColor?: string;
  borderColor?: string;
}

export const CollapsibleForm = ({ 
  title, 
  buttonText, 
  isOpen, 
  onToggle, 
  children,
  icon = "lucide:plus",
  buttonColor = "bg-blue-600 hover:bg-blue-500",
  borderColor = "border-blue-400/40"
}: CollapsibleFormProps) => (
  <div className="space-y-4">
    <Button 
      onClick={onToggle} 
      className={`w-full justify-start ${buttonColor} text-white font-mono font-bold`}
    >
      <Icon icon={isOpen ? "lucide:minus" : icon} className="mr-2" width={16} height={16} />
      {buttonText}
    </Button>
    
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <Card className={`bg-slate-800/60 backdrop-blur-sm border ${borderColor}`}>
            <CardBody className="p-6">
              <h4 className="font-semibold mb-4 text-slate-100 font-mono">{title}</h4>
              {children}
            </CardBody>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

interface CollapsibleSectionProps {
  title: string;
  count?: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  emptyMessage?: string;
}

export const CollapsibleSection = ({ 
  title, 
  count, 
  isOpen, 
  onToggle, 
  children,
  emptyMessage = "No items"
}: CollapsibleSectionProps) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h4 className="font-semibold text-blue-400 font-mono">
        {title} {count !== undefined && `(${count})`}
      </h4>
      <Button
        isIconOnly
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="text-slate-400 hover:text-blue-400"
      >
        <Icon 
          icon={isOpen ? "lucide:chevron-up" : "lucide:chevron-down"} 
          width={16} 
          height={16} 
        />
      </Button>
    </div>

    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
); 