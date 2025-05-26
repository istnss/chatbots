"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { getAudioManager } from "@/lib/audioManager"

interface UseOpenAISpeechProps {
  voice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer"
  onPlaybackStart?: () => void
  onPlaybackEnd?: () => void
  onError?: (error: string) => void
}

export function useOpenAISpeech({
  voice = "nova",
  onPlaybackStart,
  onPlaybackEnd,
  onError,
}: UseOpenAISpeechProps = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentText, setCurrentText] = useState<string | null>(null)

  // Track if component is mounted
  const isMountedRef = useRef(true)

  // Track the current operation to prevent overlapping operations
  const operationInProgressRef = useRef(false)

  // Track if an abort was intentional
  const intentionalAbortRef = useRef(false)

  // Track retry attempts
  const retryCountRef = useRef(0)
  const MAX_RETRIES = 2

  // Debug logging
  const debugLog = (message: string) => {
    console.log(`[Speech Debug] ${message}`)
  }

  // Initialize and sync with audio manager
  useEffect(() => {
    debugLog("Component mounted")
    isMountedRef.current = true
    intentionalAbortRef.current = false
    retryCountRef.current = 0

    const audioManager = getAudioManager()
    if (!audioManager) return

    // Sync initial state with audio manager
    const managerState = audioManager.getState()
    setIsPlaying(managerState.isPlaying)
    setIsPaused(managerState.isPaused)
    setCurrentText(managerState.currentText)

    // Set up callbacks
    audioManager.setCallbacks({
      onPlay: () => {
        if (!isMountedRef.current) return
        setIsPlaying(true)
        setIsPaused(false)
        onPlaybackStart?.()
      },
      onPause: () => {
        if (!isMountedRef.current) return
        setIsPlaying(true)
        setIsPaused(true)
      },
      onEnd: () => {
        if (!isMountedRef.current) return
        setIsPlaying(false)
        setIsPaused(false)
        setCurrentText(null)
        onPlaybackEnd?.()
        operationInProgressRef.current = false
      },
      onError: (errorMsg) => {
        if (!isMountedRef.current) return
        setError(errorMsg)
        setIsPlaying(false)
        setIsPaused(false)
        setIsLoading(false)
        onError?.(errorMsg)
        operationInProgressRef.current = false
      },
    })

    // Cleanup
    return () => {
      debugLog("Component unmounting - cleaning up resources")
      isMountedRef.current = false

      // Mark any abort as intentional when unmounting
      intentionalAbortRef.current = true

      // Important: We don't stop audio playback on unmount anymore
      // This allows audio to continue playing even when the component unmounts
    }
  }, [onPlaybackStart, onPlaybackEnd, onError])

  // Function to stop speaking
  const stop = useCallback(() => {
    debugLog("Stop function called")

    // Mark any abort as intentional
    intentionalAbortRef.current = true

    // Stop audio playback using the manager
    const audioManager = getAudioManager()
    if (audioManager) {
      audioManager.stop()
    }

    // Reset states
    setIsPlaying(false)
    setIsPaused(false)
    setIsLoading(false)
    setCurrentText(null)

    // Reset operation flag
    operationInProgressRef.current = false

    // Reset retry counter
    retryCountRef.current = 0

    // Reset intentional abort flag after a short delay
    setTimeout(() => {
      intentionalAbortRef.current = false
    }, 100)
  }, [])

  // Function to speak text
  const speak = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        debugLog("Empty text provided, not speaking")
        return
      }

      // Prevent multiple simultaneous operations
      if (operationInProgressRef.current) {
        debugLog("Operation already in progress, stopping previous operation")
        stop()
        // Small delay to ensure cleanup is complete
        await new Promise((resolve) => setTimeout(resolve, 300))
      }

      // Reset intentional abort flag
      intentionalAbortRef.current = false

      // Set operation flag
      operationInProgressRef.current = true

      try {
        debugLog(`Starting speech generation for text: ${text.substring(0, 30)}...`)
        setError(null)
        setIsLoading(true)
        setCurrentText(text)

        // Use a simpler approach with direct fetch instead of XMLHttpRequest
        debugLog(`Requesting TTS for text (${text.length} chars) with voice: ${voice}`)

        // Create a simple fetch request with a timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

        try {
          const response = await fetch("/api/text-to-speech", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text, voice }),
            signal: controller.signal,
          })

          clearTimeout(timeoutId)

          // Check if component is still mounted
          if (!isMountedRef.current) {
            debugLog("Component unmounted during request, stopping processing")
            return
          }

          // Handle HTTP errors
          if (!response.ok) {
            let errorDetails = `HTTP error ${response.status}: ${response.statusText}`

            // Try to get more detailed error information
            try {
              const errorData = await response.json()
              if (errorData && errorData.error) {
                errorDetails = `${errorDetails} - ${errorData.error}`
                if (errorData.details) {
                  errorDetails += ` (${errorData.details})`
                }
              }
            } catch (e) {
              // If we can't parse the error response, just use the status
              debugLog(`Could not parse error response: ${e}`)
            }

            throw new Error(errorDetails)
          }

          // Get the audio data as a blob
          const audioBlob = await response.blob()

          // Check if component is still mounted
          if (!isMountedRef.current) {
            debugLog("Component unmounted during blob processing, stopping")
            return
          }

          // Verify blob size and type
          if (audioBlob.size === 0) {
            throw new Error("Received empty audio data")
          }

          debugLog(`Received audio blob: ${audioBlob.size} bytes, type: ${audioBlob.type}`)

          // Verify blob type is audio
          if (!audioBlob.type.startsWith("audio/")) {
            debugLog(`Warning: Unexpected blob MIME type: ${audioBlob.type}`)
          }

          // Use the audio manager to play the audio
          const audioManager = getAudioManager()
          if (!audioManager) {
            throw new Error("Audio manager not available")
          }

          // Reset retry counter on success
          retryCountRef.current = 0

          // Play the audio using the manager
          await audioManager.playAudio(audioBlob, text)
        } catch (fetchError) {
          // Check if this was an intentional abort
          if (intentionalAbortRef.current) {
            debugLog("Request was intentionally aborted, not treating as error")
            return
          }

          // Check if it's an abort error
          if (fetchError.name === "AbortError") {
            throw new Error("Request timed out")
          }

          // For server errors (5xx), try to retry
          if (fetchError.message && fetchError.message.includes("HTTP error 5")) {
            if (retryCountRef.current < MAX_RETRIES) {
              retryCountRef.current++
              debugLog(`Server error, retrying (attempt ${retryCountRef.current} of ${MAX_RETRIES})...`)

              // Wait a bit before retrying
              await new Promise((resolve) => setTimeout(resolve, 1000))

              // Try again with the same text
              operationInProgressRef.current = false
              await speak(text)
              return
            } else {
              debugLog(`Max retries (${MAX_RETRIES}) reached, giving up`)
              throw new Error(`Server error after ${MAX_RETRIES} retries: ${fetchError.message}`)
            }
          }

          throw fetchError
        }
      } catch (err) {
        // Only set error if component is still mounted and it wasn't an intentional abort
        if (isMountedRef.current && !intentionalAbortRef.current) {
          const errorMsg = `Error generating speech: ${(err as Error).message}`
          console.error(errorMsg)
          setError(errorMsg)
          setCurrentText(null)
          onError?.(errorMsg)
        } else {
          debugLog(`Error occurred but not reporting: ${(err as Error).message}`)
        }
      } finally {
        // Only clear loading state if component is still mounted
        if (isMountedRef.current) {
          setIsLoading(false)

          // Reset operation flag if this wasn't an intentional abort
          if (!intentionalAbortRef.current) {
            operationInProgressRef.current = false
          }
        }
      }
    },
    [voice, onError, stop],
  )

  // Function to pause speaking
  const pause = useCallback(() => {
    if (!isPlaying || isPaused) return

    debugLog("Pausing audio")
    const audioManager = getAudioManager()
    if (audioManager) {
      audioManager.pause()
    }
  }, [isPlaying, isPaused])

  // Function to resume speaking
  const resume = useCallback(() => {
    if (!isPlaying || !isPaused) return

    debugLog("Resuming audio")
    const audioManager = getAudioManager()
    if (audioManager) {
      audioManager.resume()
    }
  }, [isPlaying, isPaused])

  return {
    speak,
    stop,
    pause,
    resume,
    isLoading,
    isPlaying,
    isPaused,
    currentText,
    error,
  }
}
