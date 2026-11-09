import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

type Msg = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT =
  "You are Luna AI, a helpful, honest general-purpose assistant. Be clear, practical and transparent about uncertainty. Never claim to have accessed live information unless a connected tool actually supplied it. For sports and betting analysis, never invent statistics, injuries, odds, live scores, historical results or probabilities. Separate verified data from estimates. Explain that betting outcomes are uncertain and avoid presenting estimates as guarantees.";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Luna AI chat is not connected yet. Add GEMINI_API_KEY in Vercel and redeploy." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const raw: unknown[] = Array.isArray(body?.messages) ? body.messages : [];

    const safeMessages: Msg[] = raw
      .slice(-16)
      .map((m) => {
        const item = m as { role?: unknown; content?: unknown };
        return {
          role: item?.role === "assistant" ? "assistant" : "user",
          content: String(item?.content ?? "").slice(0, 8000)
        } as Msg;
      })
      .filter((m: Msg) => m.content.trim().length > 0);

    while (safeMessages.length > 0 && safeMessages[0].role !== "user") {
      safeMessages.shift();
    }

    if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== "user") {
      return NextResponse.json({ error: "Send a new message to continue." }, { status: 400 });
    }

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: safeMessages.map((m: Msg) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }]
          })),
          generationConfig: { temperature: 0.5, maxOutputTokens: 1200 }
        }),
        signal: AbortSignal.timeout(25000)
      }
    );

    if (!res.ok) {
      console.error("Gemini error:", res.status, await res.text());
      const msg =
        res.status === 429
          ? "Luna hit the free Gemini limit. Wait a minute and try again."
          : "Luna couldn't complete that request. Please try again shortly.";
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const reply = data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? "")
      .join("")
      .trim();

    return NextResponse.json({ reply: reply || "I couldn't generate a response." });
  } catch (error) {
    console.error("Luna chat error:", error);
    return NextResponse.json(
      { error: "Luna couldn't complete that request. Please try again shortly." },
      { status: 500 }
    );
  }
}
