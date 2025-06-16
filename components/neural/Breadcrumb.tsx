"use client";

import React from 'react';
import { Button } from "@heroui/button";
import { Icon } from '@iconify/react';
import { motion } from "framer-motion";

interface BreadcrumbItem {
  label: string;
  icon?: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <motion.div 
      className="flex items-center gap-2 mb-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {/* Breadcrumb Item */}
          <div className="flex items-center gap-2">
            {item.onClick ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={item.onClick}
                className={`
                  text-slate-400 hover:text-slate-100 font-mono transition-colors
                  ${item.isActive ? 'text-emerald-400 cursor-default' : 'hover:bg-slate-700/30'}
                `}
                isDisabled={item.isActive}
              >
                {item.icon && (
                  <Icon icon={item.icon} width={16} height={16} className="mr-1" />
                )}
                {item.label}
              </Button>
            ) : (
              <span className={`
                text-sm font-mono px-3 py-1.5 rounded
                ${item.isActive 
                  ? 'text-emerald-400 bg-emerald-900/20 border border-emerald-500/30' 
                  : 'text-slate-400'
                }
              `}>
                {item.icon && (
                  <Icon icon={item.icon} width={16} height={16} className="mr-2 inline" />
                )}
                {item.label}
              </span>
            )}
          </div>

          {/* Separator */}
          {index < items.length - 1 && (
            <Icon 
              icon="lucide:chevron-right" 
              width={14} 
              height={14} 
              className="text-slate-600" 
            />
          )}
        </React.Fragment>
      ))}
    </motion.div>
  );
}; 