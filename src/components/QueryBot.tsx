import { Loader2, MessageSquare, Minimize2, Send, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { supabase } from '@/integrations/supabase/client'

interface Message {
  role: 'user' | 'assistant'
  content: string
  reports?: Array<{
    id: string
    name: string
    lastname: string
    address: string
    urgency_level: number
    help_needed: string
  }>
}

const QueryBot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [query, setQuery] = useState('')
  const [isQuerying, setIsQuerying] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])

  const handleQuery = async () => {
    if (!query.trim()) return

    const userMessage: Message = { role: 'user', content: query.trim() }
    setMessages((prev) => [...prev, userMessage])
    setQuery('')
    setIsQuerying(true)

    try {
      const { data, error } = await supabase.functions.invoke('query-reports', {
        body: { query: userMessage.content },
      })

      if (error) throw error
      if (data.error) throw new Error(data.error)

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.summary,
        reports: data.reports,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      console.error('Query error:', err)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'ขอโทษครับ ไม่สามารถประมวลผลคำถามได้ กรุณาลองใหม่อีกครั้ง',
      }
      setMessages((prev) => [...prev, errorMessage])
      toast.error('เกิดข้อผิดพลาด')
    } finally {
      setIsQuerying(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleQuery()
    }
  }

  const getUrgencyBadgeClass = (level: number) => {
    return `urgency-badge-${level}`
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg z-50"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card
      className={`fixed right-6 z-50 shadow-2xl border-2 transition-all duration-300 ${
        isMinimized ? 'bottom-6 w-80' : 'bottom-6 w-96 h-[600px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <span className="font-semibold">Query Bot</span>
          <Badge variant="secondary" className="text-xs">
            AI
          </Badge>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-4 h-[440px]">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">ถามคำถามเกี่ยวกับข้อมูลผู้ประสบภัย</p>
                <p className="text-xs mt-2">เช่น "มีเด็กต่ำกว่า 1 ขวบกี่เคส"</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {msg.content}
                      </p>

                      {msg.reports && msg.reports.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {msg.reports.slice(0, 3).map((report) => (
                            <div
                              key={report.id}
                              className="bg-background/50 rounded p-2 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {report.name} {report.lastname}
                                </span>
                                <Badge
                                  className={getUrgencyBadgeClass(
                                    report.urgency_level,
                                  )}
                                  variant="outline"
                                >
                                  {report.urgency_level}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground truncate mt-1">
                                {report.address}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isQuerying && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <Input
                placeholder="พิมพ์คำถามของคุณ..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isQuerying}
                className="flex-1"
              />
              <Button
                onClick={handleQuery}
                disabled={isQuerying || !query.trim()}
                size="icon"
              >
                {isQuerying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  )
}

export default QueryBot
