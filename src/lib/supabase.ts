import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Types pour la base de données
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          role: 'student' | 'owner' | 'admin'
          profile_picture: string | null
          email_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone?: string | null
          role?: 'student' | 'owner' | 'admin'
          profile_picture?: string | null
          email_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          role?: 'student' | 'owner' | 'admin'
          profile_picture?: string | null
          email_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          title: string
          description: string
          price: number
          location: string
          district: string
          room_type: 'single' | 'shared' | 'studio' | 'apartment'
          amenities: string[] | null
          images: string[] | null
          available: boolean
          owner_id: string
          latitude: number | null
          longitude: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          price: number
          location: string
          district: string
          room_type: 'single' | 'shared' | 'studio' | 'apartment'
          amenities?: string[] | null
          images?: string[] | null
          available?: boolean
          owner_id: string
          latitude?: number | null
          longitude?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          price?: number
          location?: string
          district?: string
          room_type?: 'single' | 'shared' | 'studio' | 'apartment'
          amenities?: string[] | null
          images?: string[] | null
          available?: boolean
          owner_id?: string
          latitude?: number | null
          longitude?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          room_id: string
          student_id: string
          start_date: string
          end_date: string
          total_price: number
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status: 'pending' | 'paid' | 'refunded'
          payment_method: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          student_id: string
          start_date: string
          end_date: string
          total_price: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status?: 'pending' | 'paid' | 'refunded'
          payment_method?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          student_id?: string
          start_date?: string
          end_date?: string
          total_price?: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status?: 'pending' | 'paid' | 'refunded'
          payment_method?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          room_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          room_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          room_id?: string
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          room_id: string
          student_id: string
          booking_id: string | null
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          student_id: string
          booking_id?: string | null
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          student_id?: string
          booking_id?: string | null
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          room_id: string | null
          subject: string | null
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          room_id?: string | null
          subject?: string | null
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          room_id?: string | null
          subject?: string | null
          message?: string
          is_read?: boolean
          created_at?: string
        }
      }
      districts: {
        Row: {
          id: number
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          booking_id: string
          amount: number
          payment_method: string
          transaction_id: string | null
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          amount: number
          payment_method: string
          transaction_id?: string | null
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          amount?: number
          payment_method?: string
          transaction_id?: string | null
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_date?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      rooms_detailed: {
        Row: {
          id: string
          title: string
          description: string
          price: number
          location: string
          district: string
          room_type: 'single' | 'shared' | 'studio' | 'apartment'
          amenities: string[] | null
          images: string[] | null
          available: boolean
          owner_id: string
          latitude: number | null
          longitude: number | null
          created_at: string
          updated_at: string
          owner_name: string | null
          owner_phone: string | null
          owner_email: string | null
          average_rating: number | null
          review_count: number | null
          favorite_count: number | null
        }
      }
      owner_stats: {
        Row: {
          owner_id: string | null
          owner_name: string | null
          total_rooms: number | null
          available_rooms: number | null
          occupied_rooms: number | null
          total_revenue: number | null
        }
      }
      general_stats: {
        Row: {
          total_students: number | null
          total_owners: number | null
          total_rooms: number | null
          available_rooms: number | null
          total_bookings: number | null
          confirmed_bookings: number | null
          total_revenue: number | null
        }
      }
    }
  }
}