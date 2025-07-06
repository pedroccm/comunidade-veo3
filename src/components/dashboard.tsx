"use client"

import { AddVideoModal } from "@/components/add-video-modal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VideoPost } from "@/components/video-post"
import { createVideo, getUserName, getVideos } from "@/lib/database"
import type { User, VideoData, VideoFormData } from "@/types"
import { Crown, Lock, LogOut, Plus, Video } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

interface DashboardProps {
  user: User
  onLogout: () => void
}

// Tipo para vídeos com informações enriquecidas
interface EnrichedVideoData extends VideoData {
  userName: string
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [videos, setVideos] = useState<EnrichedVideoData[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadVideos = useCallback(async () => {
    try {
      setLoading(true)
      console.log('📹 Carregando vídeos...')

      const { data, error } = await getVideos()

      if (error) {
        console.error('❌ Erro ao carregar vídeos:', error)
        setError(error)
        return
      }

      if (data && data.length > 0) {
        console.log(`📊 ${data.length} vídeos encontrados, buscando nomes dos autores...`)

        // Transformar os dados e buscar nomes dos usuários
        const enrichedVideos = await Promise.all(data.map(async (video): Promise<EnrichedVideoData> => {
          try {
            const userName = await getUserName(video.user_id, user)
            console.log(`👤 Vídeo ${video.id}: autor ${video.user_id} = ${userName}`)

            return {
              id: video.id,
              userId: video.user_id,
              userName: userName,
              youtubeUrl: video.youtube_url,
              prompt: video.prompt,
              createdAt: video.created_at,
              comments: [], // Comentários serão carregados separadamente
            }
          } catch (error) {
            console.error(`❌ Erro ao buscar nome para usuário ${video.user_id}:`, error)
            return {
              id: video.id,
              userId: video.user_id,
              userName: `Usuário ${video.user_id.slice(-4)}`, // Fallback mais específico
              youtubeUrl: video.youtube_url,
              prompt: video.prompt,
              createdAt: video.created_at,
              comments: [],
            }
          }
        }))

        console.log('✅ Vídeos processados com sucesso')
        setVideos(enrichedVideos)
      } else {
        console.log('📭 Nenhum vídeo encontrado')
        setVideos([])
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      console.error('❌ Erro geral ao carregar vídeos:', errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadVideos()
  }, [loadVideos, user])

  // Effect para atualizar nomes dos vídeos quando o usuário é enriquecido
  useEffect(() => {
    if (videos.length > 0 && user) {
      // Atualizar nome nos vídeos do usuário atual se necessário
      const needsUpdate = videos.some(video =>
        video.userId === user.id &&
        video.userName !== user.name &&
        user.name !== user.email?.split('@')[0] // Só atualizar se o nome realmente mudou
      )

      if (needsUpdate) {
        console.log('🔄 Atualizando nomes dos vídeos do usuário atual...')
        setVideos(prev => prev.map(video =>
          video.userId === user.id
            ? { ...video, userName: user.name || user.email?.split('@')[0] || 'Você' }
            : video
        ))
      }
    }
  }, [user, videos])

  const addVideo = async (videoData: VideoFormData) => {
    try {
      console.log('➕ Adicionando novo vídeo...')

      const { data, error } = await createVideo({
        youtube_url: videoData.youtubeUrl,
        prompt: videoData.prompt,
        user_id: user.id,
      })

      if (error) {
        alert(`Erro ao adicionar vídeo: ${error}`)
        return
      }

      if (data) {
        console.log('✅ Vídeo criado:', data.id)

        // Adicionar o novo vídeo ao estado com nome do usuário atual
        const newVideo: EnrichedVideoData = {
          id: data.id,
          userId: data.user_id,
          userName: user.name || user.email?.split('@')[0] || 'Você',
          youtubeUrl: data.youtube_url,
          prompt: data.prompt,
          createdAt: data.created_at,
          comments: [],
        }

        setVideos(prev => [newVideo, ...prev])
        setShowAddModal(false)
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      console.error('❌ Erro ao adicionar vídeo:', errorMessage)
      alert(`Erro ao adicionar vídeo: ${errorMessage}`)
    }
  }

  // Limitar vídeos para não-assinantes
  const displayVideos = user.assinante ? videos : videos.slice(0, 3)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando vídeos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar vídeos: {error}</p>
          <Button onClick={loadVideos}>Tentar Novamente</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Video className="h-8 w-8 text-purple-600" />
              <h1 className="text-xl font-bold text-gray-900">Criadores de Vídeos</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Olá, {user.name}</span>
                {user.assinante ? (
                  <Badge variant="default" className="bg-purple-100 text-purple-800">
                    <Crown className="h-3 w-3 mr-1" />
                    Assinante
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Lock className="h-3 w-3 mr-1" />
                    Gratuito
                  </Badge>
                )}
              </div>

              <Button variant="outline" size="sm" onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Vídeo
              </Button>

              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user.assinante && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-800 flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Acesso Limitado
              </CardTitle>
              <CardDescription className="text-amber-700">
                Você está visualizando apenas 3 vídeos de exemplo. Para acessar toda a comunidade, entre em contato para
                se tornar assinante.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {displayVideos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Video className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum vídeo ainda</h3>
              <p className="text-gray-500 text-center mb-4">Seja o primeiro a compartilhar um vídeo criado com IA!</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Vídeo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {displayVideos.map((video) => (
              <VideoPost key={video.id} video={video} currentUser={user} />
            ))}
          </div>
        )}
      </main>

      <AddVideoModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={addVideo} />
    </div>
  )
}
