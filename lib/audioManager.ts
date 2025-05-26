// Global audio manager to handle audio playback outside component lifecycle
class AudioManager {
  private static instance: AudioManager
  private audioElement: HTMLAudioElement | null = null
  private currentAudioUrl: string | null = null
  private isPlaying = false
  private isPaused = false
  private currentText: string | null = null
  private callbacks: {
    onPlay?: () => void
    onPause?: () => void
    onEnd?: () => void
    onError?: (error: string) => void
  } = {}

  private constructor() {
    if (typeof window !== "undefined") {
      this.audioElement = new Audio()
      this.setupAudioListeners()
    }
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager()
    }
    return AudioManager.instance
  }

  private setupAudioListeners() {
    if (!this.audioElement) return

    this.audioElement.onplay = () => {
      console.log("[AudioManager] Audio playback started")
      this.isPlaying = true
      this.isPaused = false
      this.callbacks.onPlay?.()
    }

    this.audioElement.onpause = () => {
      console.log("[AudioManager] Audio playback paused")
      this.isPlaying = true
      this.isPaused = true
      this.callbacks.onPause?.()
    }

    this.audioElement.onended = () => {
      console.log("[AudioManager] Audio playback ended")
      this.isPlaying = false
      this.isPaused = false
      this.currentText = null
      this.callbacks.onEnd?.()

      // Clean up the object URL when playback ends
      if (this.currentAudioUrl) {
        URL.revokeObjectURL(this.currentAudioUrl)
        this.currentAudioUrl = null
      }
    }

    this.audioElement.onerror = (e) => {
      // Log detailed error information
      const errorCode = this.audioElement?.error ? this.audioElement.error.code : "unknown"
      const errorMessage = this.audioElement?.error ? this.audioElement.error.message : "unknown error"

      console.error("[AudioManager] Audio playback error:", {
        event: e,
        errorCode,
        errorMessage,
        currentSrc: this.audioElement?.currentSrc,
      })

      const errorMsg = `Error playing audio: ${errorMessage} (code: ${errorCode})`
      this.callbacks.onError?.(errorMsg)

      // Clean up on error
      if (this.currentAudioUrl) {
        URL.revokeObjectURL(this.currentAudioUrl)
        this.currentAudioUrl = null
      }

      this.isPlaying = false
      this.isPaused = false
    }
  }

  public setCallbacks(callbacks: {
    onPlay?: () => void
    onPause?: () => void
    onEnd?: () => void
    onError?: (error: string) => void
  }) {
    this.callbacks = callbacks
  }

  public async playAudio(audioBlob: Blob, text: string): Promise<void> {
    if (!this.audioElement) return

    try {
      // Stop any current playback
      this.stop()

      // Create a URL for the blob
      const audioUrl = URL.createObjectURL(audioBlob)

      // Clean up previous URL if it exists
      if (this.currentAudioUrl) {
        URL.revokeObjectURL(this.currentAudioUrl)
      }

      // Store the new URL and text
      this.currentAudioUrl = audioUrl
      this.currentText = text

      // Set the audio source
      this.audioElement.src = audioUrl
      this.audioElement.load()

      // Wait for the audio to be ready to play
      await new Promise<void>((resolve, reject) => {
        if (!this.audioElement) {
          reject(new Error("Audio element not available"))
          return
        }

        const onCanPlay = () => {
          this.audioElement?.removeEventListener("canplay", onCanPlay)
          resolve()
        }

        if (this.audioElement.readyState >= 3) {
          resolve()
        } else {
          this.audioElement.addEventListener("canplay", onCanPlay)

          // Add a timeout in case the canplay event never fires
          setTimeout(() => {
            if (this.audioElement?.readyState >= 3) {
              this.audioElement.removeEventListener("canplay", onCanPlay)
              resolve()
            } else {
              reject(new Error("Audio failed to load"))
            }
          }, 5000)
        }
      })

      // Play the audio
      console.log("[AudioManager] Starting audio playback")
      await this.audioElement.play()
      console.log("[AudioManager] Audio playback started successfully")
    } catch (err) {
      console.error("[AudioManager] Error playing audio:", err)
      throw err
    }
  }

  public stop() {
    if (!this.audioElement) return

    console.log("[AudioManager] Stopping audio playback")
    this.audioElement.pause()
    this.audioElement.currentTime = 0
    this.audioElement.src = ""

    // Clean up object URL
    if (this.currentAudioUrl) {
      URL.revokeObjectURL(this.currentAudioUrl)
      this.currentAudioUrl = null
    }

    this.isPlaying = false
    this.isPaused = false
    this.currentText = null
  }

  public pause() {
    if (!this.audioElement || !this.isPlaying || this.isPaused) return

    console.log("[AudioManager] Pausing audio playback")
    this.audioElement.pause()
    this.isPaused = true
  }

  public resume() {
    if (!this.audioElement || !this.isPlaying || !this.isPaused) return

    console.log("[AudioManager] Resuming audio playback")
    this.audioElement.play().catch((err) => {
      console.error("[AudioManager] Error resuming audio:", err)
      this.callbacks.onError?.(`Error resuming audio: ${err.message}`)
    })
    this.isPaused = false
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      currentText: this.currentText,
    }
  }
}

// Export a singleton instance
export const audioManager = typeof window !== "undefined" ? AudioManager.getInstance() : null

// Function to safely access the audio manager (for SSR compatibility)
export function getAudioManager() {
  if (typeof window === "undefined") {
    return null
  }
  return audioManager
}
