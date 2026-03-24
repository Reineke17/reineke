import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ChapterSlider from "@/components/ChapterSlider";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PostPage({ params }: Props) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      media: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const slides = post.media.map((item: (typeof post.media)[number]) =>
    item.type === "IMAGE"
      ? {
          type: "image" as const,
          src: item.url,
          alt: item.alt ?? "",
          caption: item.caption ?? undefined,
        }
      : {
          type: "video" as const,
          src: item.url,
          caption: item.caption ?? undefined,
        }
  );

  return (
    <main className="bg-black">
      <ChapterSlider title={post.title} slides={slides} />
    </main>
  );
}