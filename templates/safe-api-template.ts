// 📝 Template para API Route Build-Safe (Next.js 13+)
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// ✅ CORRETO: Cliente criado apenas quando função é chamada
function getSupabaseClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY // ou ANON_KEY

    if (!url || !key) {
        throw new Error('Variáveis de ambiente do Supabase não configuradas')
    }

    return createClient(url, key)
}

export async function POST(request: NextRequest) {
    try {
        // Criar cliente apenas aqui, não no nível do módulo
        const supabase = getSupabaseClient()

        const body = await request.json()

        // Sua lógica aqui...
        const { data, error } = await supabase
            .from('sua_tabela')
            .insert([body])
            .select()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ success: true, data })

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
}

export async function GET() {
    return NextResponse.json({ error: 'Método não permitido' }, { status: 405 })
}

// 📝 Template para Database Function
export async function safeCreateRecord(data: {
    name: string
    email?: string
}): Promise<{ data: Record<string, unknown> | null; error: string | null }> {
    try {
        // Validação de entrada
        if (!data.name.trim()) {
            return { data: null, error: 'Nome é obrigatório' }
        }

        // Sua lógica de criação aqui
        const result = {
            id: crypto.randomUUID(),
            name: data.name.trim(),
            email: data.email?.toLowerCase()
        }

        return { data: result, error: null }
    } catch (err) {
        // ✅ Tratamento seguro de erro
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
        console.error('Erro ao criar registro:', errorMessage)
        return { data: null, error: errorMessage }
    }
} 