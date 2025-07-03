import { supabase } from './supabase'
import type { User, AuthResult, SupabaseUser } from '../types'

export async function signUp(email: string, password: string, name: string): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        }
      }
    })

    if (error) {
      throw error
    }

    // Verificar se o usuário foi criado com sucesso
    if (data.user) {
      // Se o usuário foi criado mas não está confirmado, ainda assim retornamos sucesso
      return { user: data.user as SupabaseUser, error: null, needsConfirmation: !data.session }
    }

    return { user: null, error: 'Erro ao criar usuário' }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return { user: null, error: errorMessage, needsConfirmation: false }
  }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    return { user: data.user as SupabaseUser, error: null }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return { user: null, error: errorMessage }
  }
}

export async function signOut(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
    return { error: null }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return { error: errorMessage }
  }
}

export async function getCurrentUser(): Promise<{ user: SupabaseUser | null; error: string | null }> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      throw error
    }
    return { user: user as SupabaseUser, error: null }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return { user: null, error: errorMessage }
  }
}

export function formatUserForApp(supabaseUser: SupabaseUser): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    name: supabaseUser.user_metadata?.name || supabaseUser.email,
    assinante: supabaseUser.user_metadata?.assinante || false,
    createdAt: supabaseUser.created_at,
  }
} 