import React, { ReactNode } from "react";
import { motion } from "framer-motion";

interface DashboardSectionProps {
  title: string;
  children: ReactNode;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({ title, children }) => {
  return (
    <motion.div 
      className="dashboard-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="section-title">{title}</h2>
      <div className="section-content">
        {children}
      </div>
    </motion.div>
  );
};