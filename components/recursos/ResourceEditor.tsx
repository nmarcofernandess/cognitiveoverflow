"use client";

import React, { useState } from 'react';
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { Icon } from '@iconify/react';
import { motion } from "framer-motion";
import { type Resource } from '../../lib/supabase';

interface ResourceEditorProps {
  resource: Resource;
  onSave: (resource: Resource) => void;
  onCancel: () => void;
}

export default function ResourceEditor({ resource, onSave, onCancel }: ResourceEditorProps) {
  const [formData, setFormData] = useState({
    title: resource.title,
    content: resource.content,
    category: resource.category,
    tags: resource.tags,
    priority: resource.priority
  });
  
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Título e conteúdo são obrigatórios!');
      return;
    }

    setIsSaving(true);
    
    try {
      const updatedResource: Resource = {
        ...resource,
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags: formData.tags,
        priority: formData.priority
      };
      
      await onSave(updatedResource);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar recurso!');
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim().toLowerCase())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim().toLowerCase()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-800/30" onKeyDown={handleKeyPress}>
      {/* Header */}
      <div className="border-b border-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <motion.h1 
            className="text-2xl font-mono font-bold text-green-400"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            EDITANDO RECURSO
          </motion.h1>
          
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              className="bg-green-600 hover:bg-green-500 text-black font-mono font-bold"
            >
              <Icon icon="lucide:save" width={16} height={16} />
              SALVAR (Ctrl+Enter)
            </Button>
            
            <Button
              onClick={onCancel}
              variant="bordered"
              className="border-gray-500 text-gray-300 hover:bg-gray-700 font-mono"
            >
              <Icon icon="lucide:x" width={16} height={16} />
              CANCELAR (Esc)
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-gray-400 font-mono">
          ID: {resource.id} • Criado em {new Date(resource.created_at).toLocaleDateString('pt-BR')}
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Title and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Título"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              classNames={{ 
                input: "font-mono",
                inputWrapper: "border-gray-600 bg-gray-800/50"
              }}
              isRequired
            />
            
            <Select
              label="Categoria"
              selectedKeys={[formData.category]}
              onSelectionChange={(keys) => {
                const category = Array.from(keys)[0] as Resource['category'];
                setFormData({...formData, category});
              }}
              classNames={{
                trigger: "border-gray-600 bg-gray-800/50"
              }}
            >
              <SelectItem key="recursos">📚 Recursos</SelectItem>
              <SelectItem key="insights">💡 Insights</SelectItem>
              <SelectItem key="docs">📖 Docs</SelectItem>
            </Select>
          </div>

          {/* Content */}
          <div>
            <Textarea
              label="Conteúdo"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              minRows={12}
              classNames={{ 
                input: "font-mono text-sm",
                inputWrapper: "border-gray-600 bg-gray-800/50"
              }}
              description="Suporte básico a Markdown: # títulos, **negrito**, - listas, - [ ] checkboxes"
              isRequired
            />
          </div>

          {/* Priority and Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Prioridade"
              selectedKeys={[formData.priority]}
              onSelectionChange={(keys) => {
                const priority = Array.from(keys)[0] as Resource['priority'];
                setFormData({...formData, priority});
              }}
              classNames={{
                trigger: "border-gray-600 bg-gray-800/50"
              }}
            >
              <SelectItem key="alta">🔴 Alta</SelectItem>
              <SelectItem key="média">🟡 Média</SelectItem>
              <SelectItem key="baixa">🟢 Baixa</SelectItem>
            </Select>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Adicionar tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  size="sm"
                  classNames={{ 
                    input: "font-mono",
                    inputWrapper: "border-gray-600 bg-gray-800/50"
                  }}
                />
                <Button
                  onClick={addTag}
                  size="sm"
                  className="bg-blue-600/20 border border-blue-500/50 text-blue-400 hover:bg-blue-600/30"
                >
                  <Icon icon="lucide:plus" width={14} height={14} />
                </Button>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {formData.tags.map((tag) => (
                  <Chip
                    key={tag}
                    size="sm"
                    variant="flat"
                    className="bg-gray-600/30 text-gray-300"
                    onClose={() => removeTag(tag)}
                  >
                    #{tag}
                  </Chip>
                ))}
              </div>
            </div>
          </div>

          {/* Preview toggle hint */}
          <div className="p-4 bg-gray-800/50 border border-gray-600/30 rounded">
            <div className="flex items-start gap-3">
              <Icon icon="lucide:info" className="text-blue-400 mt-1 flex-shrink-0" width={16} height={16} />
              <div className="text-sm text-gray-300">
                <strong>Dica:</strong> Use Markdown básico para formatação:
                <ul className="mt-2 space-y-1 text-xs text-gray-400 font-mono">
                  <li># Título grande</li>
                  <li>## Título médio</li>
                  <li>**texto em negrito**</li>
                  <li>- item de lista</li>
                  <li>- [ ] checkbox vazio</li>
                  <li>- [x] checkbox marcado</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-700/50 p-4">
        <div className="flex justify-between items-center text-xs text-gray-500 font-mono">
          <span>
            {formData.content.length} caracteres • {formData.tags.length} tags
          </span>
          <span>
            Use Ctrl+Enter para salvar rapidamente
          </span>
        </div>
      </div>
    </div>
  );
}
