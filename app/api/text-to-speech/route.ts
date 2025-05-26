import { NextResponse } from "next/server"

export const maxDuration = 60 // Increase timeout to 60 seconds

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allow all origins - restrict this in production
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400", // 24 hours cache for preflight requests
}

export async function POST(req: Request) {
  try {
    // Log the request for debugging
    console.log("[TTS] Received text-to-speech request")

    // Validate request body
    let requestBody
    try {
      requestBody = await req.json()
    } catch (parseError) {
      console.error("[TTS] Error parsing request body:", parseError)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400, headers: corsHeaders })
    }

    const { text, voice = "alloy" } = requestBody

    // Validate required parameters
    if (!text) {
      console.error("[TTS] No text provided in request")
      return NextResponse.json({ error: "No text provided" }, { status: 400, headers: corsHeaders })
    }

    // Validate voice parameter
    const validVoices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"]
    if (!validVoices.includes(voice)) {
      console.error("[TTS] Invalid voice parameter:", voice)
      return NextResponse.json({ error: "Invalid voice parameter" }, { status: 400, headers: corsHeaders })
    }

    // Limit text length to prevent timeouts
    const truncatedText = text.length > 4000 ? text.substring(0, 4000) + "..." : text

    console.log(`[TTS] Generating speech for text (${truncatedText.length} chars) with voice: ${voice}`)

    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error("[TTS] Missing OpenAI API key")
      return NextResponse.json(
        { error: "Server configuration error: Missing API key" },
        { status: 500, headers: corsHeaders },
      )
    }

    let timeoutId: NodeJS.Timeout | null = null

    try {
      // Use a longer timeout for the OpenAI API call
      const controller = new AbortController()
      timeoutId = setTimeout(() => {
        console.log("[TTS] OpenAI API call timed out, aborting")
        controller.abort()
      }, 45000) // 45 second timeout

      // Make the API request to OpenAI
      const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "tts-1",
          input: truncatedText,
          voice,
          response_format: "mp3",
          speed: 1.0,
        }),
        signal: controller.signal,
      })

      // Clear timeout after response is received
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }

      // Handle API errors
      if (!response.ok) {
        let errorMessage = `OpenAI API error: ${response.status} ${response.statusText}`

        try {
          const errorData = await response.json()
          errorMessage = `OpenAI API error: ${JSON.stringify(errorData)}`
          console.error("[TTS]", errorMessage)
        } catch (parseError) {
          console.error("[TTS] Failed to parse error response:", parseError)
        }

        return NextResponse.json({ error: errorMessage }, { status: response.status, headers: corsHeaders })
      }

      // Get the audio data
      const audioBuffer = await response.arrayBuffer()

      // Verify we got valid audio data
      if (!audioBuffer || audioBuffer.byteLength === 0) {
        console.error("[TTS] Received empty audio data from OpenAI")
        return NextResponse.json(
          { error: "Received empty audio data from OpenAI" },
          { status: 500, headers: corsHeaders },
        )
      }

      console.log(`[TTS] Received audio data: ${audioBuffer.byteLength} bytes`)

      try {
        // Create a proper response with the audio data
        return new Response(audioBuffer, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Content-Length": audioBuffer.byteLength.toString(),
            "Cache-Control": "public, max-age=3600", // Cache for 1 hour
            ...corsHeaders, // Add CORS headers
          },
        })
      } catch (responseError) {
        console.error("[TTS] Error creating response:", responseError)
        throw responseError
      }
    } catch (fetchError) {
      console.error("[TTS] OpenAI API fetch error:", fetchError)

      // Clear timeout if there was an error
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }

      throw fetchError
    }
  } catch (error) {
    console.error("[TTS] Text-to-speech error:", error)

    // Check if it's an abort error (timeout)
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Request timeout", details: "The text-to-speech request took too long" },
        { status: 408, headers: corsHeaders },
      )
    }

    return NextResponse.json(
      { error: "Failed to generate speech", details: (error as Error).message },
      { status: 500, headers: corsHeaders },
    )
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204, // No content
    headers: corsHeaders,
  })
}
