import { prisma } from "../lib/prisma";

async function main() {
  // Nettoyer la base
  await prisma.media.deleteMany();
  await prisma.post.deleteMany();
  await prisma.book.deleteMany();

  // Créer des livres
  const news = await prisma.book.create({
    data: {
      title: "News",
      slug: "news",
    },
  });

  const roman = await prisma.book.create({
    data: {
      title: "Roman A",
      slug: "roman-a",
    },
  });

  // Créer un post
  const post1 = await prisma.post.create({
    data: {
      title: "Premier post",
      slug: "premier-post",
      status: "PUBLISHED",
      publishedAt: new Date(),
      bookId: news.id,
      globalOrder: 1,
      bookOrder: 1,
    },
  });

  // Ajouter des médias
  await prisma.media.createMany({
    data: [
      {
        postId: post1.id,
        type: "IMAGE",
        url: "/image1.jpg",
        caption: "Première image",
        order: 1,
      },
      {
        postId: post1.id,
        type: "IMAGE",
        url: "/image2.jpg",
        caption: "Deuxième image",
        order: 2,
      },
      {
        postId: post1.id,
        type: "VIDEO",
        url: "/video1.mp4",
        caption: "Une vidéo",
        order: 3,
      },
    ],
  });

  console.log("Seed terminé");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });