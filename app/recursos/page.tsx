"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Icon } from '@iconify/react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { ResourceItem } from '../../components/recursos/ResourceItem';

// Simplified Resource type
type SimpleResource = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
};

export default function RecursosPage() {
  const [resources, setResources] = useState<SimpleResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState<string | null>(null);

  // Mock data for offline
  const mockResources: SimpleResource[] = [
    {
      id: '1',
      title: 'Bem-vindo ao Cognitive Overflow',
      content: 'Este é seu vault pessoal para recursos técnicos e conhecimento.',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Pattern: Clean Architecture',
      content: 'Insights sobre arquitetura limpa e organização de código.',
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

  const handleCreateResource = () => {
    const newResource: SimpleResource = {
      id: Date.now().toString(),
      title: 'Novo recurso',
      content: '',
      created_at: new Date().toISOString()
    };
    setResources([newResource, ...resources]);
    setSelectedResource(newResource.id);
  };

  const handleUpdateResource = (updatedResource: SimpleResource) => {
    if (isSupabaseConfigured()) {
      supabase
        .from('resources')
        .update({
          title: updatedResource.title,
          content: updatedResource.content,
          updated_at: updatedResource.updated_at
        })
        .eq('id', updatedResource.id)
        .then(({ error }) => {
          if (error) console.error('Erro ao atualizar:', error);
        });
    }

    setResources(prev => 
      prev.map(r => 
        r.id === updatedResource.id ? updatedResource : r
      )
    );
  };

  const handleDeleteResource = (id: string) => {
    if (!confirm('Deletar este recurso?')) return;

    if (isSupabaseConfigured()) {
      supabase
        .from('resources')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Erro ao deletar:', error);
        });
    }

    setResources(prev => prev.filter(r => r.id !== id));
    setSelectedResource(null);
  };

  const handleDuplicateResource = (id: string) => {
    const original = resources.find(r => r.id === id);
    if (!original) return;

    const duplicated: SimpleResource = {
      id: Date.now().toString(),
      title: `${original.title} (Cópia)`,
      content: original.content,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      supabase
        .from('resources')
        .insert([{
          title: duplicated.title,
          content: duplicated.content,
          category: 'recursos',
          tags: [],
          priority: 'média'
        }])
        .select()
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Erro ao duplicar:', error);
          } else if (data) {
            setResources(prev => [{ ...duplicated, id: data.id }, ...prev]);
          }
        });
    } else {
      setResources(prev => [duplicated, ...prev]);
    }
  };

  // Filter resources based on search
  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600 font-medium text-lg">
          <Icon icon="lucide:loader-2" className="animate-spin mr-2 inline" />
          Carregando vault...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-slate-200">
        <Button
          onClick={() => window.history.back()}
          size="md"
          variant="bordered"
          className="font-medium border-slate-300 text-slate-600 hover:bg-slate-50"
        >
          <Icon icon="lucide:arrow-left" width={16} height={16} />
          COGNITIVE OVERFLOW
        </Button>

        <Button
          onClick={() => {/* Add logout logic */}}
          size="md"
          variant="bordered"
          className="font-medium border-red-200 text-red-600 hover:bg-red-50"
        >
          <Icon icon="lucide:log-out" width={16} height={16} />
          LOGOUT
        </Button>
      </div>

      {/* Main Title */}
      <div className="text-center py-8 bg-white">
        <h1 className="text-4xl font-bold text-emerald-600 tracking-wide">
          RECURSOS VAULT
        </h1>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Search and Add */}
        <div className="flex justify-between items-center">
          <Input
            placeholder="Buscar nos recursos..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="max-w-md"
            classNames={{
              inputWrapper: "bg-white border-slate-300 shadow-sm",
              input: "text-slate-900 placeholder:text-slate-500"
            }}
            startContent={<Icon icon="lucide:search" className="text-slate-400" />}
          />
          
          <Button
            onClick={handleCreateResource}
            color="success"
            className="font-medium"
          >
            <Icon icon="lucide:plus" width={16} height={16} />
            Novo Recurso
          </Button>
        </div>

        {/* Resources List */}
        <div>
          {filteredResources.length > 0 ? (
            filteredResources
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((resource) => (
                <ResourceItem
                  key={resource.id}
                  resource={resource}
                  isExpanded={selectedResource === resource.id}
                  onToggle={() => setSelectedResource(selectedResource === resource.id ? null : resource.id)}
                  onUpdate={handleUpdateResource}
                  onDelete={handleDeleteResource}
                  onDuplicate={handleDuplicateResource}
                />
              ))
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Icon icon="lucide:folder-open" width={48} height={48} className="mx-auto mb-4 text-slate-300" />
              <p className="font-medium">
                {searchQuery ? 'Nenhum recurso encontrado para sua busca' : 'Nenhum recurso encontrado'}
              </p>
              <p className="text-sm text-slate-400">
                {!searchQuery && 'Adicione seu primeiro recurso acima'}
              </p>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="text-center py-6 text-slate-400 text-sm">
          Total: {resources.length} recursos • Exibindo: {filteredResources.length}
        </div>
      </div>
    </div>
  );
} 