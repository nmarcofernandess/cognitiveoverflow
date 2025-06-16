import React, { useState, useEffect } from 'react'
import { ArrowLeft, Edit, Check, X, Plus, MessageCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import AddPersonModal from './modals/AddPersonModal'
import AddNoteModal from './modals/AddNoteModal'
import { supabase } from '@/lib/supabase.js'



export default function PeopleTab() {
  const [people, setPeople] = useState([])
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [editingTldr, setEditingTldr] = useState(null)
  const [editingRelation, setEditingRelation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddPersonModal, setShowAddPersonModal] = useState(false)

  useEffect(() => {
    loadPeople()
  }, [])

  const loadPeople = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('people')
        .select(`
          id,
          name,
          relation,
          tldr,
          created_at
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar people:', error)
        setPeople([])
      } else {
        // Get notes count for each person
        const peopleWithCounts = await Promise.all(
          (data || []).map(async (person) => {
            const { count } = await supabase
              .from('person_notes')
              .select('*', { count: 'exact', head: true })
              .eq('person_id', person.id)
            
            return {
              ...person,
              notes_count: count || 0,
              notes: [] // Será carregado no detail
            }
          })
        )
        setPeople(peopleWithCounts)
      }
    } catch (error) {
      console.error('Erro ao carregar people:', error)
      setPeople([])
    } finally {
      setLoading(false)
    }
  }

  const loadPersonDetail = async (personId) => {
    try {
      // Carregar notas da pessoa
      const { data: notes, error } = await supabase
        .from('person_notes')
        .select('*')
        .eq('person_id', personId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao carregar notas:', error)
      } else {
        // Atualizar pessoa selecionada com as notas
        setSelectedPerson(prev => ({
          ...prev,
          notes: notes || []
        }))
      }
    } catch (error) {
      console.error('Erro ao carregar pessoa:', error)
    }
  }

  const updatePerson = async (personId, updates) => {
    try {
      const { data, error } = await supabase
        .from('people')
        .update(updates)
        .eq('id', personId)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar pessoa:', error)
        return false
      }

      // Atualiza pessoa na lista
      setPeople(prev => prev.map(p => 
        p.id === personId ? { ...p, ...updates } : p
      ))
      
      // Atualiza pessoa selecionada
      if (selectedPerson?.id === personId) {
        setSelectedPerson(prev => ({ ...prev, ...updates }))
      }
      return true
    } catch (error) {
      console.error('Erro ao atualizar pessoa:', error)
      return false
    }
  }

  const addNote = async (personId, noteData) => {
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
        .single()

      if (error) {
        console.error('Erro ao adicionar nota:', error)
        return false
      }
      
      // Atualiza pessoa com nova nota
      setPeople(prev => prev.map(p => 
        p.id === personId 
          ? { ...p, notes_count: p.notes_count + 1 }
          : p
      ))
      
      if (selectedPerson?.id === personId) {
        setSelectedPerson(prev => ({
          ...prev,
          notes: [data, ...prev.notes],
          notes_count: prev.notes_count + 1
        }))
      }
      
      return true
    } catch (error) {
      console.error('Erro ao adicionar nota:', error)
      return false
    }
  }

  const deletePerson = async (personId) => {
    if (!confirm('Tem certeza que deseja deletar esta pessoa? Esta ação não pode ser desfeita.')) {
      return false
    }

    try {
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', personId)

      if (error) {
        console.error('Erro ao deletar pessoa:', error)
        alert('Erro ao deletar pessoa. Tente novamente.')
        return false
      }

      // Remove pessoa da lista
      setPeople(prev => prev.filter(p => p.id !== personId))
      
      // Se estava visualizando esta pessoa, volta para a lista
      if (selectedPerson?.id === personId) {
        setSelectedPerson(null)
      }
      
      return true
    } catch (error) {
      console.error('Erro ao deletar pessoa:', error)
      alert('Erro ao deletar pessoa. Tente novamente.')
      return false
    }
  }

  const deleteNote = async (noteId, personId) => {
    if (!confirm('Tem certeza que deseja deletar esta nota?')) {
      return false
    }

    try {
      const { error } = await supabase
        .from('person_notes')
        .delete()
        .eq('id', noteId)

      if (error) {
        console.error('Erro ao deletar nota:', error)
        alert('Erro ao deletar nota. Tente novamente.')
        return false
      }

      // Atualiza pessoa removendo a nota
      setPeople(prev => prev.map(p => 
        p.id === personId 
          ? { ...p, notes_count: Math.max(0, p.notes_count - 1) }
          : p
      ))
      
      if (selectedPerson?.id === personId) {
        setSelectedPerson(prev => ({
          ...prev,
          notes: prev.notes.filter(n => n.id !== noteId),
          notes_count: Math.max(0, prev.notes_count - 1)
        }))
      }
      
      return true
    } catch (error) {
      console.error('Erro ao deletar nota:', error)
      alert('Erro ao deletar nota. Tente novamente.')
      return false
    }
  }

  const handleSaveTldr = async (personId, newTldr) => {
    const success = await updatePerson(personId, { tldr: newTldr })
    if (success) {
      setEditingTldr(null)
    }
  }

  const handleSaveRelation = async (personId, newRelation) => {
    const success = await updatePerson(personId, { relation: newRelation })
    if (success) {
      setEditingRelation(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Carregando pessoas...</div>
      </div>
    )
  }

  if (selectedPerson) {
    return <PersonDetail 
      person={selectedPerson}
      onBack={() => setSelectedPerson(null)}
      editingTldr={editingTldr}
      setEditingTldr={setEditingTldr}
      editingRelation={editingRelation}
      setEditingRelation={setEditingRelation}
      onSaveTldr={handleSaveTldr}
      onSaveRelation={handleSaveRelation}
      onAddNote={addNote}
      onDeletePerson={deletePerson}
      onDeleteNote={deleteNote}
    />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-green-400">👥 People</h2>
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={() => setShowAddPersonModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Person
        </Button>
      </div>
      
      <div className="text-center mb-4">
        <p className="text-xs text-green-400">
          ✅ Conectado ao Supabase - Dados reais
        </p>
      </div>
      
      <div className="grid gap-4">
        {people.map(person => (
          <div 
            key={person.id} 
            className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div 
                className="flex-1 cursor-pointer"
                onClick={() => {
                  setSelectedPerson(person)
                  loadPersonDetail(person.id)
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-white">{person.name}</h3>
                  <span className="text-sm text-blue-400 capitalize">{person.relation}</span>
                </div>
                <p className="text-gray-300">{person.tldr || 'Sem descrição'}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-400">
                  {person.notes_count || 0} notes
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    deletePerson(person.id)
                  }}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AddPersonModal
        isOpen={showAddPersonModal}
        onClose={() => setShowAddPersonModal(false)}
        onSuccess={async (newPerson) => {
          try {
            const { data, error } = await supabase
              .from('people')
              .insert([{
                name: newPerson.name,
                relation: newPerson.relation || 'amigo',
                tldr: newPerson.tldr || null
              }])
              .select()
              .single()

            if (error) {
              console.error('Erro ao criar pessoa:', error)
              alert('Erro ao criar pessoa. Tente novamente.')
            } else {
              // Adiciona a nova pessoa na lista
              setPeople(prev => [{
                ...data,
                notes_count: 0,
                notes: []
              }, ...prev])
              setShowAddPersonModal(false)
            }
          } catch (error) {
            console.error('Erro ao criar pessoa:', error)
            alert('Erro ao criar pessoa. Tente novamente.')
          }
        }}
      />
    </div>
  )
}

function PersonDetail({ 
  person, 
  onBack, 
  editingTldr, 
  setEditingTldr, 
  editingRelation,
  setEditingRelation,
  onSaveTldr, 
  onSaveRelation,
  onAddNote,
  onDeletePerson,
  onDeleteNote
}) {
  const [tldrValue, setTldrValue] = useState(person.tldr || '')
  const [relationValue, setRelationValue] = useState(person.relation || '')
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: '' })

  const handleAddNote = async () => {
    if (!newNote.title.trim()) return

    const noteData = {
      title: newNote.title,
      content: newNote.content,
      tags: newNote.tags.split(',').map(t => t.trim()).filter(Boolean)
    }

    const success = await onAddNote(person.id, noteData)
    if (success) {
      setNewNote({ title: '', content: '', tags: '' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-2xl font-bold text-green-400">{person.name}</h2>
        </div>
        <Button
          variant="ghost"
          onClick={() => onDeletePerson(person.id)}
          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Person
        </Button>
      </div>

      <div className="flex items-center gap-4">
        
        {editingRelation === person.id ? (
          <div className="flex items-center gap-2">
            <select
              value={relationValue}
              onChange={(e) => setRelationValue(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm"
            >
              <option value="esposa">esposa</option>
              <option value="irmão">irmão</option>
              <option value="amigo">amigo</option>
              <option value="pai">pai</option>
              <option value="mãe">mãe</option>
              <option value="colega">colega</option>
            </select>
            <Button 
              size="sm" 
              onClick={() => onSaveRelation(person.id, relationValue)}
              className="bg-green-600"
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setEditingRelation(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-blue-400 capitalize">{person.relation}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditingRelation(person.id)}
            >
              <Edit className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold text-green-400">TL;DR</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditingTldr(editingTldr ? null : person.id)}
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
        
        {editingTldr === person.id ? (
          <div className="space-y-2">
            <textarea 
              value={tldrValue}
              onChange={(e) => setTldrValue(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white"
              rows={3}
              placeholder="Descrição da pessoa para contexto da IA..."
            />
            <div className="flex gap-2">
              <Button 
                size="sm"
                onClick={() => onSaveTldr(person.id, tldrValue)}
                className="bg-green-600"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button 
                size="sm"
                variant="outline"
                onClick={() => setEditingTldr(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-300">{person.tldr || 'Sem descrição'}</p>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-blue-400">
            Notes ({person.notes?.length || 0})
          </h3>
        </div>
        
        {/* Add Note Form */}
        <div className="bg-gray-900 p-4 rounded mb-4">
          <h4 className="font-semibold text-white mb-2">Add New Note</h4>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Note title..."
              value={newNote.title}
              onChange={(e) => setNewNote({...newNote, title: e.target.value})}
              className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white"
            />
            <textarea
              placeholder="Note content..."
              value={newNote.content}
              onChange={(e) => setNewNote({...newNote, content: e.target.value})}
              className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white"
              rows={3}
            />
            <input
              type="text"
              placeholder="Tags (comma separated)..."
              value={newNote.tags}
              onChange={(e) => setNewNote({...newNote, tags: e.target.value})}
              className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white"
            />
            <Button 
              onClick={handleAddNote}
              disabled={!newNote.title.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Note
            </Button>
          </div>
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          {person.notes?.map(note => (
            <div key={note.id} className="bg-gray-900 p-4 rounded border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-white">{note.title}</h4>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => onDeleteNote(note.id, person.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-3">{note.content}</p>
              <div className="flex gap-2 mb-2">
                {note.tags?.map(tag => (
                  <span key={tag} className="text-xs bg-gray-700 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {new Date(note.created_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 