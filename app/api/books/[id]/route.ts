import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookId = parseInt(id, 10);

    if (isNaN(bookId)) {
      return NextResponse.json({ error: "Invalid book id" }, { status: 400 });
    }

    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: { questions: true },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json(book);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookId = parseInt(id, 10);

    if (isNaN(bookId)) {
      return NextResponse.json({ error: "Invalid book id" }, { status: 400 });
    }

    const book = await prisma.book.findUnique({ where: { id: bookId } });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    await prisma.book.delete({ where: { id: bookId } });

    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
