"use client"

import { AuthForm } from "@/components/auth-form"
import { ClientOnly } from "@/components/client-only"
import { useAuth } from "@/hooks/useAuth"
import type { User } from "@/types"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
    </div>
)

export default function LoginPage() {
    const { user, loading, error } = useAuth()
    const router = useRouter()

    // Se o usuário já está logado, redireciona para o dashboard
    useEffect(() => {
        if (user && !loading) {
            router.push("/dashboard")
        }
    }, [user, loading, router])

    const handleLogin = (userData: User) => {
        // O hook useAuth já irá detectar automaticamente o login
        // e o useEffect acima fará o redirecionamento
        console.log('Usuário logado:', userData)
    }

    return (
        <ClientOnly fallback={<LoadingSpinner />}>
            {loading ? (
                <LoadingSpinner />
            ) : error ? (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center max-w-md mx-auto p-6">
                        <div className="text-red-500 text-xl mb-4">⚠️ Erro</div>
                        <p className="text-gray-700 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                </div>
            ) : !user ? (
                <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
                    <AuthForm onLogin={handleLogin} />
                </div>
            ) : (
                <LoadingSpinner />
            )}
        </ClientOnly>
    )
} 