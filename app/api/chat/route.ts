import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Luna AI chat is not connected yet. The site administrator must configure the AI service." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    if (!messages.length) {
      return NextResponse.json({ error: "Please enter a message." }, { status: 400 });
    }

    const safeMessages = messages.slice(-16).map((message: unknown) => {
      const item = message as { role?: unknown; content?: unknown };
      const role = item?.role === "assistant" ? "assistant" : "user";
      return {
        role,
        content: String(item?.content ?? "").slice(0, 8000)
      } as const;
    }).filter(message => message.content.trim().length > 0);

    if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== "user") {
      return NextResponse.json({ error: "Send a new message to continue." }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 25_000, maxRetries: 1 });
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `You are Luna AI, a helpful, honest general-purpose assistant. Be clear, practical and transparent about uncertainty. Never claim to have accessed live information unless a connected tool actually supplied it. For sports and betting analysis, never invent statistics, injuries, odds, live scores, historical results or probabilities. Separate verified data from estimates. Explain that betting outcomes are uncertain and avoid presenting estimates as guarantees.`
        },
        ...safeMessages
      ],
      temperature: 0.5,
      max_tokens: 1200
    });

    return NextResponse.json({ reply: response.choices[0]?.message?.content || "I couldn't generate a response." });
  } catch (error) {
    console.error("Luna chat error:", error);
    return NextResponse.json(
      { error: "Luna couldn't complete that request. Please try again shortly." },
      { status: 500 }
    );
  }
}
