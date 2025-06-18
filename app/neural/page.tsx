"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from '../../lib/supabase';
import MatrixLogoutButton from '../../components/matrix/MatrixLogoutButton';

// Neural System Components  
import { OverviewTab, PeopleTab, ProjectsTab } from '../../components/neural';
import CustomInstructionsTab from '../../components/neural/CustomInstructionsTab';
import { NeuralProvider } from '../../components/neural/context/NeuralContext';

export default function NeuralSystemPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    
    // Dispatch custom events to reset navigation in tabs
    if (newTab === 'people') {
      window.dispatchEvent(new CustomEvent('tab-changed-to-people'));
    } else if (newTab === 'projects') {
      window.dispatchEvent(new CustomEvent('tab-changed-to-projects'));
    }
  };

  const tabs = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: 'lucide:brain',
      color: 'text-emerald-400',
      description: 'Manifesto MCP + AI Config'
    },
    { 
      id: 'people', 
      label: 'People', 
      icon: 'lucide:users',
      color: 'text-blue-400',
      description: 'Pessoas + Relacionamentos + Notes'
    },
    { 
      id: 'projects', 
      label: 'Projects', 
      icon: 'lucide:rocket',
      color: 'text-purple-400',
      description: 'Sprints + Tasks + Project Notes'
    },
    { 
      id: 'custom-instructions', 
      label: 'Custom Instructions', 
      icon: 'lucide:bot',
      color: 'text-orange-400',
      description: 'Comportamento IA + Instruções MCP + Memória'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
      {/* Subtle Matrix Rain Background */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHRleHQgeD0iNSIgeT0iMTUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiMwMGZmMDAiPjE8L3RleHQ+Cjwvc3ZnPgo=')] animate-pulse"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center px-6 py-6 border-b border-slate-800/50 backdrop-blur-sm">
        <Button
          onClick={() => window.location.href = '/'}
          size="lg"
          className="bg-gray-900/80 dark:bg-slate-800/50 backdrop-blur border border-gray-700 dark:border-slate-700/50 text-gray-100 dark:text-slate-300 hover:text-emerald-300 hover:border-emerald-400/30 font-mono font-medium transition-all shadow-lg"
        >
          <Icon icon="lucide:arrow-left" width={18} height={18} />
          COGNITIVE OVERFLOW
        </Button>

        <div className="flex items-center gap-4">
          <motion.div 
            className="text-emerald-400 font-mono text-lg font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            🧠 MARCO NEURAL SYSTEM v2.0
          </motion.div>

          <MatrixLogoutButton redirectTo="/neural" />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="relative z-10 px-6 py-4 border-b border-slate-800/30">
        <div className="flex gap-2 justify-center max-w-4xl mx-auto">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                px-6 py-3 rounded-lg font-mono font-medium transition-all duration-300 min-w-[140px]
                flex items-center justify-center gap-2 backdrop-blur-sm
                ${activeTab === tab.id 
                  ? `bg-slate-700/60 ${tab.color} border border-slate-600` 
                  : 'bg-slate-800/40 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300 border border-slate-700/50'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon icon={tab.icon} width={18} height={18} />
              <span className="hidden sm:inline">{tab.label}</span>
            </motion.button>
          ))}
        </div>
        
        {/* Tab Description */}
        <div className="text-center mt-3">
          <p className="text-slate-400 font-mono text-sm">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <NeuralProvider>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="min-h-[600px]"
              >
                {activeTab === 'overview' && <OverviewTab onTabChange={handleTabChange} />}
                {activeTab === 'people' && <PeopleTab onTabChange={handleTabChange} />}
                {activeTab === 'projects' && <ProjectsTab onTabChange={handleTabChange} />}
                {activeTab === 'custom-instructions' && <CustomInstructionsTab onTabChange={handleTabChange} />}
              </motion.div>
            </AnimatePresence>
          </NeuralProvider>
        </div>
      </div>
    </div>
  );
} 