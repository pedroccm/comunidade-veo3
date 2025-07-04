import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { enrichUserProfile, invalidateUserNameCache } from '@/lib/database'
import type { User, SupabaseUser } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEnriched, setIsEnriched] = useState(false)
  const isProcessing = useRef(false)
  const hasInitialized = useRef(false)
  const hasEnriched = useRef(false)

  // Função simples para converter usuário do Supabase para formato da app
  const convertUser = (supabaseUser: SupabaseUser): User => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      name: (supabaseUser.user_metadata?.name as string) || supabaseUser.email.split('@')[0],
      assinante: Boolean(supabaseUser.user_metadata?.assinante) || false,
      createdAt: supabaseUser.created_at,
    }
  }

  // Função para tentar enriquecer o perfil (opcional, não bloqueia)
  const tryEnrichProfile = async (basicUser: User) => {
    if (hasEnriched.current) return
    
    try {
      hasEnriched.current = true
      console.log('🔄 Tentando enriquecer perfil...')
      
      const enrichedUser = await enrichUserProfile(basicUser)
      
      // Só atualiza se realmente mudou alguma coisa
      if (enrichedUser.assinante !== basicUser.assinante || enrichedUser.name !== basicUser.name) {
        console.log('✅ Perfil enriquecido com sucesso')
        
        // Invalidar cache de nomes para garantir dados atualizados
        invalidateUserNameCache(basicUser.id)
        
        setUser(enrichedUser)
        setIsEnriched(true)
      }
    } catch (error) {
      console.warn('⚠️ Não foi possível enriquecer perfil:', error)
      // Não define erro aqui, pois é opcional
    }
  }

  // Função para finalizar loading com segurança
  const finishLoading = (foundUser: User | null = null, errorMessage: string | null = null) => {
    console.log('🏁 Finalizando carregamento:', { foundUser: !!foundUser, errorMessage })
    setLoading(false)
    hasInitialized.current = true
    if (foundUser) setUser(foundUser)
    if (errorMessage) setError(errorMessage)
    else setError(null)
  }

  useEffect(() => {
    let isMounted = true
    let timeoutId: NodeJS.Timeout | null = null

    const checkUser = async () => {
      // Evitar verificações múltiplas
      if (isProcessing.current || hasInitialized.current) {
        console.log('🔒 Verificação já em andamento ou concluída, pulando...')
        return
      }
      
      isProcessing.current = true
      console.log('🔍 Iniciando verificação de usuário...')
      
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (!isMounted) return
        
        if (sessionError) {
          console.error('❌ Erro ao obter sessão:', sessionError)
          finishLoading(null, 'Erro ao verificar autenticação')
          return
        }
        
        if (session?.user) {
          console.log('✅ Usuário encontrado:', session.user.id)
          const formattedUser = convertUser(session.user as SupabaseUser)
          finishLoading(formattedUser)
          
          // Cancelar timeout
          if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
          }
          
          // Tentar enriquecer perfil
          setTimeout(() => {
            if (isMounted) {
              tryEnrichProfile(formattedUser)
            }
          }, 1000)
        } else {
          console.log('❌ Nenhum usuário logado')
          finishLoading()
          
          // Cancelar timeout
          if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
          }
        }
        
      } catch (error) {
        console.error('❌ Erro geral na verificação:', error)
        if (isMounted) {
          finishLoading(null, 'Erro inesperado na autenticação')
        }
        
        // Cancelar timeout
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
      } finally {
        isProcessing.current = false
      }
    }

    // Configurar timeout APENAS se ainda não inicializou
    if (!hasInitialized.current) {
      timeoutId = setTimeout(() => {
        if (isMounted && !hasInitialized.current) {
          console.warn('⚠️ Timeout na verificação - forçando finalização')
          finishLoading(null, 'Timeout na verificação de autenticação')
        }
      }, 8000)
    }

    checkUser()

    // Escutar mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return

      console.log('🔄 Auth state changed:', event, session?.user?.id || 'no-user')
      
      // Cancelar timeout sempre que há mudança
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      
      // Apenas resetar se for mudança real de estado
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        setError(null) // Limpar erros anteriores
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ Login/refresh detectado:', session.user.id)
          const formattedUser = convertUser(session.user as SupabaseUser)
          setUser(formattedUser)
          setLoading(false)
          hasInitialized.current = true
          
          // Reset flags para permitir novo enriquecimento
          hasEnriched.current = false
          setIsEnriched(false)
          
          // Tentar enriquecer perfil
          setTimeout(() => {
            if (isMounted) {
              tryEnrichProfile(formattedUser)
            }
          }, 1000)
        } else if (event === 'SIGNED_OUT') {
          console.log('❌ Logout detectado')
          setUser(null)
          setLoading(false)
          hasInitialized.current = true
          hasEnriched.current = false
          setIsEnriched(false)
        }
      }
    })

    return () => {
      isMounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      subscription.unsubscribe()
    }
  }, []) // Sem dependências para evitar re-execução

  const signOut = async () => {
    try {
      setError(null)
      console.log('🚪 Fazendo logout...')
      await supabase.auth.signOut()
      setUser(null)
      hasInitialized.current = false
      hasEnriched.current = false
      setIsEnriched(false)
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      setError('Erro ao fazer logout')
    }
  }

  return {
    user,
    loading,
    error,
    isEnriched,
    signOut,
  }
} 