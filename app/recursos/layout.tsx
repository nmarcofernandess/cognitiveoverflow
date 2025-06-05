"use client";

import { useState, useEffect } from 'react';
import RecursosLogin from '../../components/recursos/RecursosLogin';

export default function RecursosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se já está autenticado
    const auth = sessionStorage.getItem('recursos_auth');
    const timestamp = sessionStorage.getItem('recursos_auth_timestamp');
    
    if (auth === 'followtherabit_validated' && timestamp) {
      // Verificar se não expirou (7 dias)
      const authTime = parseInt(timestamp);
      const now = Date.now();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      
      if (now - authTime < sevenDays) {
        setAuthenticated(true);
      } else {
        // Sessão expirada
        sessionStorage.removeItem('recursos_auth');
        sessionStorage.removeItem('recursos_auth_timestamp');
      }
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 font-mono text-xl">
          LOADING SYSTEM...
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <RecursosLogin onAuth={setAuthenticated} />;
  }

  return <>{children}</>;
} 