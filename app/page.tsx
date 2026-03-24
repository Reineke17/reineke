import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ChapterSlider from "@/components/ChapterSlider";

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
    },
    include: {
      book: true,
      media: {
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: {
      publishedAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-[#fafafa] text-black">
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-black/10 bg-white/90 px-4 py-3 backdrop-blur">
        <h1 className="text-sm font-medium">Accueil</h1>

        <div className="flex gap-4 text-sm text-black/70">
          <Link href="/books" className="hover:underline">
            Livres
          </Link>
          <Link href="/admin" className="hover:underline">
            Admin
          </Link>
        </div>
      </div>

      {posts.length === 0 && (
        <div className="flex min-h-screen items-center justify-center px-6 text-center text-black/50">
          Aucun post publié.
        </div>
      )}

      <div className="mx-auto w-full max-w-[620px] py-4 md:px-6 md:py-6">
        {posts.map((post: (typeof posts)[number]) => {
          const slides = post.media.map((item: (typeof post.media)[number]) =>
            item.type === "IMAGE"
              ? {
                  type: "image" as const,
                  src: item.url,
                  alt: item.caption ?? post.title,
                  caption: item.caption ?? undefined,
                }
              : {
                  type: "video" as const,
                  src: item.url,
                  caption: item.caption ?? undefined,
                }
          );

          return (
            <section
              key={post.id}
              className="
                mb-6 overflow-hidden border border-black/10 bg-white
                rounded-none border-x-0
                md:mb-8 md:rounded-[28px] md:border-x md:shadow-[0_1px_2px_rgba(0,0,0,0.04)]
              "
            >
              <div className="px-4 pt-4 md:px-6 md:pt-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {post.book.coverImageUrl ? (
                      <img
                        src={post.book.coverImageUrl}
                        alt={post.book.title}
                        className="h-12 w-12 rounded-full object-cover border border-black/10 shrink-0"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-black/10 bg-black/5 text-sm font-semibold text-black/70">
                        {post.book.title.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <Link
                        href={`/books/${post.book.slug}`}
                        className="block truncate text-sm text-black/55 hover:underline"
                      >
                        {post.book.title}
                      </Link>

                      <h2 className="truncate text-2xl font-semibold">
                        {post.title}
                      </h2>
                    </div>
                  </div>

                  {post.publishedAt && (
                    <span className="shrink-0 text-sm text-black/45">
                      {new Date(post.publishedAt).toLocaleDateString("fr-FR")}
                    </span>
                  )}
                </div>
              </div>

              <ChapterSlider title={post.title} slides={slides} />

              <div className="px-4 pb-5 pt-2 md:px-6">
                {post.excerpt && (
                  <p className="mb-3 text-sm text-black/65">
                    {post.excerpt}
                  </p>
                )}

                <Link
                  href={`/posts/${post.slug}`}
                  className="text-sm text-black/60 hover:underline"
                >
                  Ouvrir le post
                </Link>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}