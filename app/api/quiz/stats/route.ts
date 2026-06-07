import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

export async function GET() {
  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const [totalQuestions, totalBooks, todayReviews, allReviewDates] =
      await Promise.all([
        prisma.question.count(),
        prisma.book.count(),
        prisma.dailyReview.findMany({
          where: { date: { gte: todayStart, lte: todayEnd } },
          select: { wasCorrect: true },
        }),
        prisma.dailyReview.findMany({
          select: { date: true },
          orderBy: { date: 'desc' },
        }),
      ])

    const reviewedToday = todayReviews.length
    const correctToday = todayReviews.filter((r) => r.wasCorrect === true).length

    const dateSet = new Set(
      allReviewDates.map((r) => toDateKey(new Date(r.date)))
    )

    let currentStreak = 0
    const cursor = new Date()
    cursor.setHours(0, 0, 0, 0)
    while (dateSet.has(toDateKey(cursor))) {
      currentStreak++
      cursor.setDate(cursor.getDate() - 1)
    }

    return NextResponse.json({
      totalQuestions,
      totalBooks,
      reviewedToday,
      correctToday,
      currentStreak,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Statistiken' },
      { status: 500 }
    )
  }
}
