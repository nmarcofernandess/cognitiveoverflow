"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from "framer-motion";
import { detailQueries, supabase } from '../../lib/supabase';
import { useNeuralContext } from './context/NeuralContext';
import { CollapsibleForm, CollapsibleSection } from './CollapsibleForm';
import { Breadcrumb } from './Breadcrumb';
import { Badge } from "@heroui/badge";

interface Person {
  id: string;
  name: string;
  relation: string;
  tldr?: string;
  created_at: string;
  updated_at?: string;
  notes_count: number;
  notes?: PersonNote[];
  is_primary_user: boolean;
}

interface PersonNote {
  id: string;
  person_id: string;
  title: string;
  content?: string;
  tags: string[];
  created_at: string;
}

export default function PeopleTab({ onTabChange }: { onTabChange?: (tabId: string) => void }) {
  const { notifyPersonChange } = useNeuralContext();
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPerson, setNewPerson] = useState({
    name: '',
    relation: 'amigo',
    tldr: ''
  });

  // Reset navigation when tab becomes active
  useEffect(() => {
    const handleReset = () => {
      setSelectedPerson(null);
      setShowAddForm(false);
    };

    // Listen for custom tab change events
    window.addEventListener('tab-changed-to-people', handleReset);
    
    return () => {
      window.removeEventListener('tab-changed-to-people', handleReset);
    };
  }, []);

  useEffect(() => {
    loadPeople();
  }, []);

  const loadPeople = async () => {
    setLoading(true);
    try {
      const peopleWithCounts = await detailQueries.getPeopleList();
      setPeople(peopleWithCounts.map(person => ({
        ...person,
        notes: []
      })));
    } catch (error) {
      console.error('Erro ao carregar people:', error);
      setPeople([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPersonDetail = async (personId: string) => {
    try {
      // Carregar notas da pessoa
      const { data: notes, error } = await supabase
        .from('person_notes')
        .select('*')
        .eq('person_id', personId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar notas:', error);
      } else {
        // Encontrar a pessoa e adicionar as notas
        const person = people.find(p => p.id === personId);
        if (person) {
          setSelectedPerson({
            ...person,
            notes: notes || []
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar pessoa:', error);
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
      notifyPersonChange(); // ✅ Notifica Overview tab!
    } catch (error) {
      console.error('Erro ao criar pessoa:', error);
      alert('Erro ao criar pessoa. Tente novamente.');
    }
  };

  const handleDeletePerson = async (id: string) => {
    // Proteger contra deleção do usuário principal
    const personToDelete = people.find(p => p.id === id);
    if (personToDelete?.is_primary_user) {
      alert('Não é possível deletar o usuário principal do sistema.');
      return;
    }

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
      if (selectedPerson?.id === id) {
        setSelectedPerson(null);
      }
      notifyPersonChange(); // 🔥 Notifica mudança
    } catch (error) {
      console.error('Erro ao deletar pessoa:', error);
      alert('Erro ao deletar pessoa. Tente novamente.');
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

  // ✅ PADRÃO CORRETO DO VITE: Navegação por página completa
  if (selectedPerson) {
    return <PersonDetail 
      person={selectedPerson}
      onBack={() => setSelectedPerson(null)}
      onUpdate={(updatedPerson: Person) => {
        setPeople(prev => prev.map(p => 
          p.id === updatedPerson.id ? updatedPerson : p
        ));
        setSelectedPerson(updatedPerson);
        notifyPersonChange(); // 🔥 Notifica mudança
      }}
      onDeletePerson={handleDeletePerson}
    />
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
                          <Card className="w-full bg-slate-800/60 backdrop-blur-sm border border-blue-400/40">
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
                </div>
                <Textarea
                  label="TL;DR"
                  placeholder="Descrição da pessoa..."
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
        {people.length > 0 ? (
          people.map((person) => (
            <Card 
              key={person.id}
              className="w-full bg-slate-800/60 backdrop-blur-sm border border-slate-600/60 hover:border-blue-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-400/10 cursor-pointer"
              isPressable
              onPress={() => {
                setSelectedPerson(person);
                loadPersonDetail(person.id);
              }}
            >
              <CardBody className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-slate-100 font-mono">{person.name}</h3>
                      {person.is_primary_user && (
                        <Badge color="warning" variant="flat" className="font-mono text-xs">
                          PRIMARY USER
                        </Badge>
                      )}
                      <span className="text-sm text-blue-400 capitalize font-mono">{person.relation}</span>
                    </div>
                    <p className="text-slate-300 font-mono">{person.tldr || 'Sem descrição'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-400 flex items-center gap-2 font-mono">
                      <span>{person.notes_count || 0} notes</span>
                      <Icon icon="lucide:message-circle" width={16} height={16} />
                    </div>
                    {!person.is_primary_user && (
                      <Button
                        size="sm"
                        variant="flat"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePerson(person.id);
                        }}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Icon icon="lucide:trash-2" width={16} height={16} />
                      </Button>
                    )}
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
            <Icon icon="lucide:users" width={64} height={64} className="mx-auto mb-6 text-slate-600" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2 font-mono">Nenhuma pessoa encontrada</h3>
            <p className="text-slate-500 font-mono">Adicione uma pessoa para começar</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ✅ COMPONENTE PERSONDETAIL COMO NO VITE ORIGINAL
function PersonDetail({ 
  person, 
  onBack, 
  onUpdate,
  onDeletePerson 
}: {
  person: Person;
  onBack: () => void;
  onUpdate: (person: Person) => void;
  onDeletePerson: (id: string) => void;
}) {
  const [editingName, setEditingName] = useState(false);
  const [editingTldr, setEditingTldr] = useState(false);
  const [editingRelation, setEditingRelation] = useState(false);
  const [tempName, setTempName] = useState(person.name);
  const [tempTldr, setTempTldr] = useState(person.tldr || '');
  const [tempRelation, setTempRelation] = useState(person.relation);
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: '' });
  
  // Collapsible states
  const [showNotesForm, setShowNotesForm] = useState(false);
  const [showNotesList, setShowNotesList] = useState(false);
  
  // Edit states
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editNoteData, setEditNoteData] = useState({ title: '', content: '', tags: '' });

  // Update states when person changes
  useEffect(() => {
    setTempName(person.name);
    setTempTldr(person.tldr || '');
    setTempRelation(person.relation);
  }, [person.name, person.tldr, person.relation]);

  const updatePerson = async (updates: any) => {
    try {
      const { error } = await supabase
        .from('people')
        .update(updates)
        .eq('id', person.id);

      if (error) {
        console.error('Erro ao atualizar pessoa:', error);
        return false;
      }

      onUpdate({
        ...person,
        ...updates,
        updated_at: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Erro ao atualizar pessoa:', error);
      return false;
    }
  };

  const handleSaveName = async () => {
    if (tempName.trim() === person.name) {
      setEditingName(false);
      return;
    }

    if (!tempName.trim()) {
      setTempName(person.name);
      setEditingName(false);
      return;
    }

    const success = await updatePerson({ name: tempName.trim() });
    if (success) {
      setEditingName(false);
    }
  };

  const handleSaveTldr = async () => {
    if (tempTldr === person.tldr) {
      setEditingTldr(false);
      return;
    }

    const success = await updatePerson({ tldr: tempTldr });
    if (success) {
      setEditingTldr(false);
    }
  };

  const handleSaveRelation = async () => {
    if (tempRelation === person.relation) {
      setEditingRelation(false);
      return;
    }

    const success = await updatePerson({ relation: tempRelation });
    if (success) {
      setEditingRelation(false);
    }
  };

  const createNote = async () => {
    if (!newNote.title.trim()) return;

    try {
      const { data, error } = await supabase
        .from('person_notes')
        .insert([{
          person_id: person.id,
          title: newNote.title,
          content: newNote.content,
          tags: newNote.tags.split(',').map(t => t.trim()).filter(Boolean)
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar nota:', error);
        return;
      }

      // Update local state instead of reload
      const updatedPerson = {
        ...person,
        notes: [data, ...(person.notes || [])]
      };
      onUpdate(updatedPerson);

      setNewNote({ title: '', content: '', tags: '' });
      setShowNotesForm(false);
    } catch (error) {
      console.error('Erro ao criar nota:', error);
    }
  };

  // Edit note functions
  const handleEditNote = (note: PersonNote) => {
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
        .from('person_notes')
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

      // Update local state instead of reload
      const updatedNotes = (person.notes || []).map(note => 
        note.id === editingNote 
          ? { 
              ...note, 
              title: editNoteData.title,
              content: editNoteData.content,
              tags: editNoteData.tags.split(',').map(t => t.trim()).filter(Boolean)
            }
          : note
      );
      
      const updatedPerson = {
        ...person,
        notes: updatedNotes
      };
      onUpdate(updatedPerson);

      setEditingNote(null);
    } catch (error) {
      console.error('Erro ao atualizar nota:', error);
    }
  };

  const handleCancelNoteEdit = () => {
    setEditingNote(null);
    setEditNoteData({ title: '', content: '', tags: '' });
  };

  const deleteNote = async (noteId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta nota?')) return;

    try {
      const { error } = await supabase
        .from('person_notes')
        .delete()
        .eq('id', noteId);

      if (error) {
        console.error('Erro ao deletar nota:', error);
        return;
      }

      // Update local state instead of reload
      const updatedNotes = (person.notes || []).filter(note => note.id !== noteId);
      const updatedPerson = {
        ...person,
        notes: updatedNotes
      };
      onUpdate(updatedPerson);
    } catch (error) {
      console.error('Erro ao deletar nota:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { 
            label: "People", 
            icon: "lucide:users",
            onClick: onBack
          },
          { 
            label: person.name, 
            icon: "lucide:user",
            isActive: true
          }
        ]} 
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {editingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveName();
                  }
                  if (e.key === 'Escape') {
                    setTempName(person.name);
                    setEditingName(false);
                  }
                }}
                autoFocus
                className="w-80"
                classNames={{
                  inputWrapper: "bg-slate-800/60 border-slate-600/60",
                  input: "text-blue-400 font-mono text-3xl font-bold"
                }}
              />
            </div>
          ) : (
            <motion.h2 
              className="text-4xl font-bold text-blue-400 font-mono cursor-pointer hover:text-blue-300 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setEditingName(true)}
              title="Click to edit person name"
            >
              👤 {person.name}
            </motion.h2>
          )}
        </div>
        
        <div className="flex gap-2">
          {!person.is_primary_user && (
            <Button
              onClick={() => onDeletePerson(person.id)}
              className="bg-red-900/20 border border-red-500/30 text-red-400 hover:bg-red-900/30 font-mono"
            >
              <Icon icon="lucide:trash-2" width={16} height={16} />
              Delete Person
            </Button>
          )}
        </div>
      </div>

      {/* Relation */}
      <Card className="w-full bg-slate-800/60 backdrop-blur-sm border border-slate-600/60">
        <CardBody className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-blue-400 font-mono">Relação</h3>
            <Button
              size="sm"
              variant="flat"
              onClick={() => setEditingRelation(!editingRelation)}
              className="text-slate-400 hover:text-slate-100"
            >
              <Icon icon="lucide:edit" width={16} height={16} />
            </Button>
          </div>
          
          {editingRelation ? (
            <div className="flex gap-2">
              <Input
                value={tempRelation}
                onChange={(e) => setTempRelation(e.target.value)}
                classNames={{
                  inputWrapper: "bg-slate-700/60 border-slate-600/60",
                  input: "text-slate-100 font-mono"
                }}
              />
              <Button size="sm" onClick={handleSaveRelation} className="bg-green-600">
                <Icon icon="lucide:check" width={16} height={16} />
              </Button>
              <Button size="sm" variant="bordered" onClick={() => setEditingRelation(false)}>
                <Icon icon="lucide:x" width={16} height={16} />
              </Button>
            </div>
          ) : (
            <p className="text-slate-300 capitalize font-mono">{person.relation}</p>
          )}
        </CardBody>
      </Card>

      {/* TL;DR */}
      <Card className="w-full bg-slate-800/60 backdrop-blur-sm border border-slate-600/60">
        <CardBody className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-blue-400 font-mono">TL;DR</h3>
            <Button
              size="sm"
              variant="flat"
              onClick={() => setEditingTldr(!editingTldr)}
              className="text-slate-400 hover:text-slate-100"
            >
              <Icon icon="lucide:edit" width={16} height={16} />
            </Button>
          </div>
          
          {editingTldr ? (
            <div className="space-y-2">
              <Textarea
                value={tempTldr}
                onChange={(e) => setTempTldr(e.target.value)}
                minRows={3}
                classNames={{
                  inputWrapper: "bg-slate-700/60 border-slate-600/60",
                  input: "text-slate-100 font-mono"
                }}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveTldr} className="bg-green-600">
                  <Icon icon="lucide:check" width={16} height={16} />
                </Button>
                <Button size="sm" variant="bordered" onClick={() => setEditingTldr(false)}>
                  <Icon icon="lucide:x" width={16} height={16} />
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-slate-300 font-mono">{person.tldr || 'Sem descrição'}</p>
          )}
        </CardBody>
      </Card>

      {/* Notes */}
      <Card className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/60">
        <CardBody className="p-6">
          <div className="space-y-6">
            {/* Add Note Form */}
            <CollapsibleForm
              title="Add Person Note"
              buttonText="Add Note"
              isOpen={showNotesForm}
              onToggle={() => setShowNotesForm(!showNotesForm)}
              buttonColor="bg-blue-600 hover:bg-blue-500"
              borderColor="border-blue-400/40"
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
                  minRows={2}
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
                  className="bg-blue-600 hover:bg-blue-500 text-white font-mono"
                >
                  <Icon icon="lucide:plus" width={16} height={16} />
                  Create Note
                </Button>
              </div>
            </CollapsibleForm>

            {/* Notes List */}
            <CollapsibleSection
              title="Notes"
              count={person.notes?.length || 0}
              isOpen={showNotesList}
              onToggle={() => setShowNotesList(!showNotesList)}
            >
              <div className="space-y-4">
                {person.notes && person.notes.length > 0 ? (
                  person.notes.map(note => (
                    <div key={note.id} className="bg-slate-900/60 p-4 rounded-lg border-l-4 border-blue-500">
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
                            minRows={2}
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
                            <h4 className="font-semibold text-slate-100 font-mono">{note.title}</h4>
                            <div className="flex gap-2">
                              <Button
                                isIconOnly
                                size="sm"
                                variant="flat"
                                onClick={() => handleEditNote(note)}
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                              >
                                <Icon icon="lucide:edit" width={14} height={14} />
                              </Button>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="flat"
                                onClick={() => deleteNote(note.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                              >
                                <Icon icon="lucide:trash-2" width={14} height={14} />
                              </Button>
                            </div>
                          </div>
                          {note.content && (
                            <p className="text-slate-300 text-sm mb-3 font-mono">{note.content}</p>
                          )}
                          <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                              {note.tags?.map(tag => (
                                <Chip key={tag} size="sm" className="bg-slate-700 text-slate-300 font-mono text-xs">
                                  #{tag}
                                </Chip>
                              ))}
                            </div>
                            <span className="text-xs text-slate-500 font-mono">
                              {new Date(note.created_at).toLocaleString('pt-BR')}
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
  );
} 