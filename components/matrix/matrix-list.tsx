import React from "react";
import { Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";

interface MatrixListItemProps {
  icon?: string;
  iconColor?: string;
  tooltip?: string;
  children: React.ReactNode;
}

export const MatrixListItem: React.FC<MatrixListItemProps> = ({
  icon,
  iconColor = "text-red-500",
  tooltip,
  children
}) => {
  const iconElement = icon ? (
    tooltip ? (
      <Tooltip 
        content={tooltip} 
        color="danger"
        className="matrix-tooltip"
      >
        <Icon icon={icon} className={`${iconColor} mt-1 flex-shrink-0 matrix-icon`} width={20} />
      </Tooltip>
    ) : (
      <Icon icon={icon} className={`${iconColor} mt-1 flex-shrink-0 matrix-icon`} width={20} />
    )
  ) : null;

  return (
    <li className="flex items-start gap-2 matrix-list-item">
      {iconElement}
      <span>{children}</span>
    </li>
  );
};

interface MatrixListProps {
  items: {
    icon?: string;
    iconColor?: string;
    tooltip?: string;
    content: React.ReactNode;
  }[];
  className?: string;
}

export const MatrixList: React.FC<MatrixListProps> = ({ items, className = "" }) => {
  return (
    <ul className={`space-y-3 ${className}`}>
      {items.map((item, index) => (
        <MatrixListItem 
          key={index}
          icon={item.icon}
          iconColor={item.iconColor}
          tooltip={item.tooltip}
        >
          {item.content}
        </MatrixListItem>
      ))}
    </ul>
  );
};