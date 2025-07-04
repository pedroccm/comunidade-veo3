"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Video, Sparkles } from "lucide-react"
import { signUp, signIn } from "@/lib/auth"
import type { User } from "@/types"

interface AuthFormProps {
  onLogin: (user: User) => void
}

export function AuthForm({ onLogin }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, isLogin: boolean) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

          try {
        if (isLogin) {
          // Login com Supabase
          const { user, error } = await signIn(email, password)
          
          if (error) {
            setError(error)
          } else if (user) {
            // Converter diretamente para o formato da app
            const formattedUser = {
              id: user.id,
              email: user.email,
              name: (user.user_metadata?.name as string) || user.email?.split('@')[0] || 'Usuário',
              assinante: Boolean(user.user_metadata?.assinante) || false,
              createdAt: user.created_at,
            }
            onLogin(formattedUser)
          }
        } else {
          // Cadastro com Supabase
          const { user, error, needsConfirmation } = await signUp(email, password, name)
          
          if (error) {
            setError(error)
          } else if (user) {
            if (needsConfirmation) {
              setSuccess("Cadastro realizado com sucesso! Verifique seu email para confirmar a conta.")
            } else {
              // Converter diretamente para o formato da app
              const formattedUser = {
                id: user.id,
                email: user.email,
                name: name,
                assinante: false,
                createdAt: user.created_at,
              }
              onLogin(formattedUser)
            }
          }
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Erro inesperado'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Video className="h-8 w-8 text-purple-600" />
            <Sparkles className="h-6 w-6 text-indigo-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AI Video Community</h1>
          <p className="text-gray-600 mt-2">Comunidade para criadores de vídeos com IA</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo</CardTitle>
            <CardDescription>Entre na sua conta ou crie uma nova para acessar a comunidade</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {success && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-600">{success}</p>
                </div>
              )}

              <TabsContent value="login">
                <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" name="email" type="email" placeholder="seu@email.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input id="login-password" name="password" type="password" placeholder="••••••••" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome</Label>
                    <Input id="signup-name" name="name" placeholder="Seu nome" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" name="email" type="email" placeholder="seu@email.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input id="signup-password" name="password" type="password" placeholder="••••••••" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Cadastrando..." : "Cadastrar"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Dados seguros com Supabase</p>
        </div>
      </div>
    </div>
  )
}
