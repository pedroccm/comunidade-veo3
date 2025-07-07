"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { createComment, getCommentsByVideoId, getUserName } from "@/lib/database"
import type { CommentData, User, VideoData } from "@/types"
import { Calendar, Loader2, MessageCircle, Reply, Send } from "lucide-react"
import { useEffect, useState } from "react"

interface VideoPostProps {
  video: VideoData
  currentUser: User
}

export function VideoPost({ video, currentUser }: VideoPostProps) {
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [comments, setComments] = useState<CommentData[]>([])
  const [commentsLoading, setCommentsLoading] = useState(true) // Inicia como true para carregar automaticamente
  const [commentsLoaded, setCommentsLoaded] = useState(false)
  const [addingComment, setAddingComment] = useState(false)

  // Carregar comentários automaticamente quando o componente monta
  useEffect(() => {
    loadComments()
  }, [video.id]) // Recarregar se o vídeo mudar

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    if (!videoId) return ""

    // Parâmetros para reduzir tracking e analytics do YouTube
    const params = new URLSearchParams({
      rel: '0',           // Não mostrar vídeos relacionados
      modestbranding: '1', // Remover logo do YouTube
      enablejsapi: '0',   // Desabilitar JavaScript API
      fs: '1',            // Permitir fullscreen
      iv_load_policy: '3', // Desabilitar anotações
      disablekb: '0',     // Manter controles de teclado
      controls: '1',      // Mostrar controles
      showinfo: '0',      // Não mostrar info do vídeo
      origin: typeof window !== 'undefined' ? window.location.origin : 'localhost'
    })

    // Usar domínio privacy-enhanced para reduzir tracking
    return `https://www.youtube-nocookie.com/embed/${videoId[1]}?${params.toString()}`
  }

  const loadComments = async () => {
    if (commentsLoaded) return

    setCommentsLoading(true)
    try {
      console.log('📝 Carregando comentários do vídeo:', video.id)
      const { data, error } = await getCommentsByVideoId(video.id)

      if (error) {
        console.error('❌ Erro ao carregar comentários:', error)
        return
      }

      if (data) {
        console.log(`📊 ${data.length} comentários encontrados, buscando nomes dos autores...`)

        // Primeiro, buscar todos os nomes dos usuários
        const userNames = new Map<string, string>()

        // Buscar nomes únicos para evitar consultas duplicadas
        const uniqueUserIds = [...new Set(data.map(comment => comment.user_id))]

        await Promise.all(
          uniqueUserIds.map(async (userId) => {
            try {
              const userName = await getUserName(userId, currentUser)
              userNames.set(userId, userName)
              console.log(`👤 Comentário autor ${userId} = ${userName}`)
            } catch (error) {
              console.error(`❌ Erro ao buscar nome do usuário ${userId}:`, error)
              userNames.set(userId, `Usuário ${userId.slice(-4)}`)
            }
          })
        )

        // Organizar comentários hierárquicamente
        const commentMap = new Map<string, CommentData>()
        const rootComments: CommentData[] = []

        // Criar todos os comentários com nomes já resolvidos
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

        // Depois, organizar em hierarquia
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

        console.log('✅ Comentários processados com sucesso')
        setComments(rootComments)
        setCommentsLoaded(true)
      } else {
        console.log('📭 Nenhum comentário encontrado')
        setComments([])
        setCommentsLoaded(true)
      }
    } catch (error) {
      console.error('❌ Erro geral ao carregar comentários:', error)
    } finally {
      setCommentsLoading(false)
    }
  }

  const addComment = async () => {
    if (!newComment.trim()) return

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

  const addReply = async (commentId: string) => {
    if (!replyText.trim()) return

    setAddingComment(true)
    try {
      const { data, error } = await createComment({
        video_id: video.id,
        user_id: currentUser.id,
        text: replyText,
        parent_id: commentId,
      })

      if (error) {
        alert(`Erro ao adicionar resposta: ${error}`)
        return
      }

      if (data) {
        const newReply: CommentData = {
          id: data.id,
          text: data.text,
          userId: data.user_id,
          userName: currentUser.name || currentUser.email?.split('@')[0] || 'Você',
          createdAt: data.created_at,
          parentId: commentId,
          replies: [],
        }

        const updatedComments = comments.map((comment) =>
          comment.id === commentId ? { ...comment, replies: [...comment.replies, newReply] } : comment,
        )

        setComments(updatedComments)
        setReplyText("")
        setReplyTo(null)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`Erro ao adicionar resposta: ${errorMessage}`)
    } finally {
      setAddingComment(false)
    }
  }

  const handleShowComments = () => {
    setShowComments(!showComments)
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

  const embedUrl = getYouTubeEmbedUrl(video.youtubeUrl)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">{video.userName}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <Calendar className="h-4 w-4" />
              {formatDate(video.createdAt)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* YouTube Video */}
        {embedUrl && (
          <div className="aspect-video rounded-lg overflow-hidden">
            <iframe
              src={embedUrl}
              title="YouTube video"
              className="w-full h-full"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              sandbox="allow-scripts allow-same-origin allow-presentation allow-fullscreen"
            />
          </div>
        )}

        {/* Prompt */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Prompt usado:</h4>
          <p className="text-gray-700 whitespace-pre-wrap">{video.prompt}</p>
        </div>

        {/* Comments Section */}
        <div className="border-t pt-4">
          <Button variant="ghost" size="sm" onClick={handleShowComments} className="mb-4">
            <MessageCircle className="h-4 w-4 mr-2" />
            {commentsLoading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Carregando...
              </>
            ) : (
              `${comments.length} comentários`
            )}
          </Button>

          {showComments && (
            <div className="space-y-4">
              {/* Add Comment */}
              <div className="flex gap-3">
                <Textarea
                  placeholder="Adicione um comentário..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1"
                  rows={2}
                  disabled={addingComment}
                />
                <Button onClick={addComment} size="sm" disabled={addingComment}>
                  {addingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>

              {/* Loading Comments */}
              {commentsLoading && (
                <div className="text-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Carregando comentários...</p>
                </div>
              )}

              {/* Comments List */}
              {!commentsLoading && (
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Nenhum comentário ainda. Seja o primeiro!</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="space-y-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{comment.userName}</span>
                            <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                          </div>
                          <p className="text-gray-700 text-sm">{comment.text}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyTo(comment.id)}
                            className="mt-2 h-6 px-2 text-xs"
                            disabled={addingComment}
                          >
                            <Reply className="h-3 w-3 mr-1" />
                            Responder
                          </Button>
                        </div>

                        {/* Replies */}
                        {comment.replies.length > 0 && (
                          <div className="ml-6 space-y-2">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="bg-gray-100 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-sm">{reply.userName}</span>
                                  <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                                </div>
                                <p className="text-gray-700 text-sm">{reply.text}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply Form */}
                        {replyTo === comment.id && (
                          <div className="ml-6 flex gap-2">
                            <Textarea
                              placeholder="Escreva uma resposta..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="flex-1"
                              rows={2}
                              disabled={addingComment}
                            />
                            <div className="flex flex-col gap-1">
                              <Button onClick={() => addReply(comment.id)} size="sm" disabled={addingComment}>
                                {addingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)} disabled={addingComment}>
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
