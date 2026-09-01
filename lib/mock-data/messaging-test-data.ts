export type MockMessagingProfile = {
  user_id: string
  display_name: string
  profession: string
  city: string
  profile_picture: string
}

export type MockMessagingMessageType = "text" | "system" | "enquiry" | "quote"

export type MockMessagingEnquiryCard = {
  request_id: string
  booking_type: string
  origin: "booking" | "availability"
  date_label: string
  location: string
  total_estimate: number
  status: "pending" | "accepted" | "declined" | "confirmed"
  duration?: string
  date_range_days?: number
  brief?: string
  starting_rate_label?: string
  requester_name?: string
}

export type MockMessagingQuoteCard = {
  title: string
  amount: number
  coverage: string
  items: string[]
}

export type MockMessagingMessage = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: MockMessagingMessageType
  created_at: string
  is_edited: boolean
  enquiry?: MockMessagingEnquiryCard
  quote?: MockMessagingQuoteCard
}

export type MockMessagingConversation = {
  id: string
  participant_ids: [string, string]
  created_at: string
  updated_at: string
  messages: MockMessagingMessage[]
}

export type MockMessagingState = {
  profiles: MockMessagingProfile[]
  conversations: MockMessagingConversation[]
}

export const MOCK_MESSAGING_STORAGE_KEY = "snapscout-messaging-test-v1"
export const MOCK_BRAD_USER_ID = "brad-test-user"

const minutesAgo = (count: number) => new Date(Date.now() - count * 60_000).toISOString()

export function buildMockMessagingProfiles(): MockMessagingProfile[] {
  const brad: MockMessagingProfile = {
    user_id: MOCK_BRAD_USER_ID,
    display_name: "Brad Khumalo",
    profession: "Creative Producer",
    city: "Cape Town",
    profile_picture: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=400",
  }

  // Self-contained on purpose - this messaging test harness needs a stable
  // set of participants regardless of how many demo profiles a listing page
  // chooses to show publicly (that count changed independently when the
  // public mock data was trimmed to 3 per page, which is what broke this
  // when it used to borrow directly from creators-data.ts).
  const testProfiles: MockMessagingProfile[] = [
    {
      user_id: "test-thandi",
      display_name: "Thandi Mokoena",
      profession: "Photographer",
      city: "Cape Town",
      profile_picture: "https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      user_id: "test-sipho",
      display_name: "Sipho Ndlovu",
      profession: "Videographer",
      city: "Johannesburg",
      profile_picture: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      user_id: "test-lerato",
      display_name: "Lerato van der Berg",
      profession: "Photographer",
      city: "Durban",
      profile_picture: "https://images.pexels.com/photos/3768894/pexels-photo-3768894.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      user_id: "test-marcus",
      display_name: "Marcus Joubert",
      profession: "Gaffer",
      city: "Cape Town",
      profile_picture: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      user_id: "test-sixth",
      display_name: "Nolwazi Zulu",
      profession: "Sound Engineer",
      city: "Pretoria",
      profile_picture: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
  ]

  return [brad, ...testProfiles]
}

function seedConversation(
  id: string,
  participant_ids: [string, string],
  lines: Array<{
    sender: string
    content: string
    minutes: number
    message_type?: MockMessagingMessageType
    enquiry?: MockMessagingEnquiryCard
    quote?: MockMessagingQuoteCard
  }>,
): MockMessagingConversation {
  const messages: MockMessagingMessage[] = lines.map((line, index) => ({
    id: `${id}-msg-${index + 1}`,
    conversation_id: id,
    sender_id: line.sender,
    content: line.content,
    message_type: line.message_type || "text",
    created_at: minutesAgo(line.minutes),
    is_edited: false,
    enquiry: line.enquiry,
    quote: line.quote,
  }))

  return {
    id,
    participant_ids,
    created_at: messages[0]?.created_at || new Date().toISOString(),
    updated_at: messages[messages.length - 1]?.created_at || new Date().toISOString(),
    messages,
  }
}

export function createMockMessagingSeed(): MockMessagingState {
  const profiles = buildMockMessagingProfiles()
  const [brad, thandi, sipho, lerato, marcus, sixth] = profiles

  const conversations: MockMessagingConversation[] = [
    seedConversation("thread-brad-thandi", [brad.user_id, thandi.user_id], [
      { sender: thandi.user_id, content: "Hey! I saw your project brief and I am interested.", minutes: 80 },
      {
        sender: brad.user_id,
        content: "Hi Nadia! Are you available on the 12th?",
        minutes: 73,
      },
      {
        sender: thandi.user_id,
        content: "Based on the brief, here is a quote for the project.",
        minutes: 68,
        message_type: "quote",
        quote: {
          title: "Photography Package",
          amount: 2500,
          coverage: "4 Hours Coverage",
          items: ["1 Photographer", "Edited High-Res Images", "Online Gallery"],
        },
      },
      { sender: brad.user_id, content: "Perfect. Let us lock this in.", minutes: 63 },
    ]),
    seedConversation("thread-brad-sipho", [brad.user_id, sipho.user_id], [
      {
        sender: sipho.user_id,
        content: "Booking connected. You can now message each other directly.",
        minutes: 42,
        message_type: "system",
      },
      {
        sender: sipho.user_id,
        content: "Hi! Just confirming your booking for 12 July from 09:00 to 17:00.",
        minutes: 37,
      },
      {
        sender: brad.user_id,
        content: "Yes, that works perfectly.",
        minutes: 33,
      },
    ]),
    seedConversation("thread-lerato-marcus", [lerato.user_id, marcus.user_id], [
      { sender: lerato.user_id, content: "Marcus, can you cut a 30s teaser from yesterday's event footage?", minutes: 55 },
      { sender: marcus.user_id, content: "Absolutely. Drop me selects and I can deliver by tomorrow morning.", minutes: 49 },
    ]),
    seedConversation("thread-brad-sixth", [brad.user_id, sixth.user_id], []),
  ]

  return { profiles, conversations }
}

function normalizeMessage(raw: any): MockMessagingMessage {
  const messageTypeRaw = raw?.message_type
  const messageType: MockMessagingMessageType =
    messageTypeRaw === "system" || messageTypeRaw === "enquiry" || messageTypeRaw === "quote" ? messageTypeRaw : "text"

  return {
    id: String(raw?.id || `msg-${Date.now()}`),
    conversation_id: String(raw?.conversation_id || raw?.conversationId || ""),
    sender_id: String(raw?.sender_id || raw?.senderId || ""),
    content: String(raw?.content || ""),
    message_type: messageType,
    created_at: typeof raw?.created_at === "string" ? raw.created_at : new Date().toISOString(),
    is_edited: Boolean(raw?.is_edited),
    enquiry: raw?.enquiry,
    quote: raw?.quote,
  }
}

function normalizeConversation(raw: any): MockMessagingConversation {
  const participantIds = Array.isArray(raw?.participant_ids)
    ? raw.participant_ids.map((item: unknown) => String(item)).slice(0, 2)
    : []
  const normalizedParticipants: [string, string] = [
    participantIds[0] || MOCK_BRAD_USER_ID,
    participantIds[1] || "unknown-participant",
  ]

  const messages = Array.isArray(raw?.messages)
    ? raw.messages
        .map((message: any) => normalizeMessage(message))
        .sort(
          (a: MockMessagingMessage, b: MockMessagingMessage) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        )
    : []

  return {
    id: String(raw?.id || `thread-${normalizedParticipants[0]}-${normalizedParticipants[1]}`),
    participant_ids: normalizedParticipants,
    created_at:
      typeof raw?.created_at === "string"
        ? raw.created_at
        : messages[0]?.created_at || new Date().toISOString(),
    updated_at:
      typeof raw?.updated_at === "string"
        ? raw.updated_at
        : messages[messages.length - 1]?.created_at || new Date().toISOString(),
    messages,
  }
}

function normalizeState(raw: any): MockMessagingState {
  const fallback = createMockMessagingSeed()
  const profiles = Array.isArray(raw?.profiles)
    ? raw.profiles.map((profile: any) => ({
        user_id: String(profile?.user_id || ""),
        display_name: String(profile?.display_name || "SnapScout Profile"),
        profession: String(profile?.profession || "Creator"),
        city: String(profile?.city || "South Africa"),
        profile_picture: String(
          profile?.profile_picture ||
            "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400",
        ),
      }))
    : fallback.profiles

  const conversations = Array.isArray(raw?.conversations)
    ? raw.conversations.map((conversation: any) => normalizeConversation(conversation))
    : fallback.conversations

  return { profiles, conversations }
}

export function loadMockMessagingState(): MockMessagingState {
  if (typeof window === "undefined") return createMockMessagingSeed()

  try {
    const raw = window.localStorage.getItem(MOCK_MESSAGING_STORAGE_KEY)
    if (!raw) {
      const seed = createMockMessagingSeed()
      window.localStorage.setItem(MOCK_MESSAGING_STORAGE_KEY, JSON.stringify(seed))
      return seed
    }

    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.profiles) || !Array.isArray(parsed.conversations)) {
      throw new Error("Invalid stored messaging state")
    }
    return normalizeState(parsed)
  } catch {
    const seed = createMockMessagingSeed()
    window.localStorage.setItem(MOCK_MESSAGING_STORAGE_KEY, JSON.stringify(seed))
    return seed
  }
}

export function saveMockMessagingState(state: MockMessagingState) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(MOCK_MESSAGING_STORAGE_KEY, JSON.stringify(state))
}
