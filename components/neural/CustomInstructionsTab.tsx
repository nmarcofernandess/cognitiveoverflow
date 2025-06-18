'use client'

import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader } from "@heroui/card"
import { Button } from "@heroui/button"
import { Input, Textarea } from "@heroui/input"
import { Chip } from "@heroui/chip"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react"
import { customQueries, type CustomInstructions, type Memory } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { useNeuralContext } from './context/NeuralContext'
import { Icon } from '@iconify/react'

export default function CustomInstructionsTab({ onTabChange }: { onTabChange?: (tabId: string) => void }) {
  const { notifyPersonaChange } = useNeuralContext()
  const [customInstructions, setCustomInstructions] = useState<CustomInstructions | null>(null)
  const [marcoData, setMarcoData] = useState<{ name: string; tldr?: string } | null>(null)
  const [allMemory, setAllMemory] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBehavior, setEditingBehavior] = useState(false)
  const [editingMCP, setEditingMCP] = useState(false)
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null)
  const [newMemory, setNewMemory] = useState({ title: '', content: '', tags: '' })

  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [instructions, memory] = await Promise.all([
        customQueries.getCustomInstructions(),
        customQueries.getMemoryList()
      ])

      const { data: marco } = await supabase
        .from('people')
        .select('name, tldr')
        .eq('is_primary_user', true)
        .single()

      setCustomInstructions(instructions)
      setMarcoData(marco)
      setAllMemory(memory)
    } catch (error) {
      console.error('Error loading custom instructions data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBehavior = async () => {
    if (!customInstructions) return

    const success = await customQueries.updateCustomInstructions(customInstructions)
    if (success) {
      setEditingBehavior(false)
      await loadData()
      notifyPersonaChange()
    }
  }

  const handleSaveMCP = async () => {
    if (!customInstructions) return

    const success = await customQueries.updateCustomInstructions(customInstructions)
    if (success) {
      setEditingMCP(false)
      await loadData()
      notifyPersonaChange()
    }
  }

  const handleCreateMemory = async () => {
    if (!newMemory.title.trim() || !newMemory.content.trim()) return

    const memoryData = {
      title: newMemory.title.trim(),
      content: newMemory.content.trim(),
      tags: newMemory.tags.trim() ? newMemory.tags.split(',').map(tag => tag.trim()).filter(Boolean) : null
    }

    const success = await customQueries.createMemory(memoryData)
    if (success) {
      setNewMemory({ title: '', content: '', tags: '' })
      onClose()
      await loadData()
      notifyPersonaChange()
    }
  }

  const handleUpdateMemory = async () => {
    if (!editingMemory) return

    const success = await customQueries.updateMemory(editingMemory.id, editingMemory)
    if (success) {
      setEditingMemory(null)
      await loadData()
      notifyPersonaChange()
    }
  }

  const handleDeleteMemory = async (id: string) => {
    const success = await customQueries.deleteMemory(id)
    if (success) {
      await loadData()
      notifyPersonaChange()
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-32 bg-default-100 rounded-lg"></div>
        <div className="h-40 bg-default-100 rounded-lg"></div>
        <div className="h-40 bg-default-100 rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Usuário Principal */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
        <CardHeader className="flex items-center gap-3">
          <Icon icon="lucide:user" className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-xl font-semibold">Usuário Principal</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Configuração protegida do sistema</p>
          </div>
        </CardHeader>
        <CardBody>
          {marcoData && (
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="font-medium">{marcoData.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{marcoData.tldr}</p>
              </div>
              <Button
                size="sm"
                variant="light"
                onClick={() => onTabChange?.('people')}
              >
                <Icon icon="lucide:external-link" className="w-4 h-4 mr-2" />
                Editar Perfil
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Comportamento da IA */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon icon="lucide:brain" className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="text-xl font-semibold">Comportamento da IA</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Personalidade e tom de voz</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="light"
            onClick={() => setEditingBehavior(!editingBehavior)}
          >
            <Icon icon={editingBehavior ? "lucide:x" : "lucide:edit"} className="w-4 h-4 mr-2" />
            {editingBehavior ? 'Cancelar' : 'Editar'}
          </Button>
        </CardHeader>
        <CardBody>
          {editingBehavior ? (
            <div className="space-y-4">
              <Textarea
                label="Descrição do Comportamento"
                placeholder="Como a IA deve se comportar..."
                value={customInstructions?.behavior_description || ''}
                onChange={(e) => setCustomInstructions(prev => prev ? { ...prev, behavior_description: e.target.value } : null)}
                minRows={4}
              />
              <div className="flex gap-2">
                <Button color="primary" onClick={handleSaveBehavior}>
                  Salvar
                </Button>
                <Button variant="light" onClick={() => setEditingBehavior(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {customInstructions?.behavior_description}
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Instruções MCP */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon icon="lucide:terminal" className="w-6 h-6 text-cyan-600" />
            <div>
              <h3 className="text-xl font-semibold">Instruções MCP</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Como usar o sistema Neural</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="light"
            onClick={() => setEditingMCP(!editingMCP)}
          >
            <Icon icon={editingMCP ? "lucide:x" : "lucide:edit"} className="w-4 h-4 mr-2" />
            {editingMCP ? 'Cancelar' : 'Editar'}
          </Button>
        </CardHeader>
        <CardBody>
          {editingMCP ? (
            <div className="space-y-4">
              <Textarea
                label="Instruções MCP"
                placeholder="Como a IA deve usar o sistema MCP..."
                value={customInstructions?.mcp_context_instructions || ''}
                onChange={(e) => setCustomInstructions(prev => prev ? { ...prev, mcp_context_instructions: e.target.value } : null)}
                minRows={4}
              />
              <div className="flex gap-2">
                <Button color="primary" onClick={handleSaveMCP}>
                  Salvar
                </Button>
                <Button variant="light" onClick={() => setEditingMCP(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {customInstructions?.mcp_context_instructions}
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Sistema de Memória */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon icon="lucide:database" className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="text-xl font-semibold">Sistema de Memória</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Insights e contextos para a IA ({allMemory.length} total)</p>
            </div>
          </div>
          <Button
            size="sm"
            color="primary"
            onClick={onOpen}
          >
            <Icon icon="lucide:plus" className="w-4 h-4 mr-2" />
            Nova Memória
          </Button>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {allMemory.length > 0 ? (
              allMemory.map((memory) => (
                <div key={memory.id} className="p-4 border rounded-lg">
                  {editingMemory?.id === memory.id ? (
                    <div className="space-y-4">
                      <Input
                        label="Título"
                        value={editingMemory.title}
                        onChange={(e) => setEditingMemory({ ...editingMemory, title: e.target.value })}
                      />
                      <Textarea
                        label="Conteúdo"
                        value={editingMemory.content}
                        onChange={(e) => setEditingMemory({ ...editingMemory, content: e.target.value })}
                        minRows={3}
                      />
                      <Input
                        label="Tags (separadas por vírgula)"
                        value={editingMemory.tags?.join(', ') || ''}
                        onChange={(e) => setEditingMemory({ 
                          ...editingMemory, 
                          tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                        })}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" color="primary" onClick={handleUpdateMemory}>
                          Salvar
                        </Button>
                        <Button size="sm" variant="light" onClick={() => setEditingMemory(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{memory.title}</h4>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="light"
                            onClick={() => setEditingMemory(memory)}
                          >
                            <Icon icon="lucide:edit" className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            color="danger"
                            onClick={() => handleDeleteMemory(memory.id)}
                          >
                            <Icon icon="lucide:trash" className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {memory.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1 flex-wrap">
                          {memory.tags && memory.tags.map((tag, idx) => (
                            <Chip key={idx} size="sm" variant="flat">
                              {tag}
                            </Chip>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(memory.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-gray-500">
                Nenhuma memória encontrada. Adicione a primeira!
              </p>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Modal Nova Memória */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader>Criar Nova Memória</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Título"
                placeholder="Nome da memória..."
                value={newMemory.title}
                onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
              />
              <Textarea
                label="Conteúdo"
                placeholder="Descreva o insight, contexto ou informação..."
                value={newMemory.content}
                onChange={(e) => setNewMemory({ ...newMemory, content: e.target.value })}
                minRows={4}
              />
              <Input
                label="Tags (separadas por vírgula)"
                placeholder="tag1, tag2, tag3..."
                value={newMemory.tags}
                onChange={(e) => setNewMemory({ ...newMemory, tags: e.target.value })}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onClick={onClose}>
              Cancelar
            </Button>
            <Button color="primary" onClick={handleCreateMemory}>
              Criar Memória
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
} 