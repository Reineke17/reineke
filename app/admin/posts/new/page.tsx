import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

async function createPost(formData: FormData) {
  "use server";

  const title = String(formData.get("title") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim();
  const status = String(formData.get("status") || "DRAFT");
  const bookId = String(formData.get("bookId") || "").trim();
  const globalOrder = Number(formData.get("globalOrder") || 0);
  const bookOrder = Number(formData.get("bookOrder") || 0);

  if (!title || !slug || !bookId) {
    return;
  }

  await prisma.post.create({
    data: {
      title,
      slug,
      excerpt: excerpt || null,
      status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      bookId,
      globalOrder,
      bookOrder,
    },
  });

  redirect("/admin");
}

export default async function NewPostPage() {
  const books = await prisma.book.findMany({
    orderBy: {
      title: "asc",
    },
  });

  return (
    <main className="min-h-screen bg-black text-white p-6">
      
      <div className="mb-6">
        <Link
          href="/admin/posts"
          className="text-sm text-white/60 hover:underline"
        >
          ← Retour aux posts
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-6">Créer un post</h1>

      <form action={createPost} className="max-w-xl space-y-4">
        <div>
          <label className="block text-sm text-white/70 mb-1">Titre</label>
          <input
            name="title"
            type="text"
            className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-3 outline-none"
            placeholder="Ex: Mon nouveau post"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-1">Slug</label>
          <input
            name="slug"
            type="text"
            className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-3 outline-none"
            placeholder="Ex: mon-nouveau-post"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-1">Extrait</label>
          <textarea
            name="excerpt"
            className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-3 outline-none min-h-[120px]"
            placeholder="Petit résumé"
          />
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-1">Livre</label>
          <select
            name="bookId"
            className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-3 outline-none"
            required
          >
            <option value="">Choisir un livre</option>
            {books.map((book: any) => (
              <option key={book.id} value={book.id}>
                {book.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-1">Statut</label>
          <select
            name="status"
            className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-3 outline-none"
            defaultValue="DRAFT"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-1">
            Ordre global
          </label>
          <input
            name="globalOrder"
            type="number"
            defaultValue={0}
            className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-1">
            Ordre dans le livre
          </label>
          <input
            name="bookOrder"
            type="number"
            defaultValue={0}
            className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-3 outline-none"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-white text-black px-4 py-3 font-medium hover:opacity-90 transition"
        >
          Enregistrer le post
        </button>
      </form>
    </main>
  );
}