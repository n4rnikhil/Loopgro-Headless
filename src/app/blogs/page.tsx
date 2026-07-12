import Image from "next/image";
import Link from "next/link";
import { getBlogPosts } from "@/lib/sheets";

export const metadata = {
  title: "Blog | Loopgro Store",
  description: "Read our latest articles about snowboard tuning, choosing the right flex, and ski destinations.",
};

export default async function BlogsPage() {
  const posts = await getBlogPosts();

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
          THE LOOPGRO JOURNAL
        </h1>
        <p className="mt-4 text-base text-color-secondary max-w-2xl mx-auto">
          Articles, guides, and expert advice for snowboarding, mountain life, and winter sports.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border-primary rounded-2xl">
          <p className="text-color-secondary">No blog posts available at the moment. Keep an eye out for updates.</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, idx) => (
            <article 
              key={idx} 
              className="group flex flex-col overflow-hidden rounded-xl border border-solid border-border-primary bg-background-secondary transition-all hover:-translate-y-1 hover:border-[#3E3E3E] hover:shadow-lg"
            >
              {/* Image Container */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-background-tertiary">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority={idx < 3}
                />
              </div>

              {/* Text Content */}
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-3 text-xs text-color-secondary mb-3">
                  <span>{post.date}</span>
                  <span className="h-1 w-1 rounded-full bg-[#3E3E3E]" />
                  <span>By {post.author}</span>
                </div>

                <h2 className="text-lg font-bold text-white line-clamp-2 leading-snug group-hover:text-gray-300 transition-colors mb-3">
                  {post.title}
                </h2>

                <p className="text-sm text-color-secondary line-clamp-3 leading-relaxed mb-6">
                  {post.excerpt}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-border-primary pt-4 text-xs font-semibold text-white">
                  <span className="underline underline-offset-4 group-hover:text-gray-300">
                    Read Article
                  </span>
                  <span className="text-color-secondary font-normal">5 min read</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
