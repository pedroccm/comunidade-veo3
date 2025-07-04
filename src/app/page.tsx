"use client"

import { AuthForm } from "@/components/auth-form"
import { Dashboard } from "@/components/dashboard"
import { useAuth } from "@/hooks/useAuth"
import type { User } from "@/types"

export default function Home() {
  const { user, loading, error, signOut } = useAuth()

  const handleLogin = (userData: User) => {
    // O hook useAuth já irá detectar automaticamente o login
    // através do onAuthStateChange do Supabase
    console.log('Usuário logado:', userData)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
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
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {!user ? <AuthForm onLogin={handleLogin} /> : <Dashboard user={user} onLogout={signOut} />}
    </div>
  )
}
