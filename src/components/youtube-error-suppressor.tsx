"use client"

import { useEffect } from 'react'

export function YouTubeErrorSuppressor() {
    useEffect(() => {
        // Somente em desenvolvimento
        if (process.env.NODE_ENV !== 'development') return

        // Interceptar erros do console específicos do YouTube
        const originalError = console.error
        const originalWarn = console.warn

        console.error = (...args) => {
            const message = args.join(' ')

            // Suprimir erros específicos do YouTube embed player
            if (
                message.includes('youtube.com/youtubei/v1/log_event') ||
                message.includes('ERR_BLOCKED_BY_CLIENT') ||
                message.includes('www-embed-player.js') ||
                message.includes('youtube-nocookie.com') ||
                message.includes('Failed to load resource') && message.includes('youtube')
            ) {
                return // Não mostrar esses erros
            }

            // Mostrar outros erros normalmente
            originalError(...args)
        }

        console.warn = (...args) => {
            const message = args.join(' ')

            // Suprimir warnings específicos do YouTube
            if (
                message.includes('youtube') ||
                message.includes('embed-player') ||
                message.includes('log_event')
            ) {
                return // Não mostrar esses warnings
            }

            // Mostrar outros warnings normalmente
            originalWarn(...args)
        }

        // Cleanup ao desmontar componente
        return () => {
            console.error = originalError
            console.warn = originalWarn
        }
    }, [])

    // Componente invisível
    return null
}

export default YouTubeErrorSuppressor 