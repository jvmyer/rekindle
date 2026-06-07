import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { questionId, wasCorrect } = body

    if (typeof questionId !== 'number') {
      return NextResponse.json(
        { error: 'questionId (number) ist erforderlich' },
        { status: 400 }
      )
    }
    if (typeof wasCorrect !== 'boolean') {
      return NextResponse.json(
        { error: 'wasCorrect (boolean) ist erforderlich' },
        { status: 400 }
      )
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true },
    })
    if (!question) {
      return NextResponse.json(
        { error: 'Frage nicht gefunden' },
        { status: 404 }
      )
    }

    const review = await prisma.dailyReview.create({
      data: {
        questionId,
        wasCorrect,
        answeredAt: new Date(),
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Bewertung' },
      { status: 500 }
    )
  }
}
