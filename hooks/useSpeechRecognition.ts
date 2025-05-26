"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface SpeechRecognitionHook {
  isListening: boolean
  transcript: string
  startListening: () => void
  stopListening: () => void
  hasSupport: boolean
  error: string | null
  finalTranscript: string // Add this line
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [hasSupport, setHasSupport] = useState(false)
  const [finalTranscript, setFinalTranscript] = useState("")

  // Use ref to avoid recreating the recognition object
  const recognitionRef = useRef<any>(null)

  // Check for browser support only once
  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === "undefined") return

    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (SpeechRecognition) {
      setHasSupport(true)
      console.log("Speech recognition is supported in this browser")
    } else {
      setHasSupport(false)
      console.error("Speech recognition is not supported in this browser")
    }

    // Cleanup function
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          console.error("Error stopping recognition during cleanup:", e)
        }
      }
    }
  }, [])

  // Function to initialize recognition
  const initRecognition = useCallback(() => {
    // If already initialized, don't recreate
    if (recognitionRef.current) return

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (!SpeechRecognition) {
        setError("Speech recognition not supported")
        return
      }

      const recognition = new SpeechRecognition()

      // Configure recognition
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "pt-BR"

      // Set up event handlers
      recognition.onstart = () => {
        console.log("Speech recognition started")
        setIsListening(true)
        setError(null)
      }

      recognition.onend = () => {
        console.log("Speech recognition ended")
        setIsListening(false)
      }

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setError(`Error: ${event.error}`)

        // Don't stop listening for no-speech errors
        if (event.error !== "no-speech") {
          setIsListening(false)
        }
      }

      recognition.onresult = (event: any) => {
        try {
          let currentFinalTranscript = ""
          let currentInterimTranscript = ""

          // Process all results
          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i]

            if (result.isFinal) {
              currentFinalTranscript += result[0].transcript + " "
            } else {
              // For interim results, accumulate them
              currentInterimTranscript += result[0].transcript + " "
            }
          }

          // If we have a final transcript, update it
          if (currentFinalTranscript) {
            console.log("Final transcript:", currentFinalTranscript)
            setFinalTranscript((prev) => prev + currentFinalTranscript)
            setTranscript((prev) => prev + currentFinalTranscript)
          } else if (currentInterimTranscript) {
            // For interim results, just update the transcript
            setTranscript(currentInterimTranscript)
          }
        } catch (e) {
          console.error("Error processing speech result:", e)
        }
      }

      recognitionRef.current = recognition
      console.log("Speech recognition initialized")
    } catch (e) {
      console.error("Error initializing speech recognition:", e)
      setError("Failed to initialize speech recognition")
    }
  }, [])

  // Start listening function
  const startListening = useCallback(() => {
    console.log("Starting speech recognition...")

    // Initialize recognition if needed
    if (!recognitionRef.current) {
      initRecognition()
    }

    if (!recognitionRef.current) {
      setError("Could not initialize speech recognition")
      return
    }

    try {
      // Reset transcripts
      setTranscript("")
      setFinalTranscript("") // Add this line

      // Request microphone permission explicitly
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => {
          // Start recognition after getting permission
          try {
            recognitionRef.current.start()
            console.log("Speech recognition started successfully")
          } catch (e) {
            console.error("Error starting speech recognition:", e)
            setError("Error starting speech recognition")
            setIsListening(false)
          }
        })
        .catch((err) => {
          console.error("Microphone permission denied:", err)
          setError("Microphone permission denied")
          setIsListening(false)
        })
    } catch (e) {
      console.error("Error in startListening:", e)
      setError("Error starting speech recognition")
      setIsListening(false)
    }
  }, [initRecognition])

  // Stop listening function
  const stopListening = useCallback(() => {
    console.log("Stopping speech recognition...")

    if (!recognitionRef.current) {
      console.warn("No recognition instance to stop")
      return
    }

    try {
      // Important: Set isListening to false BEFORE stopping
      // This prevents the onend handler from restarting recognition
      setIsListening(false)

      // Stop the recognition
      recognitionRef.current.stop()
      console.log("Speech recognition stopped successfully")
    } catch (e) {
      console.error("Error stopping speech recognition:", e)
      // Ensure isListening is false even if there's an error
      setIsListening(false)
    }
  }, [])

  return {
    isListening,
    transcript,
    finalTranscript, // Add this line
    startListening,
    stopListening,
    hasSupport,
    error,
  }
}
