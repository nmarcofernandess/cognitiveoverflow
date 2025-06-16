import React, { useState, useEffect } from 'react'
import { ArrowLeft, Edit, Check, X, Plus, Clock, CheckCircle, Circle, AlertCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import NewProjectModal from './modals/NewProjectModal'
import NewSprintModal from './modals/NewSprintModal'
import AddTaskModal from './modals/AddTaskModal'
import AddNoteModal from './modals/AddNoteModal'
import { supabase } from '@/lib/supabase.js'



export default function ProjectsTab() {
  const [projects, setProjects] = useState([])
  const [selectedSprint, setSelectedSprint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [showNewSprintModal, setShowNewSprintModal] = useState(false)
  const [newSprintProject, setNewSprintProject] = useState(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          tldr,
          created_at,
          sprints(
            id,
            name,
            tldr,
            status,
            created_at
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar projects:', error)
        setProjects([])
      } else {
        // Transform data to match expected format and get task counts
        const projectsWithSprints = await Promise.all(
          (data || []).map(async (project) => ({
            ...project,
            sprints: await Promise.all(
              (project.sprints || []).map(async (sprint) => {
                const { count } = await supabase
                  .from('tasks')
                  .select('*', { count: 'exact', head: true })
                  .eq('sprint_id', sprint.id)
                
                return {
                  ...sprint,
                  task_count: count || 0,
                  tasks: [], // Será carregado no detail
                  notes: [] // Será carregado no detail
                }
              })
            )
          }))
        )
        setProjects(projectsWithSprints)
      }
    } catch (error) {
      console.error('Erro ao carregar projects:', error)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const loadSprintDetail = async (sprintId) => {
    try {
      // Carregar tasks e notes do sprint
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
      ])

      if (tasksResult.error) {
        console.error('Erro ao carregar tasks:', tasksResult.error)
      }
      if (notesResult.error) {
        console.error('Erro ao carregar notes:', notesResult.error)
      }

      // Atualizar sprint selecionado com tasks e notes
      setSelectedSprint(prev => ({
        ...prev,
        tasks: tasksResult.data || [],
        notes: notesResult.data || []
      }))
    } catch (error) {
      console.error('Erro ao carregar sprint:', error)
    }
  }

  const deleteProject = async (projectId) => {
    if (!confirm('Tem certeza que deseja deletar este projeto? Todos os sprints e tasks serão deletados também. Esta ação não pode ser desfeita.')) {
      return false
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) {
        console.error('Erro ao deletar projeto:', error)
        alert('Erro ao deletar projeto. Tente novamente.')
        return false
      }

      // Remove projeto da lista
      setProjects(prev => prev.filter(p => p.id !== projectId))
      
      return true
    } catch (error) {
      console.error('Erro ao deletar projeto:', error)
      alert('Erro ao deletar projeto. Tente novamente.')
      return false
    }
  }

  const deleteSprint = async (sprintId) => {
    if (!confirm('Tem certeza que deseja deletar este sprint? Todas as tasks e notas serão deletadas também. Esta ação não pode ser desfeita.')) {
      return false
    }

    try {
      const { error } = await supabase
        .from('sprints')
        .delete()
        .eq('id', sprintId)

      if (error) {
        console.error('Erro ao deletar sprint:', error)
        alert('Erro ao deletar sprint. Tente novamente.')
        return false
      }

      // Se estava visualizando este sprint, volta para a lista
      if (selectedSprint?.id === sprintId) {
        setSelectedSprint(null)
      }

      // Recarrega a lista de projetos
      loadProjects()
      
      return true
    } catch (error) {
      console.error('Erro ao deletar sprint:', error)
      alert('Erro ao deletar sprint. Tente novamente.')
      return false
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Carregando projects...</div>
      </div>
    )
  }

  if (selectedSprint) {
    return <SprintDetail 
      sprint={selectedSprint}
      onBack={() => setSelectedSprint(null)}
      onUpdate={() => {
        loadSprintDetail(selectedSprint.id)
        loadProjects()
      }}
      onDeleteSprint={deleteSprint}
    />
  }

  // Flatten all sprints from all projects
  const allSprints = projects.flatMap(project => 
    project.sprints?.map(sprint => ({
      ...sprint,
      project_name: project.name
    })) || []
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400'
      case 'completed': return 'text-blue-400'
      case 'archived': return 'text-gray-400'
      default: return 'text-gray-300'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Circle className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'archived': return <AlertCircle className="w-4 h-4" />
      default: return <Circle className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-green-400">🚀 Projects & Sprints</h2>
        <div className="flex gap-2">
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => setShowNewProjectModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => {
              // Para simplificar, vamos usar o primeiro projeto como padrão
              const firstProject = projects[0]
              if (firstProject) {
                setNewSprintProject(firstProject)
                setShowNewSprintModal(true)
              }
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Sprint
          </Button>
        </div>
      </div>

      <div className="text-center mb-4">
        <p className="text-xs text-green-400">
          ✅ Conectado ao Supabase - Dados reais
        </p>
      </div>

      <div className="grid gap-4">
        {allSprints.map(sprint => (
          <div 
            key={sprint.id} 
            className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div 
                className="flex-1 cursor-pointer"
                onClick={() => {
                  setSelectedSprint(sprint)
                  loadSprintDetail(sprint.id)
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-white">{sprint.name}</h3>
                  <span className="text-sm text-purple-400">{sprint.project_name}</span>
                  <div className={`flex items-center gap-1 text-sm ${getStatusColor(sprint.status)}`}>
                    {getStatusIcon(sprint.status)}
                    <span className="capitalize">{sprint.status}</span>
                  </div>
                </div>
                <p className="text-gray-300">{sprint.tldr || 'Sem descrição'}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-400 flex items-center gap-2">
                  <span>{sprint.task_count || 0} tasks</span>
                  <Clock className="w-4 h-4" />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteSprint(sprint.id)
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

      {allSprints.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">Nenhum sprint encontrado</p>
        </div>
      )}

      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onSuccess={(newProject) => {
          setProjects(prev => [newProject, ...prev])
          setShowNewProjectModal(false)
        }}
      />

      <NewSprintModal
        isOpen={showNewSprintModal}
        onClose={() => setShowNewSprintModal(false)}
        projectId={newSprintProject?.id}
        projectName={newSprintProject?.name}
        onSuccess={(newSprint) => {
          loadProjects() // Reload to get updated data
          setShowNewSprintModal(false)
          setNewSprintProject(null)
        }}
      />
    </div>
  )
}

function SprintDetail({ sprint, onBack, onUpdate, onDeleteSprint }) {
  const [editingTitle, setEditingTitle] = useState(null)
  const [editingTldr, setEditingTldr] = useState(null)
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 3 })
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: '' })

  const updateSprint = async (updates) => {
    try {
      const { data, error } = await supabase
        .from('sprints')
        .update(updates)
        .eq('id', sprint.id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar sprint:', error)
        return false
      }

      onUpdate()
      return true
    } catch (error) {
      console.error('Erro ao atualizar sprint:', error)
      return false
    }
  }

  const updateTask = async (taskId, updates) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar task:', error)
        return false
      }

      onUpdate()
      return true
    } catch (error) {
      console.error('Erro ao atualizar task:', error)
      return false
    }
  }

  const createTask = async () => {
    if (!newTask.title.trim()) return

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          sprint_id: sprint.id,
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          status: 'pending'
        }])
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar task:', error)
        return false
      }

      setNewTask({ title: '', description: '', priority: 3 })
      onUpdate()
      return true
    } catch (error) {
      console.error('Erro ao criar task:', error)
      return false
    }
  }

  const createNote = async () => {
    if (!newNote.title.trim()) return

    const noteData = {
      title: newNote.title,
      content: newNote.content,
      tags: newNote.tags.split(',').map(t => t.trim()).filter(Boolean)
    }

    try {
      const { data, error } = await supabase
        .from('sprint_notes')
        .insert([{
          sprint_id: sprint.id,
          title: noteData.title,
          content: noteData.content,
          tags: noteData.tags
        }])
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar nota:', error)
        return false
      }

      setNewNote({ title: '', content: '', tags: '' })
      onUpdate()
      return true
    } catch (error) {
      console.error('Erro ao criar nota:', error)
      return false
    }
  }

  const deleteTask = async (taskId) => {
    if (!confirm('Tem certeza que deseja deletar esta task?')) {
      return false
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) {
        console.error('Erro ao deletar task:', error)
        alert('Erro ao deletar task. Tente novamente.')
        return false
      }

      onUpdate()
      return true
    } catch (error) {
      console.error('Erro ao deletar task:', error)
      alert('Erro ao deletar task. Tente novamente.')
      return false
    }
  }

  const deleteNote = async (noteId) => {
    if (!confirm('Tem certeza que deseja deletar esta nota?')) {
      return false
    }

    try {
      const { error } = await supabase
        .from('sprint_notes')
        .delete()
        .eq('id', noteId)

      if (error) {
        console.error('Erro ao deletar nota:', error)
        alert('Erro ao deletar nota. Tente novamente.')
        return false
      }

      onUpdate()
      return true
    } catch (error) {
      console.error('Erro ao deletar nota:', error)
      alert('Erro ao deletar nota. Tente novamente.')
      return false
    }
  }

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-400'
      case 'in_progress': return 'text-blue-400'
      case 'completed': return 'text-green-400'
      default: return 'text-gray-300'
    }
  }

  const getTaskStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Circle className="w-4 h-4" />
      case 'in_progress': return <Clock className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      default: return <Circle className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority) => {
    if (priority >= 4) return 'bg-red-500'
    if (priority === 3) return 'bg-yellow-500'
    return 'bg-gray-500'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex-1">
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                defaultValue={sprint.name}
                className="text-2xl font-bold bg-gray-800 border border-gray-600 rounded px-3 py-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateSprint({ name: e.target.value })
                    setEditingTitle(false)
                  }
                  if (e.key === 'Escape') {
                    setEditingTitle(false)
                  }
                }}
              />
              <Button size="sm" onClick={() => setEditingTitle(false)}>
                <Check className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-green-400">{sprint.name}</h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingTitle(true)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-purple-400">{sprint.projects?.name}</span>
            <span className="text-gray-400">•</span>
            <span className={`capitalize ${getTaskStatusColor(sprint.status)}`}>
              {sprint.status}
            </span>
          </div>
        </div>
        </div>
        <Button
          variant="ghost"
          onClick={() => {
            onDeleteSprint(sprint.id)
          }}
          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Sprint
        </Button>
      </div>

      {/* Sprint TL;DR */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold text-green-400">Sprint Description</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditingTldr(!editingTldr)}
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
        
        {editingTldr ? (
          <div className="space-y-2">
            <textarea 
              defaultValue={sprint.tldr || ''}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white"
              rows={3}
              placeholder="Sprint description..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  updateSprint({ tldr: e.target.value })
                  setEditingTldr(false)
                }
                if (e.key === 'Escape') {
                  setEditingTldr(false)
                }
              }}
            />
            <div className="text-xs text-gray-400">Ctrl+Enter to save, Escape to cancel</div>
          </div>
        ) : (
          <p className="text-gray-300">{sprint.tldr || 'Sem descrição'}</p>
        )}
      </div>

      {/* Tasks */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-blue-400">
            Tasks ({sprint.tasks?.length || 0})
          </h3>
        </div>
        
        {/* Add Task Form */}
        <div className="bg-gray-900 p-4 rounded mb-4">
          <h4 className="font-semibold text-white mb-2">Add New Task</h4>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Task title..."
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white"
            />
            <textarea
              placeholder="Task description..."
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white"
              rows={2}
            />
            <div className="flex gap-2">
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({...newTask, priority: parseInt(e.target.value)})}
                className="bg-gray-800 border border-gray-600 rounded p-2"
              >
                <option value={1}>Priority 1 (Low)</option>
                <option value={2}>Priority 2</option>
                <option value={3}>Priority 3 (Medium)</option>
                <option value={4}>Priority 4</option>
                <option value={5}>Priority 5 (High)</option>
              </select>
              <Button 
                onClick={createTask}
                disabled={!newTask.title.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {sprint.tasks?.map(task => (
            <div key={task.id} className="bg-gray-900 p-4 rounded border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => {
                      const newStatus = task.status === 'completed' ? 'pending' : 
                                     task.status === 'pending' ? 'in_progress' : 'completed'
                      updateTask(task.id, { status: newStatus })
                    }}
                    className={getTaskStatusColor(task.status)}
                  >
                    {getTaskStatusIcon(task.status)}
                  </button>
                  <h4 className="font-semibold text-white">{task.title}</h4>
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} 
                       title={`Priority ${task.priority}`} />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => deleteTask(task.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {task.description && (
                <p className="text-gray-300 text-sm mb-2 ml-7">{task.description}</p>
              )}
              <div className="flex justify-between items-center ml-7">
                <span className={`text-xs capitalize ${getTaskStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(task.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sprint Notes */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-purple-400">
            Sprint Notes ({sprint.sprint_notes?.length || 0})
          </h3>
        </div>
        
        {/* Add Note Form */}
        <div className="bg-gray-900 p-4 rounded mb-4">
          <h4 className="font-semibold text-white mb-2">Add Sprint Note</h4>
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
              onClick={createNote}
              disabled={!newNote.title.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Note
            </Button>
          </div>
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          {sprint.sprint_notes?.map(note => (
            <div key={note.id} className="bg-gray-900 p-4 rounded border-l-4 border-purple-500">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-white">{note.title}</h4>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => deleteNote(note.id)}
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