import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params
    const id = parseInt(questionId, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Ungültige ID' }, { status: 400 })
    }

    const question = await prisma.question.findUnique({
      where: { id },
      select: { answerText: true },
    })

    if (!question) {
      return NextResponse.json(
        { error: 'Frage nicht gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json({ answer: question.answerText })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Antwort' },
      { status: 500 }
    )
  }
}
