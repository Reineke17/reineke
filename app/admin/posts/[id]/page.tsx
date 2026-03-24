import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import Link from "next/link";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

async function updatePost(formData: FormData) {
  "use server";

  const postId = String(formData.get("postId") || "");
  const title = String(formData.get("title") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim();
  const bookId = String(formData.get("bookId") || "").trim();
  const globalOrder = Number(formData.get("globalOrder") || 0);
  const bookOrder = Number(formData.get("bookOrder") || 0);

  if (!postId || !title || !slug || !bookId) {
    return;
  }

  await prisma.post.update({
    where: { id: postId },
    data: {
      title,
      slug,
      excerpt: excerpt || null,
      bookId,
      globalOrder,
      bookOrder,
    },
  });

  redirect(`/admin/posts/${postId}`);
}

async function addMedia(formData: FormData) {
  "use server";

  const postId = String(formData.get("postId") || "");
  const type = String(formData.get("type") || "IMAGE");
  const caption = String(formData.get("caption") || "");
  const startOrder = Number(formData.get("order") || 0);

  if (!postId) {
    return;
  }

  const files = formData.getAll("files") as File[];

  const validFiles = files.filter((file) => file && file.size > 0);

  if (validFiles.length === 0) {
    return;
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  for (const [index, file] of validFiles.entries()) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeFileName = `${Date.now()}-${index}-${file.name.replace(/\s+/g, "-")}`;
    const filePath = path.join(uploadDir, safeFileName);

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${safeFileName}`;

    await prisma.media.create({
      data: {
        postId,
        type: type === "VIDEO" ? "VIDEO" : "IMAGE",
        url: fileUrl,
        caption: caption || null,
        order: startOrder + index,
      },
    });
  }

  redirect(`/admin/posts/${postId}`);
}

async function deleteMedia(formData: FormData) {
  "use server";

  const mediaId = String(formData.get("mediaId") || "");
  const postId = String(formData.get("postId") || "");

  if (!mediaId || !postId) {
    return;
  }

  const media = await prisma.media.findUnique({
    where: { id: mediaId },
  });

  if (media?.url?.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", media.url);
    try {
      await unlink(filePath);
    } catch {
      // ignore
    }
  }

  await prisma.media.delete({
    where: { id: mediaId },
  });

  redirect(`/admin/posts/${postId}`);
}

async function updatePostStatus(formData: FormData) {
  "use server";

  const postId = String(formData.get("postId") || "");
  const nextStatus = String(formData.get("nextStatus") || "");

  if (!postId || !nextStatus) {
    return;
  }

  await prisma.post.update({
    where: { id: postId },
    data: {
      status: nextStatus === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
      publishedAt: nextStatus === "PUBLISHED" ? new Date() : null,
    },
  });

  redirect(`/admin/posts/${postId}`);
}

async function deletePost(formData: FormData) {
  "use server";

  const postId = String(formData.get("postId") || "");

  if (!postId) {
    return;
  }

  const medias = await prisma.media.findMany({
    where: { postId },
  });

  for (const media of medias) {
    if (media.url.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", media.url);
      try {
        await unlink(filePath);
      } catch {
        // ignore
      }
    }
  }

  await prisma.post.delete({
    where: { id: postId },
  });

  redirect("/admin/posts");
}

async function updateMediaOrder(formData: FormData) {
  "use server";

  const postId = String(formData.get("postId") || "");
  const mediaId = String(formData.get("mediaId") || "");
  const order = Number(formData.get("order") || 0);

  if (!postId || !mediaId) {
    return;
  }

  await prisma.media.update({
    where: { id: mediaId },
    data: { order },
  });

  redirect(`/admin/posts/${postId}`);
}

export default async function PostAdminPage({ params }: Props) {
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      media: {
        orderBy: { order: "asc" },
      },
      book: true,
    },
  });

  if (!post) return notFound();

  const books = await prisma.book.findMany({
    orderBy: {
      title: "asc",
    },
  });

  const nextStatus = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

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

    
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{post.title}</h1>
        <p className="text-white/60 text-sm mt-1">Livre : {post.book.title}</p>
        <p className="text-white/60 text-sm">Statut : {post.status}</p>
        {post.publishedAt && (
          <p className="text-white/60 text-sm">
            Publication : {new Date(post.publishedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="mb-8 flex flex-wrap gap-4">
        <form action={updatePostStatus}>
          <input type="hidden" name="postId" value={post.id} />
          <input type="hidden" name="nextStatus" value={nextStatus} />
          <button
            type="submit"
            className="rounded-lg bg-white text-black px-4 py-3 font-medium hover:opacity-90 transition"
          >
            {post.status === "PUBLISHED" ? "Dépublier" : "Publier"}
          </button>
        </form>

        <form action={deletePost}>
          <input type="hidden" name="postId" value={post.id} />
          <button
            type="submit"
            className="rounded-lg border border-red-500/40 text-red-400 px-4 py-3 font-medium hover:bg-red-500/10 transition"
          >
            Supprimer le post
          </button>
        </form>
      </div>

      <div className="mb-10 max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Modifier le post</h2>

        <form action={updatePost} className="space-y-4">
          <input type="hidden" name="postId" value={post.id} />

          <div>
            <label className="block text-sm text-white/70 mb-1">Titre</label>
            <input
              name="title"
              type="text"
              defaultValue={post.title}
              className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-3 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Slug</label>
            <input
              name="slug"
              type="text"
              defaultValue={post.slug}
              className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-3 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Extrait</label>
            <textarea
              name="excerpt"
              defaultValue={post.excerpt ?? ""}
              className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-3 outline-none min-h-[120px]"
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Livre</label>
            <select
              name="bookId"
              defaultValue={post.bookId}
              className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-3 outline-none"
              required
            >
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">
              Ordre global
            </label>
            <input
              name="globalOrder"
              type="number"
              defaultValue={post.globalOrder}
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
              defaultValue={post.bookOrder}
              className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-3 outline-none"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-white text-black px-4 py-3 font-medium hover:opacity-90 transition"
          >
            Enregistrer les modifications
          </button>
        </form>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Médias existants</h2>

        <div className="space-y-4">
          {post.media.length === 0 && (
            <p className="text-white/60">Aucun média pour ce post.</p>
          )}

          {post.media.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <p className="text-sm text-white/70">Type : {m.type}</p>
              <p className="text-sm text-white/70">Ordre actuel : {m.order}</p>
              {m.caption && (
                <p className="text-sm text-white/70">Caption : {m.caption}</p>
              )}

              <div className="mt-3">
                {m.type === "IMAGE" ? (
                  <img
                    src={m.url}
                    alt={m.caption ?? ""}
                    className="max-h-64 rounded-lg"
                  />
                ) : (
                  <video
                    src={m.url}
                    controls
                    className="max-h-64 rounded-lg bg-black"
                  />
                )}
              </div>

              <p className="text-xs text-white/40 mt-2">{m.url}</p>

              <div className="mt-4 flex flex-wrap gap-4 items-end">
                <form action={updateMediaOrder} className="flex gap-2 items-end">
                  <input type="hidden" name="mediaId" value={m.id} />
                  <input type="hidden" name="postId" value={post.id} />

                  <div>
                    <label className="block text-sm text-white/70 mb-1">
                      Nouvel ordre
                    </label>
                    <input
                      name="order"
                      type="number"
                      defaultValue={m.order}
                      className="w-24 rounded-lg bg-white/10 border border-white/10 px-3 py-2 outline-none"
                    />
                  </div>

                  <button className="text-blue-400 text-sm hover:underline">
                    Mettre à jour
                  </button>
                </form>

                <form action={deleteMedia}>
                  <input type="hidden" name="mediaId" value={m.id} />
                  <input type="hidden" name="postId" value={post.id} />

                  <button className="text-red-400 text-sm hover:underline">
                    Supprimer
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-xl">
        <h2 className="text-xl font-semibold mb-4">Ajouter un média</h2>

        <form action={addMedia} className="space-y-4">
          <input type="hidden" name="postId" value={post.id} />

          <div>
            <label className="block text-sm text-white/70 mb-1">Type</label>
            <select
              name="type"
              className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-3 outline-none"
              defaultValue="IMAGE"
            >
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Vidéo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Fichier</label>
            <input
              name="files"
              type="file"
              accept="image/*,video/*"
              multiple
              className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-3 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Caption</label>
            <input
              name="caption"
              type="text"
              className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-3 outline-none"
              placeholder="Légende du média"
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Ordre</label>
            <input
              name="order"
              type="number"
              defaultValue={post.media.length + 1}
              className="w-full rounded-lg bg-white/10 border border-white/10 px-4 py-3 outline-none"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-white text-black px-4 py-3 font-medium hover:opacity-90 transition"
          >
            Uploader le média
          </button>
        </form>
      </div>
    </main>
  );
}