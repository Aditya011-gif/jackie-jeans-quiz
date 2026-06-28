import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { text, model = "aura-asteria-en" } = await req.json(); // Aura-2 asteria voice

    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Deepgram API Key not configured on server" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.deepgram.com/v1/speak?model=${model}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Token ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Deepgram Error: ${errText}` },
        { status: response.status }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Response(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Deepgram TTS API Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
