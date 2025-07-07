"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { translateAuthError } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { CheckCircle, Eye, EyeOff, Sparkles, Video } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

function ResetPasswordContent() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [validToken, setValidToken] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        // Verificar se há um access_token nos parâmetros da URL
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')

        if (accessToken && refreshToken) {
            // Configurar a sessão com os tokens recebidos
            supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
            }).then(({ error }) => {
                if (error) {
                    console.error('Erro ao configurar sessão:', error)
                    setError('Link de recuperação inválido ou expirado')
                } else {
                    setValidToken(true)
                }
            })
        } else {
            setError('Link de recuperação inválido. Solicite um novo link.')
        }
    }, [searchParams])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setError('As senhas não coincidem')
            return
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) {
                console.error('Erro ao atualizar senha:', error)
                setError(translateAuthError(error.message))
            } else {
                setSuccess(true)
                // Redirecionar para login após 3 segundos
                setTimeout(() => {
                    router.push('/login')
                }, 3000)
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Erro inesperado'
            setError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Senha alterada com sucesso!
                            </h3>
                            <p className="text-gray-500 text-center mb-4">
                                Sua senha foi atualizada. Você será redirecionado para o login em breve.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
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
                    <p className="text-gray-600 mt-2">Redefinir sua senha</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Nova Senha</CardTitle>
                        <CardDescription>
                            Digite sua nova senha abaixo
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        {validToken ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Nova Senha</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Digite sua nova senha"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Confirme sua nova senha"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? "Salvando..." : "Redefinir Senha"}
                                </Button>
                            </form>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Verificando link de recuperação...</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    )
} 