import React, { useState } from 'react'
import { Brain, Users, Briefcase, Search, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import OverviewTab from './components/OverviewTab.jsx'
import PeopleTab from './components/PeopleTab.jsx'
import ProjectsTab from './components/ProjectsTab.jsx'
import './App.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-black border-b border-gray-700 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-green-400" />
            <h1 className="text-2xl font-bold">Marco Neural System</h1>
            <span className="text-sm text-gray-400">v2.0</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search everything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 w-64"
              />
            </div>
            <MessageCircle className="w-6 h-6 text-blue-400 cursor-pointer" />
          </div>
        </div>
      </header>

      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto flex gap-8 p-4">
          {[
            { id: 'overview', icon: Brain, label: 'Overview' },
            { id: 'people', icon: Users, label: 'People' },
            { id: 'projects', icon: Briefcase, label: 'Projects' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-all ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white'
                  : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'people' && <PeopleTab />}
        {activeTab === 'projects' && <ProjectsTab />}
      </main>

      <div className="fixed bottom-4 right-4 bg-green-600 hover:bg-green-700 rounded-full p-3 cursor-pointer shadow-lg">
        <MessageCircle className="w-6 h-6 text-white" />
      </div>
    </div>
  )
} 