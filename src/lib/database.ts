import { supabase } from './supabase'
import type { SupabaseVideo, SupabaseComment, DatabaseResult, User } from '../types'

// Funções para Videos
export async function createVideo(videoData: {
  youtube_url: string
  prompt: string
  user_id: string
}): Promise<DatabaseResult<SupabaseVideo>> {
  try {
    const { data, error } = await supabase
      .from('videos')
      .insert([videoData])
      .select()
      .single()

    if (error) throw error
    return { data: data as SupabaseVideo, error: null }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return { data: null, error: errorMessage }
  }
}

export async function getVideos(): Promise<DatabaseResult<SupabaseVideo[]>> {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data: data as SupabaseVideo[], error: null }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return { data: null, error: errorMessage }
  }
}

export async function getVideoById(id: string): Promise<DatabaseResult<SupabaseVideo>> {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return { data: data as SupabaseVideo, error: null }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return { data: null, error: errorMessage }
  }
}

// Funções para Comments
export async function createComment(commentData: {
  video_id: string
  user_id: string
  text: string
  parent_id?: string
}): Promise<DatabaseResult<SupabaseComment>> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([commentData])
      .select()
      .single()

    if (error) throw error
    return { data: data as SupabaseComment, error: null }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return { data: null, error: errorMessage }
  }
}

export async function getCommentsByVideoId(videoId: string): Promise<DatabaseResult<SupabaseComment[]>> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('video_id', videoId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return { data: data as SupabaseComment[], error: null }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return { data: null, error: errorMessage }
  }
}

export async function deleteComment(commentId: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) throw error
    return { error: null }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return { error: errorMessage }
  }
}

// Função auxiliar para extrair nome do usuário
export function extractUserName(user: User): string {
  if (user?.name) {
    return user.name
  }
  return user?.email?.split('@')[0] || 'Usuário'
}

// Função para buscar informações do usuário
export async function getUserById(userId: string): Promise<DatabaseResult<User>> {
  try {
    const { data, error } = await supabase.auth.admin.getUserById(userId)
    if (error) throw error
    return { data: data as User, error: null }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return { data: null, error: errorMessage }
  }
}

// Função para buscar nome do usuário diretamente do cache/session
export function getUserName(userId: string, currentUser: User): string {
  // Se for o usuário atual, usar o nome dele
  if (currentUser && currentUser.id === userId) {
    return currentUser.name || currentUser.email?.split('@')[0] || 'Usuário'
  }
  // Para outros usuários, usar um nome genérico por enquanto
  return 'Usuário'
} 