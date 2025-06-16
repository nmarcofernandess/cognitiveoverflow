import React, { useState } from 'react'
import { X, Plus, Loader2, Tag } from 'lucide-react'
import { Button } from '../ui/button'
import { supabase } from '@/lib/supabase.js'

export default function AddNoteModal({ isOpen, onClose, onSuccess, type, entityId, entityName }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: ''
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
      const noteData = {
        title: formData.title,
        content: formData.content,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      }

      // Convert to direct Supabase calls
      if (type === 'person') {
        noteData.person_id = entityId
        const { data, error } = await supabase
          .from('person_notes')
          .insert([noteData])
          .select()
          .single()

        if (error) throw new Error(error.message)
        onSuccess?.(data)
      } else {
        noteData.sprint_id = entityId
        const { data, error } = await supabase
          .from('sprint_notes')
          .insert([noteData])
          .select()
          .single()

        if (error) throw new Error(error.message)
        onSuccess?.(data)
      }

      handleClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({ title: '', content: '', tags: '' })
    setError('')
    onClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose()
    }
  }

  if (!isOpen) return null

  const modalTitle = type === 'person' ? 'Add Person Note' : 'Add Sprint Note'
  const colorClass = type === 'person' ? 'text-blue-400' : 'text-purple-400'
  const focusClass = type === 'person' ? 'focus:border-blue-400' : 'focus:border-purple-400'
  const buttonClass = type === 'person' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'

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
            <h2 className={`text-xl font-bold ${colorClass}`}>{modalTitle}</h2>
            {entityName && (
              <p className="text-sm text-gray-400 mt-1">para {entityName}</p>
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
              className={`w-full bg-gray-900 border border-gray-600 rounded p-3 text-white ${focusClass} focus:outline-none`}
              placeholder="Título da nota..."
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Conteúdo
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className={`w-full bg-gray-900 border border-gray-600 rounded p-3 text-white ${focusClass} focus:outline-none`}
              rows={4}
              placeholder="Conteúdo da nota..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className={`w-full bg-gray-900 border border-gray-600 rounded p-3 text-white ${focusClass} focus:outline-none`}
              placeholder="Tags separadas por vírgula..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Ex: importante, reunião, ideia
            </p>
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
              className={`flex-1 ${buttonClass} disabled:opacity-50`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Note
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