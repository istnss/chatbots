"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface UseAudioRecorderProps {
  onTranscriptionComplete?: (text: string) => void
  onError?: (error: string) => void
}

export function useAudioRecorder({ onTranscriptionComplete, onError }: UseAudioRecorderProps = {}) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasSupport, setHasSupport] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // References for media recorder and audio chunks
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  // Check for browser support
  useEffect(() => {
    if (typeof navigator === "undefined") return

    const hasMediaRecorder = "MediaRecorder" in window
    const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)

    setHasSupport(hasMediaRecorder && hasMediaDevices)

    if (!hasMediaRecorder || !hasMediaDevices) {
      setError("Audio recording is not supported in this browser")
    }

    // Cleanup function
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
    }
  }, [])

  // Function to start recording
  const startRecording = useCallback(async () => {
    if (!hasSupport) {
      const errorMsg = "Audio recording is not supported"
      setError(errorMsg)
      onError?.(errorMsg)
      return
    }

    try {
      setError(null)

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      // Clear previous audio chunks
      audioChunksRef.current = []

      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      // Start recording
      mediaRecorder.start()
      setIsRecording(true)

      console.log("Recording started")
    } catch (err) {
      const errorMsg = `Error starting recording: ${(err as Error).message}`
      console.error(errorMsg)
      setError(errorMsg)
      onError?.(errorMsg)
    }
  }, [hasSupport, onError])

  // Function to stop recording and process audio
  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || !isRecording) {
      return
    }

    try {
      // Create a promise that resolves when recording stops
      const recordingStoppedPromise = new Promise<void>((resolve) => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.onstop = () => resolve()
        }
      })

      // Stop the media recorder
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      // Wait for the recording to stop
      await recordingStoppedPromise

      // Stop all tracks in the stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      // Process the recorded audio
      if (audioChunksRef.current.length > 0) {
        setIsProcessing(true)

        // Create a blob from the audio chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })

        // Create form data to send to the API
        const formData = new FormData()
        formData.append("audio", audioBlob, "recording.webm")

        // Send the audio to the transcription API
        const response = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Transcription failed with status: ${response.status}`)
        }

        const data = await response.json()

        if (data.text) {
          console.log("Transcription received:", data.text)
          onTranscriptionComplete?.(data.text)
        } else {
          throw new Error("No transcription text received")
        }
      }
    } catch (err) {
      const errorMsg = `Error processing recording: ${(err as Error).message}`
      console.error(errorMsg)
      setError(errorMsg)
      onError?.(errorMsg)
    } finally {
      setIsProcessing(false)
    }
  }, [isRecording, onTranscriptionComplete, onError])

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    hasSupport,
    error,
  }
}
