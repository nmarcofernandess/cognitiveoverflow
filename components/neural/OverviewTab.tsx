"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Icon } from '@iconify/react';
import { motion } from "framer-motion";
import { overviewQueries, customQueries, PersonSummary, ProjectSummary, OverviewStats, CustomInstructions, Memory } from '../../lib/supabase';
import { useNeuralContext } from './context/NeuralContext';
import { supabase } from '../../lib/supabase';

interface ManifestData {
  ai_config: {
    primary_user: string;
    persona: string;
    memory_count: number;
  };
  mcp_instructions: string;
  people: PersonSummary[];
  projects: ProjectSummary[];
  stats: OverviewStats;
  last_sync: string;
  marcoData?: { name: string; tldr?: string; };
  memorySummary: Pick<Memory, 'id' | 'title' | 'tags' | 'created_at'>[];
}

export default function OverviewTab({ onTabChange }: { onTabChange?: (tabId: string) => void }) {
  const { stats: contextStats } = useNeuralContext();
  const [manifest, setManifest] = useState<ManifestData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadManifest();
  }, []);

  // 🔥 Reagir às mudanças do contexto
  useEffect(() => {
    if (contextStats.last_updated) {
      loadManifest();
    }
  }, [contextStats.last_updated]);

  const loadManifest = async () => {
    setLoading(true);
    try {
      // 🎯 Use optimized queries for Overview (no tldr)
      const [peopleData, projectsData, statsData, customInstructions, memoryCount, memorySummary] = await Promise.all([
        overviewQueries.getPeopleSummary(10),
        overviewQueries.getProjectsSummary(10), 
        overviewQueries.getOverviewStats(),
        customQueries.getCustomInstructions(),
        customQueries.getMemoryCount(),
        customQueries.getMemorySummary(10)
      ]);

      // 🔥 Buscar Marco especificamente (primary user)
      const { data: marcoData } = await supabase
        .from('people')
        .select('name, tldr')
        .eq('is_primary_user', true)
        .single();

      const manifest: ManifestData = {
        ai_config: {
          primary_user: marcoData?.name || "Marco Fernandes",
          persona: customInstructions?.behavior_description || "CEO DietFlow, rebelde intelectual",
          memory_count: memoryCount
        },
        mcp_instructions: customInstructions?.mcp_context_instructions || "Sistema de conhecimento pessoal Neural",
        people: peopleData,
        projects: projectsData,
        stats: statsData,
        last_sync: new Date().toISOString(),
        marcoData: marcoData || undefined,
        memorySummary: memorySummary
      };

      setManifest(manifest);
    } catch (error) {
      console.error('Erro ao carregar manifesto:', error);
              setManifest({
          ai_config: {
            primary_user: "Marco Fernandes",
            persona: "Rebelde intelectual, CEO/fundador DietFlow",
            memory_count: 0
          },
          mcp_instructions: "Sistema de conhecimento pessoal Neural",
          people: [],
          projects: [],
          stats: { people: 0, projects: 0, sprints: 0, tasks: 0 },
          last_sync: new Date().toISOString(),
          memorySummary: []
        });
    } finally {
      setLoading(false);
    }
  };

  const exportManifest = () => {
    if (!manifest) return;
    
    const dataStr = JSON.stringify(manifest, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'marco-neural-manifest.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const [showCopySuccess, setShowCopySuccess] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div 
          className="text-emerald-400 font-mono text-xl flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Icon icon="lucide:brain" className="animate-pulse" width={24} height={24} />
          LOADING NEURAL MANIFEST...
        </motion.div>
      </div>
    );
  }

  if (!manifest) {
    return (
      <div className="text-center py-12">
        <Icon icon="lucide:alert-triangle" width={48} height={48} className="mx-auto mb-4 text-red-400" />
        <p className="text-red-400 font-mono">Erro ao carregar manifesto neural</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <motion.h2 
          className="text-4xl font-bold text-emerald-400 font-mono"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          🧠 NEURAL OVERVIEW
        </motion.h2>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              const mcpUrl = "https://cognitiveoverflow.vercel.app/api/mcp";
              navigator.clipboard.writeText(mcpUrl);
              setShowCopySuccess(true);
              setTimeout(() => setShowCopySuccess(false), 2000);
            }}
            className={`${showCopySuccess 
              ? 'bg-emerald-600/20 border border-emerald-400/30 text-emerald-400' 
              : 'bg-indigo-600/20 border border-indigo-400/30 text-indigo-400 hover:bg-indigo-600/30'
            } font-mono`}
          >
            <Icon icon={showCopySuccess ? "lucide:check" : "lucide:link"} width={16} height={16} />
            {showCopySuccess ? 'Copied!' : 'Copy MCP URL'}
          </Button>
          
          <Button
            onClick={exportManifest}
            className="bg-cyan-600/20 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-600/30 font-mono"
          >
            <Icon icon="lucide:download" width={16} height={16} />
            Export Manifest
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gray-900/50 border border-gray-700/50">
          <CardBody className="text-center py-6">
            <Icon icon="lucide:users" width={32} height={32} className="mx-auto mb-2 text-blue-400" />
            <p className="text-2xl font-bold text-blue-400 font-mono">{manifest.stats.people}</p>
            <p className="text-gray-400 text-sm font-mono">PEOPLE</p>
          </CardBody>
        </Card>
        
        <Card className="bg-gray-900/50 border border-gray-700/50">
          <CardBody className="text-center py-6">
            <Icon icon="lucide:folder" width={32} height={32} className="mx-auto mb-2 text-green-400" />
            <p className="text-2xl font-bold text-green-400 font-mono">{manifest.stats.projects}</p>
            <p className="text-gray-400 text-sm font-mono">PROJECTS</p>
          </CardBody>
        </Card>
        
        <Card className="bg-gray-900/50 border border-gray-700/50">
          <CardBody className="text-center py-6">
            <Icon icon="lucide:zap" width={32} height={32} className="mx-auto mb-2 text-yellow-400" />
            <p className="text-2xl font-bold text-yellow-400 font-mono">{manifest.stats.sprints}</p>
            <p className="text-gray-400 text-sm font-mono">SPRINTS</p>
          </CardBody>
        </Card>
        
        <Card className="bg-gray-900/50 border border-gray-700/50">
          <CardBody className="text-center py-6">
            <Icon icon="lucide:check-square" width={32} height={32} className="mx-auto mb-2 text-purple-400" />
            <p className="text-2xl font-bold text-purple-400 font-mono">{manifest.stats.tasks}</p>
            <p className="text-gray-400 text-sm font-mono">TASKS</p>
          </CardBody>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* People Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gray-900/50 border border-gray-700/50 h-full">
            <CardBody className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-blue-400 font-mono flex items-center gap-2">
                  <Icon icon="lucide:users" width={20} height={20} />
                  PEOPLE NETWORK
                </h3>
                <Button
                  size="sm"
                  onClick={() => onTabChange?.('people')}
                  className="bg-blue-600/20 border border-blue-400/30 text-blue-400 hover:bg-blue-600/30 font-mono"
                >
                  <Icon icon="lucide:arrow-right" width={14} height={14} />
                  View All
                </Button>
              </div>
              
              <div className="space-y-3">
                {manifest.people.length > 0 ? (
                  manifest.people.map((person, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/30"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                    >
                      <div>
                        <p className="font-semibold text-white font-mono">{person.name}</p>
                        <p className="text-sm text-gray-400 font-mono">{person.relation}</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-6 font-mono">No people found</p>
                )}
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Projects Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gray-900/50 border border-gray-700/50 h-full">
            <CardBody className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-green-400 font-mono flex items-center gap-2">
                  <Icon icon="lucide:folder" width={20} height={20} />
                  ACTIVE PROJECTS
                </h3>
                <Button
                  size="sm"
                  onClick={() => onTabChange?.('projects')}
                  className="bg-green-600/20 border border-green-400/30 text-green-400 hover:bg-green-600/30 font-mono"
                >
                  <Icon icon="lucide:arrow-right" width={14} height={14} />
                  View All
                </Button>
              </div>
              
              <div className="space-y-3">
                {manifest.projects.length > 0 ? (
                  manifest.projects.map((project, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/30"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                    >
                      <div>
                        <p className="font-semibold text-white font-mono">{project.name}</p>
                        <p className="text-sm text-gray-400 font-mono">{project.sprint_count} sprints</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-6 font-mono">No projects found</p>
                )}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Custom Instructions & Memory System */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {/* Custom Instructions Section */}
        <Card className="bg-gray-900/50 border border-gray-700/50">
          <CardBody className="p-6">
            <h3 className="text-xl font-bold text-emerald-400 font-mono flex items-center gap-2 mb-6">
              <Icon icon="lucide:brain" width={20} height={20} />
              CUSTOM INSTRUCTIONS
            </h3>
            
            {/* Primary User */}
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-400 font-mono">PRIMARY USER</p>
                <p className="text-white font-mono">{manifest.ai_config.primary_user}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 font-mono">USER TL;DR</p>
                <p className="text-gray-300 font-mono text-sm">{manifest.marcoData?.tldr || "CEO DietFlow, rebelde intelectual"}</p>
              </div>
            </div>

            {/* AI Behavior */}
            <div className="space-y-4 mb-6 p-4 bg-purple-950/20 rounded-lg border border-purple-400/20">
              <div>
                <p className="text-sm text-purple-400 font-mono mb-2">AI BEHAVIOR</p>
                <p className="text-gray-300 font-mono text-xs leading-relaxed">
                  {manifest.ai_config.persona.substring(0, 200)}...
                </p>
              </div>
            </div>

            {/* MCP Context */}
            <div className="space-y-4 p-4 bg-cyan-950/20 rounded-lg border border-cyan-400/20">
              <div>
                <p className="text-sm text-cyan-400 font-mono mb-2">MCP CONTEXT</p>
                <p className="text-gray-300 font-mono text-xs leading-relaxed">
                  {manifest.mcp_instructions}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Memory System Section */}
        <Card className="bg-gray-900/50 border border-gray-700/50">
          <CardBody className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-green-400 font-mono flex items-center gap-2">
                <Icon icon="lucide:database" width={20} height={20} />
                MEMORY SYSTEM
              </h3>
              <Button
                size="sm"
                onClick={() => onTabChange?.('custom-instructions')}
                className="bg-green-600/20 border border-green-400/30 text-green-400 hover:bg-green-600/30 font-mono"
              >
                <Icon icon="lucide:settings" width={14} height={14} />
                Manage
              </Button>
            </div>
            
            {/* Memory Stats */}
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/30 text-center mb-6">
              <p className="text-3xl font-bold text-green-400 font-mono">{manifest.ai_config.memory_count}</p>
              <p className="text-green-400 text-sm font-mono">Total Memories</p>
              <p className="text-xs text-gray-400 font-mono">Available on demand</p>
            </div>

            {/* Memory List */}
            <div className="space-y-3">
              <p className="text-sm text-gray-400 font-mono mb-3">RECENT MEMORIES</p>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {manifest.memorySummary.length > 0 ? (
                  manifest.memorySummary.map((memory, index) => (
                    <motion.div
                      key={memory.id}
                      className="p-3 bg-green-950/20 rounded-lg border border-green-400/20"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                    >
                      <h4 className="font-semibold text-green-400 font-mono text-sm">{memory.title}</h4>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-green-400 font-mono">
                          {new Date(memory.created_at || Date.now()).toLocaleDateString('pt-BR')}
                        </span>
                        {memory.tags && memory.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {memory.tags.slice(0, 2).map((tag, tagIndex) => (
                              <Chip 
                                key={tagIndex}
                                size="sm" 
                                className="text-xs bg-gray-700/50 text-gray-300"
                              >
                                {tag}
                              </Chip>
                            ))}
                            {memory.tags.length > 2 && (
                              <span className="text-xs text-gray-500">+{memory.tags.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-6 font-mono text-sm">No memories found</p>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>
      
      {/* Sync Status */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-xs text-emerald-400 font-mono">
          ✅ Neural Manifest Synced - {new Date(manifest.last_sync).toLocaleString('pt-BR')}
        </p>
      </motion.div>
    </div>
  );
} 