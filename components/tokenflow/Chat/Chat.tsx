'use client'

import { Card, Chip } from '@heroui/react'
import { ChatHeader } from '../Chat/ChatHeader'
import { MessageList } from '../Chat/MessageList'
import { Sidebar } from '../Chat/Sidebar'
import { estimateTokens, formatTokenCount } from '../utils/tokenCounter';

export const Chat = () => {
  return (
    <div className="grid grid-cols-[350px_1fr] gap-6">
      <Sidebar />
      <Card className="h-[calc(100vh-200px)]">
        <ChatHeader />
        <MessageList />
      </Card>
    </div>
  )
} 