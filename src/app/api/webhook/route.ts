import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Cliente Supabase com Service Role para operações administrativas
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface WebhookPayload {
  table: string // Nome da tabela onde inserir os dados
  data: Record<string, any> // Dados para inserir
  action?: 'insert' | 'update' | 'delete' // Ação a realizar (padrão: insert)
  where?: Record<string, any> // Condições para update/delete
}

export async function POST(request: NextRequest) {
  console.log('🎣 Webhook recebido')
  
  try {
    // Parse do body
    const payload: WebhookPayload = await request.json()
    console.log('📦 Payload recebido:', JSON.stringify(payload, null, 2))

    // Validações básicas
    if (!payload.table) {
      console.error('❌ Tabela não especificada')
      return NextResponse.json(
        { error: 'Campo "table" é obrigatório' },
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

  } catch (err) {
    console.error('❌ Erro no webhook:', err)
    return NextResponse.json(
      { error: 'Erro ao processar webhook', details: err instanceof Error ? err.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

// Métodos não permitidos
export async function GET() {
  return NextResponse.json({ error: 'Método não permitido' }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ error: 'Método não permitido' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Método não permitido' }, { status: 405 })
} 