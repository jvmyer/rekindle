import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface GrokQuestion {
  question: string;
  answer: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey || apiKey === "your-key-here") {
      return NextResponse.json(
        { error: "XAI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const { id } = await params;
    const bookId = parseInt(id, 10);

    if (isNaN(bookId)) {
      return NextResponse.json({ error: "Invalid book id" }, { status: 400 });
    }

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const prompt = `Generiere 20 Fragen und Antworten auf Deutsch zum Buch "${book.title}" von ${book.author}. Konzentriere dich auf Kernkonzepte, interessante Fakten, Charaktere/Personen und wichtige Erkenntnisse. Antworte NUR mit einem JSON-Array: [{"question": "...", "answer": "...", "difficulty": "EASY|MEDIUM|HARD"}]`;

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Grok API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Grok API request failed", details: errorText },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "Invalid response from Grok API" },
        { status: 502 }
      );
    }

    let questions: GrokQuestion[];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("No JSON array found in response");
      questions = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse Grok API response as JSON" },
        { status: 502 }
      );
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "Grok API returned no questions" },
        { status: 502 }
      );
    }

    // Delete existing questions before creating new ones
    await prisma.question.deleteMany({ where: { bookId } });

    const created = await prisma.question.createMany({
      data: questions.map((q) => ({
        questionText: q.question,
        answerText: q.answer,
        difficulty: ["EASY", "MEDIUM", "HARD"].includes(q.difficulty)
          ? q.difficulty
          : "MEDIUM",
        bookId,
      })),
    });

    return NextResponse.json({ generated: created.count, bookId });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
