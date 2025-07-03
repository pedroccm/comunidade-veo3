"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface AddVideoModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (videoData: any) => void
}

export function AddVideoModal({ isOpen, onClose, onAdd }: AddVideoModalProps) {
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validar URL do YouTube
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    if (!youtubeRegex.test(youtubeUrl)) {
      alert("Por favor, insira uma URL válida do YouTube")
      setIsLoading(false)
      return
    }

    if (!prompt.trim()) {
      alert("Por favor, insira o prompt usado")
      setIsLoading(false)
      return
    }

    // Simular delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    onAdd({
      youtubeUrl,
      prompt: prompt.trim(),
    })

    // Reset form
    setYoutubeUrl("")
    setPrompt("")
    setIsLoading(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Vídeo</DialogTitle>
          <DialogDescription>Compartilhe seu vídeo criado com IA e o prompt usado para criá-lo.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="youtube-url">URL do YouTube</Label>
            <Input
              id="youtube-url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500">Cole o link completo do seu vídeo no YouTube</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt Usado</Label>
            <Textarea
              id="prompt"
              placeholder="Descreva o prompt que você usou para criar este vídeo..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              required
            />
            <p className="text-xs text-gray-500">Compartilhe os detalhes do prompt para ajudar outros criadores</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adicionando..." : "Adicionar Vídeo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
