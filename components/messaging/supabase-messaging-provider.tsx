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
  read: boolean
  created_at: string
  sender?: {
    display_name: string
    profile_picture: string
  }
}

interface Conversation {
  id: string
  participant_1: string
  participant_2: string
  last_message_at: string
  created_at: string
  participants?: {
    user_id: string
    display_name: string
    profile_picture: string
  }[]
  last_message?: Message
}

interface MessagingContextType {
  conversations: Conversation[]
  currentConversation: Conversation | null
  messages: Message[]
  loading: boolean
  sendMessage: (content: string) => Promise<void>
  sendContentToConversation: (conversationId: string, content: string) => Promise<boolean>
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

  const loadConversations = useCallback(
    async (userId: string) => {
      // Conversations where the user is either participant
      const { data: convos } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        .order("last_message_at", { ascending: false })

      if (!convos?.length) {
        setConversations([])
        return
      }

      const conversationsWithParticipants = await Promise.all(
        convos.map(async (convo) => {
          const otherId = convo.participant_1 === userId ? convo.participant_2 : convo.participant_1

          const { data: profile } = await supabase
            .from("user_profiles")
            .select("user_id, display_name, profile_picture")
            .eq("user_id", otherId)
            .maybeSingle()

          const { data: lastMessages } = await supabase
            .from("messages")
            .select("*")
            .eq("conversation_id", convo.id)
            .order("created_at", { ascending: false })
            .limit(1)

          return {
            ...convo,
            participants: profile ? [profile] : [],
            last_message: lastMessages?.[0] || null,
          }
        }),
      )

      setConversations(conversationsWithParticipants)
    },
    [supabase],
  )

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
  }, [loadConversations, supabase])

  const refreshConversations = useCallback(async () => {
    if (currentUserId) {
      await loadConversations(currentUserId)
    }
  }, [currentUserId, loadConversations])

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

      // Subscribe to new messages in this conversation
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
              .maybeSingle()

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

      // Mark incoming messages as read
      if (currentUserId) {
        await supabase
          .from("messages")
          .update({ read: true })
          .eq("conversation_id", conversationId)
          .neq("sender_id", currentUserId)
          .eq("read", false)
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

  // Sends pre-built content (e.g. an encoded profile-share payload) to a
  // specific conversation without requiring it to be the "selected"
  // conversation first - selectConversation() also loads message history
  // and opens a realtime subscription, which a fire-and-forget send from a
  // share sheet doesn't need.
  const sendContentToConversation = useCallback(
    async (conversationId: string, content: string): Promise<boolean> => {
      const userId = userIdRef.current
      if (!userId || !conversationId || !content.trim()) return false

      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: userId,
        content: content.trim(),
      })
      if (error) return false

      supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversationId)
        .then(() => {})

      return true
    },
    [supabase],
  )

  const createConversation = useCallback(
    async (participantId: string): Promise<string | null> => {
      const userId = userIdRef.current
      if (!userId || !participantId || participantId === userId) return null

      // The DB's unique constraint on (participant_1, participant_2) is
      // directional, so check both orderings before creating a new row.
      const { data: existingConvo } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `and(participant_1.eq.${userId},participant_2.eq.${participantId}),and(participant_1.eq.${participantId},participant_2.eq.${userId})`,
        )
        .maybeSingle()

      if (existingConvo) {
        await refreshConversations()
        return existingConvo.id
      }

      const { data: newConvo, error } = await supabase
        .from("conversations")
        .insert({
          participant_1: userId,
          participant_2: participantId,
          last_message_at: new Date().toISOString(),
        })
        .select("id")
        .single()

      if (error || !newConvo) return null

      await refreshConversations()
      return newConvo.id
    },
    [supabase, refreshConversations],
  )

  return (
    <MessagingContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        loading,
        sendMessage,
        sendContentToConversation,
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
