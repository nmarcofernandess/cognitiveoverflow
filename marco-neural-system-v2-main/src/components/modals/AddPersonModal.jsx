import React, { useState } from 'react'
import { X, Plus, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'

// Removido array fixo - agora é input livre

export default function AddPersonModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    relation: '',
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
      // Chama a função onSuccess passada pelo componente pai
      await onSuccess?.(formData)
      handleClose()
    } catch (err) {
      setError(err.message || 'Erro ao criar pessoa')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({ name: '', relation: '', tldr: '' })
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
          <h2 className="text-xl font-bold text-green-400">Add Person</h2>
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
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-green-400 focus:outline-none"
              placeholder="Nome da pessoa..."
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Relação
            </label>
            <input
              type="text"
              value={formData.relation}
              onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-green-400 focus:outline-none"
              placeholder="Ex: esposa, irmão, amigo, colega..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              TL;DR
            </label>
            <textarea
              value={formData.tldr}
              onChange={(e) => setFormData({ ...formData, tldr: e.target.value })}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-green-400 focus:outline-none"
              rows={3}
              placeholder="Descrição da pessoa para contexto da IA..."
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
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Person
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