import React, { ReactNode } from "react";
import { motion } from "framer-motion";

interface DataCardProps {
  title: string;
  children: ReactNode;
  type?: "default" | "kpi" | "list" | "chart";
  value?: string;
  className?: string;
}

export const DataCard: React.FC<DataCardProps> = ({ 
  title, 
  children, 
  type = "default",
  value,
  className = ""
}) => {
  if (type === "kpi") {
    return (
      <motion.div 
        className={`data-card kpi-card ${className}`}
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.2 }}
      >
        <div className="kpi-value">{value}</div>
        <h3 className="kpi-title">{title}</h3>
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      className={`data-card ${type}-card ${className}`}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <h3 className="card-title">{title}</h3>
      <div className="card-content">
        {children}
      </div>
    </motion.div>
  );
};