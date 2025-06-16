import React, { useState } from 'react'
import { X, Plus, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { supabase } from '@/lib/supabase.js'

export default function NewSprintModal({ isOpen, onClose, onSuccess, projectId, projectName }) {
  const [formData, setFormData] = useState({
    name: '',
    tldr: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('Nome é obrigatório')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase
        .from('sprints')
        .insert([{
          name: formData.name,
          tldr: formData.tldr || null,
          project_id: projectId,
          status: 'active'
        }])
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
    setFormData({ name: '', tldr: '' })
    setError('')
    onClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div 
        className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-purple-400">New Sprint</h2>
            {projectName && (
              <p className="text-sm text-gray-400 mt-1">em {projectName}</p>
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
              Nome *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-purple-400 focus:outline-none"
              placeholder="Nome do sprint..."
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              TL;DR
            </label>
            <textarea
              value={formData.tldr}
              onChange={(e) => setFormData({ ...formData, tldr: e.target.value })}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-purple-400 focus:outline-none"
              rows={3}
              placeholder="Descrição do sprint para contexto da IA..."
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded p-2">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  New Sprint
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