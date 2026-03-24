import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

async function updateBook(formData: FormData) {
  "use server";

  const bookId = String(formData.get("bookId") || "");
  const title = String(formData.get("title") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const file = formData.get("cover") as File | null;

  if (!bookId || !title || !slug) {
    return;
  }

  const existingBook = await prisma.book.findUnique({
    where: { id: bookId },
  });

  if (!existingBook) {
    return;
  }

  let coverImageUrl = existingBook.coverImageUrl;

  if (file && file.size > 0) {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeFileName = `${Date.now()}-book-${file.name.replace(/\s+/g, "-")}`;
    const filePath = path.join(uploadDir, safeFileName);

    await writeFile(filePath, buffer);

    if (existingBook.coverImageUrl?.startsWith("/uploads/")) {
      const oldPath = path.join(process.cwd(), "public", existingBook.coverImageUrl);
      try {
        await unlink(oldPath);
      } catch {
        // ignore
      }
    }

    coverImageUrl = `/uploads/${safeFileName}`;
  }

  await prisma.book.update({
    where: { id: bookId },
    data: {
      title,
      slug,
      description: description || null,
      coverImageUrl,
    },
  });

  redirect(`/admin/books/${bookId}`);
}

async function removeBookCover(formData: FormData) {
  "use server";

  const bookId = String(formData.get("bookId") || "");

  if (!bookId) {
    return;
  }

  const book = await prisma.book.findUnique({
    where: { id: bookId },
  });

  if (!book) {
    return;
  }

  if (book.coverImageUrl?.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", book.coverImageUrl);
    try {
      await unlink(filePath);
    } catch {
      // ignore
    }
  }

  await prisma.book.update({
    where: { id: bookId },
    data: {
      coverImageUrl: null,
    },
  });

  redirect(`/admin/books/${bookId}`);
}

async function deleteBook(formData: FormData) {
  "use server";

  const bookId = String(formData.get("bookId") || "");

  if (!bookId) {
    return;
  }

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: {
      posts: {
        include: {
          media: true,
        },
      },
    },
  });

  if (!book) {
    return;
  }

  if (book.coverImageUrl?.startsWith("/uploads/")) {
    const coverPath = path.join(process.cwd(), "public", book.coverImageUrl);
    try {
      await unlink(coverPath);
    } catch {
      // ignore
    }
  }

  for (const post of book.posts) {
    for (const media of post.media) {
      if (media.url.startsWith("/uploads/")) {
        const mediaPath = path.join(process.cwd(), "public", media.url);
        try {
          await unlink(mediaPath);
        } catch {
          // ignore
        }
      }
    }
  }

  await prisma.book.delete({
    where: { id: bookId },
  });

  redirect("/admin/books");
}

export default async function AdminBookEditPage({ params }: Props) {
  const { id } = await params;

  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      posts: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!book) return notFound();

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

      <div className="mb-8 flex items-center gap-4">
        {book.coverImageUrl ? (
          <img
            src={book.coverImageUrl}
            alt={book.title}
            className="h-20 w-20 rounded-full object-cover border border-black/10"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-black/10 bg-black/5 text-xl font-semibold text-black/70">
            {book.title.charAt(0).toUpperCase()}
          </div>
        )}

        <div>
          <h1 className="text-3xl font-bold">{book.title}</h1>
          <p className="text-sm text-black/60">slug : {book.slug}</p>
          <p className="text-sm text-black/60">
            {book.posts.length} post{book.posts.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="mb-10 max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Modifier le livre</h2>

        <form action={updateBook} className="space-y-4">
          <input type="hidden" name="bookId" value={book.id} />

          <div>
            <label className="block text-sm text-black/70 mb-1">Titre</label>
            <input
              name="title"
              type="text"
              defaultValue={book.title}
              className="w-full rounded-lg bg-black/[0.04] border border-black/10 px-4 py-3 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-black/70 mb-1">Slug</label>
            <input
              name="slug"
              type="text"
              defaultValue={book.slug}
              className="w-full rounded-lg bg-black/[0.04] border border-black/10 px-4 py-3 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-black/70 mb-1">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={book.description ?? ""}
              className="w-full rounded-lg bg-black/[0.04] border border-black/10 px-4 py-3 outline-none min-h-[120px]"
            />
          </div>

          <div>
            <label className="block text-sm text-black/70 mb-1">
              Nouvelle vignette
            </label>
            <input
              name="cover"
              type="file"
              accept="image/*"
              className="w-full rounded-lg bg-black/[0.04] border border-black/10 px-4 py-3 outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              type="submit"
              className="rounded-lg bg-black text-white px-4 py-3 font-medium hover:opacity-90 transition"
            >
              Enregistrer les modifications
            </button>
          </div>
        </form>

        {book.coverImageUrl && (
          <form action={removeBookCover} className="mt-4">
            <input type="hidden" name="bookId" value={book.id} />
            <button
              type="submit"
              className="text-red-500 text-sm hover:underline"
            >
              Supprimer la vignette
            </button>
          </form>
        )}
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Posts liés</h2>

        <div className="space-y-3">
          {book.posts.length === 0 && (
            <p className="text-black/50">Aucun post dans ce livre.</p>
          )}

          {book.posts.map((post: any) => (
            <div
              key={post.id}
              className="rounded-xl border border-black/10 bg-white p-4"
            >
              <p className="font-semibold">{post.title}</p>
              <p className="text-sm text-black/60">slug : {post.slug}</p>
              <p className="text-sm text-black/60">statut : {post.status}</p>

              <div className="mt-2">
                <Link
                  href={`/admin/posts/${post.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Éditer le post
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-red-600">Danger zone</h2>

        <form action={deleteBook}>
          <input type="hidden" name="bookId" value={book.id} />
          <button
            type="submit"
            className="rounded-lg border border-red-500/30 px-4 py-3 text-red-600 hover:bg-red-50 transition"
          >
            Supprimer le livre
          </button>
        </form>
      </div>
    </main>
  );
}