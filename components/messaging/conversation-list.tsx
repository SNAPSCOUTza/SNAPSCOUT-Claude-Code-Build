"use client"

import { useMessaging } from "./supabase-messaging-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

interface ConversationListProps {
  onSelect: (conversationId: string) => void
  selectedId?: string | null
}

export function ConversationList({ onSelect, selectedId }: ConversationListProps) {
  const { conversations, loading } = useMessaging()

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No conversations yet</p>
        <p className="text-sm mt-2">Start a conversation from a profile page</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((convo) => {
        const participant = convo.participants?.[0]
        const isSelected = selectedId === convo.id

        return (
          <button
            key={convo.id}
            onClick={() => onSelect(convo.id)}
            className={`w-full p-4 flex items-center gap-3 hover:bg-accent/50 transition-colors text-left ${
              isSelected ? "bg-accent" : ""
            }`}
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={participant?.profile_picture || ""} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {participant?.display_name?.charAt(0)?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground truncate">{participant?.display_name || "Unknown User"}</p>
                {convo.last_message_at && (
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(convo.last_message_at), { addSuffix: true })}
                  </span>
                )}
              </div>
              {convo.last_message && (
                <p className="text-sm text-muted-foreground truncate">{convo.last_message.content}</p>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
