import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Função para criar cliente Supabase apenas quando necessário (lazy loading)
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL é obrigatória')
  }

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY é obrigatória')
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

interface WebhookPayload {
  table: string // Nome da tabela onde inserir os dados
  data: Record<string, unknown> // Dados para inserir
  action?: 'insert' | 'update' | 'delete' // Ação a realizar (padrão: insert)
  where?: Record<string, unknown> // Condições para update/delete
}

// Interface para payload de sistema de pagamento/e-commerce
interface PaymentWebhookPayload {
  evento?: string
  produto?: string
  transacao?: string
  email?: string
  status?: string
  data?: string
  [key: string]: unknown
}

export async function POST(request: NextRequest) {
  console.log('🎣 Webhook recebido')

  try {
    // Headers para debug
    const headers = Object.fromEntries(request.headers.entries())
    console.log('📋 Headers recebidos:', JSON.stringify(headers, null, 2))

    // Parse do body
    const rawBody = await request.text()
    console.log('📦 Body RAW recebido:', rawBody)

    let payload: WebhookPayload | PaymentWebhookPayload

    try {
      payload = JSON.parse(rawBody)
      console.log('📦 Payload JSON parseado:', JSON.stringify(payload, null, 2))
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON:', parseError)

      // Tentar como form-urlencoded
      try {
        const urlParams = new URLSearchParams(rawBody)
        payload = Object.fromEntries(urlParams.entries())
        console.log('📦 Payload URL-encoded parseado:', JSON.stringify(payload, null, 2))
      } catch (formError) {
        console.error('❌ Erro ao fazer parse como form-urlencoded:', formError)
        return NextResponse.json(
          {
            error: 'Formato de dados inválido. Suporte JSON ou form-urlencoded.',
            received: rawBody.substring(0, 200) + '...'
          },
          { status: 400 }
        )
      }
    }

    // Detectar tipo de webhook e processar adequadamente
    if (isPaymentWebhook(payload)) {
      console.log('💳 Detectado webhook de pagamento/e-commerce')
      return await handlePaymentWebhook(payload as PaymentWebhookPayload)
    } else {
      console.log('🔧 Detectado webhook genérico')
      return await handleGenericWebhook(payload as WebhookPayload)
    }

  } catch (err) {
    console.error('❌ Erro geral no webhook:', err)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: err instanceof Error ? err.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Detectar se é webhook de pagamento
function isPaymentWebhook(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object') return false

  const paymentKeys = ['evento', 'transacao', 'produto', 'status', 'compra', 'payment', 'order']
  const keys = Object.keys(payload)

  return paymentKeys.some(key => keys.includes(key))
}

// Processar webhook de pagamento/e-commerce
async function handlePaymentWebhook(payload: PaymentWebhookPayload): Promise<NextResponse> {
  try {
    console.log('💳 Processando webhook de pagamento...')

    // Extrair dados do payload de pagamento
    const paymentData = {
      id: crypto.randomUUID(),
      evento: payload.evento || 'desconhecido',
      produto: payload.produto || 'produto_nao_especificado',
      transacao: payload.transacao || 'transacao_nao_especificada',
      email: payload.email || null,
      status: payload.status || 'pendente',
      data_evento: payload.data || new Date().toISOString(),
      raw_payload: JSON.stringify(payload),
      created_at: new Date().toISOString()
    }

    console.log('📊 Dados do pagamento processados:', paymentData)

    // Salvar no Supabase (se tabela de payments existir)
    try {
      const supabase = getSupabaseClient()

      const { data, error } = await supabase
        .from('payments')
        .insert([paymentData])
        .select()

      if (error) {
        console.warn('⚠️ Erro ao salvar em payments (tabela pode não existir):', error.message)

        // Se tabela payments não existir, salvar como log genérico
        const logData = {
          id: crypto.randomUUID(),
          type: 'payment_webhook',
          data: paymentData,
          created_at: new Date().toISOString()
        }

        // Tentar salvar em webhook_logs
        const { error: logError } = await supabase
          .from('webhook_logs')
          .insert([logData])

        if (logError) {
          console.warn('⚠️ Tabela webhook_logs também não existe:', logError.message)
        }
      } else {
        console.log('✅ Pagamento salvo com sucesso:', data)
      }

    } catch (dbError) {
      console.error('❌ Erro de banco de dados:', dbError)
    }

    // Processar ações específicas baseadas no evento
    await processPaymentAction(payload)

    return NextResponse.json({
      success: true,
      message: 'Webhook de pagamento processado com sucesso',
      type: 'payment',
      evento: payload.evento,
      transacao: payload.transacao,
      processedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Erro ao processar webhook de pagamento:', error)
    return NextResponse.json(
      {
        error: 'Erro ao processar webhook de pagamento',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

// Processar ações específicas baseadas no evento de pagamento
async function processPaymentAction(payload: PaymentWebhookPayload): Promise<void> {
  try {
    console.log(`🎯 Processando ação para evento: ${payload.evento}`)

    switch (payload.evento?.toLowerCase()) {
      case 'compra aprovada':
      case 'payment_approved':
      case 'completed':
        console.log('✅ Processando compra aprovada...')
        // Aqui você pode:
        // - Ativar assinatura do usuário
        // - Enviar email de confirmação
        // - Liberar acesso a conteúdo premium
        await handleApprovedPurchase(payload)
        break

      case 'compra cancelada':
      case 'payment_cancelled':
      case 'cancelled':
        console.log('❌ Processando compra cancelada...')
        await handleCancelledPurchase(payload)
        break

      case 'compra pendente':
      case 'payment_pending':
      case 'pending':
        console.log('⏳ Processando compra pendente...')
        await handlePendingPurchase(payload)
        break

      default:
        console.log(`ℹ️ Evento não reconhecido: ${payload.evento}`)
    }
  } catch (error) {
    console.error('❌ Erro ao processar ação do pagamento:', error)
  }
}

// Helper function para buscar usuário por email
async function findUserByEmail(email: string) {
  const supabase = getSupabaseClient()

  const { data: usersResponse } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000
  })

  return usersResponse?.users?.find(user => user.email === email)
}

// Processar compra aprovada
async function handleApprovedPurchase(payload: PaymentWebhookPayload): Promise<void> {
  try {
    if (!payload.email) {
      console.warn('⚠️ Email não fornecido para compra aprovada')
      return
    }

    const authUser = await findUserByEmail(payload.email)

    if (authUser) {
      console.log(`👤 Usuário encontrado: ${authUser.id}`)

      const supabase = getSupabaseClient()

      // Ativar assinatura
      const { error: updateError } = await supabase
        .from('public_profiles')
        .update({ assinante: true })
        .eq('id', authUser.id)

      if (updateError) {
        console.error('❌ Erro ao ativar assinatura:', updateError.message)
      } else {
        console.log('🎉 Assinatura ativada com sucesso!')
      }
    } else {
      console.warn(`⚠️ Usuário não encontrado com email: ${payload.email}`)
    }
  } catch (error) {
    console.error('❌ Erro ao processar compra aprovada:', error)
  }
}

// Processar compra cancelada
async function handleCancelledPurchase(payload: PaymentWebhookPayload): Promise<void> {
  try {
    if (!payload.email) return

    const authUser = await findUserByEmail(payload.email)

    if (authUser) {
      const supabase = getSupabaseClient()
      
      // Desativar assinatura
      await supabase
        .from('public_profiles')
        .update({ assinante: false })
        .eq('id', authUser.id)

      console.log('❌ Assinatura desativada por cancelamento')
    }
  } catch (error) {
    console.error('❌ Erro ao processar compra cancelada:', error)
  }
}

// Processar compra pendente
async function handlePendingPurchase(payload: PaymentWebhookPayload): Promise<void> {
  console.log('⏳ Compra pendente - aguardando confirmação')
  console.log(`📧 Email: ${payload.email || 'não informado'}`)
  console.log(`💰 Produto: ${payload.produto || 'não informado'}`)
  // Aqui você pode registrar o evento ou enviar notificações
}

// Processar webhook genérico (formato original)
async function handleGenericWebhook(payload: WebhookPayload): Promise<NextResponse> {
  // Validações básicas
  if (!payload.table) {
    console.error('❌ Tabela não especificada')
    return NextResponse.json(
      { error: 'Campo "table" é obrigatório para webhook genérico' },
      { status: 400 }
    )
  }

  if (!payload.data && payload.action !== 'delete') {
    console.error('❌ Dados não especificados')
    return NextResponse.json(
      { error: 'Campo "data" é obrigatório para insert/update' },
      { status: 400 }
    )
  }

  const action = payload.action || 'insert'
  console.log(`📝 Executando ${action} na tabela ${payload.table}`)

  // Criar cliente Supabase apenas quando necessário
  const supabase = getSupabaseClient()

  let result
  let error

  switch (action) {
    case 'insert':
      console.log('➕ Inserindo dados:', payload.data)
      const insertResult = await supabase
        .from(payload.table)
        .insert([payload.data])
        .select()

      result = insertResult.data
      error = insertResult.error
      break

    case 'update':
      if (!payload.where) {
        console.error('❌ Condição WHERE não especificada para update')
        return NextResponse.json(
          { error: 'Campo "where" é obrigatório para update' },
          { status: 400 }
        )
      }

      console.log('✏️ Atualizando dados:', payload.data, 'onde:', payload.where)
      const updateResult = await supabase
        .from(payload.table)
        .update(payload.data)
        .match(payload.where)
        .select()

      result = updateResult.data
      error = updateResult.error
      break

    case 'delete':
      if (!payload.where) {
        console.error('❌ Condição WHERE não especificada para delete')
        return NextResponse.json(
          { error: 'Campo "where" é obrigatório para delete' },
          { status: 400 }
        )
      }

      console.log('🗑️ Removendo dados onde:', payload.where)
      const deleteResult = await supabase
        .from(payload.table)
        .delete()
        .match(payload.where)
        .select()

      result = deleteResult.data
      error = deleteResult.error
      break

    default:
      console.error('❌ Ação inválida:', action)
      return NextResponse.json(
        { error: `Ação "${action}" não suportada. Use: insert, update, delete` },
        { status: 400 }
      )
  }

  if (error) {
    console.error('❌ Erro do Supabase:', error)
    return NextResponse.json(
      { error: 'Erro ao executar operação no banco', details: error },
      { status: 500 }
    )
  }

  console.log('✅ Operação executada com sucesso:', result)
  return NextResponse.json({
    success: true,
    action,
    table: payload.table,
    result
  })
}

// Métodos não permitidos
export async function GET() {
  return NextResponse.json({
    error: 'Método não permitido',
    message: 'Este endpoint aceita apenas POST requests',
    webhook_url: 'https://criadoresde.video/api/webhook',
    timestamp: new Date().toISOString()
  }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ error: 'Método não permitido' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Método não permitido' }, { status: 405 })
} 