import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";

async function createBook(formData: FormData) {
  "use server";

  const title = String(formData.get("title") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const file = formData.get("cover") as File | null;

  if (!title || !slug) {
    return;
  }

  const existingBook = await prisma.book.findUnique({
    where: { slug },
  });

  if (existingBook) {
    throw new Error("Ce slug existe déjà. Choisis-en un autre.");
  }

  let coverImageUrl: string | null = null;

  if (file && file.size > 0) {
    const safeFileName = `${Date.now()}-book-${file.name.replace(/\s+/g, "-")}`;

    const blob = await put(`uploads/${safeFileName}`, file, {
      access: "public",
    });

    coverImageUrl = blob.url;
  }

  await prisma.book.create({
    data: {
      title,
      slug,
      description: description || null,
      coverImageUrl,
    },
  });

  revalidatePath("/admin/books");
  revalidatePath("/books");
  revalidatePath("/");

  redirect("/admin/books");
}

export default function NewBookPage() {
  return (
    <main className="min-h-screen bg-white text-black p-6">
      <div className="mb-6">
        <Link
          href="/admin/books"
          className="text-sm text-black/60 hover:underline"
        >
          ← Retour aux livres
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Créer un livre</h1>

      <form action={createBook} className="max-w-xl space-y-4">
        <div>
          <label className="block text-sm text-black/70 mb-1">Titre</label>
          <input
            name="title"
            type="text"
            className="w-full rounded-lg bg-black/[0.04] border border-black/10 px-4 py-3 outline-none"
            placeholder="Ex: Recommandations"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-black/70 mb-1">Slug</label>
          <input
            name="slug"
            type="text"
            className="w-full rounded-lg bg-black/[0.04] border border-black/10 px-4 py-3 outline-none"
            placeholder="Ex: recommandations"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-black/70 mb-1">
            Description
          </label>
          <textarea
            name="description"
            className="w-full rounded-lg bg-black/[0.04] border border-black/10 px-4 py-3 outline-none min-h-[120px]"
            placeholder="Description du livre"
          />
        </div>

        <div>
          <label className="block text-sm text-black/70 mb-1">
            Image de couverture / vignette
          </label>
          <input
            name="cover"
            type="file"
            accept="image/*"
            className="w-full rounded-lg bg-black/[0.04] border border-black/10 px-4 py-3 outline-none"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-black text-white px-4 py-3 font-medium hover:opacity-90 transition"
        >
          Enregistrer le livre
        </button>
      </form>
    </main>
  );
}