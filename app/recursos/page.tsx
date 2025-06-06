"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Card, CardBody } from "@heroui/card";
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from "framer-motion";
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

// Simplified Resource type
type SimpleResource = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
};

interface ResourceCardProps {
  resource: SimpleResource;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (resource: SimpleResource) => void;
  onDelete: (id: string) => void;
  onDuplicate: (resource: SimpleResource) => void;
}

function ResourceCard({ resource, isExpanded, onToggle, onUpdate, onDelete, onDuplicate }: ResourceCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(resource.title);
  const [content, setContent] = useState(resource.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Sync content when resource changes (only when ID changes)
  useEffect(() => {
    setContent(resource.content || '');
    setTempTitle(resource.title);
  }, [resource.id]);

  const handleTitleClick = () => {
    setIsEditingTitle(true);
    setTimeout(() => titleInputRef.current?.focus(), 0);
  };

  const handleTitleSubmit = () => {
    if (tempTitle.trim() && tempTitle !== resource.title) {
      onUpdate({
        ...resource,
        title: tempTitle.trim(),
        updated_at: new Date().toISOString()
      });
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setTempTitle(resource.title);
      setIsEditingTitle(false);
    }
  };

  const handleSave = async () => {
    if (content === (resource.content || '')) return;
    
    setIsSaving(true);
    
    try {
      onUpdate({
        ...resource,
        content: content,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasUnsavedChanges = content !== (resource.content || '');

  const getRelativeTime = (dateString: string) => {
    try {
      const now = new Date();
      const date = new Date(dateString);
      const diffInMs = now.getTime() - date.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);
      
      if (diffInMinutes < 1) return 'agora';
      if (diffInMinutes < 60) return `${diffInMinutes}m`;
      if (diffInHours < 24) return `${diffInHours}h`;
      if (diffInDays < 30) return `${diffInDays}d`;
      return date.toLocaleDateString('pt-BR');
    } catch {
      return 'agora';
    }
  };

  return (
    <div className="group">
      <Card className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/60 hover:border-emerald-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-400/10">
        <CardBody className="p-0">
          {/* Header sempre visível */}
          <div className="flex items-center gap-4 p-4">
            <div className="flex-1 min-w-0">
              {isEditingTitle ? (
                <input
                  ref={titleInputRef}
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={handleTitleKeyDown}
                  className="text-lg font-medium text-slate-100 font-mono bg-transparent border-0 outline-none w-full border-b border-emerald-400/50 pb-1 focus:border-emerald-400"
                />
              ) : (
                <div 
                  onClick={handleTitleClick}
                  className="text-lg font-medium text-slate-100 cursor-text hover:text-emerald-300 transition-colors font-mono truncate border-b border-transparent hover:border-emerald-400/30 pb-1"
                >
                  {resource.title}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-slate-300">
              <span className="text-xs font-mono">
                {getRelativeTime(resource.updated_at || resource.created_at)}
              </span>
              
              {hasUnsavedChanges && (
                <div className="flex items-center gap-1 text-xs text-cyan-400 font-mono">
                  <Icon icon="lucide:pencil" width={12} height={12} />
                  editado
                </div>
              )}

              <div className="flex items-center gap-1">
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  className="bg-blue-500/15 border border-blue-400/30 text-blue-400 hover:bg-blue-500/25 transition-all"
                  onPress={() => onDuplicate(resource)}
                >
                  <Icon icon="lucide:copy" width={14} height={14} />
                </Button>
                
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  className="bg-red-500/15 border border-red-400/30 text-red-400 hover:bg-red-500/25 transition-all"
                  onPress={() => onDelete(resource.id)}
                >
                  <Icon icon="lucide:trash-2" width={14} height={14} />
                </Button>
                
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  className="bg-slate-600/40 border border-slate-500/40 text-slate-300 hover:bg-slate-600/60 transition-all"
                  onPress={onToggle}
                >
                  <Icon 
                    icon="lucide:chevron-down" 
                    width={16} 
                    height={16}
                    className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </Button>
              </div>
            </div>
          </div>

          {/* Conteúdo expansível */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4">
                  <div className="border-t border-slate-700/50 pt-4">
                                         <Textarea
                       value={content}
                       onChange={(e) => setContent(e.target.value)}
                       placeholder="Digite o conteúdo do seu recurso aqui..."
                       minRows={8}
                       classNames={{
                         inputWrapper: "bg-slate-900/60 border-slate-600/60 hover:border-slate-500/70 focus-within:!border-blue-400/80 data-[focus=true]:!border-blue-400/80 data-[focused=true]:!border-blue-400/80 backdrop-blur-sm",
                         input: "text-slate-100 placeholder:text-slate-400 font-mono text-sm leading-relaxed"
                       }}
                     />
                    
                    <div className="flex justify-between items-center mt-4">
                                             <div className="text-xs text-slate-400 font-mono">
                         {content.length} caracteres
                       </div>
                       
                       <Button
                         size="sm"
                         className="bg-emerald-600/90 hover:bg-emerald-600 text-white font-mono font-medium shadow-sm"
                         onPress={handleSave}
                         isDisabled={!hasUnsavedChanges}
                         isLoading={isSaving}
                       >
                         <Icon icon="lucide:save" width={14} height={14} />
                         Salvar
                       </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardBody>
      </Card>
    </div>
  );
}

export default function RecursosPage() {
  const [resources, setResources] = useState<SimpleResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Mock data for offline
  const mockResources: SimpleResource[] = [
    {
      id: '1',
      title: 'Bem-vindo ao Cognitive Overflow',
      content: 'Este é seu vault pessoal para recursos técnicos e conhecimento. Use este espaço para armazenar insights, códigos, documentação e qualquer conteúdo que seja importante para seu desenvolvimento.',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Pattern: Clean Architecture',
      content: 'Insights sobre arquitetura limpa e organização de código. Princípios fundamentais:\n\n• Separação de responsabilidades\n• Inversão de dependência\n• Testabilidade\n• Baixo acoplamento',
      created_at: new Date().toISOString()
    }
  ];

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);

    if (!isSupabaseConfigured()) {
      setResources(mockResources);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('resources')
        .select('id, title, content, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar recursos:', error);
        setResources(mockResources);
      } else {
        setResources(data || mockResources);
      }
    } catch (err) {
      console.error('Erro na conexão:', err);
      setResources(mockResources);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResource = async () => {
    const newResource: SimpleResource = {
      id: Date.now().toString(),
      title: 'Novo Recurso',
      content: '',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('resources')
          .insert([{
            title: newResource.title,
            content: newResource.content,
            category: 'recursos',
            tags: [],
            priority: 'média'
          }])
          .select()
          .single();

        if (!error && data) {
          newResource.id = data.id;
        }
      } catch (err) {
        console.error('Erro na conexão:', err);
      }
    }

    setResources(prev => [newResource, ...prev]);
    setExpandedCard(newResource.id);
  };

  const handleUpdateResource = async (updatedResource: SimpleResource) => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('resources')
          .update({
            title: updatedResource.title,
            content: updatedResource.content
          })
          .eq('id', updatedResource.id);
        
        if (error) console.error('Erro ao atualizar:', error);
      } catch (err) {
        console.error('Erro na conexão:', err);
      }
    }

    setResources(prev => prev.map(r => r.id === updatedResource.id ? updatedResource : r));
  };

  const handleDeleteResource = async (id: string) => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);
      
      if (error) console.error('Erro ao deletar:', error);
    }

    setResources(prev => prev.filter(r => r.id !== id));
    if (expandedCard === id) {
      setExpandedCard(null);
    }
  };

  const handleDuplicateResource = async (resource: SimpleResource) => {
    const duplicated: SimpleResource = {
      id: Date.now().toString(),
      title: `${resource.title} (Cópia)`,
      content: resource.content,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('resources')
          .insert([{
            title: duplicated.title,
            content: duplicated.content,
            category: 'recursos',
            tags: [],
            priority: 'média'
          }])
          .select()
          .single();

        if (!error && data) {
          duplicated.id = data.id;
        }
      } catch (err) {
        console.error('Erro na conexão:', err);
      }
    }

    setResources(prev => [duplicated, ...prev]);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('recursos_auth');
    sessionStorage.removeItem('recursos_auth_timestamp');
    window.location.href = '/recursos';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-emerald-400 font-mono text-xl flex items-center gap-3"
        >
          <Icon icon="lucide:loader-2" className="animate-spin" width={24} height={24} />
          LOADING SYSTEM...
        </motion.div>
      </div>
    );
  }

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
          className="bg-slate-800/50 backdrop-blur border border-slate-700/50 text-slate-300 hover:text-emerald-300 hover:border-emerald-400/30 font-mono font-medium transition-all"
        >
          <Icon icon="lucide:arrow-left" width={18} height={18} />
          COGNITIVE OVERFLOW
        </Button>

        <Button
          onClick={handleLogout}
          size="lg"
          className="bg-red-900/20 backdrop-blur border border-red-500/30 text-red-400 hover:bg-red-900/30 hover:border-red-400/50 font-mono font-medium transition-all"
        >
          <Icon icon="lucide:log-out" width={18} height={18} />
          LOGOUT
        </Button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        {/* Title Section */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 tracking-wide font-mono mb-3"
          >
            RECURSOS VAULT
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 font-mono"
          >
            Seu vault pessoal simplificado para conhecimento
          </motion.p>
        </div>

        {/* Create Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Button
            onClick={handleCreateResource}
            size="lg"
            className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-mono font-bold shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Icon icon="lucide:plus" width={20} height={20} />
            Novo Recurso
          </Button>
        </motion.div>

        {/* Resources List */}
        <div className="space-y-4">
          <AnimatePresence>
            {resources.length > 0 ? (
              resources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  isExpanded={expandedCard === resource.id}
                  onToggle={() => setExpandedCard(expandedCard === resource.id ? null : resource.id)}
                  onUpdate={handleUpdateResource}
                  onDelete={handleDeleteResource}
                  onDuplicate={handleDuplicateResource}
                />
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <Icon icon="lucide:folder-open" width={64} height={64} className="mx-auto mb-6 text-slate-600" />
                <p className="text-slate-400 font-mono text-lg mb-2">
                  Vault vazio
                </p>
                <p className="text-slate-500 font-mono text-sm">
                  Crie seu primeiro recurso para começar
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
} 