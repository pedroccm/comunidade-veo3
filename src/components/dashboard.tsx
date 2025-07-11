"use client"

import { AddVideoModal } from "@/components/add-video-modal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { YouTubeErrorSuppressor } from "@/components/youtube-error-suppressor"
import { createComment, createVideo, getCommentsByVideoId, getUserName, getVideos } from "@/lib/database"
import type { CommentData, User, VideoData, VideoFormData } from "@/types"
import { Calendar, Copy, Crown, Lock, LogOut, MessageCircle, Plus, Send, Video, X } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

interface DashboardProps {
  user: User
  onLogout: () => void
}

// Tipo para vídeos com informações enriquecidas
interface EnrichedVideoData extends VideoData {
  userName: string
}

// Mini player do YouTube direto - funcional
function VideoGridIframe({ url }: { url: string }) {
  const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  
  if (!videoId) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
        <Video className="h-12 w-12 text-purple-400" />
      </div>
    )
  }

  return (
    <iframe
      src={`https://www.youtube.com/embed/${videoId[1]}`}
      className="w-full h-full"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  )
}

// Componente para card de vídeo no grid
function VideoGridCard({ video, onClick }: { video: EnrichedVideoData; onClick: () => void }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

    return (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <div className="aspect-video relative overflow-hidden rounded-t-lg bg-gray-100">
        <VideoGridIframe url={video.youtubeUrl} />
        
        {/* Botão para abrir painel - só no canto, não interfere no player */}
        <div 
          className="absolute top-2 right-2 opacity-60 hover:opacity-100 transition-opacity duration-200"
          onClick={onClick}
        >
          <div className="bg-black bg-opacity-70 rounded-full p-2 cursor-pointer">
            <MessageCircle className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>
      
      <CardContent className="p-3 cursor-pointer" onClick={onClick}>
        <h3 className="font-medium text-sm line-clamp-2 mb-2 min-h-[2.5rem]">
          {video.prompt.length > 80 ? `${video.prompt.slice(0, 80)}...` : video.prompt}
        </h3>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="font-medium">{video.userName}</span>
          <span>{formatDate(video.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente do painel lateral
function VideoSidePanel({
  video,
  isOpen,
  onClose,
  currentUser
}: {
  video: EnrichedVideoData | null
  isOpen: boolean
  onClose: () => void
  currentUser: User
}) {
  const [comments, setComments] = useState<CommentData[]>([])
  const [newComment, setNewComment] = useState("")
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [addingComment, setAddingComment] = useState(false)

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    if (!videoId) return ""
    return `https://www.youtube-nocookie.com/embed/${videoId[1]}?rel=0&modestbranding=1&controls=1&autoplay=1`
  }

  const loadComments = useCallback(async () => {
    if (!video) return

    setCommentsLoading(true)
    try {
      const { data, error } = await getCommentsByVideoId(video.id)

      if (error) {
        console.error('❌ Erro ao carregar comentários:', error)
        return
      }

      if (data) {
        // Buscar nomes dos usuários
        const userNames = new Map<string, string>()
        const uniqueUserIds = [...new Set(data.map(comment => comment.user_id))]

        await Promise.all(
          uniqueUserIds.map(async (userId) => {
            try {
              const userName = await getUserName(userId, currentUser)
              userNames.set(userId, userName)
            } catch {
              userNames.set(userId, `Usuário ${userId.slice(-4)}`)
            }
          })
        )

        // Organizar comentários
        const commentMap = new Map<string, CommentData>()
        const rootComments: CommentData[] = []

        data.forEach((comment) => {
          const formattedComment: CommentData = {
            id: comment.id,
            text: comment.text,
            userId: comment.user_id,
            userName: userNames.get(comment.user_id) || `Usuário ${comment.user_id.slice(-4)}`,
            createdAt: comment.created_at,
            parentId: comment.parent_id,
            replies: [],
          }
          commentMap.set(comment.id, formattedComment)
        })

        commentMap.forEach((comment) => {
          if (comment.parentId) {
            const parent = commentMap.get(comment.parentId)
            if (parent) {
              parent.replies.push(comment)
            }
          } else {
            rootComments.push(comment)
          }
        })

        setComments(rootComments)
      } else {
        setComments([])
      }
    } catch (error) {
      console.error('❌ Erro ao carregar comentários:', error)
    } finally {
      setCommentsLoading(false)
    }
  }, [video, currentUser])

  useEffect(() => {
    if (video && isOpen) {
      loadComments()
    }
  }, [video, isOpen, loadComments])

  const addComment = async () => {
    if (!newComment.trim() || !video) return

    setAddingComment(true)
    try {
      const { data, error } = await createComment({
        video_id: video.id,
        user_id: currentUser.id,
        text: newComment,
      })

      if (error) {
        alert(`Erro ao adicionar comentário: ${error}`)
        return
      }

      if (data) {
        const newCommentObj: CommentData = {
          id: data.id,
          text: data.text,
          userId: data.user_id,
          userName: currentUser.name || currentUser.email?.split('@')[0] || 'Você',
          createdAt: data.created_at,
          parentId: null,
          replies: [],
        }

        setComments([...comments, newCommentObj])
        setNewComment("")
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`Erro ao adicionar comentário: ${errorMessage}`)
    } finally {
      setAddingComment(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!isOpen || !video) return null

  const embedUrl = getYouTubeEmbedUrl(video.youtubeUrl)

  return (
    <>
      {/* Overlay para mobile */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 lg:hidden ${isOpen ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      />

      {/* Painel lateral */}
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-2xl transform transition-transform duration-300 z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'
          } w-full lg:w-1/2 xl:w-2/5`}
      >
        <div className="flex flex-col h-full">
          {/* Header do painel */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Detalhes do Vídeo</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Conteúdo scrollável */}
          <div className="flex-1 overflow-y-auto">
            {/* Vídeo */}
            {embedUrl && (
              <div className="aspect-video">
                <iframe
                  src={embedUrl}
                  title="YouTube video"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

                        {/* Informações do vídeo */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">{video.userName}</span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {formatDate(video.createdAt)}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">📝 Prompt usado:</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(video.prompt)
                        .then(() => {
                          // Feedback visual opcional - você pode adicionar um toast aqui
                          const button = document.activeElement as HTMLElement
                          const originalText = button.textContent
                          button.textContent = "Copiado!"
                          setTimeout(() => {
                            button.textContent = originalText
                          }, 1000)
                        })
                        .catch(() => {
                          alert('Erro ao copiar prompt')
                        })
                    }}
                    className="text-xs h-auto p-1"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar
                  </Button>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">{video.prompt}</p>
              </div>
            </div>

            {/* Seção de comentários */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">
                  Comentários ({comments.length})
                </h3>
              </div>

              {/* Adicionar comentário */}
              <div className="space-y-3 mb-6">
                <Textarea
                  placeholder="Adicione um comentário..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <Button
                  onClick={addComment}
                  disabled={!newComment.trim() || addingComment}
                  size="sm"
                  className="w-full"
                >
                  {addingComment ? (
                    <>Postando...</>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Comentar
                    </>
                  )}
                </Button>
              </div>

              {/* Lista de comentários */}
              {commentsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Carregando comentários...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum comentário ainda</p>
                  <p className="text-sm text-gray-400">Seja o primeiro a comentar!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {comment.userName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800">{comment.text}</p>

                      {/* Respostas */}
                      {comment.replies.length > 0 && (
                        <div className="mt-3 ml-4 space-y-2">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="bg-white rounded-md p-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-600">
                                  {reply.userName}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatDate(reply.createdAt)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-700">{reply.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [videos, setVideos] = useState<EnrichedVideoData[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<EnrichedVideoData | null>(null)
  const [showSidePanel, setShowSidePanel] = useState(false)

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
      // Verificar se usuário é assinante
      if (!user.assinante) {
        alert('Apenas assinantes podem adicionar vídeos. Assine para ter acesso completo!')
        return
      }

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

  const handleVideoClick = (video: EnrichedVideoData) => {
    setSelectedVideo(video)
    setShowSidePanel(true)
  }

  const handleCloseSidePanel = () => {
    setShowSidePanel(false)
    // Aguardar o fim da animação antes de limpar o vídeo selecionado
    setTimeout(() => {
      setSelectedVideo(null)
    }, 300)
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
      <YouTubeErrorSuppressor />

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
                <span className="text-sm text-gray-600 hidden sm:inline">Olá, {user.name}</span>
                {user.assinante ? (
                  <Badge variant="default" className="bg-purple-100 text-purple-800">
                    <Crown className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Assinante</span>
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Lock className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Gratuito</span>
                  </Badge>
                )}
              </div>

              {user.assinante && (
                <Button variant="outline" size="sm" onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Adicionar Vídeo</span>
                </Button>
              )}

              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${showSidePanel ? 'lg:mr-[40%] xl:mr-[40%]' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {!user.assinante && (
            <Card className="mb-6 border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-purple-800 flex items-center gap-2 text-lg">
                  <Lock className="h-5 w-5" />
                  🚀 Desbloqueie Acesso Total
                </CardTitle>
                <CardDescription className="text-purple-700 space-y-3">
                  <p>Você está visualizando apenas 3 vídeos de exemplo. Tenha acesso a mais de 50+ vídeos com IA e atualizações diárias por apenas R$ 39,90/mês!</p>
                  <div className="pt-2">
                    <a
                      href="https://pay.hotmart.com/M100644599Q?bid=1751886666553"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      🎯 Assinar Agora - R$ 39,90/mês
                    </a>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {displayVideos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Video className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {user.assinante ? "Nenhum vídeo ainda" : "Vídeos exclusivos para assinantes"}
                </h3>
                <p className="text-gray-500 text-center mb-4">
                  {user.assinante
                    ? "Seja o primeiro a compartilhar um vídeo criado com IA!"
                    : "Assine para ver e adicionar vídeos incríveis criados com IA!"
                  }
                </p>
                {user.assinante && (
                  <Button onClick={() => setShowAddModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Vídeo
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayVideos.map((video) => (
                <VideoGridCard
                  key={video.id}
                  video={video}
                  onClick={() => handleVideoClick(video)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Painel lateral */}
      <VideoSidePanel
        video={selectedVideo}
        isOpen={showSidePanel}
        onClose={handleCloseSidePanel}
        currentUser={user}
      />

      <AddVideoModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={addVideo} />
    </div>
  )
}
