import { useState, useCallback } from 'react';

interface Project {
  id: string;
  name: string;
  tldr?: string;
  created_at: string;
  updated_at?: string;
}

interface Person {
  id: string;
  name: string;
  relation: string;
  tldr?: string;
  created_at: string;
  updated_at?: string;
  notes_count: number;
}

interface NeuralStats {
  people_count: number;
  projects_count: number;
  sprints_count: number;
  tasks_count: number;
  notes_count: number;
  last_updated: string;
}

export function useNeuralData() {
  const [stats, setStats] = useState<NeuralStats>({
    people_count: 0,
    projects_count: 0,
    sprints_count: 0,
    tasks_count: 0,
    notes_count: 0,
    last_updated: new Date().toISOString()
  });

  // Notifica quando projeto é criado/atualizado
  const notifyProjectChange = useCallback(() => {
    setStats(prev => ({
      ...prev,
      projects_count: prev.projects_count + 1,
      last_updated: new Date().toISOString()
    }));
  }, []);

  // Notifica quando pessoa é criada/atualizada  
  const notifyPersonChange = useCallback(() => {
    setStats(prev => ({
      ...prev,
      people_count: prev.people_count + 1,
      last_updated: new Date().toISOString()
    }));
  }, []);

  // Notifica quando sprint é criado/atualizado
  const notifySprintChange = useCallback(() => {
    setStats(prev => ({
      ...prev,
      sprints_count: prev.sprints_count + 1,
      last_updated: new Date().toISOString()
    }));
  }, []);

  // Notifica quando persona IA é atualizada
  const notifyPersonaChange = useCallback(() => {
    setStats(prev => ({
      ...prev,
      last_updated: new Date().toISOString()
    }));
  }, []);

  // Atualiza stats completas (para Overview)
  const updateStats = useCallback((newStats: Partial<NeuralStats>) => {
    setStats(prev => ({
      ...prev,
      ...newStats,
      last_updated: new Date().toISOString()
    }));
  }, []);

  // Força reload de todas as tabs
  const reloadAllData = useCallback(() => {
    setStats(prev => ({
      ...prev,
      last_updated: new Date().toISOString()
    }));
  }, []);

  return {
    stats,
    notifyProjectChange,
    notifyPersonChange,
    notifySprintChange,
    notifyPersonaChange,
    updateStats,
    reloadAllData
  };
} 