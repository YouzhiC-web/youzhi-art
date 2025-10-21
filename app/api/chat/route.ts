import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid prompt" },
        { status: 400 }
      );
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a friendly squirrel assistant." },
        { role: "user", content: prompt },
      ],
    });

    const reply =
      completion.choices?.[0]?.message?.content ??
      "❌ No recognizable text found in response.";

    return NextResponse.json({ success: true, reply });
  } catch (err) {
    console.error("OpenAI API error:", err);
    return NextResponse.json({
      success: false,
      error: "Failed to connect to OpenAI API",
    });
  }
}
