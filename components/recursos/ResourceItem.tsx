"use client";

import React, { useState, useRef } from 'react';
import { Card, CardBody, Button, Input, Textarea, Chip } from "@heroui/react";
import { Icon } from '@iconify/react';

interface SimpleResource {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

interface ResourceItemProps {
  resource: SimpleResource;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (resource: SimpleResource) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export const ResourceItem: React.FC<ResourceItemProps> = ({
  resource,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete,
  onDuplicate
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(resource.title);
  const [content, setContent] = useState(resource.content || '');
  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleTitleClick = () => {
    setIsEditingTitle(true);
    setTimeout(() => titleInputRef.current?.focus(), 0);
  };

  const handleTitleSubmit = () => {
    if (tempTitle.trim()) {
      onUpdate({
        ...resource,
        title: tempTitle,
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

  const handleSave = () => {
    onUpdate({
      ...resource,
      content,
      updated_at: new Date().toISOString()
    });
  };

  const getRelativeTime = (dateString: string) => {
    try {
      const now = new Date();
      const date = new Date(dateString);
      const diffInMs = now.getTime() - date.getTime();
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInHours / 24);
      
      if (diffInHours < 1) return 'há poucos minutos';
      if (diffInHours < 24) return `há ${diffInHours}h`;
      if (diffInDays < 30) return `há ${diffInDays}d`;
      return date.toLocaleDateString('pt-BR');
    } catch {
      return 'Agora';
    }
  };

  const hasUnsavedChanges = content !== (resource.content || '');

  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow border border-slate-200 mb-3">
      <CardBody className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-grow" onClick={handleTitleClick}>
            {isEditingTitle ? (
              <Input
                ref={titleInputRef}
                value={tempTitle}
                onValueChange={setTempTitle}
                onBlur={handleTitleSubmit}
                onKeyDown={handleTitleKeyDown}
                variant="underlined"
                classNames={{
                  input: "text-lg font-semibold text-slate-800",
                  inputWrapper: "bg-transparent shadow-none hover:bg-transparent border-slate-300"
                }}
              />
            ) : (
              <div className="text-lg font-semibold cursor-text border-b border-transparent hover:border-slate-300 text-slate-800 transition-colors py-1">
                {resource.title}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-500 font-medium">
              {getRelativeTime(resource.updated_at || resource.created_at)}
            </div>

            {hasUnsavedChanges && (
              <Chip 
                size="sm" 
                variant="flat"
                color="warning"
                className="text-xs font-medium"
              >
                Não salvo
              </Chip>
            )}

            <div className="flex items-center gap-1">
              <Button
                isIconOnly
                variant="light"
                onPress={() => onDuplicate(resource.id)}
                size="sm"
                className="text-slate-500 hover:text-blue-600 hover:bg-blue-50"
              >
                <Icon icon="lucide:copy" width={16} height={16} />
              </Button>
              <Button
                isIconOnly
                variant="light"
                onPress={() => onDelete(resource.id)}
                size="sm"
                className="text-slate-500 hover:text-red-600 hover:bg-red-50"
              >
                <Icon icon="lucide:trash-2" width={16} height={16} />
              </Button>
              <Button
                isIconOnly
                variant="light"
                onPress={onToggle}
                size="sm"
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              >
                <Icon 
                  icon="lucide:chevron-down"
                  width={18} 
                  height={18}
                  className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
              </Button>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div>
              <Textarea
                value={content}
                onValueChange={setContent}
                placeholder="Digite o conteúdo do recurso aqui..."
                minRows={8}
                variant="bordered"
                classNames={{
                  inputWrapper: "bg-slate-50 border-slate-300 hover:border-slate-400 focus-within:border-emerald-500",
                  input: "text-slate-700 placeholder:text-slate-400"
                }}
              />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <div className="text-sm text-slate-500">
                Criado {getRelativeTime(resource.created_at)}
              </div>
              
              <Button
                color="success"
                variant={hasUnsavedChanges ? "solid" : "bordered"}
                startContent={<Icon icon="lucide:save" width={16} height={16} />}
                onPress={handleSave}
                isDisabled={!hasUnsavedChanges}
                size="sm"
                className="font-medium"
              >
                Salvar
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}; 