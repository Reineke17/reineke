import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Admin</h1>

      <div className="grid gap-4 max-w-xl">

        <Link
          href="/admin/books"
          className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
        >
          Voir les livres
        </Link>

        <Link
          href="/admin/posts"
          className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
        >
          Voir les posts
        </Link>

        <Link
          href="/admin/books/new"
          className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
        >
          Créer un livre
        </Link>

        <Link
          href="/admin/posts/new"
          className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
        >
          Créer un post
        </Link>

      </div>
    </main>
  );
}