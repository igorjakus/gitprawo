import Image from "next/image";

export default function Home() {
  const articles = [
    { id: 1, title: "Artykul 1", link: "/posts/post-1" },
    { id: 2, title: "Artykul 2", link: "/posts/post-2" },
    { id: 3, title: "Artykul 3", link: "/posts/post-3" },
    { id: 4, title: "Artykul 4", link: "/posts/post-4" },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-start py-16 px-16 bg-white dark:bg-black sm:items-start">
        <h2 className="text-3xl font-bold mb-6">GitPrawo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((post) => (
            <a
              key={post.id}
              href={post.link}
              className="block p-6 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-2xl font-semibold">{post.title}</h3>
              <p className="text-base text-gray-500">
                Read more about {post.title}.
              </p>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
