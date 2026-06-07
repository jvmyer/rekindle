import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(books);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, author, genre, dateRead, source, coverUrl } = body;

    if (!title || !author) {
      return NextResponse.json(
        { error: "title and author are required" },
        { status: 400 }
      );
    }

    const book = await prisma.book.create({
      data: {
        title,
        author,
        genre: genre ?? null,
        dateRead: dateRead ? new Date(dateRead) : null,
        source: source ?? "MANUAL",
        coverUrl: coverUrl ?? null,
      },
    });

    return NextResponse.json(book, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
