import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function BookPage({ params }: Props) {
  const { slug } = await params;

  const book = await prisma.book.findUnique({
    where: { slug },
    include: {
      posts: {
        where: {
          status: "PUBLISHED",
        },
        include: {
          media: {
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: [
          { bookOrder: "asc" },
          { publishedAt: "asc" },
        ],
      },
    },
  });

  if (!book) return notFound();

  return (
    <main className="min-h-screen bg-[#fafafa] text-black">
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-black/10 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3 min-w-0">
          {book.coverImageUrl ? (
            <img
              src={book.coverImageUrl}
              alt={book.title}
              className="h-10 w-10 rounded-full object-cover border border-black/10 shrink-0"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-black/5 text-sm font-semibold text-black/70">
              {book.title.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{book.title}</p>
            <p className="truncate text-xs text-black/50">
              {book.posts.length} chapitre{book.posts.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <Link
          href="/books"
          className="text-sm text-black/60 hover:underline shrink-0"
        >
          Retour
        </Link>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {book.description && (
          <p className="mb-6 max-w-2xl text-sm text-black/65">
            {book.description}
          </p>
        )}

        {book.posts.length === 0 ? (
          <p className="text-black/50">Aucun chapitre publié.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {book.posts.map((post: (typeof book.posts)[number], index: number) => {
              const cover = post.media[0];

              return (
                <Link
                  key={post.id}
                  href={`/books/${book.slug}/${post.slug}`}
                  className="group overflow-hidden rounded-3xl border border-black/10 bg-white transition hover:bg-black/[0.02]"
                >
                  <div className="aspect-square w-full overflow-hidden bg-[#f5f5f5]">
                    {cover?.type === "IMAGE" ? (
                      <img
                        src={cover.url}
                        alt={cover.alt ?? post.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    ) : cover?.type === "VIDEO" ? (
                      <video
                        src={cover.url}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-black/40">
                        Aucun visuel
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <p className="text-xs text-black/45 mb-1">
                      Chapitre {index + 1}
                    </p>
                    <p className="line-clamp-2 text-sm font-medium">
                      {post.title}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}