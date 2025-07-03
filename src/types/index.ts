// Tipos para usuário
export interface User {
  id: string
  email: string
  name?: string
  assinante?: boolean
  createdAt: string
}

// Tipos para vídeo
export interface VideoData {
  id: string
  userId: string
  userName: string
  youtubeUrl: string
  prompt: string
  createdAt: string
  comments: CommentData[]
}

// Tipos para comentário
export interface CommentData {
  id: string
  text: string
  userId: string
  userName: string
  createdAt: string
  parentId?: string | null
  replies: CommentData[]
}

// Tipos para formulários
export interface VideoFormData {
  youtubeUrl: string
  prompt: string
}

// Tipos para Auth
export interface AuthResult {
  user: User | null
  error: string | null
  needsConfirmation?: boolean
}

// Tipos para Database
export interface DatabaseResult<T> {
  data: T | null
  error: string | null
}

// Tipos para Supabase
export interface SupabaseUser {
  id: string
  email: string
  user_metadata?: {
    name?: string
    [key: string]: unknown
  }
  raw_user_meta_data?: {
    name?: string
    [key: string]: unknown
  }
  created_at: string
}

export interface SupabaseVideo {
  id: string
  user_id: string
  youtube_url: string
  prompt: string
  created_at: string
}

export interface SupabaseComment {
  id: string
  video_id: string
  user_id: string
  text: string
  parent_id: string | null
  created_at: string
} 