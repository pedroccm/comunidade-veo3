"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { resetPassword, signIn, signUp } from "@/lib/auth"
import type { User } from "@/types"
import { ArrowLeft, Eye, EyeOff, Mail, Sparkles, Video } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface AuthFormProps {
  onLogin: (user: User) => void
}

export function AuthForm({ onLogin }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showResetForm, setShowResetForm] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, isLogin: boolean) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string
    const phone = formData.get("phone") as string

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
          // Redirecionar para o dashboard
          router.push('/dashboard')
        }
      } else {
        // Cadastro com Supabase
        const { user, error, needsConfirmation } = await signUp(email, password, name, phone)

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
            // Redirecionar para o dashboard
            router.push('/dashboard')
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

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error, success } = await resetPassword(resetEmail)

      if (error) {
        setError(error)
      } else if (success) {
        setSuccess("Email de recuperação enviado! Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.")
        setResetEmail("")
        // Voltar para tela de login após 3 segundos
        setTimeout(() => {
          setShowResetForm(false)
          setSuccess(null)
        }, 3000)
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const goBackToLogin = () => {
    setShowResetForm(false)
    setError(null)
    setSuccess(null)
    setResetEmail("")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Video className="h-8 w-8 text-purple-600" />
            <Sparkles className="h-6 w-6 text-indigo-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Criadores de Vídeos</h1>
          <p className="text-gray-600 mt-2">Comunidade para criadores de vídeos com IA</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {showResetForm ? "Recuperar Senha" : "Bem-vindo"}
            </CardTitle>
            <CardDescription>
              {showResetForm
                ? "Digite seu email para receber instruções de recuperação"
                : "Entre na sua conta ou crie uma nova para acessar a comunidade"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            {showResetForm ? (
              <div className="space-y-4">
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Enviar Link de Recuperação
                      </>
                    )}
                  </Button>
                </form>

                <Button
                  variant="ghost"
                  onClick={goBackToLogin}
                  className="w-full"
                  disabled={isLoading}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Login
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                  <TabsTrigger value="signup">Cadastrar</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input id="login-email" name="email" type="email" placeholder="seu@email.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Senha</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          name="password"
                          type={showLoginPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        >
                          {showLoginPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="link"
                        className="text-sm h-auto p-0"
                        onClick={() => setShowResetForm(true)}
                      >
                        Esqueci minha senha
                      </Button>
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
                      <Label htmlFor="signup-phone">Telefone</Label>
                      <Input id="signup-phone" name="phone" type="tel" placeholder="(11) 99999-9999" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input id="signup-email" name="email" type="email" placeholder="seu@email.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Senha</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          name="password"
                          type={showSignupPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        >
                          {showSignupPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Cadastrando..." : "Cadastrar"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
