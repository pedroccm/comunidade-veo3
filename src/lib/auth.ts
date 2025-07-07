import type { SupabaseUser } from '../types';
import { checkEmailHasPayments, createPublicProfile, getPublicProfile, updatePublicProfile } from './database';
import { supabase } from './supabase';

// Função para traduzir mensagens de erro do Supabase
export function translateAuthError(error: string): string {
  const errorTranslations: Record<string, string> = {
    'Invalid login credentials': 'Email ou senha incorretos',
    'Email not confirmed': 'Email não confirmado. Verifique sua caixa de entrada.',
    'Invalid email': 'Email inválido',
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
    'User already registered': 'Este email já está cadastrado',
    'Email rate limit exceeded': 'Muitas tentativas. Tente novamente em alguns minutos.',
    'Invalid refresh token': 'Sessão expirada. Faça login novamente.',
    'Token has expired': 'Sessão expirada. Faça login novamente.',
    'User not found': 'Usuário não encontrado',
    'Signup is disabled': 'Cadastro desabilitado no momento',
    'Email address not authorized': 'Email não autorizado',
    'Database error saving user': 'Erro no banco de dados. Tente novamente.',
    'Invalid user': 'Usuário inválido',
    'Unable to validate email address: invalid format': 'Formato de email inválido',
    'Password is too weak': 'Senha muito fraca',
    'Signups not allowed for otp': 'Cadastro não permitido',
    'For security purposes, you can only request this once every 60 seconds': 'Por segurança, você só pode tentar uma vez a cada 60 segundos',
    'Email address not authorized': 'Email não encontrado em nosso sistema',
  }

  // Procurar tradução exata primeiro
  if (errorTranslations[error]) {
    return errorTranslations[error]
  }

  // Procurar por padrões parciais
  for (const [key, translation] of Object.entries(errorTranslations)) {
    if (error.toLowerCase().includes(key.toLowerCase())) {
      return translation
    }
  }

  // Se não encontrou tradução, retorna mensagem genérica
  return 'Erro na autenticação. Tente novamente.'
}

export async function signUp(email: string, password: string, name: string, phone?: string): Promise<{ user: SupabaseUser | null; error: string | null; needsConfirmation?: boolean }> {
  try {
    console.log('📝 Iniciando cadastro para:', email)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          display_name: name,
          phone: phone || null
        }
      }
    })

    if (error) {
      console.error('❌ Erro no signUp do Supabase:', error)
      throw error
    }

    // Verificar se o usuário foi criado com sucesso
    if (data.user) {
      console.log('✅ Usuário criado no Supabase:', data.user.id)

      // Verificar se email tem pagamentos aprovados
      console.log('💳 Verificando pagamentos...')
      const hasPayments = await checkEmailHasPayments(email)
      console.log('💳 Tem pagamentos:', hasPayments)

      // Verificar se perfil já existe
      console.log('👤 Verificando se perfil já existe...')
      const { data: existingProfile } = await getPublicProfile(data.user.id)

      if (existingProfile) {
        console.log('🔄 Perfil já existe, atualizando status de assinante...')
        // Perfil já existe, atualizar apenas se necessário
        if (existingProfile.assinante !== hasPayments) {
          const updateResult = await updatePublicProfile(data.user.id, {
            assinante: hasPayments
          })

          if (updateResult.error) {
            console.error('❌ Erro ao atualizar perfil:', updateResult.error)
          } else {
            console.log('✅ Perfil atualizado com sucesso:', updateResult.data)
          }
        } else {
          console.log('✅ Perfil já está correto, não precisa atualizar')
        }
      } else {
        console.log('🆕 Criando novo perfil...')
        // Perfil não existe, criar novo
        const profileResult = await createPublicProfile({
          id: data.user.id,
          name: name,
          assinante: hasPayments
        })

        if (profileResult.error) {
          console.error('❌ Erro ao criar perfil:', profileResult.error)
        } else {
          console.log('✅ Perfil criado com sucesso:', profileResult.data)
        }
      }

      // Se o usuário foi criado mas não está confirmado, ainda assim retornamos sucesso
      return { user: data.user as SupabaseUser, error: null, needsConfirmation: !data.session }
    }

    console.error('❌ Usuário não foi criado')
    return { user: null, error: 'Erro ao criar usuário' }
  } catch (error: unknown) {
    console.error('❌ Erro geral no signUp:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return { user: null, error: translateAuthError(errorMessage), needsConfirmation: false }
  }
}

export async function signIn(email: string, password: string): Promise<{ user: SupabaseUser | null; error: string | null }> {
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
    return { user: null, error: translateAuthError(errorMessage) }
  }
}

export async function resetPassword(email: string): Promise<{ error: string | null; success?: boolean }> {
  try {
    console.log('🔄 Enviando email de reset de senha para:', email)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined'
        ? `${window.location.origin}/reset-password`
        : 'http://localhost:3000/reset-password'
    })

    if (error) {
      console.error('❌ Erro no reset de senha:', error)
      throw error
    }

    console.log('✅ Email de reset enviado com sucesso')
    return { error: null, success: true }
  } catch (error: unknown) {
    console.error('❌ Erro geral no reset de senha:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return { error: translateAuthError(errorMessage), success: false }
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
    return { error: translateAuthError(errorMessage) }
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
    return { user: null, error: translateAuthError(errorMessage) }
  }
} 