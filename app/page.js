"use client";

import { useState, useEffect } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { SpookyStoryCardSkeleton } from "@/app/_components/ui/SpookySkeleton";
import { useSession } from "next-auth/react";
import { Skull } from "lucide-react";
import { toast } from "sonner";

// Import professional components
import FilterButtons from "@/app/_components/main/FilterButtons";
import StoryCard from "@/app/_components/stories/StoryCard";
import Sidebar from "@/app/_components/main/Sidebar";
import LoadingIndicator from "@/app/_components/main/LoadingIndicator";

// Safe date formatting helper
const safeFormatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recently";
    return formatDistanceToNow(date) + " ago";
  } catch (error) {
    return "Recently";
  }
};

export default function MainPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const { data: session } = useSession();

  // Vote handler
  const handleVote = async (storyId, voteType) => {
    if (!session) {
      toast.error("Please sign in to vote");
      return;
    }

    try {
      const response = await fetch(`/api/v1/stories/${storyId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.userId,
          voteType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Vote recorded!");
      }
    } catch (error) {
      toast.error("Failed to vote");
    }
  };

  // Like handler
  const handleLike = async (storyId) => {
    if (!session) {
      toast.error("Please sign in to like stories");
      return;
    }

    try {
      const response = await fetch(`/api/v1/stories/${storyId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: session.user.userId }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
      }
    } catch (error) {
      toast.error("Failed to like story");
    }
  };

  // Bookmark handler
  const handleBookmark = async (storyId) => {
    if (!session) {
      toast.error("Please sign in to bookmark stories");
      return;
    }

    try {
      const response = await fetch(`/api/v1/stories/${storyId}/bookmark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: session.user.userId }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
      }
    } catch (error) {
      toast.error("Failed to bookmark story");
    }
  };

  // Fetch stories with React Query and infinite scroll
  const {
    data: storiesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: storiesLoading,
    error: storiesError,
  } = useInfiniteQuery({
    queryKey: ["stories", activeFilter],
    queryFn: async ({ pageParam = 1 }) => {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXTAUTH_URL ||
        "http://localhost:3000";
      const response = await fetch(
        `${baseUrl}/api/v1/stories?page=${pageParam}&limit=6&sort=${
          activeFilter === "trending"
            ? "-views,-likes"
            : activeFilter === "recent"
            ? "-createdAt"
            : activeFilter === "popular"
            ? "-likes,-views"
            : "-createdAt"
        }`
      );
      if (!response.ok) throw new Error("Failed to fetch stories");
      return response.json();
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.data.length === 6 ? pages.length + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch sidebar data
  const { data: trendingAuthors, isLoading: authorsLoading } = useQuery({
    queryKey: ["trending-authors"],
    queryFn: async () => {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXTAUTH_URL ||
        "http://localhost:3000";
      const response = await fetch(`${baseUrl}/api/v1/users/trending`);
      if (!response.ok) throw new Error("Failed to fetch trending authors");
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXTAUTH_URL ||
        "http://localhost:3000";
      const response = await fetch(`${baseUrl}/api/v1/categories`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXTAUTH_URL ||
        "http://localhost:3000";
      const response = await fetch(`${baseUrl}/api/v1/events`);
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXTAUTH_URL ||
        "http://localhost:3000";
      const response = await fetch(`${baseUrl}/api/v1/stats`);
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Flatten stories from all pages
  const stories = storiesData?.pages?.flatMap((page) => page.data) || [];

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop !==
          document.documentElement.offsetHeight ||
        isFetchingNextPage
      ) {
        return;
      }
      if (hasNextPage) {
        fetchNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filter Buttons */}
            <FilterButtons 
              activeFilter={activeFilter} 
              onFilterChange={setActiveFilter} 
            />

            {/* Stories Grid */}
            {storiesLoading ? (
              <div className="grid gap-6">
                {[...Array(6)].map((_, i) => (
                  <SpookyStoryCardSkeleton key={i} />
                ))}
              </div>
            ) : storiesError ? (
              <div className="text-center py-12">
                <Skull className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Failed to load stories. The darkness consumed them...
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {stories.map((story, index) => (
                  <StoryCard
                    key={`${story._id}-${index}`}
                    story={story}
                    onVote={handleVote}
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                  />
                ))}
              </div>
            )}

            {/* Loading more indicator */}
            {isFetchingNextPage && <LoadingIndicator />}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar
              trendingAuthors={trendingAuthors}
              categories={categories}
              events={events}
              authorsLoading={authorsLoading}
              categoriesLoading={categoriesLoading}
              eventsLoading={eventsLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
