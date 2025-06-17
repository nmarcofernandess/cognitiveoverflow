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

  // 🔥 Claude.ai Integration State
  const [claudeToken, setClaudeToken] = useState<string>('');
  const [claudeGenerating, setClaudeGenerating] = useState(false);
  const [claudeError, setClaudeError] = useState<string>('');
  const [autoCopied, setAutoCopied] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const generateClaudeLink = async () => {
    setClaudeGenerating(true);
    setClaudeError('');
    setAutoCopied(false);
    
    try {
      const response = await fetch('/api/mcp/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: 'neural_access_2024' })
      });

      if (!response.ok) {
        throw new Error('Failed to generate token');
      }

      const data = await response.json();
      const manifestUrl = `https://cognitiveoverflow.vercel.app/api/mcp/manifest?token=${data.token}`;
      setClaudeToken(manifestUrl);
      
      // Try to copy to clipboard (optional)
      try {
        await navigator.clipboard.writeText(manifestUrl);
        setAutoCopied(true);
      } catch (clipboardError) {
        console.log('Auto-copy failed, manual copy available');
        setAutoCopied(false);
      }
      
    } catch (error) {
      setClaudeError('Erro ao gerar token. Tente novamente.');
      console.error('Error generating Claude token:', error);
    } finally {
      setClaudeGenerating(false);
    }
  };

  const copyClaudeLink = async () => {
    if (claudeToken) {
      try {
        await navigator.clipboard.writeText(claudeToken);
        setAutoCopied(true);
        setShowCopySuccess(true);
        
        // Reset feedback after 2 seconds
        setTimeout(() => {
          setShowCopySuccess(false);
        }, 2000);
        
      } catch (error) {
        // Fallback: Seleção manual
        const input = document.querySelector('input[readonly]') as HTMLInputElement;
        if (input) {
          input.select();
          input.setSelectionRange(0, 99999); // Para mobile
          try {
            document.execCommand('copy');
            setAutoCopied(true);
            setShowCopySuccess(true);
            setTimeout(() => {
              setShowCopySuccess(false);
            }, 2000);
          } catch (e) {
            console.log('Clipboard not available, manual copy required');
          }
        }
      }
    }
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

      {/* Claude.ai Integration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="w-full bg-gradient-to-r from-indigo-900/40 to-purple-900/40 backdrop-blur-sm border border-indigo-400/30">
          <CardBody className="p-8">
            <h3 className="text-2xl font-bold mb-6 text-indigo-300 font-mono flex items-center gap-3">
              <Icon icon="lucide:bot" width={24} height={24} />
              Claude.ai Integration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-slate-300 font-mono text-sm mb-4">
                  Gere um link personalizado para conectar o Neural System ao Claude.ai web.
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={generateClaudeLink}
                    isLoading={claudeGenerating}
                    className="bg-indigo-600/80 border border-indigo-400/50 text-white hover:bg-indigo-600/90 font-mono w-full"
                  >
                    {claudeGenerating ? (
                      <>
                        <Icon icon="lucide:loader-2" width={16} height={16} className="animate-spin" />
                        Gerando Token...
                      </>
                    ) : (
                      <>
                        <Icon icon="lucide:zap" width={16} height={16} />
                        Gerar Link Claude.ai
                      </>
                    )}
                  </Button>
                  
                  {claudeError && (
                    <p className="text-red-400 text-xs font-mono">{claudeError}</p>
                  )}
                </div>
              </div>
              
              <div>
                {claudeToken ? (
                  <div className="space-y-3">
                                         <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50">
                       <p className="text-emerald-400 font-mono text-xs mb-2">
                         ✅ Link gerado{autoCopied ? ' e copiado!' : '!'}
                       </p>
                       {!autoCopied && (
                         <p className="text-yellow-400 font-mono text-xs mb-2">
                           ⚠️ Use o botão copy para copiar manualmente
                         </p>
                       )}
                      <div className="flex items-center gap-2">
                        <input
                          value={claudeToken}
                          readOnly
                          className="bg-slate-800/60 border border-slate-600/40 text-slate-300 font-mono text-xs px-3 py-2 rounded flex-1 focus:outline-none focus:border-indigo-400/60"
                        />
                                                 <Button
                           onClick={copyClaudeLink}
                           size="sm"
                           className={`${showCopySuccess 
                             ? 'bg-emerald-600/60 border-emerald-400/40 text-emerald-300' 
                             : 'bg-slate-700/60 border border-slate-600/40 text-slate-300 hover:bg-slate-600/60'
                           }`}
                         >
                           <Icon 
                             icon={showCopySuccess ? "lucide:check" : "lucide:copy"} 
                             width={14} 
                             height={14} 
                           />
                         </Button>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 font-mono space-y-1">
                      <p>• Cole no Claude.ai: Settings → Integrations</p>
                      <p>• Token válido por 7 dias</p>
                      <p>• Acesso completo ao Neural System</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50">
                    <div className="text-slate-400 font-mono text-sm space-y-2">
                      <p className="flex items-center gap-2">
                        <Icon icon="lucide:info" width={16} height={16} />
                        Como usar:
                      </p>
                      <div className="text-xs space-y-1 pl-5">
                        <p>1. Clique em "Gerar Link"</p>
                        <p>2. Link será copiado automaticamente</p>
                        <p>3. Cole no Claude.ai web</p>
                        <p>4. Neural System conectado! 🧠</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Neural Manifest */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
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
        transition={{ delay: 0.4 }}
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
        transition={{ delay: 0.5 }}
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