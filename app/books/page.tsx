import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function BooksPage() {
  const books = await prisma.book.findMany({
    include: {
      posts: {
        where: {
          status: "PUBLISHED",
        },
      },
    },
    orderBy: {
      title: "asc",
    },
  });

  return (
    <main className="min-h-screen bg-[#fafafa] text-black p-6">
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm text-black/60 hover:underline"
        >
          ← Retour à l’accueil
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Livres</h1>

      <div className="grid gap-6">
        {books.map((book) => (
          <Link
            key={book.id}
            href={`/books/${book.slug}`}
            className="block rounded-2xl overflow-hidden border border-black/10 bg-white p-5 hover:bg-black/[0.02] transition"
          >
            <div className="flex items-center gap-4">
              {book.coverImageUrl ? (
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  className="h-16 w-16 rounded-full object-cover border border-black/10"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-black/10 bg-black/5 text-base font-semibold text-black/70">
                  {book.title.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <p className="text-xl font-semibold">{book.title}</p>

                {book.description && (
                  <p className="text-sm text-black/70 mt-1">
                    {book.description}
                  </p>
                )}

                <p className="text-sm text-black/50 mt-2">
                  {book.posts.length} post{book.posts.length > 1 ? "s" : ""} publié
                  {book.posts.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}