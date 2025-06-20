"use client";

import { useState, useEffect } from 'react';
import UnifiedMatrixAuth from '../../components/matrix/UnifiedMatrixAuth';

export default function MatrixLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se já está autenticado com o sistema unificado
    const auth = localStorage.getItem('matrix_global_auth');
    const timestamp = localStorage.getItem('matrix_global_auth_timestamp');
    
    if (auth === 'redpill_validated' && timestamp) {
      // Verificar se não expirou (7 dias)
      const authTime = parseInt(timestamp);
      const now = Date.now();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      
      if (now - authTime < sevenDays) {
        setAuthenticated(true);
      } else {
        // Sessão expirada
        localStorage.removeItem('matrix_global_auth');
        localStorage.removeItem('matrix_global_auth_timestamp');
      }
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 font-mono text-xl animate-pulse">
          MATRIX LOADING...
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <UnifiedMatrixAuth 
        onAuth={setAuthenticated}
        targetRoute="/matrix"
        title="REALITY ENGINE ACCESS"
        subtitle="Enter the Matrix to see how deep the rabbit hole goes"
      />
    );
  }

  return <>{children}</>;
} 