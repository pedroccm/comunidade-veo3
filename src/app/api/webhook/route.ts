import { activateSubscriptionByEmail } from '@/lib/database'
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

export async function POST(request: NextRequest) {
  console.log('🎣 Webhook recebido')

  try {
    // Parse do body
    const rawBody = await request.text()
    console.log('📦 Body RAW recebido:', rawBody)

    let payload: Record<string, unknown>

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
            error: 'Formato de dados inválido',
            received: rawBody.substring(0, 200) + '...'
          },
          { status: 400 }
        )
      }
    }

    // Verificar se é compra aprovada
    const evento = String(payload.evento || '').toLowerCase()

    if (evento.includes('compra aprovada') || evento.includes('aprovad')) {
      console.log('✅ Compra aprovada detectada - inserindo no banco...')

      // Preparar dados para inserir
      const paymentData = {
        id: crypto.randomUUID(),
        evento: String(payload.evento || 'compra aprovada'),
        produto: String(payload.produto || ''),
        transacao: String(payload.transacao || ''),
        email: String(payload.email || ''),
        status: 'aprovado',
        data_evento: payload.data ? String(payload.data) : new Date().toISOString(),
        raw_payload: payload,
        created_at: new Date().toISOString()
      }

      console.log('💾 Inserindo dados:', paymentData)

      // Inserir no banco
      const supabase = getSupabaseClient()

      const { data, error } = await supabase
        .from('payments')
        .insert([paymentData])
        .select()

      if (error) {
        console.error('❌ Erro ao inserir no banco:', error)
        return NextResponse.json(
          {
            error: 'Erro ao salvar no banco',
            details: error.message
          },
          { status: 500 }
        )
      }

      console.log('🎉 Dados inseridos com sucesso:', data)

      // Segunda ação: Ativar assinatura do usuário se ele existir
      const userEmail = String(payload.email || '')
      if (userEmail) {
        const activationResult = await activateSubscriptionByEmail(userEmail)

        return NextResponse.json({
          success: true,
          message: 'Compra aprovada salva com sucesso',
          data: data?.[0] || null,
          subscriptionActivation: activationResult,
          processedAt: new Date().toISOString()
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Compra aprovada salva com sucesso',
        data: data?.[0] || null,
        processedAt: new Date().toISOString()
      })

    } else {
      console.log(`ℹ️ Evento ignorado: ${payload.evento} (não é compra aprovada)`)

      return NextResponse.json({
        success: true,
        message: 'Evento ignorado - apenas compras aprovadas são processadas',
        evento: payload.evento,
        processedAt: new Date().toISOString()
      })
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

// Métodos não permitidos
export async function GET() {
  return NextResponse.json({
    error: 'Método não permitido',
    message: 'Este endpoint aceita apenas POST requests para compras aprovadas',
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