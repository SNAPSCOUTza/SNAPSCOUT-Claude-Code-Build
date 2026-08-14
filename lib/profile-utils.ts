// Calculate profile completeness percentage
export function calculateProfileCompleteness(profile: any): number {
  const requiredFields = [
    "full_name",
    "display_name",
    "account_type",
    "bio",
    "profession",
    "location",
    "profile_image_url",
    "availability",
  ]

  const filledFields = requiredFields.filter((field) => {
    const value = profile[field]
    return value && value.toString().trim() !== "" && value !== null && value !== undefined
  })

  return Math.round((filledFields.length / requiredFields.length) * 100)
}

// Get profile completeness status with styling
export function getProfileStatus(completeness: number): {
  label: string
  color: string
  bgColor: string
} {
  if (completeness === 100) {
    return { label: "Complete", color: "text-green-600", bgColor: "bg-green-50" }
  } else if (completeness >= 75) {
    return { label: "Mostly Complete", color: "text-blue-600", bgColor: "bg-blue-50" }
  } else if (completeness >= 50) {
    return { label: "Half Complete", color: "text-yellow-600", bgColor: "bg-yellow-50" }
  } else {
    return { label: "Incomplete", color: "text-red-600", bgColor: "bg-red-50" }
  }
}

// Profile field definitions organized by section
export const PROFILE_SECTIONS = [
  {
    section: "Personal Information",
    fields: [
      {
        key: "full_name",
        label: "Full Name",
        type: "text",
        required: true,
        placeholder: "Your full name",
      },
      {
        key: "display_name",
        label: "Display Name",
        type: "text",
        required: true,
        placeholder: "How you want to be known publicly",
      },
      {
        key: "profile_image_url",
        label: "Profile Picture URL",
        type: "url",
        required: false,
        placeholder: "https://example.com/image.jpg",
      },
    ],
  },
  {
    section: "Professional Details",
    fields: [
      {
        key: "account_type",
        label: "Account Type",
        type: "select",
        required: true,
        options: ["creator", "scout", "studio", "store"],
      },
      {
        key: "profession",
        label: "Profession / Title",
        type: "text",
        required: true,
        placeholder: "e.g., Cinematographer, Sound Engineer",
      },
      {
        key: "bio",
        label: "Professional Biography",
        type: "textarea",
        required: false,
        placeholder: "Tell us about yourself and your experience...",
        rows: 4,
      },
      {
        key: "location",
        label: "Location",
        type: "text",
        required: false,
        placeholder: "City, Province",
      },
    ],
  },
  {
    section: "Portfolio & Skills",
    fields: [
      {
        key: "skills",
        label: "Skills",
        type: "textarea",
        required: false,
        placeholder: 'Enter skills as JSON array: ["skill1", "skill2"]',
        rows: 3,
      },
      {
        key: "portfolio_images",
        label: "Portfolio Images",
        type: "textarea",
        required: false,
        placeholder: 'Enter image URLs as JSON array: ["url1", "url2"]',
        rows: 3,
      },
    ],
  },
  {
    section: "Availability & Rates",
    fields: [
      {
        key: "availability",
        label: "Availability Status",
        type: "select",
        required: false,
        options: ["available", "busy", "unavailable"],
      },
      {
        key: "pricing",
        label: "Pricing / Rate",
        type: "text",
        required: false,
        placeholder: "e.g., $50/hour or $500/day",
      },
    ],
  },
  {
    section: "Social & Visibility",
    fields: [
      {
        key: "social_links",
        label: "Social Links",
        type: "textarea",
        required: false,
        placeholder: 'Enter as JSON: {"instagram": "handle", "linkedin": "url", "website": "url"}',
        rows: 3,
      },
      {
        key: "is_public",
        label: "Make Profile Public",
        type: "checkbox",
        required: false,
      },
    ],
  },
]
