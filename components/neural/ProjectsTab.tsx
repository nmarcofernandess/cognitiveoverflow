"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from "framer-motion";
import { detailQueries, supabase } from '../../lib/supabase';
import { useNeuralContext } from './context/NeuralContext';
import { CollapsibleForm, CollapsibleSection } from './CollapsibleForm';
import { Breadcrumb } from './Breadcrumb';

interface Project {
  id: string;
  name: string;
  tldr?: string;
  created_at: string;
  updated_at?: string;
  sprint_count?: number;
  total_tasks?: number;
  sprints?: Sprint[];
}

interface Sprint {
  id: string;
  project_id: string;
  name: string;
  tldr?: string;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at?: string;
  project_name?: string;
  task_count: number;
  tasks?: Task[];
  notes?: SprintNote[];
}

interface Task {
  id: string;
  sprint_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: number;
  created_at: string;
  completed_at?: string;
}

interface SprintNote {
  id: string;
  sprint_id: string;
  title: string;
  content?: string;
  tags: string[];
  created_at: string;
}

function SprintDetail({ sprint, onBack, onUpdate }: { 
  sprint: Sprint; 
  onBack: () => void; 
  onUpdate: () => void;
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingTldr, setEditingTldr] = useState(false);
  const [tempTitle, setTempTitle] = useState(sprint.name);
  const [tempTldr, setTempTldr] = useState(sprint.tldr || '');
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 3 });
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: '' });
  
  // Collapsible states
  const [showTasksForm, setShowTasksForm] = useState(false);
  const [showTasksList, setShowTasksList] = useState(true);
  const [showNotesForm, setShowNotesForm] = useState(false);
  const [showNotesList, setShowNotesList] = useState(false);
  
  // Edit states
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editTaskData, setEditTaskData] = useState({ title: '', description: '', priority: 3 });
  const [editNoteData, setEditNoteData] = useState({ title: '', content: '', tags: '' });

  // Update states when sprint changes
  useEffect(() => {
    setTempTitle(sprint.name);
    setTempTldr(sprint.tldr || '');
  }, [sprint.name, sprint.tldr]);

  const updateSprint = async (updates: any) => {
    try {
      const { error } = await supabase
        .from('sprints')
        .update(updates)
        .eq('id', sprint.id);

      if (error) {
        console.error('Erro ao atualizar sprint:', error);
        return false;
      }

      onUpdate();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar sprint:', error);
      return false;
    }
  };

  const updateTask = async (taskId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) {
        console.error('Erro ao atualizar task:', error);
        return false;
      }

      onUpdate();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar task:', error);
      return false;
    }
  };

  const createTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .insert([{
          sprint_id: sprint.id,
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          status: 'pending'
        }]);

      if (error) {
        console.error('Erro ao criar task:', error);
        return;
      }

      setNewTask({ title: '', description: '', priority: 3 });
      setShowTasksForm(false);
      onUpdate();
    } catch (error) {
      console.error('Erro ao criar task:', error);
    }
  };

  const createNote = async () => {
    if (!newNote.title.trim()) return;

    try {
      const { error } = await supabase
        .from('sprint_notes')
        .insert([{
          sprint_id: sprint.id,
          title: newNote.title,
          content: newNote.content,
          tags: newNote.tags.split(',').map(t => t.trim()).filter(Boolean)
        }]);

      if (error) {
        console.error('Erro ao criar nota:', error);
        return;
      }

      setNewNote({ title: '', content: '', tags: '' });
      setShowNotesForm(false);
      onUpdate();
    } catch (error) {
      console.error('Erro ao criar nota:', error);
    }
  };

  // Edit task functions
  const handleEditTask = (task: Task) => {
    setEditingTask(task.id);
    setEditTaskData({
      title: task.title,
      description: task.description || '',
      priority: task.priority
    });
  };

  const handleSaveTaskEdit = async () => {
    if (!editingTask) return;
    
    const success = await updateTask(editingTask, {
      title: editTaskData.title,
      description: editTaskData.description,
      priority: editTaskData.priority
    });
    
    if (success) {
      setEditingTask(null);
    }
  };

  const handleCancelTaskEdit = () => {
    setEditingTask(null);
    setEditTaskData({ title: '', description: '', priority: 3 });
  };

  // Edit note functions
  const handleEditNote = (note: SprintNote) => {
    setEditingNote(note.id);
    setEditNoteData({
      title: note.title,
      content: note.content || '',
      tags: note.tags.join(', ')
    });
  };

  const handleSaveNoteEdit = async () => {
    if (!editingNote) return;
    
    try {
      const { error } = await supabase
        .from('sprint_notes')
        .update({
          title: editNoteData.title,
          content: editNoteData.content,
          tags: editNoteData.tags.split(',').map(t => t.trim()).filter(Boolean)
        })
        .eq('id', editingNote);

      if (error) {
        console.error('Erro ao atualizar nota:', error);
        return;
      }

      setEditingNote(null);
      onUpdate();
    } catch (error) {
      console.error('Erro ao atualizar nota:', error);
    }
  };

  const handleCancelNoteEdit = () => {
    setEditingNote(null);
    setEditNoteData({ title: '', content: '', tags: '' });
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta task?')) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Erro ao deletar task:', error);
        return;
      }

      onUpdate();
    } catch (error) {
      console.error('Erro ao deletar task:', error);
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta nota?')) return;

    try {
      const { error } = await supabase
        .from('sprint_notes')
        .delete()
        .eq('id', noteId);

      if (error) {
        console.error('Erro ao deletar nota:', error);
        return;
      }

      onUpdate();
    } catch (error) {
      console.error('Erro ao deletar nota:', error);
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-gray-400';
      case 'in_progress': return 'text-yellow-400';
      case 'completed': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'lucide:circle';
      case 'in_progress': return 'lucide:clock';
      case 'completed': return 'lucide:check-circle';
      default: return 'lucide:circle';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return 'text-red-400';
    if (priority >= 3) return 'text-yellow-400';
    return 'text-green-400';
  };

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
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { 
            label: "Projects", 
            icon: "lucide:rocket",
            onClick: () => {
              // Go back to projects list
              window.location.reload();
            }
          },
          { 
            label: sprint.project_name || "Project", 
            icon: "lucide:folder",
            onClick: onBack
          },
          { 
            label: sprint.name, 
            icon: "lucide:target",
            isActive: true
          }
        ]} 
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={async () => {
                  if (tempTitle.trim() !== sprint.name && tempTitle.trim()) {
                    await updateSprint({ name: tempTitle.trim() });
                  }
                  setEditingTitle(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                  if (e.key === 'Escape') {
                    setTempTitle(sprint.name);
                    setEditingTitle(false);
                  }
                }}
                autoFocus
                className="w-64"
                classNames={{
                  inputWrapper: "bg-slate-800/60 border-slate-600/60",
                  input: "text-slate-100 font-mono text-xl font-bold"
                }}
              />
            </div>
          ) : (
            <h2 
              className="text-2xl font-bold text-purple-400 font-mono cursor-pointer hover:text-purple-300 transition-colors"
              onClick={() => setEditingTitle(true)}
              title="Click to edit sprint name"
            >
              🎯 {sprint.name}
            </h2>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Select
            size="sm"
            selectedKeys={[sprint.status]}
            onSelectionChange={(keys) => {
              const newStatus = Array.from(keys)[0] as string;
              updateSprint({ status: newStatus });
            }}
            className="w-32"
          >
            <SelectItem key="active">Active</SelectItem>
            <SelectItem key="completed">Completed</SelectItem>
            <SelectItem key="archived">Archived</SelectItem>
          </Select>
        </div>
      </div>

      {/* Sprint TL;DR */}
      <Card className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/60">
        <CardBody className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-purple-400 font-mono">Sprint TL;DR</h3>
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              onClick={() => setEditingTldr(!editingTldr)}
              className="bg-slate-600/40 border border-slate-500/40 text-slate-300 hover:bg-slate-600/60"
            >
              <Icon icon="lucide:edit" width={14} height={14} />
            </Button>
          </div>
          
          {editingTldr ? (
            <div className="space-y-2">
              <Textarea 
                value={tempTldr}
                onChange={(e) => setTempTldr(e.target.value)}
                placeholder="Descrição do sprint..."
                minRows={3}
                classNames={{
                  inputWrapper: "bg-slate-900/60 border-slate-600/60",
                  input: "text-slate-100 font-mono"
                }}
              />
              <div className="flex gap-2">
                <Button 
                  size="sm"
                  onClick={() => {
                    updateSprint({ tldr: tempTldr });
                    setEditingTldr(false);
                  }}
                  className="bg-green-600 text-white"
                >
                  <Icon icon="lucide:check" width={14} height={14} />
                </Button>
                <Button 
                  size="sm"
                  variant="bordered"
                  onClick={() => setEditingTldr(false)}
                >
                  <Icon icon="lucide:x" width={14} height={14} />
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-slate-300 font-mono">{sprint.tldr || 'Sem descrição'}</p>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks */}
        <Card className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/60">
          <CardBody className="p-6">
            <div className="space-y-6">
              {/* Add Task Form */}
              <CollapsibleForm
                title="Add New Task"
                buttonText="Add Task"
                isOpen={showTasksForm}
                onToggle={() => setShowTasksForm(!showTasksForm)}
                buttonColor="bg-blue-600 hover:bg-blue-500"
                borderColor="border-blue-400/40"
              >
                <div className="space-y-4">
                  <Input
                    placeholder="Task title..."
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    classNames={{
                      inputWrapper: "bg-slate-700/60 border-slate-600/60",
                      input: "text-slate-100 font-mono"
                    }}
                  />
                  <Textarea
                    placeholder="Task description..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    minRows={2}
                    classNames={{
                      inputWrapper: "bg-slate-700/60 border-slate-600/60",
                      input: "text-slate-100 font-mono"
                    }}
                  />
                  <div className="flex gap-2">
                    <Select
                      size="sm"
                      selectedKeys={[newTask.priority.toString()]}
                      onSelectionChange={(keys) => setNewTask({...newTask, priority: parseInt(Array.from(keys)[0] as string)})}
                      className="w-32"
                    >
                      <SelectItem key="1">P1 (Low)</SelectItem>
                      <SelectItem key="2">P2</SelectItem>
                      <SelectItem key="3">P3 (Med)</SelectItem>
                      <SelectItem key="4">P4</SelectItem>
                      <SelectItem key="5">P5 (High)</SelectItem>
                    </Select>
                    <Button 
                      onClick={createTask}
                      isDisabled={!newTask.title.trim()}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-mono"
                    >
                      <Icon icon="lucide:plus" width={14} height={14} />
                      Create Task
                    </Button>
                  </div>
                </div>
              </CollapsibleForm>

              {/* Tasks List */}
              <CollapsibleSection
                title="Tasks"
                count={sprint.tasks?.length || 0}
                isOpen={showTasksList}
                onToggle={() => setShowTasksList(!showTasksList)}
              >
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {sprint.tasks && sprint.tasks.length > 0 ? (
                    sprint.tasks.map(task => (
                      <div key={task.id} className="bg-slate-900/60 p-3 rounded border border-slate-700/30">
                        {editingTask === task.id ? (
                          <div className="space-y-3">
                            <Input
                              value={editTaskData.title}
                              onChange={(e) => setEditTaskData({...editTaskData, title: e.target.value})}
                              className="text-sm"
                            />
                            <Textarea
                              value={editTaskData.description}
                              onChange={(e) => setEditTaskData({...editTaskData, description: e.target.value})}
                              minRows={2}
                              className="text-sm"
                            />
                            <div className="flex gap-2">
                              <Select
                                size="sm"
                                selectedKeys={[editTaskData.priority.toString()]}
                                onSelectionChange={(keys) => setEditTaskData({...editTaskData, priority: parseInt(Array.from(keys)[0] as string)})}
                                className="w-24"
                              >
                                <SelectItem key="1">P1</SelectItem>
                                <SelectItem key="2">P2</SelectItem>
                                <SelectItem key="3">P3</SelectItem>
                                <SelectItem key="4">P4</SelectItem>
                                <SelectItem key="5">P5</SelectItem>
                              </Select>
                              <Button size="sm" onClick={handleSaveTaskEdit} className="bg-green-600">
                                <Icon icon="lucide:check" width={12} height={12} />
                              </Button>
                              <Button size="sm" variant="bordered" onClick={handleCancelTaskEdit}>
                                <Icon icon="lucide:x" width={12} height={12} />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => {
                                    const newStatus = task.status === 'completed' ? 'pending' : 
                                                    task.status === 'pending' ? 'in_progress' : 'completed';
                                    updateTask(task.id, { 
                                      status: newStatus,
                                      completed_at: newStatus === 'completed' ? new Date().toISOString() : null
                                    });
                                  }}
                                  className={`${getTaskStatusColor(task.status)} hover:scale-110 transition-transform`}
                                >
                                  <Icon icon={getTaskStatusIcon(task.status)} width={16} height={16} />
                                </button>
                                <span className="text-slate-100 font-medium font-mono text-sm">{task.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-mono ${getPriorityColor(task.priority)}`}>
                                  P{task.priority}
                                </span>
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="flat"
                                  onClick={() => handleEditTask(task)}
                                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                >
                                  <Icon icon="lucide:edit" width={12} height={12} />
                                </Button>
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="flat"
                                  onClick={() => deleteTask(task.id)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                >
                                  <Icon icon="lucide:trash-2" width={12} height={12} />
                                </Button>
                              </div>
                            </div>
                            {task.description && (
                              <p className="text-slate-400 text-xs font-mono mb-2">{task.description}</p>
                            )}
                            <div className="flex justify-between items-center">
                              <span className={`text-xs font-mono capitalize ${getTaskStatusColor(task.status)}`}>
                                {task.status.replace('_', ' ')}
                              </span>
                              <span className="text-xs text-slate-500 font-mono">
                                {getRelativeTime(task.created_at)}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 font-mono text-sm italic text-center py-8">
                      No tasks yet
                    </div>
                  )}
                </div>
              </CollapsibleSection>
            </div>
          </CardBody>
        </Card>

        {/* Notes */}
        <Card className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/60">
          <CardBody className="p-6">
            <div className="space-y-6">
              {/* Add Note Form */}
              <CollapsibleForm
                title="Add Sprint Note"
                buttonText="Add Note"
                isOpen={showNotesForm}
                onToggle={() => setShowNotesForm(!showNotesForm)}
                buttonColor="bg-green-600 hover:bg-green-500"
                borderColor="border-green-400/40"
              >
                <div className="space-y-4">
                  <Input
                    placeholder="Note title..."
                    value={newNote.title}
                    onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                    classNames={{
                      inputWrapper: "bg-slate-700/60 border-slate-600/60",
                      input: "text-slate-100 font-mono"
                    }}
                  />
                  <Textarea
                    placeholder="Note content..."
                    value={newNote.content}
                    onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                    minRows={3}
                    classNames={{
                      inputWrapper: "bg-slate-700/60 border-slate-600/60",
                      input: "text-slate-100 font-mono"
                    }}
                  />
                  <Input
                    placeholder="Tags (comma separated)..."
                    value={newNote.tags}
                    onChange={(e) => setNewNote({...newNote, tags: e.target.value})}
                    classNames={{
                      inputWrapper: "bg-slate-700/60 border-slate-600/60",
                      input: "text-slate-100 font-mono"
                    }}
                  />
                  <Button 
                    onClick={createNote}
                    isDisabled={!newNote.title.trim()}
                    className="bg-green-600 hover:bg-green-500 text-white font-mono"
                  >
                    <Icon icon="lucide:plus" width={14} height={14} />
                    Create Note
                  </Button>
                </div>
              </CollapsibleForm>

              {/* Notes List */}
              <CollapsibleSection
                title="Sprint Notes"
                count={sprint.notes?.length || 0}
                isOpen={showNotesList}
                onToggle={() => setShowNotesList(!showNotesList)}
              >
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {sprint.notes && sprint.notes.length > 0 ? (
                    sprint.notes.map(note => (
                      <div key={note.id} className="bg-slate-900/60 p-4 rounded border-l-4 border-green-500/60">
                        {editingNote === note.id ? (
                          <div className="space-y-3">
                            <Input
                              value={editNoteData.title}
                              onChange={(e) => setEditNoteData({...editNoteData, title: e.target.value})}
                              className="text-sm"
                            />
                            <Textarea
                              value={editNoteData.content}
                              onChange={(e) => setEditNoteData({...editNoteData, content: e.target.value})}
                              minRows={3}
                              className="text-sm"
                            />
                            <Input
                              value={editNoteData.tags}
                              onChange={(e) => setEditNoteData({...editNoteData, tags: e.target.value})}
                              placeholder="Tags (comma separated)..."
                              className="text-sm"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleSaveNoteEdit} className="bg-green-600">
                                <Icon icon="lucide:check" width={12} height={12} />
                              </Button>
                              <Button size="sm" variant="bordered" onClick={handleCancelNoteEdit}>
                                <Icon icon="lucide:x" width={12} height={12} />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-slate-100 font-mono text-sm">{note.title}</h4>
                              <div className="flex gap-2">
                                <Button 
                                  isIconOnly
                                  size="sm" 
                                  variant="flat"
                                  onClick={() => handleEditNote(note)}
                                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                >
                                  <Icon icon="lucide:edit" width={12} height={12} />
                                </Button>
                                <Button 
                                  isIconOnly
                                  size="sm" 
                                  variant="flat"
                                  onClick={() => deleteNote(note.id)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                >
                                  <Icon icon="lucide:trash-2" width={12} height={12} />
                                </Button>
                              </div>
                            </div>
                            {note.content && (
                              <p className="text-slate-300 text-xs mb-3 font-mono">{note.content}</p>
                            )}
                            <div className="flex justify-between items-center">
                              <div className="flex gap-1">
                                {note.tags?.map(tag => (
                                  <Chip 
                                    key={tag} 
                                    size="sm" 
                                    variant="flat"
                                    className="bg-slate-700/60 text-slate-300 font-mono text-xs"
                                  >
                                    #{tag}
                                  </Chip>
                                ))}
                              </div>
                              <span className="text-xs text-slate-500 font-mono">
                                {getRelativeTime(note.created_at)}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 font-mono text-sm italic text-center py-8">
                      No notes yet
                    </div>
                  )}
                </div>
              </CollapsibleSection>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function ProjectDetail({ project, onBack, onSelectSprint, onDeleteProject }: {
  project: Project;
  onBack: () => void;
  onSelectSprint: (sprint: Sprint) => void;
  onDeleteProject?: (id: string) => void;
}) {
  const [showNewSprintForm, setShowNewSprintForm] = useState(false);
  const [newSprint, setNewSprint] = useState({
    name: '',
    tldr: ''
  });
  const [, forceUpdate] = useState({});
  
  // Edit states for project
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingTldr, setEditingTldr] = useState(false);
  const [tempTitle, setTempTitle] = useState(project.name);
  const [tempTldr, setTempTldr] = useState(project.tldr || '');
  
  // Update states when project changes
  useEffect(() => {
    setTempTitle(project.name);
    setTempTldr(project.tldr || '');
  }, [project.name, project.tldr]);
  
  const updateProject = async (updates: any) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', project.id);

      if (error) {
        console.error('Erro ao atualizar projeto:', error);
        return false;
      }

      // Update local project data
      Object.assign(project, updates);
      forceUpdate({});
      return true;
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      return false;
    }
  };
  
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'completed': return 'text-blue-400';
      case 'archived': return 'text-gray-400';
      default: return 'text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return 'lucide:circle';
      case 'completed': return 'lucide:check-circle';
      case 'archived': return 'lucide:archive';
      default: return 'lucide:circle';
    }
  };

  const handleCreateSprint = async () => {
    if (!newSprint.name.trim()) return;

    try {
      const { data, error } = await supabase
        .from('sprints')
        .insert([{
          project_id: project.id,
          name: newSprint.name.trim(),
          tldr: newSprint.tldr.trim() || null,
          status: 'active'
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar sprint:', error);
        alert('Erro ao criar sprint. Tente novamente.');
        return;
      }

      // Add the new sprint to the project's sprints array
      const newSprintWithDetails = {
        ...data,
        task_count: 0,
        project_name: project.name
      };
      
      // Update project sprints locally
      project.sprints = [...(project.sprints || []), newSprintWithDetails];
      project.sprint_count = (project.sprint_count || 0) + 1;
      
      // Reset form and close
      setNewSprint({ name: '', tldr: '' });
      setShowNewSprintForm(false);
      
      // Force component re-render to show new sprint
      forceUpdate({});
    } catch (error) {
      console.error('Erro ao criar sprint:', error);
      alert('Erro ao criar sprint. Tente novamente.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { 
            label: "Projects", 
            icon: "lucide:rocket",
            onClick: onBack
          },
          { 
            label: project.name, 
            icon: "lucide:folder",
            isActive: true
          }
        ]} 
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={async () => {
                  if (tempTitle.trim() !== project.name && tempTitle.trim()) {
                    await updateProject({ name: tempTitle.trim() });
                  }
                  setEditingTitle(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                  if (e.key === 'Escape') {
                    setTempTitle(project.name);
                    setEditingTitle(false);
                  }
                }}
                autoFocus
                className="w-80"
                classNames={{
                  inputWrapper: "bg-slate-800/60 border-slate-600/60",
                  input: "text-purple-400 font-mono text-3xl font-bold"
                }}
              />
            </div>
          ) : (
            <motion.h2 
              className="text-4xl font-bold text-purple-400 font-mono cursor-pointer hover:text-purple-300 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setEditingTitle(true)}
              title="Click to edit project name"
            >
              📁 {project.name}
            </motion.h2>
          )}
          
          <div className="flex items-center gap-4 text-sm text-slate-400 font-mono">
            <span>{project.sprint_count} sprints</span>
            <span>{project.total_tasks} tasks</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => setShowNewSprintForm(!showNewSprintForm)}
            className="bg-green-600 hover:bg-green-500 text-white font-mono font-bold"
          >
            <Icon icon="lucide:plus" width={16} height={16} />
            New Sprint
          </Button>
          
          {onDeleteProject && (
            <Button
              onClick={() => onDeleteProject(project.id)}
              className="bg-red-900/20 border border-red-500/30 text-red-400 hover:bg-red-900/30 font-mono"
            >
              <Icon icon="lucide:trash-2" width={16} height={16} />
              Delete Project
            </Button>
          )}
        </div>
      </div>

      {/* New Sprint Form */}
      <AnimatePresence>
        {showNewSprintForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card className="w-full bg-slate-800/60 backdrop-blur-sm border border-green-400/40">
              <CardBody className="p-6">
                <h3 className="text-lg font-bold text-green-400 mb-4 font-mono">Create New Sprint for {project.name}</h3>
                <div className="space-y-4">
                  <Input
                    label="Sprint Name"
                    placeholder="Nome do sprint..."
                    value={newSprint.name}
                    onChange={(e) => setNewSprint({...newSprint, name: e.target.value})}
                    classNames={{
                      inputWrapper: "bg-slate-700/60 border-slate-600/60",
                      input: "text-slate-100 font-mono"
                    }}
                  />
                  <Textarea
                    label="Sprint TL;DR"
                    placeholder="Descrição do sprint..."
                    value={newSprint.tldr}
                    onChange={(e) => setNewSprint({...newSprint, tldr: e.target.value})}
                    minRows={2}
                    classNames={{
                      inputWrapper: "bg-slate-700/60 border-slate-600/60",
                      input: "text-slate-100 font-mono"
                    }}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateSprint}
                      isDisabled={!newSprint.name.trim()}
                      className="bg-green-600 hover:bg-green-500 text-white font-mono"
                    >
                      <Icon icon="lucide:plus" width={16} height={16} />
                      Create Sprint
                    </Button>
                    <Button
                      onClick={() => setShowNewSprintForm(false)}
                      variant="bordered"
                      className="border-slate-500 text-slate-300 hover:bg-slate-700 font-mono"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project TL;DR */}
      <Card className="w-full bg-slate-800/60 backdrop-blur-sm border border-slate-600/60">
        <CardBody className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-purple-400 font-mono">Project Description</h3>
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              onClick={() => setEditingTldr(!editingTldr)}
              className="bg-slate-600/40 border border-slate-500/40 text-slate-300 hover:bg-slate-600/60"
            >
              <Icon icon="lucide:edit" width={14} height={14} />
            </Button>
          </div>
          
          {editingTldr ? (
            <div className="space-y-2">
              <Textarea 
                value={tempTldr}
                onChange={(e) => setTempTldr(e.target.value)}
                placeholder="Descrição do projeto..."
                minRows={3}
                classNames={{
                  inputWrapper: "bg-slate-900/60 border-slate-600/60",
                  input: "text-slate-100 font-mono"
                }}
              />
              <div className="flex gap-2">
                <Button 
                  size="sm"
                  onClick={async () => {
                    await updateProject({ tldr: tempTldr });
                    setEditingTldr(false);
                  }}
                  className="bg-green-600 text-white"
                >
                  <Icon icon="lucide:check" width={14} height={14} />
                </Button>
                <Button 
                  size="sm"
                  variant="bordered"
                  onClick={() => {
                    setTempTldr(project.tldr || '');
                    setEditingTldr(false);
                  }}
                >
                  <Icon icon="lucide:x" width={14} height={14} />
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-slate-300 font-mono">{project.tldr || 'Sem descrição - clique no ícone para editar'}</p>
          )}
        </CardBody>
      </Card>

      {/* Sprints */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-purple-400 font-mono">Sprints</h3>
        
        {project.sprints && project.sprints.length > 0 ? (
          project.sprints.map((sprint) => (
            <Card 
              key={sprint.id}
              className="w-full bg-slate-800/60 backdrop-blur-sm border border-slate-600/60 hover:border-purple-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-400/10 cursor-pointer"
              isPressable
              onPress={() => onSelectSprint(sprint)}
            >
              <CardBody className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-xl font-semibold text-slate-100 font-mono">{sprint.name}</h4>
                      <div className={`flex items-center gap-1 text-sm ${getStatusColor(sprint.status)}`}>
                        <Icon icon={getStatusIcon(sprint.status)} width={16} height={16} />
                        <span className="capitalize font-mono">{sprint.status}</span>
                      </div>
                    </div>
                    {sprint.tldr && (
                      <p className="text-slate-300 font-mono">{sprint.tldr}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-400 flex items-center gap-2 font-mono">
                      <span>{sprint.task_count || 0} tasks</span>
                      <Icon icon="lucide:check-square" width={16} height={16} />
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      {getRelativeTime(sprint.updated_at || sprint.created_at)}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Icon icon="lucide:rocket" width={64} height={64} className="mx-auto mb-6 text-slate-600" />
            <p className="text-slate-400 font-mono text-lg mb-2">
              No sprints in this project yet
            </p>
            <p className="text-slate-500 font-mono text-sm">
              Create your first sprint to get started
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function ProjectsTab({ onTabChange }: { onTabChange?: (tabId: string) => void }) {
  const { notifyProjectChange, notifySprintChange } = useNeuralContext();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewSprintForm, setShowNewSprintForm] = useState(false);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [newSprint, setNewSprint] = useState({
    name: '',
    project_id: '',
    tldr: ''
  });
  const [newProject, setNewProject] = useState({
    name: '',
    tldr: ''
  });

  // Reset navigation when tab becomes active
  useEffect(() => {
    const handleReset = () => {
      setSelectedProject(null);
      setSelectedSprint(null);
      setShowNewSprintForm(false);
      setShowNewProjectForm(false);
    };

    // Listen for custom tab change events
    window.addEventListener('tab-changed-to-projects', handleReset);
    
    return () => {
      window.removeEventListener('tab-changed-to-projects', handleReset);
    };
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load projects with sprint counts and total tasks
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      // Load all sprints
      const { data: sprintsData } = await supabase
        .from('sprints')
        .select(`
          id,
          project_id,
          name,
          tldr,
          status,
          created_at,
          updated_at,
          projects(name)
        `)
        .order('created_at', { ascending: false });

      // Get task counts for sprints
      const sprintsWithCounts = await Promise.all(
        (sprintsData || []).map(async (sprint: any) => {
          const { count } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('sprint_id', sprint.id);
          
          return {
            ...sprint,
            project_name: sprint.projects?.name || 'Unknown Project',
            task_count: count || 0,
            tasks: [],
            notes: []
          };
        })
      );

      setSprints(sprintsWithCounts);

      // Aggregate data for projects
      const projectsWithAggregates = (projectsData || []).map(project => {
        const projectSprints = sprintsWithCounts.filter(sprint => sprint.project_id === project.id);
        const totalTasks = projectSprints.reduce((sum, sprint) => sum + sprint.task_count, 0);
        
        return {
          ...project,
          sprint_count: projectSprints.length,
          total_tasks: totalTasks,
          sprints: projectSprints
        };
      });

      setProjects(projectsWithAggregates);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setProjects([]);
      setSprints([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSprintDetail = async (sprintId: string) => {
    try {
      // Load tasks and notes for the sprint
      const [tasksResult, notesResult] = await Promise.all([
        supabase
          .from('tasks')
          .select('*')
          .eq('sprint_id', sprintId)
          .order('created_at', { ascending: false }),
        supabase
          .from('sprint_notes')
          .select('*')
          .eq('sprint_id', sprintId)
          .order('created_at', { ascending: false })
      ]);

      const sprint = sprints.find(s => s.id === sprintId);
      if (sprint) {
        setSelectedSprint({
          ...sprint,
          tasks: tasksResult.data || [],
          notes: notesResult.data || []
        });
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do sprint:', error);
    }
  };

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name: newProject.name.trim(),
          tldr: newProject.tldr.trim() || null
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar projeto:', error);
        alert('Erro ao criar projeto. Tente novamente.');
        return;
      }

      setProjects(prev => [data, ...prev]);
      setNewProject({ name: '', tldr: '' });
      setShowNewProjectForm(false);
      notifyProjectChange(); // ✅ Notifica Overview tab!
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      alert('Erro ao criar projeto. Tente novamente.');
    }
  };

  const handleCreateSprint = async () => {
    const projectId = selectedProject?.id || newSprint.project_id;
    if (!newSprint.name.trim() || !projectId) return;

    try {
      const { data, error } = await supabase
        .from('sprints')
        .insert([{
          project_id: projectId,
          name: newSprint.name.trim(),
          tldr: newSprint.tldr.trim() || null,
          status: 'active'
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar sprint:', error);
        alert('Erro ao criar sprint. Tente novamente.');
        return;
      }

      loadData(); // Reload all data
      setNewSprint({ name: '', project_id: '', tldr: '' });
      setShowNewSprintForm(false);
      notifySprintChange(); // ✅ Notifica Overview tab!
      
      // Show success feedback
      console.log('Sprint criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar sprint:', error);
      alert('Erro ao criar sprint. Tente novamente.');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Tem certeza que deseja deletar este projeto? Todos os sprints, tasks e notes também serão deletados. Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        console.error('Erro ao deletar projeto:', error);
        alert('Erro ao deletar projeto. Tente novamente.');
        return;
      }

      // Reset navigation
      setSelectedProject(null);
      setSelectedSprint(null);
      
      // Reload data
      loadData();
      notifyProjectChange();
    } catch (error) {
      console.error('Erro ao deletar projeto:', error);
      alert('Erro ao deletar projeto. Tente novamente.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'completed': return 'text-blue-400';
      case 'archived': return 'text-gray-400';
      default: return 'text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return 'lucide:circle';
      case 'completed': return 'lucide:check-circle';
      case 'archived': return 'lucide:archive';
      default: return 'lucide:circle';
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div 
          className="text-purple-400 font-mono text-xl flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Icon icon="lucide:rocket" className="animate-pulse" width={24} height={24} />
          LOADING PROJECTS...
        </motion.div>
      </div>
    );
  }

  if (selectedSprint) {
    return (
      <SprintDetail 
        sprint={selectedSprint}
        onBack={() => setSelectedSprint(null)}
        onUpdate={() => {
          loadSprintDetail(selectedSprint.id);
          loadData();
        }}
      />
    );
  }

  if (selectedProject) {
    return (
      <ProjectDetail 
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
        onSelectSprint={(sprint) => {
          setSelectedSprint(sprint);
          loadSprintDetail(sprint.id);
        }}

        onDeleteProject={handleDeleteProject}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <motion.h2 
          className="text-4xl font-bold text-purple-400 font-mono"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          🚀 PROJECTS & SPRINTS
        </motion.h2>
        
        <div className="flex gap-2">
          <Button
            onClick={() => setShowNewProjectForm(!showNewProjectForm)}
            className="bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold"
          >
            <Icon icon="lucide:plus" width={16} height={16} />
            New Project
          </Button>
          <Button
            onClick={() => setShowNewSprintForm(!showNewSprintForm)}
            className="bg-green-600 hover:bg-green-500 text-white font-mono font-bold"
          >
            <Icon icon="lucide:plus" width={16} height={16} />
            New Sprint
          </Button>
        </div>
      </div>

      {/* Create Forms */}
      <div className="space-y-4">
        <AnimatePresence>
          {showNewProjectForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <Card className="bg-slate-800/60 backdrop-blur-sm border border-purple-400/40">
                <CardBody className="p-6">
                  <h3 className="text-lg font-bold text-purple-400 mb-4 font-mono">Create New Project</h3>
                  <div className="space-y-4">
                    <Input
                      label="Project Name"
                      placeholder="Nome do projeto..."
                      value={newProject.name}
                      onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                      classNames={{
                        inputWrapper: "bg-slate-700/60 border-slate-600/60",
                        input: "text-slate-100 font-mono"
                      }}
                    />
                    <Textarea
                      label="Project TL;DR"
                      placeholder="Descrição do projeto..."
                      value={newProject.tldr}
                      onChange={(e) => setNewProject({...newProject, tldr: e.target.value})}
                      minRows={2}
                      classNames={{
                        inputWrapper: "bg-slate-700/60 border-slate-600/60",
                        input: "text-slate-100 font-mono"
                      }}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCreateProject}
                        isDisabled={!newProject.name.trim()}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-mono"
                      >
                        <Icon icon="lucide:plus" width={16} height={16} />
                        Create Project
                      </Button>
                      <Button
                        onClick={() => setShowNewProjectForm(false)}
                        variant="bordered"
                        className="border-slate-500 text-slate-300 hover:bg-slate-700 font-mono"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}

          {showNewSprintForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <Card className="bg-slate-800/60 backdrop-blur-sm border border-green-400/40">
                <CardBody className="p-6">
                  <h3 className="text-lg font-bold text-green-400 mb-4 font-mono">Create New Sprint</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Sprint Name"
                        placeholder="Nome do sprint..."
                        value={newSprint.name}
                        onChange={(e) => setNewSprint({...newSprint, name: e.target.value})}
                        classNames={{
                          inputWrapper: "bg-slate-700/60 border-slate-600/60",
                          input: "text-slate-100 font-mono"
                        }}
                      />
                      <Select
                        label="Project"
                        placeholder="Select project"
                        selectedKeys={newSprint.project_id ? [newSprint.project_id] : []}
                        onSelectionChange={(keys) => setNewSprint({...newSprint, project_id: Array.from(keys)[0] as string})}
                      >
                        {projects.map(project => (
                          <SelectItem key={project.id}>{project.name}</SelectItem>
                        ))}
                      </Select>
                    </div>
                    <Textarea
                      label="Sprint TL;DR"
                      placeholder="Descrição do sprint..."
                      value={newSprint.tldr}
                      onChange={(e) => setNewSprint({...newSprint, tldr: e.target.value})}
                      minRows={2}
                      classNames={{
                        inputWrapper: "bg-slate-700/60 border-slate-600/60",
                        input: "text-slate-100 font-mono"
                      }}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCreateSprint}
                        isDisabled={!newSprint.name.trim() || !newSprint.project_id}
                        className="bg-green-600 hover:bg-green-500 text-white font-mono"
                      >
                        <Icon icon="lucide:plus" width={16} height={16} />
                        Create Sprint
                      </Button>
                      <Button
                        onClick={() => setShowNewSprintForm(false)}
                        variant="bordered"
                        className="border-slate-500 text-slate-300 hover:bg-slate-700 font-mono"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.length > 0 ? (
          projects.map((project) => (
            <Card 
              key={project.id}
              className="w-full bg-slate-800/60 backdrop-blur-sm border border-slate-600/60 hover:border-purple-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-400/10 cursor-pointer"
              isPressable
              onPress={() => setSelectedProject(project)}
            >
              <CardBody className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Icon icon="lucide:folder" className="text-purple-400" width={24} height={24} />
                      <h3 className="text-2xl font-bold text-purple-400 font-mono">{project.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-400 font-mono">
                        <span>{project.sprint_count || 0} sprint{(project.sprint_count || 0) !== 1 ? 's' : ''}</span>
                        <span>{project.total_tasks || 0} task{(project.total_tasks || 0) !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    
                    {project.tldr && (
                      <p className="text-slate-300 font-mono mb-3">{project.tldr}</p>
                    )}
                    
                    {/* Sprint Preview */}
                    {project.sprints && project.sprints.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-slate-400 font-mono mb-2">Sprints:</h4>
                        <div className="space-y-1">
                          {project.sprints.slice(0, 3).map((sprint) => (
                            <div key={sprint.id} className="flex items-center gap-2 text-sm">
                              <Icon icon="lucide:circle" className="text-purple-400" width={8} height={8} />
                              <span className="text-slate-300 font-mono">{sprint.name}</span>
                              <span className="text-slate-500 font-mono">({sprint.task_count} tasks)</span>
                            </div>
                          ))}
                          {project.sprints.length > 3 && (
                            <div className="text-sm text-slate-500 font-mono">
                              ... and {project.sprints.length - 3} more sprint{project.sprints.length - 3 !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-slate-500 font-mono">
                      {getRelativeTime(project.updated_at || project.created_at)}
                    </span>
                    <Icon icon="lucide:chevron-right" className="text-slate-400" width={20} height={20} />
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Icon icon="lucide:folder-plus" width={64} height={64} className="mx-auto mb-6 text-slate-600" />
            <p className="text-slate-400 font-mono text-lg mb-2">
              No projects yet
            </p>
            <p className="text-slate-500 font-mono text-sm">
              Create your first project to get started
            </p>
          </motion.div>
        )}
      </div>

      {/* Connection Status */}
      <div className="text-center">
        <p className="text-xs text-emerald-400 font-mono">
          ✅ Connected to Supabase - Real data
        </p>
      </div>
    </div>
  );
} 