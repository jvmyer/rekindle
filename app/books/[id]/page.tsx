'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type BookSource = 'KINDLE' | 'GOODREADS' | 'MANUAL';
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

type Question = {
  id: number;
  questionText: string;
  answerText: string;
  difficulty: Difficulty;
  createdAt: string;
};

type Book = {
  id: number;
  title: string;
  author: string;
  genre: string | null;
  dateRead: string | null;
  source: BookSource;
  coverUrl: string | null;
  createdAt: string;
  questions: Question[];
};

const SOURCE_LABELS: Record<BookSource, string> = {
  KINDLE: 'Kindle',
  GOODREADS: 'Goodreads',
  MANUAL: 'Manuell',
};

const SOURCE_COLORS: Record<BookSource, string> = {
  KINDLE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  GOODREADS: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  MANUAL: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
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

function QuestionCard({ question }: { question: Question }) {
  const [open, setOpen] = useState(false);

  return (
    <li className="bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-4 py-4 flex items-start gap-3 min-h-[64px] active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white leading-snug">
            {question.questionText}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[question.difficulty]}`}>
            {DIFFICULTY_LABELS[question.difficulty]}
          </span>
          <span className="text-gray-400 dark:text-gray-600 text-sm">{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mt-3">
            {question.answerText}
          </p>
        </div>
      )}
    </li>
  );
}

export default function BookDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const bookId = params.id;

  const fetchBook = useCallback(async () => {
    if (!bookId) return;
    try {
      const res = await fetch(`/api/books/${bookId}`);
      if (!res.ok) {
        router.push('/books');
        return;
      }
      const data = await res.json();
      setBook(data);
    } finally {
      setLoading(false);
    }
  }, [bookId, router]);

  useEffect(() => {
    if (bookId) fetchBook();
  }, [bookId, fetchBook]);

  const handleGenerate = async () => {
    if (!bookId) return;
    setGenerating(true);
    try {
      const res = await fetch(`/api/books/${bookId}/generate-questions`, { method: 'POST' });
      if (res.ok) {
        setLoading(true);
        await fetchBook();
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!bookId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/books/${bookId}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/books');
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex justify-center pt-20">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!book) return null;

  const dateLabel = book.dateRead
    ? new Date(book.dateRead).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="px-4 pt-12 pb-4 flex items-start gap-3">
        <Link
          href="/books"
          className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
          aria-label="Zurück"
        >
          ‹
        </Link>
        <div className="flex-1 min-w-0 pt-1">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{book.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{book.author}</p>
        </div>
      </header>

      <main className="px-4 pb-28 space-y-6">
        {/* Meta */}
        <div className="flex flex-wrap gap-2">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${SOURCE_COLORS[book.source]}`}>
            {SOURCE_LABELS[book.source]}
          </span>
          {book.genre && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              {book.genre}
            </span>
          )}
          {dateLabel && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              Gelesen: {dateLabel}
            </span>
          )}
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full h-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl disabled:opacity-50 active:scale-[0.98] transition-transform"
        >
          {generating ? 'Generiere Fragen …' : 'Fragen generieren (KI)'}
        </button>

        {/* Questions section */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
            {book.questions.length > 0
              ? `${book.questions.length} ${book.questions.length === 1 ? 'Frage' : 'Fragen'}`
              : 'Fragen'}
          </h2>

          {book.questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-4xl mb-3">🤔</span>
              <p className="text-gray-700 dark:text-gray-300 font-medium">Noch keine Fragen</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Generiere sie mit KI</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {book.questions.map((q) => (
                <QuestionCard key={q.id} question={q} />
              ))}
            </ul>
          )}
        </section>

        {/* Delete button */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full h-12 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-medium rounded-xl active:bg-red-50 dark:active:bg-red-900/20 transition-colors"
          >
            Buch löschen
          </button>
        </div>
      </main>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl z-50 px-4 pt-6 pb-10">
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-6" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Buch löschen?</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              &ldquo;{book.title}&rdquo; und alle zugehörigen Fragen werden unwiderruflich gelöscht.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full h-12 bg-red-600 text-white font-semibold rounded-xl disabled:opacity-50 active:scale-[0.98] transition-transform"
              >
                {deleting ? 'Löschen …' : 'Ja, löschen'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full h-12 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
