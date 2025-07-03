"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { VideoPost } from "@/components/video-post"
import { AddVideoModal } from "@/components/add-video-modal"
import { Video, Plus, LogOut, Crown, Lock } from "lucide-react"
import { getVideos, createVideo, getUserName } from "@/lib/database"
import type { User, VideoData, VideoFormData } from "@/types"

interface DashboardProps {
  user: User
  onLogout: () => void
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [videos, setVideos] = useState<VideoData[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadVideos = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await getVideos()
      
      if (error) {
        setError(error)
        return
      }

      if (data) {
        // Transformar os dados para o formato esperado pelos componentes
        const formattedVideos = data.map((video) => ({
          id: video.id,
          userId: video.user_id,
          userName: getUserName(video.user_id, user),
          youtubeUrl: video.youtube_url,
          prompt: video.prompt,
          createdAt: video.created_at,
          comments: [], // Comentários serão carregados separadamente
        }))
        setVideos(formattedVideos)
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadVideos()
  }, [loadVideos])

  const addVideo = async (videoData: VideoFormData) => {
    try {
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
        // Adicionar o novo vídeo ao estado
        const newVideo: VideoData = {
          id: data.id,
          userId: data.user_id,
          userName: user.name || user.email.split('@')[0],
          youtubeUrl: data.youtube_url,
          prompt: data.prompt,
          createdAt: data.created_at,
          comments: [],
        }
        setVideos([newVideo, ...videos])
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      alert(`Erro ao adicionar vídeo: ${errorMessage}`)
    }
  }

  const updateVideoComments = (videoId: string, comments: VideoData['comments']) => {
    const updatedVideos = videos.map((video) => (video.id === videoId ? { ...video, comments } : video))
    setVideos(updatedVideos)
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
              <h1 className="text-xl font-bold text-gray-900">AI Video Community</h1>
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
              <VideoPost key={video.id} video={video} currentUser={user} onUpdateComments={updateVideoComments} />
            ))}
          </div>
        )}
      </main>

      <AddVideoModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={addVideo} />
    </div>
  )
}
