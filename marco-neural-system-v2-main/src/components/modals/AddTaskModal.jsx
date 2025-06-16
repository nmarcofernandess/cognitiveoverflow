import React, { useState } from 'react'
import { X, Plus, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { supabase } from '@/lib/supabase.js'

const PRIORITIES = [
  { value: 1, label: 'Priority 1 (Low)', color: 'text-gray-400' },
  { value: 2, label: 'Priority 2', color: 'text-blue-400' },
  { value: 3, label: 'Priority 3 (Medium)', color: 'text-yellow-400' },
  { value: 4, label: 'Priority 4', color: 'text-orange-400' },
  { value: 5, label: 'Priority 5 (High)', color: 'text-red-400' }
]

export default function AddTaskModal({ isOpen, onClose, onSuccess, sprintId, sprintName }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 3
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError('Título é obrigatório')
      return
    }

    setLoading(true)
    setError('')

    try {
      const taskData = {
        sprint_id: sprintId,
        title: formData.title,
        description: formData.description || null,
        priority: formData.priority,
        status: 'pending'
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      onSuccess?.(data)
      handleClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({ title: '', description: '', priority: 3 })
    setError('')
    onClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose()
    }
  }

  if (!isOpen) return null

  const selectedPriority = PRIORITIES.find(p => p.value === formData.priority)

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div 
        className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-blue-400">Add Task</h2>
            {sprintName && (
              <p className="text-sm text-gray-400 mt-1">para {sprintName}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-400 focus:outline-none"
              placeholder="Título da task..."
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-400 focus:outline-none"
              rows={3}
              placeholder="Descrição da task..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Prioridade
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-400 focus:outline-none"
            >
              {PRIORITIES.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-400 mr-2">Preview:</span>
              <span className={`text-sm font-medium ${selectedPriority?.color}`}>
                {selectedPriority?.label}
              </span>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded p-2">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 