"use client"

import { AuthForm } from "@/components/auth-form"
import { Dashboard } from "@/components/dashboard"
import { useAuth } from "@/hooks/useAuth"
import type { User } from "@/types"

export default function Home() {
  const { user, loading, signOut } = useAuth()

  const handleLogin = (userData: User) => {
    // O hook useAuth já irá detectar automaticamente o login
    // através do onAuthStateChange do Supabase
    console.log('Usuário logado:', userData)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {!user ? <AuthForm onLogin={handleLogin} /> : <Dashboard user={user} onLogout={signOut} />}
    </div>
  )
}
