"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useNeuralData } from '../hooks/useNeuralData';

interface NeuralStats {
  people_count: number;
  projects_count: number;
  sprints_count: number;
  tasks_count: number;
  notes_count: number;
  last_updated: string;
}

interface NeuralContextType {
  stats: NeuralStats;
  notifyProjectChange: () => void;
  notifyPersonChange: () => void;
  notifySprintChange: () => void;
  updateStats: (newStats: Partial<NeuralStats>) => void;
  reloadAllData: () => void;
}

const NeuralContext = createContext<NeuralContextType | undefined>(undefined);

export function NeuralProvider({ children }: { children: ReactNode }) {
  const neuralData = useNeuralData();

  return (
    <NeuralContext.Provider value={neuralData}>
      {children}
    </NeuralContext.Provider>
  );
}

export function useNeuralContext() {
  const context = useContext(NeuralContext);
  if (context === undefined) {
    throw new Error('useNeuralContext must be used within a NeuralProvider');
  }
  return context;
} 