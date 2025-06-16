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
import { supabase } from '../../lib/supabase';

interface Project {
  id: string;
  name: string;
  tldr?: string;
  created_at: string;
  updated_at?: string;
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
      onUpdate();
    } catch (error) {
      console.error('Erro ao criar nota:', error);
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            isIconOnly
            onClick={onBack}
            className="bg-slate-700/60 border border-slate-600/40 text-slate-300 hover:bg-slate-600/60"
          >
            <Icon icon="lucide:arrow-left" width={18} height={18} />
          </Button>
          
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={() => {
                  if (tempTitle.trim() !== sprint.name) {
                    updateSprint({ name: tempTitle.trim() });
                  }
                  setEditingTitle(false);
                }}
                className="w-64"
                classNames={{
                  inputWrapper: "bg-slate-800/60 border-slate-600/60",
                  input: "text-slate-100 font-mono text-xl font-bold"
                }}
              />
            </div>
          ) : (
            <h2 
              className="text-2xl font-bold text-purple-400 font-mono cursor-pointer hover:text-purple-300"
              onClick={() => setEditingTitle(true)}
            >
              {sprint.name}
            </h2>
          )}
          
          <span className="text-sm text-slate-400 font-mono">
            {sprint.project_name}
          </span>
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-blue-400 font-mono">
                Tasks ({sprint.tasks?.length || 0})
              </h3>
            </div>
            
            {/* Add Task Form */}
            <div className="bg-slate-900/60 p-4 rounded-lg mb-4 border border-slate-700/50">
              <div className="space-y-3">
                <Input
                  placeholder="Task title..."
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  classNames={{
                    inputWrapper: "bg-slate-800/60 border-slate-600/60",
                    input: "text-slate-100 font-mono"
                  }}
                />
                <Textarea
                  placeholder="Task description..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  minRows={2}
                  classNames={{
                    inputWrapper: "bg-slate-800/60 border-slate-600/60",
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
                    Add Task
                  </Button>
                </div>
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sprint.tasks?.map(task => (
                <div key={task.id} className="bg-slate-900/60 p-3 rounded border border-slate-700/30">
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
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Notes */}
        <Card className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/60">
          <CardBody className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-green-400 font-mono">
                Notes ({sprint.notes?.length || 0})
              </h3>
            </div>
            
            {/* Add Note Form */}
            <div className="bg-slate-900/60 p-4 rounded-lg mb-4 border border-slate-700/50">
              <div className="space-y-3">
                <Input
                  placeholder="Note title..."
                  value={newNote.title}
                  onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                  classNames={{
                    inputWrapper: "bg-slate-800/60 border-slate-600/60",
                    input: "text-slate-100 font-mono"
                  }}
                />
                <Textarea
                  placeholder="Note content..."
                  value={newNote.content}
                  onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                  minRows={3}
                  classNames={{
                    inputWrapper: "bg-slate-800/60 border-slate-600/60",
                    input: "text-slate-100 font-mono"
                  }}
                />
                <Input
                  placeholder="Tags (comma separated)..."
                  value={newNote.tags}
                  onChange={(e) => setNewNote({...newNote, tags: e.target.value})}
                  classNames={{
                    inputWrapper: "bg-slate-800/60 border-slate-600/60",
                    input: "text-slate-100 font-mono"
                  }}
                />
                <Button 
                  onClick={createNote}
                  isDisabled={!newNote.title.trim()}
                  className="bg-green-600 hover:bg-green-500 text-white font-mono"
                >
                  <Icon icon="lucide:plus" width={14} height={14} />
                  Add Note
                </Button>
              </div>
            </div>

            {/* Notes List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sprint.notes?.map(note => (
                <div key={note.id} className="bg-slate-900/60 p-4 rounded border-l-4 border-green-500/60">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-slate-100 font-mono text-sm">{note.title}</h4>
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
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default function ProjectsTab() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load projects first
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      setProjects(projectsData || []);

      // Load sprints with project names
      const { data: sprintsData, error } = await supabase
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

      if (error) {
        console.error('Erro ao buscar sprints:', error);
        setSprints([]);
      } else {
        // Get task counts and transform data
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
      }
    } catch (error) {
      console.error('Erro ao carregar sprints:', error);
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
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      alert('Erro ao criar projeto. Tente novamente.');
    }
  };

  const handleCreateSprint = async () => {
    if (!newSprint.name.trim() || !newSprint.project_id) return;

    try {
      const { data, error } = await supabase
        .from('sprints')
        .insert([{
          project_id: newSprint.project_id,
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
    } catch (error) {
      console.error('Erro ao criar sprint:', error);
      alert('Erro ao criar sprint. Tente novamente.');
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

      {/* Sprints List */}
      <div className="space-y-4">
        {sprints.length > 0 ? (
          sprints.map((sprint) => (
            <Card 
              key={sprint.id}
              className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/60 hover:border-purple-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-400/10 cursor-pointer"
              isPressable
              onPress={() => {
                setSelectedSprint(sprint);
                loadSprintDetail(sprint.id);
              }}
            >
              <CardBody className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-slate-100 font-mono">{sprint.name}</h3>
                      <span className="text-sm text-purple-400 font-mono">{sprint.project_name}</span>
                      <div className={`flex items-center gap-1 text-sm ${getStatusColor(sprint.status)}`}>
                        <Icon icon={getStatusIcon(sprint.status)} width={16} height={16} />
                        <span className="capitalize font-mono">{sprint.status}</span>
                      </div>
                    </div>
                    <p className="text-slate-300 font-mono">{sprint.tldr || 'Sem descrição'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-400 flex items-center gap-2 font-mono">
                      <span>{sprint.task_count || 0} tasks</span>
                      <Icon icon="lucide:clock" width={16} height={16} />
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
              No sprints yet
            </p>
            <p className="text-slate-500 font-mono text-sm">
              Create your first project and sprint to get started
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