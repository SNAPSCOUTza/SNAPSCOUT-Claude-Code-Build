import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

// This interface is aligned with the main UserProfile interface
// to ensure data compatibility between demo and authenticated states.
export interface DemoProfileState {
  display_name: string
  full_name: string
  profile_picture: string // Base64 string for local storage
  bio: string
  province: string
  city: string
  department: string
  profession: string
  roles: string[]
  instagram: string
  linkedin: string
  youtube_vimeo: string
  website_url: string
  portfolio_images: string[] // Array of Base64 strings
}

interface ProfileStore {
  profile: DemoProfileState
  setProfileField: <K extends keyof DemoProfileState>(field: K, value: DemoProfileState[K]) => void
  setProfile: (profile: Partial<DemoProfileState>) => void
  addPortfolioImage: (image: string) => void
  removePortfolioImage: (index: number) => void
  resetProfile: () => void
}

const initialState: DemoProfileState = {
  display_name: "Your Name",
  full_name: "",
  profile_picture: "",
  bio: "A short bio about your skills, experience, and what makes you unique.",
  province: "",
  city: "",
  department: "",
  profession: "Photographer",
  roles: ["Photographer"],
  instagram: "",
  linkedin: "",
  youtube_vimeo: "",
  website_url: "",
  portfolio_images: [],
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profile: initialState,
      setProfileField: (field, value) =>
        set((state) => ({
          profile: { ...state.profile, [field]: value },
        })),
      setProfile: (newProfileData) =>
        set((state) => ({
          profile: { ...state.profile, ...newProfileData },
        })),
      addPortfolioImage: (image) =>
        set((state) => ({
          profile: {
            ...state.profile,
            portfolio_images: [...state.profile.portfolio_images, image],
          },
        })),
      removePortfolioImage: (index) =>
        set((state) => ({
          profile: {
            ...state.profile,
            portfolio_images: state.profile.portfolio_images.filter((_, i) => i !== index),
          },
        })),
      resetProfile: () => set({ profile: initialState }),
    }),
    {
      name: "snapscout-demo-profile-v2", // Renamed to avoid conflicts with old structure
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
