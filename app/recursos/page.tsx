"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from '../../lib/supabase';

// Neural System Components  
import OverviewTab from '../../components/neural/OverviewTab';
import PeopleTab from '../../components/neural/PeopleTab';
import ProjectsTab from '../../components/neural/ProjectsTab';

export default function NeuralSystemPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem('recursos_auth');
    sessionStorage.removeItem('recursos_auth_timestamp');
    window.location.href = '/recursos';
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

          <Button
            onClick={handleLogout}
            size="lg"
            className="bg-red-900/20 backdrop-blur border border-red-500/30 text-red-400 hover:bg-red-900/30 hover:border-red-400/50 font-mono font-medium transition-all"
          >
            <Icon icon="lucide:log-out" width={18} height={18} />
            LOGOUT
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="relative z-10 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 py-4">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-lg font-mono font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-slate-800/60 border border-emerald-400/40 text-emerald-400 shadow-emerald-400/10 shadow-lg'
                    : 'hover:bg-slate-800/30 text-slate-300 hover:text-slate-100 border border-transparent'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon 
                  icon={tab.icon} 
                  width={20} 
                  height={20} 
                  className={activeTab === tab.id ? 'text-emerald-400' : tab.color}
                />
                <div className="text-left">
                  <div className="text-sm font-bold">{tab.label}</div>
                  <div className="text-xs opacity-70">{tab.description}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="relative z-10 max-w-7xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <OverviewTab />
            </motion.div>
          )}
          
          {activeTab === 'people' && (
            <motion.div
              key="people"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PeopleTab />
            </motion.div>
          )}
          
          {activeTab === 'projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ProjectsTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Status */}
      <div className="relative z-10 border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center text-xs">
            <div className="text-slate-500 font-mono">
              Marco Neural System v2.0 • Cognitive Overflow Integration
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-emerald-400 font-mono">
                <Icon icon="lucide:wifi" width={14} height={14} />
                Supabase Connected
              </div>
              <div className="text-slate-500 font-mono">
                Last sync: {new Date().toLocaleTimeString('pt-BR')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 