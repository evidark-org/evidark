import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { Pen } from "lucide-react";
import { Lora, Merriweather, Roboto_Slab } from "next/font/google";
import Link from "next/link";
import React from "react";

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const crimsonText = Roboto_Slab({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const merriweather = Roboto_Slab({
  subsets: ["latin"], // Choose subsets
  weight: ["300", "400", "500", "600", "700", "800", "900"], // Optional: specific weights
  variable: "--font-inter", // Optional: for CSS variables
});

const fetchStoryData = async (slug) => {
  if (!slug) return null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/stories/slug/${slug}`,
      { cache: "no-store" } // disable caching
    );

    if (!res.ok) {
      console.error("Fetch failed:", res.status, res.statusText);
      return null;
    }

    const story = await res.json();
    return story || null;
  } catch (error) {
    console.error("Error fetching story:", error);
    return null;
  }
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const story = await fetchStoryData(slug);

  if (!story) {
    return {
      title: "Not Found",
      description: "The story you are looking for does not exist.",
    };
  }

  return {
    title: `${story.title} - My Story`,
    description: story.description,
    openGraph: {
      title: story.title,
      description: story.description,
      images:
        story.media?.length > 0
          ? story.media.map((m) => ({ url: m.url }))
          : [{ url: "/default-story.png" }],
      url: `${process.env.HOSTNAME}/story/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description: story.description,
      images:
        story.media?.length > 0
          ? story.media.map((m) => m.url)
          : ["/default-story.png"],
    },
  };
}

const Page = async ({ params }) => {
  const { slug } = await params;
  const story = await fetchStoryData(slug);
  console.log(story);

  if (!story) {
    return (
      <div className="mt-44 text-center text-red-600">Story not found.</div>
    );
  }

  return (
    <div className="mt-6 flex flex-col items-center p-1">
      <div className="w-full max-w-[860px] flex flex-col items-center">
        <div className="min-h-screen  ">
          {/* Title & Author */}
          <header className="mb-4 border-b  pb-6">
            <p className="font-medium text-red-800 mb-4">EVIDARK ORIGINALS</p>
            <h1 className="text-6xl font-bold tracking-tight">{story.title}</h1>
            {/* <div className="flex items-center gap-3 mt-4 ">
              <img
                src={story.author.photo || "/default-avatar.png"}
                alt={story.author.name}
                width={42}
                height={42}
                className="rounded-full"
              />
              <div className="text-sm">
                <p className="font-semibold">{story.author.name}</p>
                <p className="">@{story.author.username}</p>
              </div>
            </div> */}

            <p className="mt-3 ">{story.description}</p>
          </header>

          {/* Main Content */}
          <article
            className={`${merriweather.className} prose prose-invert prose-lg max-w-none leading-relaxed text-lg  mb-12 `}
            dangerouslySetInnerHTML={{ __html: story.content }}
          />

          {/* Categories & Tags */}
          <section className="flex flex-wrap gap-2 mb-12">
            {story.categories.map((cat) => (
              <span
                key={cat._id}
                className="px-3 py-1 bg-gray-800 rounded-full text-xs tracking-wide uppercase"
              >
                {cat.name}
              </span>
            ))}
            {story.tags.map((tag) => (
              <span key={tag._id} className="px-3 py-1 rounded-full text-xs">
                #{tag.name}
              </span>
            ))}
          </section>

          {/* Media Evidence */}
          {story.media.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Evidence</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {story.media.map((m) => (
                  <div
                    key={m._id}
                    className="overflow-hidden rounded-lg border border-gray-800 shadow-lg"
                  >
                    <img
                      src={m.url}
                      alt={m.type}
                      width={600}
                      height={400}
                      className="object-cover w-full h-64 hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
