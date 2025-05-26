/**
 * Utility functions for audio handling
 */

// Function to create an audio element and play a blob
export async function playAudioBlob(blob: Blob): Promise<HTMLAudioElement> {
  return new Promise((resolve, reject) => {
    try {
      // Create audio element
      const audio = new Audio()

      // Create object URL
      const url = URL.createObjectURL(blob)

      // Set up event handlers
      audio.oncanplaythrough = () => {
        audio
          .play()
          .then(() => resolve(audio))
          .catch((err) => {
            URL.revokeObjectURL(url)
            reject(err)
          })
      }

      audio.onerror = (err) => {
        URL.revokeObjectURL(url)
        reject(err)
      }

      // Set source and load
      audio.src = url
      audio.load()

      // Set timeout in case oncanplaythrough doesn't fire
      setTimeout(() => {
        if (audio.readyState >= 3) {
          audio
            .play()
            .then(() => resolve(audio))
            .catch((err) => {
              URL.revokeObjectURL(url)
              reject(err)
            })
        }
      }, 1000)
    } catch (err) {
      reject(err)
    }
  })
}

// Function to safely stop and clean up an audio element
export function stopAudio(audio: HTMLAudioElement | null, objectUrl: string | null): void {
  if (audio) {
    audio.pause()
    audio.currentTime = 0
    audio.src = ""
  }

  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
  }
}
