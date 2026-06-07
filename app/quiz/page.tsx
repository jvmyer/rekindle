'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

type QuizQuestion = {
  id: number;
  questionText: string;
  bookId: number;
  difficulty: Difficulty;
  createdAt: string;
  book: { title: string; author: string };
};

type Stats = {
  totalQuestions: number;
  totalBooks: number;
  reviewedToday: number;
  correctToday: number;
  currentStreak: number;
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  EASY: 'Leicht',
  MEDIUM: 'Mittel',
  HARD: 'Schwer',
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  EASY: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  HARD: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

type Phase = 'loading' | 'quiz' | 'done' | 'already_done' | 'no_questions';

export default function QuizPage() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerText, setAnswerText] = useState<string | null>(null);
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const [statsRes, questionsRes] = await Promise.all([
          fetch('/api/quiz/stats'),
          fetch('/api/quiz/today'),
        ]);
        const statsData: Stats = await statsRes.json();
        const questionsData: QuizQuestion[] = await questionsRes.json();

        setStats(statsData);

        if (statsData.reviewedToday >= 10) {
          setPhase('already_done');
        } else if (!Array.isArray(questionsData) || questionsData.length === 0) {
          setPhase('no_questions');
        } else {
          setQuestions(questionsData);
          setPhase('quiz');
        }
      } catch {
        setPhase('no_questions');
      }
    }
    init();
  }, []);

  const handleReveal = async () => {
    const q = questions[currentIndex];
    setLoadingAnswer(true);
    try {
      const res = await fetch(`/api/quiz/answer/${q.id}`);
      const data = await res.json();
      setAnswerText(data.answer);
    } finally {
      setLoadingAnswer(false);
    }
  };

  const handleAnswer = async (wasCorrect: boolean) => {
    const q = questions[currentIndex];
    if (wasCorrect) setCorrectCount((c) => c + 1);

    fetch('/api/quiz/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: q.id, wasCorrect }),
    }).catch(() => {});

    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      setPhase('done');
    } else {
      setCurrentIndex(nextIndex);
      setAnswerText(null);
    }
  };

  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex justify-center pt-20">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (phase === 'no_questions') {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
        <header className="px-4 pt-12 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tägliches Quiz</h1>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-4 text-center pb-20">
          <span className="text-6xl mb-6">📚</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Noch keine Fragen</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Füge Bücher hinzu und generiere Fragen um das Quiz zu starten.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-12 px-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl"
          >
            Zu den Büchern
          </Link>
        </main>
      </div>
    );
  }

  if (phase === 'already_done') {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
        <header className="px-4 pt-12 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tägliches Quiz</h1>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-4 text-center pb-20">
          <span className="text-6xl mb-6">🎉</span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Heute fertig!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Komm morgen wieder.</p>
          {stats && (
            <div className="w-full max-w-sm space-y-3 mb-8">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-4 flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Heute richtig</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats.correctToday} / {stats.reviewedToday}
                </span>
              </div>
              {stats.currentStreak > 0 && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-4 flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Streak</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {stats.currentStreak} {stats.currentStreak === 1 ? 'Tag' : 'Tage'} 🔥
                  </span>
                </div>
              )}
            </div>
          )}
          <Link
            href="/"
            className="inline-flex items-center justify-center h-12 px-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl"
          >
            Zur Übersicht
          </Link>
        </main>
      </div>
    );
  }

  if (phase === 'done') {
    const total = questions.length;
    const emoji = correctCount >= total * 0.8 ? '🏆' : correctCount >= total * 0.5 ? '👍' : '📚';
    const message = correctCount >= total * 0.8 ? 'Ausgezeichnet!' : correctCount >= total * 0.5 ? 'Gut gemacht!' : 'Weiter üben!';
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
        <header className="px-4 pt-12 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quiz abgeschlossen</h1>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-4 text-center pb-20">
          <span className="text-6xl mb-6">{emoji}</span>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {correctCount}/{total} richtig
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-10">{message}</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-12 px-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl"
          >
            Zur Übersicht
          </Link>
        </main>
      </div>
    );
  }

  const q = questions[currentIndex];
  const total = questions.length;
  const answered = currentIndex;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <header className="px-4 pt-12 pb-4">
        <div className="flex items-center justify-between mb-3">
          <Link
            href="/"
            className="w-11 h-11 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
            aria-label="Zurück"
          >
            ‹
          </Link>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {answered} / {total} beantwortet
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gray-900 dark:bg-white rounded-full transition-all duration-300"
            style={{ width: `${total > 0 ? (answered / total) * 100 : 0}%` }}
          />
        </div>
      </header>

      <main className="flex-1 px-4 pb-8 flex flex-col">
        <div className="flex-1 flex flex-col space-y-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-6 flex flex-col flex-1">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 truncate">
              {q.book.title}
            </p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white leading-snug flex-1">
              {q.questionText}
            </p>
            <div className="mt-6">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${DIFFICULTY_COLORS[q.difficulty]}`}>
                {DIFFICULTY_LABELS[q.difficulty]}
              </span>
            </div>
          </div>

          {answerText && (
            <div className="animate-slide-down bg-blue-50 dark:bg-blue-950/30 rounded-3xl p-6 border border-blue-100 dark:border-blue-900/50">
              <p className="text-xs font-semibold text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-3">
                Antwort
              </p>
              <p className="text-base text-gray-900 dark:text-white leading-relaxed">{answerText}</p>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-3">
          {!answerText ? (
            <button
              onClick={handleReveal}
              disabled={loadingAnswer}
              className="w-full h-14 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-2xl text-base disabled:opacity-50 active:scale-[0.98] transition-transform"
            >
              {loadingAnswer ? 'Laden …' : 'Antwort anzeigen'}
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => handleAnswer(false)}
                className="flex-1 h-14 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-semibold rounded-2xl text-sm active:bg-red-50 dark:active:bg-red-900/20 transition-colors"
              >
                Nicht gewusst ✗
              </button>
              <button
                onClick={() => handleAnswer(true)}
                className="flex-1 h-14 bg-green-600 dark:bg-green-700 text-white font-semibold rounded-2xl text-sm active:scale-[0.98] transition-transform"
              >
                Wusste ich ✓
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
