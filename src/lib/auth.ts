import { supabase } from './supabase'

export interface User {
  id: string
  email: string
  name?: string
  assinante?: boolean
  createdAt: string
}

export async function signUp(email: string, password: string, name: string) {
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
      return { user: data.user, error: null, needsConfirmation: !data.session }
    }

    return { user: null, error: 'Erro ao criar usuário' }
  } catch (error: any) {
    return { user: null, error: error.message, needsConfirmation: false }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    return { user: data.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      throw error
    }
    return { user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export function formatUserForApp(supabaseUser: any): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    name: supabaseUser.user_metadata?.name || supabaseUser.email,
    assinante: supabaseUser.user_metadata?.assinante || false,
    createdAt: supabaseUser.created_at,
  }
} 