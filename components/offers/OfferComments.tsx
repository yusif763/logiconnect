'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, MessageCircle, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Comment {
  id: string
  content: string
  createdAt: string
  author: { id: string; name: string; role: string; companyId: string }
}

interface OfferCommentsProps {
  offerId: string
  myCompanyId: string
  supplierCompanyId?: string
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function OfferComments({ offerId, myCompanyId }: OfferCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchComments = useCallback(async () => {
    const res = await fetch(`/api/offers/${offerId}/comments`)
    if (res.ok) {
      const data = await res.json()
      setComments(data)
    }
    setLoading(false)
  }, [offerId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments])

  const sendComment = async () => {
    if (!text.trim()) return
    setSending(true)
    const res = await fetch(`/api/offers/${offerId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text.trim() }),
    })
    if (res.ok) {
      const newComment = await res.json()
      setComments((prev) => [...prev, newComment])
      setText('')
    }
    setSending(false)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendComment()
    }
  }

  const isMyMessage = (comment: Comment) => comment.author.companyId === myCompanyId

  return (
    <div className="mt-4 border-t border-slate-200">
      {/* Header */}
      <div className="flex items-center gap-2 px-1 pt-4 pb-3">
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100">
          <MessageCircle className="h-4 w-4 text-blue-600" />
        </div>
        <span className="font-semibold text-sm text-slate-800">Messages</span>
        {comments.length > 0 && (
          <span className="ml-auto bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            {comments.length}
          </span>
        )}
      </div>

      {/* Chat area */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
        <div className="h-56 overflow-y-auto p-3 space-y-3 custom-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-1.5 text-center">
              <MessageCircle className="h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-400">No messages yet.</p>
              <p className="text-xs text-slate-400">Start the conversation below.</p>
            </div>
          ) : (
            <>
              {comments.map((comment) => {
                const mine = isMyMessage(comment)
                return (
                  <div
                    key={comment.id}
                    className={cn('flex items-end gap-2', mine ? 'flex-row-reverse' : 'flex-row')}
                  >
                    {/* Avatar */}
                    {!mine && (
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-600">
                        {getInitials(comment.author.name)}
                      </div>
                    )}

                    <div className={cn('max-w-[75%]', mine ? 'items-end' : 'items-start', 'flex flex-col gap-0.5')}>
                      {!mine && (
                        <p className="text-[10px] font-semibold text-slate-500 px-1">
                          {comment.author.name}
                        </p>
                      )}
                      <div
                        className={cn(
                          'rounded-2xl px-3.5 py-2 text-sm leading-snug',
                          mine
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm'
                        )}
                      >
                        <p className="whitespace-pre-wrap">{comment.content}</p>
                      </div>
                      <p className={cn('text-[10px] text-slate-400 px-1', mine ? 'text-right' : 'text-left')}>
                        {new Date(comment.createdAt).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Input row */}
        <div className="border-t border-slate-200 bg-white p-2.5 flex gap-2 items-end">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            placeholder="Write a message… (Enter to send)"
            className="resize-none text-sm min-h-[36px] py-2 border-slate-200 bg-slate-50 focus:bg-white"
          />
          <Button
            size="sm"
            onClick={sendComment}
            disabled={!text.trim() || sending}
            className="shrink-0 h-9 w-9 p-0 bg-blue-600 hover:bg-blue-700"
          >
            {sending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
