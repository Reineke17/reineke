import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    include: {
      book: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-black text-white p-6">
        <div className="mb-6">
            <Link
                href="/admin"
                className="text-sm text-white/60 hover:underline"
            >
                ← Retour admin
            </Link>
        </div>
      <h1 className="text-3xl font-bold mb-6">Posts</h1>

      <div className="space-y-4">
        {posts.map((post: any) => (
          <div
            key={post.id}
            className="p-4 rounded-xl border border-white/10 bg-white/5"
          >
            <p className="text-lg font-semibold">{post.title}</p>

            <p className="text-sm text-white/60">
              Livre : {post.book.title}
            </p>

            <p className="text-sm text-white/60 mb-2">
              Statut : {post.status}
            </p>

            <div className="flex gap-4 text-sm">
              <Link
                href={`/posts/${post.slug}`}
                className="text-blue-400 hover:underline"
              >
                Voir
              </Link>

              <Link
                href={`/admin/posts/${post.id}`}
                className="text-yellow-400 hover:underline"
              >
                Éditer
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}