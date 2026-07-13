"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { fallbackBlogs, parseCSV, type BlogPost } from "@/lib/sheets";

export default function BlogsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    document.title = "Blog | Loopgro Store";

    const fetchBlogs = async () => {
      const sheetId = process.env.NEXT_PUBLIC_BLOGS_SHEET_ID;
      if (!sheetId) {
        setPosts(fallbackBlogs);
        setLoading(false);
        return;
      }

      const baseUrl = sheetId.startsWith("https://")
        ? sheetId
        : `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;

      const url = baseUrl + (baseUrl.includes("?") ? "&" : "?") + `t=${Date.now()}`;

      try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch blogs from Google Sheets");
        const text = await response.text();
        const rows = parseCSV(text);

        if (rows.length <= 1) {
          setPosts(fallbackBlogs);
        } else {
          const parsed = rows.slice(1).map((row) => ({
            title: row[0] || "Untitled Post",
            author: row[1] || "Anonymous",
            date: row[2] || "Recently",
            excerpt: row[3] || "",
            content: row[4] || "",
            image: row[5] || "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800",
          }));
          setPosts(parsed);
        }
      } catch (error) {
        console.error("Failed to fetch blogs, using fallback:", error);
        setPosts(fallbackBlogs);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedPost) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedPost]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
      </div>
    );
  }

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
              onClick={() => setSelectedPost(post)}
              className="group flex flex-col overflow-hidden rounded-xl border border-solid border-border-primary bg-background-secondary transition-all hover:-translate-y-1 hover:border-[#3E3E3E] hover:shadow-lg cursor-pointer"
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

      {/* Modal Overlay for Reading Article */}
      {selectedPost && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-opacity animate-in fade-in duration-200"
          onClick={() => setSelectedPost(null)}
        >
          <div 
            className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl border border-solid border-border-primary bg-background-secondary p-6 md:p-10 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              className="absolute top-4 right-4 rounded-full bg-background-primary border border-border-primary p-2 text-color-secondary hover:text-white transition-all"
              onClick={() => setSelectedPost(null)}
              aria-label="Close modal"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 text-xs text-color-secondary mb-4">
              <span>{selectedPost.date}</span>
              <span className="h-1 w-1 rounded-full bg-[#3E3E3E]" />
              <span>By {selectedPost.author}</span>
            </div>

            {/* Modal Title */}
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-6 uppercase tracking-tight leading-tight">
              {selectedPost.title}
            </h2>

            {/* Modal Image */}
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-background-tertiary mb-8">
              <Image
                src={selectedPost.image}
                alt={selectedPost.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Modal Content */}
            <div className="text-color-secondary text-base leading-relaxed space-y-6 whitespace-pre-line">
              {selectedPost.content}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
