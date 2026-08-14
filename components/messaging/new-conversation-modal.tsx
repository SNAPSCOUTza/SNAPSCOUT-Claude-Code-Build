"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Search, MessageSquare } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useMessaging } from "./supabase-messaging-provider"

interface NewConversationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConversationCreated: (conversationId: string) => void
}

interface UserProfile {
  user_id: string
  display_name: string
  profile_picture: string
  profession: string
}

export function NewConversationModal({ open, onOpenChange, onConversationCreated }: NewConversationModalProps) {
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState<string | null>(null)
  const { createConversation, currentUserId } = useMessaging()
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      loadUsers()
    }
  }, [open])

  const loadUsers = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("user_profiles")
      .select("user_id, display_name, profile_picture, profession")
      .neq("user_id", currentUserId || "")
      .eq("is_profile_visible", true)
      .limit(50)

    setUsers(data || [])
    setLoading(false)
  }

  const handleStartConversation = async (userId: string) => {
    setCreating(userId)
    const conversationId = await createConversation(userId)
    setCreating(null)
    if (conversationId) {
      onConversationCreated(conversationId)
      onOpenChange(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.profession?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="pl-10"
          />
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-border">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {search ? "No users found" : "No users available"}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.user_id} className="flex items-center justify-between p-3 hover:bg-accent/50">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.profile_picture || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.display_name?.charAt(0)?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{user.display_name || "Unknown"}</p>
                    {user.profession && <p className="text-sm text-muted-foreground">{user.profession}</p>}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleStartConversation(user.user_id)}
                  disabled={creating === user.user_id}
                >
                  {creating === user.user_id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
