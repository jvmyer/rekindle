'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Stats = {
  totalQuestions: number;
  totalBooks: number;
  reviewedToday: number;
  correctToday: number;
  currentStreak: number;
  totalReviewed: number;
  totalCorrect: number;
};

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/quiz/stats')
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const doneToday = stats ? stats.reviewedToday >= 10 : false;
  const remaining = stats ? Math.max(0, 10 - stats.reviewedToday) : 10;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="px-4 pt-12 pb-6">
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-1">Willkommen zurück</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dein Lernplan</h1>
      </header>

      <main className="px-4 pb-28 space-y-6">
        {/* Stats tiles */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? '—' : (stats?.totalBooks ?? 0)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Bücher</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? '—' : (stats?.totalQuestions ?? 0)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Fragen</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? '—' : `${stats?.reviewedToday ?? 0}/10`}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Heute</p>
          </div>
        </div>

        {/* CTA */}
        {!loading && (
          doneToday ? (
            <div className="space-y-3">
              <div className="w-full h-14 flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold rounded-2xl text-base">
                Heute geschafft ✓
              </div>
              <Link
                href="/stats"
                className="flex items-center justify-center w-full h-12 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl text-sm"
              >
                Statistik ansehen
              </Link>
            </div>
          ) : (
            <Link
              href="/quiz"
              className="flex items-center justify-center w-full h-14 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-2xl text-base active:scale-[0.98] transition-transform"
            >
              Heute lernen — {remaining} {remaining === 1 ? 'Frage wartet' : 'Fragen warten'}
            </Link>
          )
        )}

        {/* Streak */}
        {stats && stats.currentStreak > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-4 flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Aktueller Streak</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {stats.currentStreak} {stats.currentStreak === 1 ? 'Tag' : 'Tage'} 🔥
            </span>
          </div>
        )}
      </main>
    </div>
  );
}
