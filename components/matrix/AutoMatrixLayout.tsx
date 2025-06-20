"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import UnifiedMatrixAuth from './UnifiedMatrixAuth';
import { getProjectById } from '../../config/projects';

interface AutoMatrixLayoutProps {
  children: React.ReactNode;
}

export default function AutoMatrixLayout({ children }: AutoMatrixLayoutProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // Extrair ID do projeto da rota (ex: "/matrix" -> "matrix", "/neural" -> "neural-system")
  const routeToProjectMap: { [key: string]: string } = {
    'neural': 'neural-system',
    'matrix': 'matrix',
    'marco': 'marco',
    'tokenflow': 'tokenflow',
    'comic-builder': 'comic-builder',
    'apatia': 'apatia'
  };
  
  const routeName = pathname.slice(1);
  const projectId = routeToProjectMap[routeName] || routeName;
  const project = getProjectById(projectId);

  useEffect(() => {
    // Se o projeto não existe ou não é protegido, libera acesso
    if (!project || !project.protected) {
      setAuthenticated(true);
      setLoading(false);
      return;
    }

    // Verificar auth para projetos protegidos
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
  }, [project, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 font-mono text-xl animate-pulse">
          MATRIX LOADING...
        </div>
      </div>
    );
  }

  // Se não está autenticado E o projeto é protegido
  if (!authenticated && project?.protected) {
    return (
      <UnifiedMatrixAuth 
        onAuth={setAuthenticated}
        targetRoute={project.path}
        title={project.authConfig?.title || `${project.title} ACCESS`}
        subtitle={project.authConfig?.subtitle || `Enter the Matrix to access ${project.title}`}
      />
    );
  }

  return <>{children}</>;
} 