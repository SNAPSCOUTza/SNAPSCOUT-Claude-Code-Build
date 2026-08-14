export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          display_name: string | null
          account_type: string | null
          bio: string | null
          profession: string | null
          location: string | null
          profile_image_url: string | null
          availability: string | null
          is_public: boolean | null
          social_links: Record<string, any> | null
          portfolio_images: string[] | null
          skills: string[] | null
          pricing: string | null
          subscription_status: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          email?: string | null
          full_name?: string | null
          display_name?: string | null
          account_type?: string | null
          bio?: string | null
          profession?: string | null
          location?: string | null
          profile_image_url?: string | null
          availability?: string | null
          is_public?: boolean | null
          social_links?: Record<string, any> | null
          portfolio_images?: string[] | null
          skills?: string[] | null
          pricing?: string | null
          subscription_status?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          display_name?: string | null
          account_type?: string | null
          bio?: string | null
          profession?: string | null
          location?: string | null
          profile_image_url?: string | null
          availability?: string | null
          is_public?: boolean | null
          social_links?: Record<string, any> | null
          portfolio_images?: string[] | null
          skills?: string[] | null
          pricing?: string | null
          subscription_status?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      user_profiles: {
        Row: {
          imdb_profile: string | null
          twitter: string | null
          full_name: string | null
          display_name: string | null
          bio: string | null
          profession: string | null
          location: string | null
          phone: string | null
          website: string | null
          instagram: string | null
          linkedin: string | null
          youtube: string | null
          user_id: string
          languages_spoken: string[] | null
          id: string
          facebook: string | null
          credits_highlights: string[] | null
          portfolio_images: string[] | null
          city: string | null
          email: string | null
          profile_picture: string | null
          skills: string[] | null
          provinces: string | null
          experience_level: string | null
          availability_status: string | null
          daily_rate: string | null
          project_rate: string | null
          is_verified: boolean | null
          rating: number | null
          total_reviews: number | null
          contact_clicks: number | null
          booking_requests: number | null
          favorite_count: number | null
          willing_to_travel: boolean | null
          is_profile_visible: boolean | null
          years_experience: string | null
          cities: string | null
          experience_years: string | null
          user_type: string | null
          availability: string | null
          department: string | null
          hourly_rate: string | null
          specializations: string[] | null
          roles: string[] | null
          software_skills: string[] | null
          technical_skills: string[] | null
          photography_skills: string[] | null
          services_offered: string[] | null
          videography_skills: string[] | null
          special_skills: string[] | null
          gear_owned: string[] | null
          profile_views: number | null
          created_at: string
          updated_at: string | null
          rate_card_visible: boolean | null
          contact_info_visible: boolean | null
        }
        Insert: {
          // Same structure but with optional fields for inserts
          city?: string | null
          cities?: string | null
          display_name?: string | null
          full_name?: string | null
          bio?: string | null
          // ... other optional fields
        }
        Update: {
          // Same structure but all optional for updates
          city?: string | null
          cities?: string | null
          display_name?: string | null
          // ... other optional fields
        }
      }
      portfolio_items: {
        Row: {
          id: string
          user_id: string
          source_platform: "local" | "instagram" | "facebook" | "youtube" | "vimeo" | "imdb" | "external"
          media_type: "image" | "video" | "embed" | "external"
          source_url: string | null
          thumbnail_url: string | null
          full_media_url: string | null
          embed_url: string | null
          title: string | null
          caption: string | null
          sort_order: number | null
          is_visible: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          source_platform?: "local" | "instagram" | "facebook" | "youtube" | "vimeo" | "imdb" | "external"
          media_type?: "image" | "video" | "embed" | "external"
          source_url?: string | null
          thumbnail_url?: string | null
          full_media_url?: string | null
          embed_url?: string | null
          title?: string | null
          caption?: string | null
          sort_order?: number | null
          is_visible?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          source_platform?: "local" | "instagram" | "facebook" | "youtube" | "vimeo" | "imdb" | "external"
          media_type?: "image" | "video" | "embed" | "external"
          source_url?: string | null
          thumbnail_url?: string | null
          full_media_url?: string | null
          embed_url?: string | null
          title?: string | null
          caption?: string | null
          sort_order?: number | null
          is_visible?: boolean
          updated_at?: string | null
        }
      }
      projects: {
        Row: {
          created_at: string
          client_id: string
          is_remote: boolean | null
          shoot_date: string | null
          portfolio_requirements: boolean | null
          revision_rounds: number | null
          rate_amount: number | null
          is_negotiable: boolean | null
          urgent: boolean | null
          applications_count: number | null
          id: string
          updated_at: string | null
          title: string | null
          category: string | null
          location: string | null
          province: string | null
          city: string | null
          project_type: string | null
          duration: string | null
          description: string | null
          requirements: string | null
          equipment_needed: string[] | null
          experience_level: string | null
          deliverables: string[] | null
          quantity: string | null
          timeline: string | null
          file_formats: string[] | null
          rate_type: string | null
          currency: string | null
          payment_terms: string | null
          whats_included: string | null
          status: string | null
        }
      }
      project_applications: {
        Row: {
          id: string
          status: string | null
          portfolio_samples: string[] | null
          proposed_timeline: string | null
          cover_message: string | null
          project_id: string
          freelancer_id: string
          proposed_rate: number | null
          created_at: string
          updated_at: string | null
        }
      }
    }
  }
}
