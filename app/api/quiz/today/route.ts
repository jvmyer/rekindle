import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const questionSelect = {
  id: true,
  questionText: true,
  bookId: true,
  difficulty: true,
  createdAt: true,
  book: { select: { title: true, author: true } },
} as const

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export async function GET() {
  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const reviewedToday = await prisma.dailyReview.findMany({
      where: { date: { gte: todayStart, lte: todayEnd } },
      select: { questionId: true },
    })
    const reviewedIds = reviewedToday.map((r) => r.questionId)

    // Prefer questions not yet reviewed today
    const unreviewedPool = await prisma.question.findMany({
      where: reviewedIds.length > 0 ? { id: { notIn: reviewedIds } } : {},
      select: questionSelect,
    })
    const unreviewed = shuffle(unreviewedPool).slice(0, 10)

    let questions = unreviewed
    if (questions.length < 10) {
      const usedIds = questions.map((q) => q.id)
      const additionalPool = await prisma.question.findMany({
        where: usedIds.length > 0 ? { id: { notIn: usedIds } } : {},
        select: questionSelect,
      })
      const additional = shuffle(additionalPool).slice(0, 10 - questions.length)
      questions = [...questions, ...additional]
    }

    return NextResponse.json(questions)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Fragen' },
      { status: 500 }
    )
  }
}
