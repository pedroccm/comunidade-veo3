import type { DatabaseResult, PublicProfile, SupabaseComment, SupabaseVideo, User } from '../types'
import { supabase } from './supabase'

// Cache para nomes de usuários (evita múltiplas consultas)
const userNameCache = new Map<string, string>()

// Função para limpar cache de nomes (útil para testes)
export function clearUserNameCache() {
  userNameCache.clear()
}

// Função para invalidar cache de um usuário específico
export function invalidateUserNameCache(userId: string) {
  userNameCache.delete(userId)
  console.log('🗑️ Cache invalidado para usuário:', userId)
}

// Função para forçar atualização do nome de um usuário
export async function refreshUserName(userId: string, currentUser: User): Promise<string> {
  // Invalidar cache primeiro
  invalidateUserNameCache(userId)

  // Buscar nome atualizado
  return await getUserName(userId, currentUser)
}

// Funções para Public Profiles
export async function createPublicProfile(profileData: {
  id: string // ID do usuário do Supabase Auth
  name: string
  assinante?: boolean
}): Promise<DatabaseResult<PublicProfile>> {
  try {
    console.log('🆕 Tentando criar perfil:', profileData)

    const { data, error } = await supabase
      .from('public_profiles')
      .insert([{
        id: profileData.id,
        name: profileData.name,
        assinante: profileData.assinante || false
      }])
      .select()
      .single()

    if (error) {
      console.error('❌ Erro detalhado do Supabase:', error)
      throw error
    }

    // Invalidar cache quando perfil é criado
    invalidateUserNameCache(profileData.id)
    console.log('🆕 Perfil criado e cache invalidado para:', profileData.id)

    return { data: data as PublicProfile, error: null }
  } catch (error: unknown) {
    console.error('❌ Erro completo na criação do perfil:', error)
    let errorMessage = 'Erro desconhecido'

    if (error instanceof Error) {
      errorMessage = error.message
      console.error('❌ Mensagem do erro:', error.message)
      console.error('❌ Stack do erro:', error.stack)
    } else {
      console.error('❌ Tipo do erro:', typeof error)
      console.error('❌ Valor do erro:', error)
    }

    return { data: null, error: errorMessage }
  }
}

export async function getPublicProfile(userId: string): Promise<DatabaseResult<PublicProfile>> {
  try {
    const { data, error } = await supabase
      .from('public_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return { data: data as PublicProfile, error: null }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return { data: null, error: errorMessage }
  }
}

export async function updatePublicProfile(
  userId: string,
  updates: Partial<Pick<PublicProfile, 'name' | 'assinante'>>
): Promise<DatabaseResult<PublicProfile>> {
  try {
    console.log('🔄 Tentando atualizar perfil:', userId, updates)

    const { data, error } = await supabase
      .from('public_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro detalhado no update:', error)
      throw error
    }

    // Invalidar cache quando perfil é atualizado
    invalidateUserNameCache(userId)
    console.log('🔄 Perfil atualizado e cache invalidado para:', userId)

    return { data: data as PublicProfile, error: null }
  } catch (error: unknown) {
    console.error('❌ Erro completo no update:', error)
    let errorMessage = 'Erro desconhecido'

    if (error instanceof Error) {
      errorMessage = error.message
      console.error('❌ Mensagem do erro update:', error.message)
    } else {
      console.error('❌ Tipo do erro update:', typeof error)
      console.error('❌ Valor do erro update:', error)
    }

    return { data: null, error: errorMessage }
  }
}

// Função para obter perfil completo do usuário
export async function getFullUserProfile(userId: string): Promise<DatabaseResult<User>> {
  try {
    // Buscar dados do usuário autenticado
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    if (authError) throw authError
    if (!authUser) throw new Error('Usuário não autenticado')

    // Buscar perfil público
    const { data: profile, error: profileError } = await getPublicProfile(userId)
    if (profileError) throw new Error(profileError)
    if (!profile) throw new Error('Perfil não encontrado')

    // Combinar dados
    const fullUser: User = {
      id: authUser.id,
      email: authUser.email!,
      name: profile.name,
      assinante: profile.assinante,
      createdAt: profile.created_at
    }

    return { data: fullUser, error: null }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return { data: null, error: errorMessage }
  }
}

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

// Função para buscar nome do usuário da tabela public_profiles
export async function getUserNameById(userId: string): Promise<string> {
  // Verificar cache primeiro
  if (userNameCache.has(userId)) {
    return userNameCache.get(userId)!
  }

  try {
    console.log('🔍 Buscando nome do usuário:', userId)

    // Tentar buscar da tabela public_profiles
    const { data: profile, error } = await getPublicProfile(userId)

    if (profile) {
      console.log('✅ Nome encontrado na public_profiles:', profile.name)
      userNameCache.set(userId, profile.name)
      return profile.name
    }

    // Verificar se o erro é porque a tabela não existe
    if (error && (error.includes('relation') || error.includes('table') || error.includes('public_profiles'))) {
      console.log('⚠️ Tabela public_profiles não existe, usando fallback')
      const fallbackName = `Usuário ${userId.slice(-4)}`
      userNameCache.set(userId, fallbackName)
      return fallbackName
    }

    // Se a tabela existe mas o usuário não tem perfil, tentar criar um básico
    console.log('⚠️ Perfil não encontrado, tentando obter dados do auth...')

    try {
      // Tentar buscar informações do usuário atual se for o mesmo ID
      const { data: { user: currentAuthUser }, error: authError } = await supabase.auth.getUser()

      if (!authError && currentAuthUser && currentAuthUser.id === userId) {
        // Se é o usuário atual, tentar criar perfil automaticamente
        const userName = (currentAuthUser.user_metadata?.name as string) || currentAuthUser.email?.split('@')[0] || 'Usuário'

        console.log('🔧 Tentando criar perfil para usuário atual:', userName)

        const { data: newProfile, error: createError } = await createPublicProfile({
          id: userId,
          name: userName,
          assinante: false
        })

        if (newProfile) {
          console.log('✅ Perfil criado automaticamente:', newProfile.name)
          userNameCache.set(userId, newProfile.name)
          return newProfile.name
        } else {
          console.warn('⚠️ Não foi possível criar perfil:', createError)
          userNameCache.set(userId, userName)
          return userName
        }
      }
    } catch (createError) {
      console.warn('⚠️ Erro ao tentar criar perfil:', createError)
    }

    // Como último recurso, usar um nome genérico mas mais específico
    const fallbackName = `Usuário ${userId.slice(-4)}`
    console.log('📄 Usando nome fallback:', fallbackName)
    userNameCache.set(userId, fallbackName)
    return fallbackName

  } catch (error) {
    console.error('❌ Erro ao buscar nome do usuário:', error)
    const fallbackName = `Usuário ${userId.slice(-4)}`
    userNameCache.set(userId, fallbackName)
    return fallbackName
  }
}

// Função para buscar nome do usuário com cache do usuário atual
export async function getUserName(userId: string, currentUser: User): Promise<string> {
  // Se for o usuário atual, usar o nome dele direto (mais rápido)
  if (currentUser && currentUser.id === userId) {
    const name = currentUser.name || currentUser.email?.split('@')[0] || 'Você'
    userNameCache.set(userId, name)
    return name
  }

  // Para outros usuários, buscar via getUserNameById
  return await getUserNameById(userId)
}

// Funções específicas para gerenciar status de assinante
export async function updateSubscriptionStatus(
  userId: string,
  isSubscriber: boolean
): Promise<DatabaseResult<PublicProfile>> {
  return await updatePublicProfile(userId, { assinante: isSubscriber })
}

export async function checkSubscriptionStatus(userId: string): Promise<boolean> {
  try {
    const { data: profile, error } = await getPublicProfile(userId)
    if (error || !profile) {
      return false
    }
    return profile.assinante
  } catch (error) {
    console.error('Erro ao verificar status de assinante:', error)
    return false
  }
}

// Função auxiliar para migração de usuários existentes
export async function ensureUserProfile(userId: string, userEmail: string, userName?: string): Promise<DatabaseResult<PublicProfile>> {
  try {
    // Verificar se o perfil já existe
    const { data: existingProfile, error: checkError } = await getPublicProfile(userId)

    if (checkError && !checkError.includes('não encontrado')) {
      // Erro real, não apenas perfil não encontrado
      throw new Error(checkError)
    }

    if (existingProfile) {
      // Perfil já existe, retornar ele
      return { data: existingProfile, error: null }
    }

    // Perfil não existe, criar um novo
    const name = userName || userEmail.split('@')[0]
    return await createPublicProfile({
      id: userId,
      name: name,
      assinante: false
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return { data: null, error: errorMessage }
  }
}

// Função de diagnóstico para testar a configuração
export async function testDatabaseConfiguration(): Promise<{
  success: boolean;
  message: string;
  details: Record<string, unknown>
}> {
  try {
    console.log('🔍 Testando configuração do banco de dados...')

    // Teste 1: Verificar se consegue acessar a tabela public_profiles
    const { error: selectError } = await supabase
      .from('public_profiles')
      .select('id')
      .limit(1)

    if (selectError) {
      if (selectError.message.includes('relation') || selectError.message.includes('public_profiles')) {
        return {
          success: false,
          message: 'Tabela public_profiles não existe. Execute os scripts SQL fornecidos.',
          details: { error: selectError.message, step: 'select_test' }
        }
      }
      return {
        success: false,
        message: 'Erro ao acessar tabela public_profiles: ' + selectError.message,
        details: { error: selectError.message, step: 'select_test' }
      }
    }

    console.log('✅ Tabela public_profiles acessível')

    // Teste 2: Verificar usuário atual
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
    if (userError || !currentUser) {
      return {
        success: false,
        message: 'Nenhum usuário autenticado para teste',
        details: { error: userError?.message, step: 'auth_test' }
      }
    }

    console.log('✅ Usuário autenticado:', currentUser.id)

    // Teste 3: Buscar perfil do usuário atual
    const { data: profile, error: profileError } = await getPublicProfile(currentUser.id)

    if (profileError) {
      console.log('⚠️ Perfil não encontrado, tentando criar...')

      // Teste 4: Tentar criar perfil
      const { data: newProfile, error: createError } = await createPublicProfile({
        id: currentUser.id,
        name: currentUser.email!.split('@')[0],
        assinante: false
      })

      if (createError) {
        return {
          success: false,
          message: 'Erro ao criar perfil: ' + createError,
          details: { error: createError, step: 'create_test' }
        }
      }

      console.log('✅ Perfil criado com sucesso:', newProfile)
      return {
        success: true,
        message: 'Configuração OK! Perfil criado automaticamente.',
        details: { profile: newProfile, step: 'create_success' }
      }
    }

    console.log('✅ Perfil encontrado:', profile)
    return {
      success: true,
      message: 'Configuração OK! Tabela public_profiles funcionando corretamente.',
      details: { profile, step: 'all_tests_passed' }
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('❌ Erro no teste:', errorMessage)
    return {
      success: false,
      message: 'Erro durante o teste: ' + errorMessage,
      details: { error: errorMessage, step: 'catch_block' }
    }
  }
}

// Função para enriquecer o perfil do usuário com dados da public_profiles
// Esta função pode ser chamada DEPOIS do login, de forma opcional
export async function enrichUserProfile(user: User): Promise<User> {
  try {
    console.log('🔍 Tentando enriquecer perfil do usuário:', user.id)

    const { data: profile, error } = await getPublicProfile(user.id)

    if (profile) {
      console.log('✅ Perfil público encontrado, atualizando dados')

      // Invalidar cache para garantir dados atualizados
      invalidateUserNameCache(user.id)

      return {
        ...user,
        name: profile.name,
        assinante: profile.assinante,
        createdAt: profile.created_at,
      }
    }

    if (error && !error.includes('relation') && !error.includes('table')) {
      console.log('⚠️ Perfil não encontrado, tentando criar...')

      const { data: newProfile, error: createError } = await createPublicProfile({
        id: user.id,
        name: user.name || user.email?.split('@')[0] || 'Usuário',
        assinante: user.assinante || false
      })

      if (newProfile) {
        console.log('✅ Perfil criado com sucesso')

        // Invalidar cache para garantir dados atualizados
        invalidateUserNameCache(user.id)

        return {
          ...user,
          name: newProfile.name,
          assinante: newProfile.assinante,
          createdAt: newProfile.created_at,
        }
      } else {
        console.error('❌ Erro ao criar perfil:', createError)
      }
    }

    console.log('📄 Mantendo dados básicos do usuário')
    return user

  } catch (error) {
    console.error('❌ Erro ao enriquecer perfil:', error)
    return user // Sempre retorna o usuário original em caso de erro
  }
}

// Função para ativar assinatura por email (usado pelo webhook)
export async function activateSubscriptionByEmail(email: string): Promise<{ success: boolean; message: string; userId?: string }> {
  try {
    // Buscar usuário pelo email usando service role
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()

    if (userError) {
      throw new Error(`Erro ao buscar usuários: ${userError.message}`)
    }

    // Encontrar usuário pelo email
    const user = users.find(u => u.email === email)

    if (!user) {
      return { success: false, message: `Usuário com email ${email} não encontrado` }
    }

    // Ativar assinatura
    const { data: _, error: updateError } = await updatePublicProfile(user.id, { assinante: true })

    if (updateError) {
      return { success: false, message: `Erro ao ativar assinatura: ${updateError}` }
    }

    return {
      success: true,
      message: `Assinatura ativada para ${email}`,
      userId: user.id
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return { success: false, message: errorMessage }
  }
}

// Função para verificar se email tem pagamentos aprovados
export async function checkEmailHasPayments(email: string): Promise<boolean> {
  try {
    console.log('💳 Verificando pagamentos para email:', email)
    console.log('💳 Tipo do email:', typeof email)
    console.log('💳 Email length:', email.length)
    console.log('💳 Email trim:', email.trim())

    const { data, error } = await supabase
      .from('payments')
      .select('id')
      .eq('email', email)
      .limit(1)

    if (error) {
      console.error('❌ Erro ao verificar pagamentos:', error)
      return false
    }

    const hasPayments = data && data.length > 0
    console.log('💳 Resultado da verificação:', hasPayments, 'Dados:', data, "email buscado:", email)

    return hasPayments
  } catch (error) {
    console.error('❌ Erro ao verificar pagamentos:', error)
    return false
  }
} 