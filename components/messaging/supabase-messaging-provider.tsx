"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: string
  created_at: string
  is_edited: boolean
  sender?: {
    display_name: string
    profile_picture: string
  }
}

interface Conversation {
  id: string
  title: string
  type: string
  last_message_at: string
  created_at: string
  participants?: {
    user_id: string
    display_name: string
    profile_picture: string
  }[]
  last_message?: Message
  unread_count?: number
}

interface MessagingContextType {
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  loading: boolean
  sendMessage: (content: string) => Promise<void>
  selectConversation: (conversationId: string) => Promise<void>
  createConversation: (participantId: string) => Promise<string | null>
  refreshConversations: () => Promise<void>
  currentUserId: string | null
}

const MessagingContext = createContext<MessagingContextType | null>(null)

export function useMessaging() {
  const context = useContext(MessagingContext)
  if (!context) {
    throw new Error("useMessaging must be used within MessagingProvider")
  }
  return context
}

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [messagesChannel, setMessagesChannel] = useState<RealtimeChannel | null>(null)

  const supabaseRef = useRef(createClient())
  const userIdRef = useRef<string | null>(null)
  const initializedRef = useRef(false)

  const supabase = supabaseRef.current

  useEffect(() => {
    if (initializedRef.current) return

    const init = async () => {
      initializedRef.current = true

      // Get session from local storage first (faster than server call)
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        const userId = session.user.id
        userIdRef.current = userId
        setCurrentUserId(userId)
        await loadConversations(userId)
      }
      setLoading(false)
    }

    init()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const userId = session.user.id
        userIdRef.current = userId
        setCurrentUserId(userId)
        if (event === "SIGNED_IN") {
          loadConversations(userId)
        }
      } else {
        userIdRef.current = null
        setCurrentUserId(null)
        setConversations([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadConversations = async (userId: string) => {
    // Get conversations where user is a participant
    const { data: participations } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", userId)
      .eq("is_active", true)

    if (!participations?.length) {
      setConversations([])
      return
    }

    const conversationIds = participations.map((p) => p.conversation_id)

    // Get conversation details
    const { data: convos } = await supabase
      .from("conversations")
      .select("*")
      .in("id", conversationIds)
      .order("last_message_at", { ascending: false })

    if (!convos) {
      setConversations([])
      return
    }

    // Get participants for each conversation
    const conversationsWithParticipants = await Promise.all(
      convos.map(async (convo) => {
        const { data: participants } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", convo.id)
          .eq("is_active", true)

        // Get profile info for other participants
        const otherParticipantIds = participants?.filter((p) => p.user_id !== userId).map((p) => p.user_id) || []

        let participantProfiles: any[] = []
        if (otherParticipantIds.length > 0) {
          const { data: profiles } = await supabase
            .from("user_profiles")
            .select("user_id, display_name, profile_picture")
            .in("user_id", otherParticipantIds)

          participantProfiles = profiles || []
        }

        // Get last message
        const { data: lastMessages } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", convo.id)
          .order("created_at", { ascending: false })
          .limit(1)

        return {
          ...convo,
          participants: participantProfiles,
          last_message: lastMessages?.[0] || null,
        }
      }),
    )

    setConversations(conversationsWithParticipants)
  }

  const refreshConversations = useCallback(async () => {
    if (currentUserId) {
      await loadConversations(currentUserId)
    }
  }, [currentUserId])

  const selectConversation = useCallback(
    async (conversationId: string) => {
      setLoading(true)

      // Unsubscribe from previous channel
      if (messagesChannel) {
        supabase.removeChannel(messagesChannel)
      }

      // Get conversation details
      const convo = conversations.find((c) => c.id === conversationId)
      if (convo) {
        setCurrentConversation(convo)
      }

      // Load messages
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      // Get sender profiles
      if (msgs && msgs.length > 0) {
        const senderIds = [...new Set(msgs.map((m) => m.sender_id))]
        const { data: profiles } = await supabase
          .from("user_profiles")
          .select("user_id, display_name, profile_picture")
          .in("user_id", senderIds)

        const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || [])

        const messagesWithSenders = msgs.map((m) => ({
          ...m,
          sender: profileMap.get(m.sender_id) || { display_name: "Unknown", profile_picture: "" },
        }))

        setMessages(messagesWithSenders)
      } else {
        setMessages([])
      }

      // Subscribe to new messages
      const channel = supabase
        .channel(`messages:${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          async (payload) => {
            const newMessage = payload.new as Message

            // Get sender profile
            const { data: profile } = await supabase
              .from("user_profiles")
              .select("user_id, display_name, profile_picture")
              .eq("user_id", newMessage.sender_id)
              .single()

            setMessages((prev) => [
              ...prev,
              {
                ...newMessage,
                sender: profile || { display_name: "Unknown", profile_picture: "" },
              },
            ])
          },
        )
        .subscribe()

      setMessagesChannel(channel)
      setLoading(false)

      // Update last_read_at
      if (currentUserId) {
        await supabase
          .from("conversation_participants")
          .update({ last_read_at: new Date().toISOString() })
          .eq("conversation_id", conversationId)
          .eq("user_id", currentUserId)
      }
    },
    [conversations, currentUserId, messagesChannel, supabase],
  )

  const sendMessage = useCallback(
    async (content: string) => {
      const userId = userIdRef.current
      if (!currentConversation || !userId || !content.trim()) return

      await supabase.from("messages").insert({
        conversation_id: currentConversation.id,
        sender_id: userId,
        content: content.trim(),
        message_type: "text",
      })

      // Update last_message_at in background (non-blocking)
      supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", currentConversation.id)
        .then(() => {})
    },
    [currentConversation, supabase],
  )

  const createConversation = useCallback(
    async (participantId: string): Promise<string | null> => {
      const userId = userIdRef.current
      if (!userId) return null

      const { data: myConversations } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", userId)

      if (myConversations?.length) {
        // Check if any of my conversations include this participant
        const conversationIds = myConversations.map((c) => c.conversation_id)
        const { data: existingConvo } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("user_id", participantId)
          .in("conversation_id", conversationIds)
          .limit(1)
          .maybeSingle()

        if (existingConvo) {
          return existingConvo.conversation_id
        }
      }

      // Create new conversation
      const { data: newConvo, error } = await supabase
        .from("conversations")
        .insert({
          type: "direct",
          title: null,
          last_message_at: new Date().toISOString(),
        })
        .select("id")
        .single()

      if (error || !newConvo) return null

      // Add both participants
      await supabase.from("conversation_participants").insert([
        { conversation_id: newConvo.id, user_id: userId, is_active: true },
        { conversation_id: newConvo.id, user_id: participantId, is_active: true },
      ])

      await refreshConversations()
      return newConvo.id
    },
    [supabase],
  )

  return (
    <MessagingContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        loading,
        sendMessage,
        selectConversation,
        createConversation,
        refreshConversations,
        currentUserId,
      }}
    >
      {children}
    </MessagingContext.Provider>
  )
}
