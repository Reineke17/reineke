import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BookReaderFeed from "@/components/BookReaderFeed";

type Props = {
  params: Promise<{
    slug: string;
    postSlug: string;
  }>;
};

export default async function BookReaderPage({ params }: Props) {
  const { slug, postSlug } = await params;

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
        orderBy: [{ bookOrder: "asc" }, { publishedAt: "asc" }],
      },
    },
  });

  if (!book) return notFound();

  const targetPost = book.posts.find(
    (post: (typeof book.posts)[number]) => post.slug === postSlug
  );

  if (!targetPost) return notFound();

  const posts = book.posts.map((post: (typeof book.posts)[number]) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
    slides: post.media.map((item: (typeof post.media)[number]) =>
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
    ),
  }));

  return (
    <BookReaderFeed
      bookTitle={book.title}
      bookSlug={book.slug}
      initialPostSlug={postSlug}
      posts={posts}
    />
  );
}