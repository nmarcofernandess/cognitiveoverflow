'use client'

import { useState } from 'react'
import { TokenFlowHeader } from './Layout/TokenFlowHeader'
import { LoadingOverlay } from './Loading/LoadingOverlay'
import { FilterControls } from './FilterControls/FilterControls'
import { FileManagement } from './FileManagement/FileManagement'
import { Chat } from './Chat/Chat'
import dynamic from 'next/dynamic'

const LoadingPlaceholder = dynamic(() => import('./Loading/LoadingPlaceholder'), {
  loading: () => <LoadingOverlay />,
  ssr: false
})

export const TokenFlowMain = () => {
  const [isImportOpen, setIsImportOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <TokenFlowHeader onImportClick={() => setIsImportOpen(!isImportOpen)} />
      <div className="pt-16">
        <div className="container mx-auto p-6">
          {/* Área de Importação */}
          {isImportOpen && (
            <div className="bg-content1 rounded-large shadow-medium p-6 mb-6">
              <FileManagement />
            </div>
          )}
          
          {/* Área de Filtros */}
          <div className="bg-content1 rounded-large shadow-medium p-6 mb-6">
            <FilterControls />
          </div>
          
          <Chat />
        </div>
      </div>
      <LoadingOverlay />
    </div>
  )
} 