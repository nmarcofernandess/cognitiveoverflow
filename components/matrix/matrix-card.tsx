import React from "react";
import { Card, CardBody, CardHeader, CardFooter, Chip, Badge } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

interface MatrixCardProps {
  title?: string;
  icon?: string;
  color?: "green" | "red" | "purple";
  variant?: "default" | "terminal" | "result";
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const MatrixCard: React.FC<MatrixCardProps> = ({
  title,
  icon,
  color = "green",
  variant = "default",
  headerContent,
  footerContent,
  children,
  className = ""
}) => {
  const colorClass = color === "red" 
    ? "matrix-card-red" 
    : color === "purple" 
      ? "matrix-card-purple" 
      : "";
  
  const badgeClass = color === "red" 
    ? "matrix-badge-red" 
    : color === "purple" 
      ? "matrix-badge-purple" 
      : "matrix-badge";
  
  const textColorClass = color === "red" 
    ? "text-red-400" 
    : color === "purple" 
      ? "text-purple-400" 
      : "text-green-400";

  const renderHeader = () => {
    if (headerContent) return headerContent;
    if (!title) return null;
    
    return (
      <CardHeader className="flex gap-3 items-center">
        {icon && (
          <div className="flex items-center justify-center">
            <Icon icon={icon} className={`${textColorClass} matrix-icon text-2xl`} />
          </div>
        )}
        <div className="flex flex-col">
          <p className={`text-xl font-bold matrix-title ${textColorClass}`}>{title}</p>
        </div>
      </CardHeader>
    );
  };

  if (variant === "terminal") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`matrix-terminal ${className}`}
      >
        <div className="flex items-center gap-2 mb-2">
          <Badge className={badgeClass} size="sm">TERMINAL</Badge>
          {title && <span className={`text-sm ${textColorClass}`}>{title}</span>}
        </div>
        <div className="matrix-code-text">
          {children}
          <span className="matrix-cursor"></span>
        </div>
      </motion.div>
    );
  }

  if (variant === "result") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card 
          className={`matrix-card ${colorClass} ${className}`}
          shadow="none"
          radius="lg"
        >
          <CardBody className="gap-2">
            <div className="flex items-center gap-2 mb-2">
              <Chip
                className={badgeClass}
                size="sm"
                variant="flat"
                startContent={<Icon icon="lucide:terminal" className={textColorClass} />}
              >
                RESULTADO
              </Chip>
            </div>
            <div className={`text-xl font-mono ${textColorClass} matrix-code-text`}>
              {children}
            </div>
          </CardBody>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card 
        className={`matrix-card ${colorClass} ${className}`}
        shadow="none"
        radius="lg"
      >
        {renderHeader()}
        <CardBody>
          {children}
        </CardBody>
        {footerContent && (
          <CardFooter>
            {footerContent}
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};