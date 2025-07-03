import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatUserForApp } from '@/lib/auth'
import type { User, SupabaseUser } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há um usuário logado
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(formatUserForApp(session.user as SupabaseUser))
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Escutar mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(formatUserForApp(session.user as SupabaseUser))
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return {
    user,
    loading,
    signOut,
  }
} 