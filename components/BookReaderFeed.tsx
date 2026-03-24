"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import ChapterSlider from "@/components/ChapterSlider";

type Slide =
  | {
      type: "image";
      src: string;
      alt: string;
      caption?: string;
    }
  | {
      type: "video";
      src: string;
      caption?: string;
    };

type ReaderPost = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  publishedAt?: string | null;
  slides: Slide[];
};

type BookReaderFeedProps = {
  bookTitle: string;
  bookSlug: string;
  initialPostSlug: string;
  posts: ReaderPost[];
};

export default function BookReaderFeed({
  bookTitle,
  bookSlug,
  initialPostSlug,
  posts,
}: BookReaderFeedProps) {
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const target = refs.current[initialPostSlug];
    if (!target) return;

    requestAnimationFrame(() => {
      target.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
    });
  }, [initialPostSlug]);

  return (
    <main className="min-h-screen bg-[#fafafa] text-black">
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-black/10 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="min-w-0">
          <p className="truncate text-sm text-black/55">{bookTitle}</p>
          <p className="truncate text-sm font-medium">Lecture</p>
        </div>

        <div className="flex gap-4 text-sm text-black/70 shrink-0">
          <Link href={`/books/${bookSlug}`} className="hover:underline">
            Chapitres
          </Link>
          <Link href="/" className="hover:underline">
            Accueil
          </Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[820px] py-4 md:px-6 md:py-6">
        {posts.map((post, index) => (
          <section
            key={post.id}
            ref={(el: HTMLDivElement | null) => {
              refs.current[post.slug] = el;
            }}
            className="
              mb-6 overflow-hidden border border-black/10 bg-white
              rounded-none border-x-0
              md:mb-8 md:rounded-[28px] md:border-x md:shadow-[0_1px_2px_rgba(0,0,0,0.04)]
            "
          >
            <div className="px-4 pt-4 md:px-6 md:pt-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-black/55">
                    Chapitre {index + 1}
                  </p>
                  <h2 className="truncate text-2xl font-semibold">
                    {post.title}
                  </h2>
                </div>

                {post.publishedAt && (
                  <span className="shrink-0 text-sm text-black/45">
                    {new Date(post.publishedAt).toLocaleDateString("fr-FR")}
                  </span>
                )}
              </div>
            </div>

            <ChapterSlider title={post.title} slides={post.slides} />

            <div className="px-4 pb-5 pt-2 md:px-6">
              {post.excerpt && (
                <p className="mb-3 text-sm text-black/65">{post.excerpt}</p>
              )}

              <div className="flex gap-4 text-sm text-black/60">
                <Link href={`/books/${bookSlug}`} className="hover:underline">
                  Retour au livre
                </Link>

                <Link href={`/posts/${post.slug}`} className="hover:underline">
                  Ouvrir seul
                </Link>
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}