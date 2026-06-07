'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Book = {
  id: number;
  title: string;
  author: string;
  genre: string | null;
  dateRead: string | null;
  source: 'KINDLE' | 'GOODREADS' | 'MANUAL';
  coverUrl: string | null;
  createdAt: string;
  _count: { questions: number };
};

type BookSource = 'KINDLE' | 'GOODREADS' | 'MANUAL';

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

const defaultForm = {
  title: '',
  author: '',
  genre: '',
  dateRead: '',
  source: 'MANUAL' as BookSource,
};

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/books');
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          author: form.author,
          genre: form.genre || undefined,
          dateRead: form.dateRead || undefined,
          source: form.source,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setForm(defaultForm);
        await fetchBooks();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meine Bücher</h1>
        {!loading && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {books.length} {books.length === 1 ? 'Buch' : 'Bücher'}
          </p>
        )}
      </header>

      <main className="px-4 pb-28">
        {loading ? (
          <div className="flex justify-center pt-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 text-center">
            <span className="text-5xl mb-4">📚</span>
            <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">Noch keine Bücher</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Füge dein erstes Buch hinzu</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {books.map((book) => (
              <li key={book.id}>
                <Link
                  href={`/books/${book.id}`}
                  className="block bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 active:bg-gray-100 dark:active:bg-gray-800 transition-colors min-h-[64px]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white leading-tight">{book.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{book.author}</p>
                    </div>
                    <span
                      className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${SOURCE_COLORS[book.source]}`}
                    >
                      {SOURCE_LABELS[book.source]}
                    </span>
                  </div>
                  {book._count.questions > 0 && (
                    <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">
                      {book._count.questions} {book._count.questions === 1 ? 'Frage' : 'Fragen'}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        aria-label="Buch hinzufügen"
        className="fixed bottom-6 right-6 w-14 h-14 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full shadow-xl flex items-center justify-center text-3xl font-light active:scale-95 transition-transform z-30"
      >
        +
      </button>

      {/* Bottom Sheet Modal */}
      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setShowModal(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl z-50 px-4 pt-4 pb-10 max-h-[92vh] overflow-y-auto">
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-6" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Buch hinzufügen</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Titel <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Buchtitel"
                  className="w-full h-11 px-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Autor <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  placeholder="Autor"
                  className="w-full h-11 px-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Genre
                </label>
                <input
                  type="text"
                  value={form.genre}
                  onChange={(e) => setForm({ ...form, genre: e.target.value })}
                  placeholder="z.B. Sachbuch, Roman …"
                  className="w-full h-11 px-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Gelesen am
                </label>
                <input
                  type="date"
                  value={form.dateRead}
                  onChange={(e) => setForm({ ...form, dateRead: e.target.value })}
                  className="w-full h-11 px-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Quelle
                </label>
                <select
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value as BookSource })}
                  className="w-full h-11 px-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
                >
                  <option value="MANUAL">Manuell</option>
                  <option value="KINDLE">Kindle</option>
                  <option value="GOODREADS">Goodreads</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl mt-2 disabled:opacity-50 active:scale-[0.98] transition-transform"
              >
                {submitting ? 'Speichern …' : 'Speichern'}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
