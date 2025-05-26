import { NextResponse } from "next/server"
import { experimental_transcribe as transcribe } from "ai"
import { openai } from "@ai-sdk/openai"

export const maxDuration = 30 // 30 seconds timeout

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allow all origins - restrict this in production
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400", // 24 hours cache for preflight requests
}

export async function POST(req: Request) {
  try {
    // Get the audio data from the request
    const formData = await req.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400, headers: corsHeaders })
    }

    // Convert the file to a buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer())

    // Use OpenAI's Whisper model for transcription
    const result = await transcribe({
      model: openai.transcription("whisper-1"),
      audio: audioBuffer,
      // Optional language specification
      //providerOptions: {
        //openai: {
          //language: "pt", // Portuguese
        //},
      //},
    })

    return NextResponse.json(
      {
        text: result.text,
        language: result.language,
        durationInSeconds: result.durationInSeconds,
      },
      { headers: corsHeaders },
    )
  } catch (error) {
    console.error("Transcription error:", error)
    return NextResponse.json(
      { error: "Failed to transcribe audio", details: (error as Error).message },
      { status: 500, headers: corsHeaders },
    )
  }
}

// Handle OPTIONS preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 204, // No content
    headers: corsHeaders,
  })
}
