import React, { useState, ReactNode } from 'react';
import { Icon } from '@iconify/react';

interface TerminalSectionProps {
  title: string;
  icon: string;
  color: 'red' | 'green' | 'purple';
  defaultOpen?: boolean;
  children: ReactNode;
}

export const TerminalSection: React.FC<TerminalSectionProps> = ({
  title,
  icon,
  color = 'green',
  defaultOpen = false,
  children
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const colorClass = `section-${color}`;
  
  return (
    <div className={`terminal-section ${colorClass}`}>
      <div 
        className="section-header" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon 
          icon={icon} 
          className="section-icon" 
          width={28} 
          height={28}
        />
        <div className="section-title">
          {title}
        </div>
        <Icon 
          icon={isOpen ? 'lucide:chevron-down' : 'lucide:chevron-right'} 
          width={24}
          height={24}
          className="section-icon"
        />
      </div>
      
      {isOpen && (
        <div className="section-body">
          {children}
        </div>
      )}
    </div>
  );
};

interface TerminalCardProps {
  title?: string;
  color?: 'red' | 'green' | 'purple';
  className?: string;
  children: ReactNode;
}

export const TerminalCard: React.FC<TerminalCardProps> = ({
  title,
  color = 'green',
  className = '',
  children
}) => {
  const colorClass = color !== 'green' ? `card-${color}` : '';
  
  return (
    <div className={`terminal-card ${colorClass} ${className}`}>
      {title && <div className="card-title">{title}</div>}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

interface TerminalOutputProps {
  color?: 'red' | 'green' | 'purple';
  showCursor?: boolean;
  className?: string;
  children: ReactNode;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({
  color = 'green',
  showCursor = false,
  className = '',
  children
}) => {
  const colorClass = color !== 'green' ? color : '';
  
  return (
    <div className={`terminal-output ${colorClass} ${className}`}>
      {children}
      {showCursor && <span className="terminal-cursor"></span>}
    </div>
  );
};

interface IconBadgeProps {
  icon: string;
  color?: 'red' | 'green' | 'purple';
}

export const IconBadge: React.FC<IconBadgeProps> = ({
  icon,
  color = 'green'
}) => {
  const colorClass = color !== 'green' ? `badge-${color}` : '';
  
  return (
    <span className={`icon-badge ${colorClass}`}>
      <Icon icon={icon} width={16} height={16} />
    </span>
  );
};