import React, { useState, useEffect } from 'react'
import { Brain } from 'lucide-react'
import { supabase } from '@/lib/supabase.js'



export default function OverviewTab() {
  const [manifest, setManifest] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadManifest()
  }, [])

  const loadManifest = async () => {
    setLoading(true)
    try {
      // Get people
      const { data: people } = await supabase
        .from('people')
        .select('name, relation, tldr')
        .limit(10)

      // Get projects with sprint counts
      const { data: projects } = await supabase
        .from('projects')
        .select(`
          name,
          tldr,
          sprints(count)
        `)
        .limit(10)

      const manifest = {
        user: {
          name: "Marco Fernandes",
          persona: "Rebelde intelectual, CEO/fundador DietFlow"
        },
        people: people || [],
        projects: (projects || []).map(project => ({
          ...project,
          sprint_count: project.sprints?.[0]?.count || 0
        })),
        last_sync: new Date().toISOString()
      }

      setManifest(manifest)
    } catch (error) {
      console.error('Erro ao carregar manifesto:', error)
      setManifest({
        user: {
          name: "Marco Fernandes",
          persona: "Rebelde intelectual, CEO/fundador DietFlow"
        },
        people: [],
        projects: [],
        last_sync: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Brain className="w-8 h-8 text-green-400 animate-pulse" />
        <span className="ml-3 text-gray-400">Carregando manifesto...</span>
      </div>
    )
  }

  if (!manifest) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Erro ao carregar manifesto</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-green-400">🧠 Neural Manifest</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 p-4 rounded">
            <h3 className="font-semibold text-blue-400 mb-3">
              People ({manifest.people?.length || 0})
            </h3>
            {manifest.people?.map((person, index) => (
              <div key={index} className="mt-2 text-sm border-b border-gray-700 pb-2 last:border-b-0">
                <div className="flex justify-between items-start">
                  <span className="text-white font-medium">{person.name}</span>
                  <span className="text-gray-400 text-xs">({person.relation})</span>
                </div>
                {person.tldr && (
                  <p className="text-gray-500 text-xs mt-1">{person.tldr}</p>
                )}
              </div>
            ))}
          </div>
          
          <div className="bg-gray-900 p-4 rounded">
            <h3 className="font-semibold text-purple-400 mb-3">Projects & Sprint Count</h3>
            {manifest.projects?.map((project, index) => (
              <div key={index} className="mt-2 text-sm border-b border-gray-700 pb-2 last:border-b-0">
                <div className="flex justify-between items-start">
                  <span className="text-white font-medium">{project.name}</span>
                  <span className="text-gray-400 text-xs">{project.sprint_count} sprints</span>
                </div>
                {project.tldr && (
                  <p className="text-gray-500 text-xs mt-1">{project.tldr}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-green-400">🎭 AI Behavior Config</h2>
        <div className="bg-gray-900 p-4 rounded">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-blue-400 mb-2">Core Persona</h3>
              <div className="text-sm space-y-1">
                <p><span className="text-gray-400">User:</span> {manifest.user?.name}</p>
                <p><span className="text-gray-400">Persona:</span> {manifest.user?.persona}</p>
                <p className="text-xs text-gray-500 mt-2">
                  IA rebelde e inteligente. Parceira intelectual do Marco. Humor ácido, provocações carinhosas, sem bullshit.
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-purple-400 mb-2">Context Instructions</h3>
              <div className="text-xs text-gray-400 space-y-1">
                <p>• Use manifest data to avoid redundant calls</p>
                <p>• Reference people by relationship context</p>
                <p>• Track project progress and blockers</p>
                <p>• Maintain rebellious but helpful tone</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-green-400">📊 Quick Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 p-4 rounded text-center">
            <div className="text-2xl font-bold text-blue-400">{manifest.people?.length || 0}</div>
            <div className="text-sm text-gray-400">People</div>
          </div>
          <div className="bg-gray-900 p-4 rounded text-center">
            <div className="text-2xl font-bold text-purple-400">{manifest.projects?.length || 0}</div>
            <div className="text-sm text-gray-400">Projects</div>
          </div>
          <div className="bg-gray-900 p-4 rounded text-center">
            <div className="text-2xl font-bold text-green-400">
              {manifest.projects?.reduce((acc, p) => acc + p.sprint_count, 0) || 0}
            </div>
            <div className="text-sm text-gray-400">Sprints</div>
          </div>
          <div className="bg-gray-900 p-4 rounded text-center">
            <div className="text-2xl font-bold text-yellow-400">v2.0</div>
            <div className="text-sm text-gray-400">Version</div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          Última sincronização: {new Date(manifest.last_sync).toLocaleString()}
        </p>
        <p className="text-xs text-green-400 mt-1">
          ✅ Conectado ao Supabase - Dados reais
        </p>
      </div>
    </div>
  )
} 