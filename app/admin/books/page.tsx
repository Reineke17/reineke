import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminBooksPage() {
  const books = await prisma.book.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-white text-black p-6">
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-sm text-black/60 hover:underline"
        >
          ← Retour admin
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Livres</h1>

      <div className="space-y-4">
        {books.map((book) => (
          <div
            key={book.id}
            className="p-4 rounded-xl border border-black/10 bg-white"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {book.coverImageUrl ? (
                  <img
                    src={book.coverImageUrl}
                    alt={book.title}
                    className="h-14 w-14 rounded-full object-cover border border-black/10"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-black/5 text-sm font-semibold text-black/70">
                    {book.title.charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <p className="text-lg font-semibold">{book.title}</p>
                  <p className="text-sm text-black/60">slug : {book.slug}</p>
                </div>
              </div>

              <div className="flex gap-4 text-sm">
                <Link
                  href={`/books/${book.slug}`}
                  className="text-blue-600 hover:underline"
                >
                  Voir
                </Link>

                <Link
                  href={`/admin/books/${book.id}`}
                  className="text-yellow-600 hover:underline"
                >
                  Éditer
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}