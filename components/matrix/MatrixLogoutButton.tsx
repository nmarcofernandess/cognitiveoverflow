"use client";

import React from 'react';
import { Button } from "@heroui/button";
import { Icon } from '@iconify/react';

interface MatrixLogoutButtonProps {
  className?: string;
  redirectTo?: string;
}

export default function MatrixLogoutButton({ 
  className = "",
  redirectTo = "/" 
}: MatrixLogoutButtonProps) {
  const handleLogout = () => {
    // Limpar auth global
    localStorage.removeItem('matrix_global_auth');
    localStorage.removeItem('matrix_global_auth_timestamp');
    
    // Redirecionar para a página especificada
    window.location.href = redirectTo;
  };

  return (
    <Button
      onClick={handleLogout}
      size="lg"
      className={`bg-red-500/20 border border-red-400/50 text-red-400 hover:bg-red-500/30 hover:border-red-400 font-mono backdrop-blur-lg shadow-lg ${className}`}
    >
      <Icon icon="lucide:log-out" width={20} height={20} />
      EXIT MATRIX
    </Button>
  );
} 