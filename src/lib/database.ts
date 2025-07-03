import { supabase } from './supabase'

// Tipos para as tabelas
export interface Video {
  id: string
  user_id: string
  youtube_url: string
  prompt: string
  created_at: string
}

export interface Comment {
  id: string
  video_id: string
  user_id: string
  text: string
  parent_id: string | null
  created_at: string
}

export interface VideoWithUser extends Video {
  user_name: string
  user_email: string
}

export interface CommentWithUser extends Comment {
  user_name: string
  user_email: string
}

// Funções para Videos
export async function createVideo(videoData: {
  youtube_url: string
  prompt: string
  user_id: string
}) {
  try {
    const { data, error } = await supabase
      .from('videos')
      .insert([videoData])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export async function getVideos() {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export async function getVideoById(id: string) {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

// Funções para Comments
export async function createComment(commentData: {
  video_id: string
  user_id: string
  text: string
  parent_id?: string
}) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([commentData])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export async function getCommentsByVideoId(videoId: string) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('video_id', videoId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export async function deleteComment(commentId: string) {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) throw error
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

// Função auxiliar para extrair nome do usuário
export function extractUserName(user: any): string {
  if (user?.raw_user_meta_data?.name) {
    return user.raw_user_meta_data.name
  }
  return user?.email?.split('@')[0] || 'Usuário'
}

// Função para buscar informações do usuário
export async function getUserById(userId: string) {
  try {
    const { data, error } = await supabase.auth.admin.getUserById(userId)
    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

// Função para buscar nome do usuário diretamente do cache/session
export function getUserName(userId: string, currentUser: any): string {
  // Se for o usuário atual, usar o nome dele
  if (currentUser && currentUser.id === userId) {
    return currentUser.name || currentUser.email?.split('@')[0] || 'Usuário'
  }
  // Para outros usuários, usar um nome genérico por enquanto
  return 'Usuário'
} 