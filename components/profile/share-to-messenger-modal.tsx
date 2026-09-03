"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Check, Search, Send } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { MessagingProvider, useMessaging } from "@/components/messaging/supabase-messaging-provider"
import { encodeProfileShareContent } from "@/lib/messaging/profile-share-content"

interface RecipientProfile {
  user_id: string
  display_name: string
  profile_picture: string
  profession: string
}

interface ShareToMessengerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profileId: string
  profileHref: string
}

// Mirrors NewConversationModal's picker (same query, same list UI) so this
// doesn't introduce a second messaging UI - it reuses the same
// createConversation/messages plumbing, just sends an encoded profile-share
// message instead of leaving the conversation empty.
function PickerContent({ profileId, profileHref, onSent }: { profileId: string; profileHref: string; onSent: () => void }) {
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState<RecipientProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingTo, setSendingTo] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const { createConversation, sendContentToConversation, currentUserId } = useMessaging()
  const supabase = createClient()

  useEffect(() => {
    let cancelled = false
    const loadUsers = async () => {
      setLoading(true)
      let query = supabase
        .from("user_profiles")
        .select("user_id, display_name, profile_picture, profession")
        .eq("is_profile_visible", true)
        .limit(50)
      // profileId belongs to the profile being shared, not the signed-in
      // user, and isn't a uuid for demo/mock profiles (e.g. "creator-1") -
      // only filter out "yourself" once currentUserId has actually loaded.
      if (currentUserId) {
        query = query.neq("user_id", currentUserId)
      }
      const { data } = await query
      // currentUserId arrives async, so this effect fires twice in quick
      // succession (once without it, once with it) - without this guard the
      // earlier, unfiltered response can resolve after the filtered one and
      // clobber it, letting the signed-in user see themselves in the list.
      if (!cancelled) {
        setUsers(data || [])
        setLoading(false)
      }
    }
    loadUsers()
    return () => {
      cancelled = true
    }
  }, [currentUserId, profileId, supabase])

  const handleShare = async (userId: string) => {
    setSendingTo(userId)
    const conversationId = await createConversation(userId)
    if (conversationId) {
      const content = encodeProfileShareContent({ profileId, profileHref })
      const ok = await sendContentToConversation(conversationId, content)
      if (ok) {
        setSentTo(userId)
        window.setTimeout(() => onSent(), 900)
      }
    }
    setSendingTo(null)
  }

  const filteredUsers = users.filter(
    (user) =>
      user.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.profession?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="pl-10" />
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-border">
        {loading ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">{search ? "No users found" : "No users available"}</div>
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
              <Button size="sm" onClick={() => handleShare(user.user_id)} disabled={sendingTo === user.user_id || sentTo === user.user_id}>
                {sentTo === user.user_id ? (
                  <Check className="h-4 w-4" />
                ) : sendingTo === user.user_id ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))
        )}
      </div>
    </>
  )
}

export function ShareToMessengerModal({ open, onOpenChange, profileId, profileHref }: ShareToMessengerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[180] max-w-md" overlayClassName="z-[179]">
        <DialogHeader>
          <DialogTitle>Share in SnapScout</DialogTitle>
        </DialogHeader>
        {open && (
          <MessagingProvider>
            <PickerContent profileId={profileId} profileHref={profileHref} onSent={() => onOpenChange(false)} />
          </MessagingProvider>
        )}
      </DialogContent>
    </Dialog>
  )
}
