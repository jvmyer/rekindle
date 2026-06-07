'use client';

import { useState, useEffect } from 'react';

type Stats = {
  totalQuestions: number;
  totalBooks: number;
  reviewedToday: number;
  correctToday: number;
  currentStreak: number;
  totalReviewed: number;
  totalCorrect: number;
};

type Book = {
  id: number;
  title: string;
  author: string;
  _count: { questions: number };
};

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/quiz/stats').then((r) => r.json()),
      fetch('/api/books').then((r) => r.json()),
    ])
      .then(([statsData, booksData]: [Stats, Book[]]) => {
        setStats(statsData);
        const arr: Book[] = Array.isArray(booksData) ? booksData : [];
        setBooks(arr.sort((a, b) => b._count.questions - a._count.questions).slice(0, 10));
      })
      .finally(() => setLoading(false));
  }, []);

  const correctPct =
    stats && stats.totalReviewed > 0
      ? Math.round((stats.totalCorrect / stats.totalReviewed) * 100)
      : null;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Statistik</h1>
      </header>

      <main className="px-4 pb-28 space-y-6">
        {loading ? (
          <div className="flex justify-center pt-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {stats && stats.currentStreak > 0 && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-4 flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Streak</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {stats.currentStreak} {stats.currentStreak === 1 ? 'Tag' : 'Tage'} 🔥
                  </span>
                </div>
              )}
              {correctPct !== null && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-4 flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Richtige Antworten</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{correctPct}%</span>
                </div>
              )}
              {stats && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-4 flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Fragen beantwortet</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{stats.totalReviewed}</span>
                </div>
              )}
            </div>

            {books.length > 0 ? (
              <section>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                  Fragen pro Buch
                </h2>
                <ul className="space-y-2">
                  {books.map((book, i) => (
                    <li
                      key={book.id}
                      className="bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-3 flex items-center gap-3 min-h-[56px]"
                    >
                      <span className="text-sm font-medium text-gray-400 dark:text-gray-600 w-5 text-right flex-shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {book.title}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{book.author}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white flex-shrink-0">
                        {book._count.questions}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : (
              <div className="flex flex-col items-center justify-center pt-12 text-center">
                <span className="text-5xl mb-4">📊</span>
                <p className="text-gray-700 dark:text-gray-300 font-medium">Noch keine Daten</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                  Füge Bücher hinzu und beantworte Fragen
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
