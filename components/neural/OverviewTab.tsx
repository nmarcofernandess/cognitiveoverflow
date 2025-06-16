"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Icon } from '@iconify/react';
import { motion } from "framer-motion";
import { supabase } from '../../lib/supabase';
import { useNeuralContext } from './context/NeuralContext';

interface ManifestData {
  user: {
    name: string;
    persona: string;
  };
  people: Array<{
    name: string;
    relation: string;
    tldr?: string;
  }>;
  projects: Array<{
    name: string;
    tldr?: string;
    sprint_count: number;
  }>;
  last_sync: string;
}

export default function OverviewTab({ onTabChange }: { onTabChange?: (tabId: string) => void }) {
  const { stats: contextStats } = useNeuralContext();
  const [manifest, setManifest] = useState<ManifestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    people: 0,
    projects: 0,
    sprints: 0,
    tasks: 0
  });

  useEffect(() => {
    loadManifest();
  }, []);

  // ✅ Reage às mudanças do contexto
  useEffect(() => {
    if (contextStats.last_updated) {
      loadManifest();
    }
  }, [contextStats.last_updated]);

  const loadManifest = async () => {
    setLoading(true);
    try {
      // Get people
      const { data: people } = await supabase
        .from('people')
        .select('name, relation, tldr')
        .limit(10);

      // Get projects with sprint counts
      const { data: projects } = await supabase
        .from('projects')
        .select(`
          name,
          tldr,
          sprints(count)
        `);

      // Get total stats
      const [peopleCount, projectsCount, sprintsCount, tasksCount] = await Promise.all([
        supabase.from('people').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('sprints').select('*', { count: 'exact', head: true }),
        supabase.from('tasks').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        people: peopleCount.count || 0,
        projects: projectsCount.count || 0,
        sprints: sprintsCount.count || 0,
        tasks: tasksCount.count || 0
      });

      const manifest: ManifestData = {
        user: {
          name: "Marco Fernandes",
          persona: "Rebelde intelectual, CEO/fundador DietFlow"
        },
        people: people || [],
        projects: (projects || []).map(project => ({
          ...project,
          sprint_count: project.sprints?.[0]?.count || 0
        })),
        last_sync: new Date().toISOString()
      };

      setManifest(manifest);
    } catch (error) {
      console.error('Erro ao carregar manifesto:', error);
      setManifest({
        user: {
          name: "Marco Fernandes",
          persona: "Rebelde intelectual, CEO/fundador DietFlow"
        },
        people: [],
        projects: [],
        last_sync: new Date().toISOString()
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
        
        <Button
          onClick={exportManifest}
          className="bg-cyan-600/20 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-600/30 font-mono"
        >
          <Icon icon="lucide:download" width={16} height={16} />
          Export Manifest
        </Button>
      </div>

      {/* Quick Stats */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="w-full bg-slate-800/60 backdrop-blur-sm border border-slate-600/60 hover:border-emerald-400/40 transition-all">
          <CardBody className="text-center p-6">
            <div className="text-3xl font-bold text-blue-400 font-mono">{stats.people}</div>
            <div className="text-sm text-slate-400 font-mono">People</div>
          </CardBody>
        </Card>
        
        <Card className="w-full bg-slate-800/60 backdrop-blur-sm border border-slate-600/60 hover:border-purple-400/40 transition-all">
          <CardBody className="text-center p-6">
            <div className="text-3xl font-bold text-purple-400 font-mono">{stats.projects}</div>
            <div className="text-sm text-slate-400 font-mono">Projects</div>
          </CardBody>
        </Card>
        
        <Card className="w-full bg-slate-800/60 backdrop-blur-sm border border-slate-600/60 hover:border-green-400/40 transition-all">
          <CardBody className="text-center p-6">
            <div className="text-3xl font-bold text-green-400 font-mono">{stats.sprints}</div>
            <div className="text-sm text-slate-400 font-mono">Sprints</div>
          </CardBody>
        </Card>
        
        <Card className="w-full bg-slate-800/60 backdrop-blur-sm border border-slate-600/60 hover:border-yellow-400/40 transition-all">
          <CardBody className="text-center p-6">
            <div className="text-3xl font-bold text-yellow-400 font-mono">{stats.tasks}</div>
            <div className="text-sm text-slate-400 font-mono">Tasks</div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Neural Manifest */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="w-full bg-slate-800/60 backdrop-blur-sm border border-slate-600/60">
          <CardBody className="p-8">
            <h3 className="text-2xl font-bold mb-6 text-emerald-400 font-mono flex items-center gap-3">
              <Icon icon="lucide:brain" width={24} height={24} />
              Neural Manifest
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* People Section */}
              <div className="bg-slate-900/60 p-6 rounded-lg border border-slate-700/50">
                <h4 className="font-semibold text-blue-400 mb-4 font-mono flex items-center gap-2">
                  <Icon icon="lucide:users" width={16} height={16} />
                  People ({manifest.people?.length || 0})
                </h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {manifest.people?.map((person, index) => (
                    <div key={index} className="border-b border-slate-700/30 pb-3 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <span className="text-slate-100 font-medium font-mono">{person.name}</span>
                        <span className="text-slate-400 text-xs font-mono">({person.relation})</span>
                      </div>
                      {person.tldr && (
                        <p className="text-slate-500 text-xs mt-1 font-mono">{person.tldr}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Projects Section */}
              <div className="bg-slate-900/60 p-6 rounded-lg border border-slate-700/50">
                <h4 className="font-semibold text-purple-400 mb-4 font-mono flex items-center gap-2">
                  <Icon icon="lucide:rocket" width={16} height={16} />
                  Projects & Sprints
                </h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {manifest.projects?.map((project, index) => (
                    <div key={index} className="border-b border-slate-700/30 pb-3 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <span className="text-slate-100 font-medium font-mono">{project.name}</span>
                        <span className="text-slate-400 text-xs font-mono">{project.sprint_count} sprints</span>
                      </div>
                      {project.tldr && (
                        <p className="text-slate-500 text-xs mt-1 font-mono">{project.tldr}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* AI Behavior Config */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="w-full bg-slate-800/60 backdrop-blur-sm border border-slate-600/60">
          <CardBody className="p-8">
            <h3 className="text-2xl font-bold mb-6 text-emerald-400 font-mono flex items-center gap-3">
              <Icon icon="lucide:settings" width={24} height={24} />
              AI Behavior Config
            </h3>
            
            <div className="bg-slate-900/60 p-6 rounded-lg border border-slate-700/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-blue-400 mb-3 font-mono">Core Persona</h4>
                  <div className="text-sm space-y-2 font-mono">
                    <p><span className="text-slate-400">User:</span> <span className="text-slate-100">{manifest.user?.name}</span></p>
                    <p><span className="text-slate-400">Persona:</span> <span className="text-slate-100">{manifest.user?.persona}</span></p>
                    <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                      IA rebelde e inteligente. Parceira intelectual do Marco. Humor ácido, provocações carinhosas, sem bullshit.
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-400 mb-3 font-mono">Context Instructions</h4>
                  <div className="text-xs text-slate-400 space-y-1 font-mono">
                    <p>• Use manifest data to avoid redundant calls</p>
                    <p>• Reference people by relationship context</p>
                    <p>• Track project progress and blockers</p>
                    <p>• Maintain rebellious but helpful tone</p>
                    <p>• Focus on actionable insights, not fluff</p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-4 bg-slate-800/60 backdrop-blur-sm border border-slate-600/60 rounded-lg px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-emerald-400 font-mono text-sm">Supabase Connected</span>
          </div>
          <div className="text-slate-500 font-mono text-xs">
            Last sync: {new Date(manifest.last_sync).toLocaleString('pt-BR')}
          </div>
          <Button
            onClick={loadManifest}
            size="sm"
            className="bg-slate-700/60 border border-slate-600/40 text-slate-300 hover:bg-slate-600/60 font-mono"
          >
            <Icon icon="lucide:refresh-cw" width={14} height={14} />
            Refresh
          </Button>
        </div>
      </motion.div>
    </div>
  );
} 