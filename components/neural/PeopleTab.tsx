"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";

import { Chip } from "@heroui/chip";
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from '../../lib/supabase';

interface Person {
  id: string;
  name: string;
  relation: string;
  tldr?: string;
  created_at: string;
  updated_at?: string;
  notes_count: number;
  notes?: PersonNote[];
}

interface PersonNote {
  id: string;
  person_id: string;
  title: string;
  content?: string;
  tags: string[];
  created_at: string;
}

interface PersonCardProps {
  person: Person;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (person: Person) => void;
  onDelete: (id: string) => void;
  onAddNote: (personId: string, noteData: any) => void;
  onDeleteNote: (noteId: string, personId: string) => void;
}

function PersonCard({ person, isExpanded, onToggle, onUpdate, onDelete, onAddNote, onDeleteNote }: PersonCardProps) {
  const [editingTldr, setEditingTldr] = useState(false);
  const [editingRelation, setEditingRelation] = useState(false);
  const [tempTldr, setTempTldr] = useState(person.tldr || '');
  const [tempRelation, setTempRelation] = useState(person.relation);
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: '' });
  const [isSaving, setIsSaving] = useState(false);
  const tldrInputRef = useRef<HTMLTextAreaElement>(null);

  const handleTldrEdit = () => {
    setEditingTldr(true);
    setTimeout(() => tldrInputRef.current?.focus(), 0);
  };

  const handleSaveTldr = async () => {
    if (tempTldr === person.tldr) {
      setEditingTldr(false);
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('people')
        .update({ tldr: tempTldr, updated_at: new Date().toISOString() })
        .eq('id', person.id);

      if (error) {
        console.error('Erro ao atualizar TL;DR:', error);
        return;
      }

      onUpdate({
        ...person,
        tldr: tempTldr,
        updated_at: new Date().toISOString()
      });
      setEditingTldr(false);
    } catch (error) {
      console.error('Erro ao atualizar pessoa:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRelation = async () => {
    if (tempRelation === person.relation) {
      setEditingRelation(false);
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('people')
        .update({ relation: tempRelation, updated_at: new Date().toISOString() })
        .eq('id', person.id);

      if (error) {
        console.error('Erro ao atualizar relação:', error);
        return;
      }

      onUpdate({
        ...person,
        relation: tempRelation,
        updated_at: new Date().toISOString()
      });
      setEditingRelation(false);
    } catch (error) {
      console.error('Erro ao atualizar pessoa:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.title.trim()) return;

    const noteData = {
      title: newNote.title.trim(),
      content: newNote.content.trim(),
      tags: newNote.tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    await onAddNote(person.id, noteData);
    setNewNote({ title: '', content: '', tags: '' });
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
    <Card className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/60 hover:border-blue-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-400/10">
      <CardBody className="p-0">
        {/* Header sempre visível */}
        <div className="flex items-center gap-4 p-4">
          <div className="flex-1 min-w-0" onClick={onToggle}>
            <div className="flex items-center gap-3 mb-2 cursor-pointer">
              <h3 className="text-lg font-semibold text-slate-100 font-mono">{person.name}</h3>
              
              {editingRelation ? (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Input
                    size="sm"
                    value={tempRelation}
                    onChange={(e) => setTempRelation(e.target.value)}
                    placeholder="Relação..."
                    className="w-32"
                    classNames={{
                      inputWrapper: "bg-slate-800/60 border-slate-600/60",
                      input: "text-slate-100 font-mono text-sm"
                    }}
                  />
                  <Button
                    isIconOnly
                    size="sm"
                    className="bg-green-600 text-white"
                    onPress={handleSaveRelation}
                    isLoading={isSaving}
                  >
                    <Icon icon="lucide:check" width={14} height={14} />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="bordered"
                    onPress={() => setEditingRelation(false)}
                  >
                    <Icon icon="lucide:x" width={14} height={14} />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-400 capitalize font-mono">{person.relation}</span>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    className="bg-blue-500/15 border border-blue-400/30 text-blue-400 hover:bg-blue-500/25"
                    onClick={() => setEditingRelation(true)}
                  >
                    <Icon icon="lucide:edit" width={12} height={12} />
                  </Button>
                </div>
              )}
            </div>
            
            {editingTldr ? (
              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                <Textarea
                  ref={tldrInputRef}
                  value={tempTldr}
                  onChange={(e) => setTempTldr(e.target.value)}
                  placeholder="Descrição da pessoa para contexto da IA..."
                  minRows={2}
                  classNames={{
                    inputWrapper: "bg-slate-900/60 border-slate-600/60",
                    input: "text-slate-100 font-mono text-sm"
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-green-600 text-white"
                    onPress={handleSaveTldr}
                    isLoading={isSaving}
                  >
                    <Icon icon="lucide:check" width={14} height={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="bordered"
                    onPress={() => setEditingTldr(false)}
                  >
                    <Icon icon="lucide:x" width={14} height={14} />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <p className="text-gray-300 text-sm font-mono flex-1">{person.tldr || 'Sem descrição'}</p>
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  className="bg-slate-600/40 border border-slate-500/40 text-slate-300 hover:bg-slate-600/60"
                  onPress={handleTldrEdit}
                >
                  <Icon icon="lucide:edit" width={12} height={12} />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <span className="text-xs font-mono">
              {getRelativeTime(person.updated_at || person.created_at)}
            </span>
            
            <div className="text-sm text-slate-400 font-mono">
              {person.notes_count || 0} notes
            </div>

            <div className="flex items-center gap-1">
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                className="bg-red-500/15 border border-red-400/30 text-red-400 hover:bg-red-500/25"
                onClick={() => onDelete(person.id)}
              >
                <Icon icon="lucide:trash-2" width={14} height={14} />
              </Button>
              
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                className="bg-slate-600/40 border border-slate-500/40 text-slate-300 hover:bg-slate-600/60"
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

        {/* Conteúdo expansível - Notes */}
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
                <div className="border-t border-slate-700/50 pt-4 space-y-4">
                  
                  {/* Add Note Form */}
                  <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/50">
                    <h4 className="font-semibold text-blue-400 mb-3 font-mono">Add New Note</h4>
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
                        onClick={handleAddNote}
                        isDisabled={!newNote.title.trim()}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-mono"
                      >
                        <Icon icon="lucide:plus" width={14} height={14} />
                        Add Note
                      </Button>
                    </div>
                  </div>

                  {/* Notes List */}
                  {person.notes && person.notes.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-blue-400 font-mono">
                        Notes ({person.notes.length})
                      </h4>
                      {person.notes.map(note => (
                        <div key={note.id} className="bg-slate-900/60 p-4 rounded-lg border-l-4 border-blue-500/60">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-semibold text-slate-100 font-mono">{note.title}</h5>
                            <Button 
                              isIconOnly
                              size="sm" 
                              variant="flat"
                              onClick={() => onDeleteNote(note.id, person.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            >
                              <Icon icon="lucide:trash-2" width={14} height={14} />
                            </Button>
                          </div>
                          {note.content && (
                            <p className="text-slate-300 text-sm mb-3 font-mono">{note.content}</p>
                          )}
                          <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                              {note.tags?.map(tag => (
                                <Chip 
                                  key={tag} 
                                  size="sm" 
                                  variant="flat"
                                  className="bg-slate-700/60 text-slate-300 font-mono"
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
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardBody>
    </Card>
  );
}

export default function PeopleTab() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPerson, setNewPerson] = useState({
    name: '',
    relation: 'amigo',
    tldr: ''
  });

  useEffect(() => {
    loadPeople();
  }, []);

  const loadPeople = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('people')
        .select(`
          id,
          name,
          relation,
          tldr,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar people:', error);
        setPeople([]);
      } else {
        // Get notes count for each person
        const peopleWithCounts = await Promise.all(
          (data || []).map(async (person) => {
            const { count } = await supabase
              .from('person_notes')
              .select('*', { count: 'exact', head: true })
              .eq('person_id', person.id);
            
            return {
              ...person,
              notes_count: count || 0,
              notes: []
            };
          })
        );
        setPeople(peopleWithCounts);
      }
    } catch (error) {
      console.error('Erro ao carregar people:', error);
      setPeople([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPersonNotes = async (personId: string) => {
    try {
      const { data: notes, error } = await supabase
        .from('person_notes')
        .select('*')
        .eq('person_id', personId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar notas:', error);
        return;
      }

      setPeople(prev => prev.map(p => 
        p.id === personId ? { ...p, notes: notes || [] } : p
      ));
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
    }
  };

  const handleToggleExpand = (personId: string) => {
    if (expandedCard === personId) {
      setExpandedCard(null);
    } else {
      setExpandedCard(personId);
      loadPersonNotes(personId);
    }
  };

  const handleCreatePerson = async () => {
    if (!newPerson.name.trim()) return;

    try {
      const { data, error } = await supabase
        .from('people')
        .insert([{
          name: newPerson.name.trim(),
          relation: newPerson.relation,
          tldr: newPerson.tldr.trim() || null
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar pessoa:', error);
        alert('Erro ao criar pessoa. Tente novamente.');
        return;
      }

      setPeople(prev => [{
        ...data,
        notes_count: 0,
        notes: []
      }, ...prev]);
      
      setNewPerson({ name: '', relation: 'amigo', tldr: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Erro ao criar pessoa:', error);
      alert('Erro ao criar pessoa. Tente novamente.');
    }
  };

  const handleUpdatePerson = (updatedPerson: Person) => {
    setPeople(prev => prev.map(p => 
      p.id === updatedPerson.id ? updatedPerson : p
    ));
  };

  const handleDeletePerson = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta pessoa? Todas as notes também serão deletadas. Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar pessoa:', error);
        alert('Erro ao deletar pessoa. Tente novamente.');
        return;
      }

      setPeople(prev => prev.filter(p => p.id !== id));
      if (expandedCard === id) {
        setExpandedCard(null);
      }
    } catch (error) {
      console.error('Erro ao deletar pessoa:', error);
      alert('Erro ao deletar pessoa. Tente novamente.');
    }
  };

  const handleAddNote = async (personId: string, noteData: any) => {
    try {
      const { data, error } = await supabase
        .from('person_notes')
        .insert([{
          person_id: personId,
          title: noteData.title,
          content: noteData.content,
          tags: noteData.tags
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar nota:', error);
        return false;
      }
      
      // Update person with new note
      setPeople(prev => prev.map(p => 
        p.id === personId 
          ? { 
              ...p, 
              notes_count: p.notes_count + 1,
              notes: p.notes ? [data, ...p.notes] : [data]
            }
          : p
      ));
      
      return true;
    } catch (error) {
      console.error('Erro ao adicionar nota:', error);
      return false;
    }
  };

  const handleDeleteNote = async (noteId: string, personId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta nota?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('person_notes')
        .delete()
        .eq('id', noteId);

      if (error) {
        console.error('Erro ao deletar nota:', error);
        return;
      }

      setPeople(prev => prev.map(p => 
        p.id === personId 
          ? { 
              ...p, 
              notes_count: Math.max(0, p.notes_count - 1),
              notes: p.notes?.filter(n => n.id !== noteId) || []
            }
          : p
      ));
    } catch (error) {
      console.error('Erro ao deletar nota:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div 
          className="text-blue-400 font-mono text-xl flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Icon icon="lucide:users" className="animate-pulse" width={24} height={24} />
          LOADING PEOPLE...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <motion.h2 
          className="text-4xl font-bold text-blue-400 font-mono"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          👥 PEOPLE
        </motion.h2>
        
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold"
        >
          <Icon icon="lucide:plus" width={16} height={16} />
          Add Person
        </Button>
      </div>

      {/* Add Person Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card className="bg-slate-800/60 backdrop-blur-sm border border-blue-400/40">
              <CardBody className="p-6">
                <h3 className="text-lg font-bold text-blue-400 mb-4 font-mono">Add New Person</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <Input
                    label="Name"
                    placeholder="Nome da pessoa..."
                    value={newPerson.name}
                    onChange={(e) => setNewPerson({...newPerson, name: e.target.value})}
                    classNames={{
                      inputWrapper: "bg-slate-700/60 border-slate-600/60",
                      input: "text-slate-100 font-mono"
                    }}
                  />
                  <Input
                    label="Relation"
                    placeholder="Ex: esposa, irmão, amigo..."
                    value={newPerson.relation}
                    onChange={(e) => setNewPerson({...newPerson, relation: e.target.value})}
                    classNames={{
                      inputWrapper: "bg-slate-700/60 border-slate-600/60",
                      input: "text-slate-100 font-mono"
                    }}
                  />
                  <div></div>
                </div>
                <Textarea
                  label="TL;DR"
                  placeholder="Descrição para contexto da IA..."
                  value={newPerson.tldr}
                  onChange={(e) => setNewPerson({...newPerson, tldr: e.target.value})}
                  minRows={2}
                  classNames={{
                    inputWrapper: "bg-slate-700/60 border-slate-600/60",
                    input: "text-slate-100 font-mono"
                  }}
                />
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={handleCreatePerson}
                    isDisabled={!newPerson.name.trim()}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-mono"
                  >
                    <Icon icon="lucide:plus" width={16} height={16} />
                    Create Person
                  </Button>
                  <Button
                    onClick={() => setShowAddForm(false)}
                    variant="bordered"
                    className="border-slate-500 text-slate-300 hover:bg-slate-700 font-mono"
                  >
                    Cancel
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* People List */}
      <div className="space-y-4">
        <AnimatePresence>
          {people.length > 0 ? (
            people.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                isExpanded={expandedCard === person.id}
                onToggle={() => handleToggleExpand(person.id)}
                onUpdate={handleUpdatePerson}
                onDelete={handleDeletePerson}
                onAddNote={handleAddNote}
                onDeleteNote={handleDeleteNote}
              />
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Icon icon="lucide:users" width={64} height={64} className="mx-auto mb-6 text-slate-600" />
              <p className="text-slate-400 font-mono text-lg mb-2">
                No people yet
              </p>
              <p className="text-slate-500 font-mono text-sm">
                Add your first person to get started
              </p>
            </motion.div>
          )}
        </AnimatePresence>
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