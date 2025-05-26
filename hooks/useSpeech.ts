"use client"

import { useState, useCallback, useEffect, useRef } from "react"

interface UseSpeechProps {
  voice?: string
  rate?: number
  pitch?: number
  volume?: number
}

export function useSpeech({ voice = "", rate = 1, pitch = 1, volume = 1 }: UseSpeechProps = {}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [error, setError] = useState<string | null>(null)
  const [hasSupport, setHasSupport] = useState(false)

  // Use refs to track the current utterance
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window === "undefined") return

    if (window.speechSynthesis) {
      setHasSupport(true)

      // Load available voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices()
        setAvailableVoices(voices)
      }

      // Chrome loads voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices
      }

      loadVoices()
    } else {
      setHasSupport(false)
      setError("Speech synthesis is not supported in this browser")
    }

    // Cleanup function
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Function to speak text
  const speak = useCallback(
    (text: string) => {
      if (!hasSupport) {
        setError("Speech synthesis not supported")
        return
      }

      try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel()

        // Create a new utterance
        const utterance = new SpeechSynthesisUtterance(text)

        // Set properties
        utterance.rate = rate
        utterance.pitch = pitch
        utterance.volume = volume

        // Set voice if specified and available
        if (voice && availableVoices.length > 0) {
          const selectedVoice = availableVoices.find((v) => v.name === voice || v.voiceURI === voice)
          if (selectedVoice) {
            utterance.voice = selectedVoice
          }
        }

        // Set event handlers
        utterance.onstart = () => {
          setIsPlaying(true)
          setIsPaused(false)
        }

        utterance.onend = () => {
          setIsPlaying(false)
          setIsPaused(false)
          utteranceRef.current = null
        }

        utterance.onerror = (event) => {
          console.error("Speech synthesis error:", event)
          setError(`Speech synthesis error: ${event.error}`)
          setIsPlaying(false)
          utteranceRef.current = null
        }

        // Store the utterance in ref for later control
        utteranceRef.current = utterance

        // Start speaking
        window.speechSynthesis.speak(utterance)
      } catch (e) {
        console.error("Error in speak function:", e)
        setError(`Failed to speak: ${e}`)
      }
    },
    [hasSupport, rate, pitch, volume, voice, availableVoices],
  )

  // Function to stop speaking
  const stop = useCallback(() => {
    if (!hasSupport) return

    window.speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
    utteranceRef.current = null
  }, [hasSupport])

  // Function to pause speaking
  const pause = useCallback(() => {
    if (!hasSupport || !isPlaying || !utteranceRef.current) return

    window.speechSynthesis.pause()
    setIsPaused(true)
  }, [hasSupport, isPlaying])

  // Function to resume speaking
  const resume = useCallback(() => {
    if (!hasSupport || !isPaused || !utteranceRef.current) return

    window.speechSynthesis.resume()
    setIsPaused(false)
  }, [hasSupport, isPaused])

  return {
    speak,
    stop,
    pause,
    resume,
    isPlaying,
    isPaused,
    availableVoices,
    hasSupport,
    error,
  }
}
