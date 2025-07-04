import { useCallback, useEffect, useState } from 'react'

// 📝 Template para Hook Seguro
// Copie este template para criar novos hooks sem erros

interface UseExampleHookParams {
    userId: string
    // Adicione outros parâmetros necessários
}

interface ExampleData {
    id: string
    name: string
    email?: string  // Sempre marque propriedades opcionais explicitamente
}

interface UseExampleHookReturn {
    data: ExampleData[]
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
}

export function useExampleHook({ userId }: UseExampleHookParams): UseExampleHookReturn {
    const [data, setData] = useState<ExampleData[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        if (!userId) return // Guard clause para evitar chamadas desnecessárias

        setLoading(true)
        setError(null)

        try {
            // Substitua pela sua chamada de API
            const response = await fetch(`/api/data/${userId}`)

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`)
            }

            const result = await response.json()

            // Validação básica do resultado
            if (!Array.isArray(result)) {
                throw new Error('Formato de dados inválido')
            }

            setData(result)
        } catch (err) {
            // Tratamento seguro de erro
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
            console.error('Erro ao buscar dados:', errorMessage)
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }, [userId]) // ✅ Inclua TODAS as dependências usadas na função

    useEffect(() => {
        fetchData()
    }, [fetchData]) // ✅ Dependência correta

    return {
        data,
        loading,
        error,
        refetch: fetchData
    }
}

// 📝 Template para Component Seguro
interface ExampleComponentProps {
    user: {
        id: string
        name?: string
        email?: string
    }
    onSave: (data: ExampleData) => void
}

export function ExampleComponent({ user, onSave }: ExampleComponentProps) {
    const { data, loading, error, refetch } = useExampleHook({ userId: user.id })

    const handleSubmit = (formData: FormData) => {
        const newData: ExampleData = {
            id: crypto.randomUUID(),
            name: formData.get('name') as string,
            // ✅ Optional chaining para propriedades opcionais
            email: user.email?.toLowerCase() || undefined
        }

        onSave(newData)
    }

    if (loading) {
        return <div>Carregando...</div>
    }

    if (error) {
        return (
            <div>
                <p>Erro: {error}</p>
                <button onClick={refetch}>Tentar Novamente</button>
            </div>
        )
    }

    return (
        <div>
            <h1>Olá, {user.name || user.email?.split('@')[0] || 'Usuário'}!</h1>
            {/* Resto do component */}
        </div>
    )
} 