"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Ghost, Skull } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Comment from "./Comment";

export default function CommentSection({ storyId }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [storyId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/stories/${storyId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!session) {
      toast.error("Please sign in to comment");
      return;
    }
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/v1/stories/${storyId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment,
          userId: session.user.userId,
        }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([comment, ...comments]);
        setNewComment("");
        toast.success("Comment added to the darkness!");
      } else {
        toast.error("Failed to add comment");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!session) {
      toast.error("Please sign in to like comments");
      return;
    }

    try {
      const response = await fetch(`/api/v1/comments/${commentId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: session.user.userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments(
          comments.map((comment) =>
            comment._id === commentId
              ? { ...comment, likes: data.likes, isLiked: data.isLiked }
              : comment
          )
        );
      }
    } catch (error) {
      toast.error("Failed to like comment");
    }
  };

  const handleReplyToComment = async (parentId, content) => {
    if (!session) {
      toast.error("Please sign in to reply");
      return;
    }

    try {
      const response = await fetch(`/api/v1/stories/${storyId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          userId: session.user.userId,
          parentId,
        }),
      });

      if (response.ok) {
        const reply = await response.json();
        setComments(
          comments.map((comment) =>
            comment._id === parentId
              ? { ...comment, replies: [...(comment.replies || []), reply] }
              : comment
          )
        );
        toast.success("Reply added!");
      } else {
        toast.error("Failed to add reply");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleEditComment = async (commentId, content) => {
    if (!session) {
      toast.error("Please sign in to edit comments");
      return;
    }

    try {
      const response = await fetch(`/api/v1/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          userId: session.user.userId,
        }),
      });

      if (response.ok) {
        const updatedComment = await response.json();
        setComments(
          comments.map((comment) =>
            comment._id === commentId
              ? { ...comment, content: updatedComment.content }
              : comment
          )
        );
        toast.success("Comment updated!");
      } else {
        toast.error("Failed to update comment");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!session) {
      toast.error("Please sign in to delete comments");
      return;
    }

    setCommentToDelete(commentId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!commentToDelete) return;

    try {
      const response = await fetch(`/api/v1/comments/${commentToDelete}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.userId,
        }),
      });

      if (response.ok) {
        // Remove the comment and its replies from the state
        setComments(comments.filter((c) => c._id !== commentToDelete));
        toast.success("Comment has vanished into the void!");
      } else {
        toast.error("Failed to delete comment");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    }
  };

  return (
    <>
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Dark Whispers ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Comment Form */}
          {session ? (
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8 border border-border/50">
                  <AvatarImage
                    src={session.user.image}
                    alt={session.user.name}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-700 text-white text-sm">
                    {session.user.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Share your thoughts on this dark tale..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[100px] bg-background/50 border-border/50 focus:border-primary/50 resize-none"
                    disabled={submitting}
                  />
                  <div className="flex justify-between items-center mt-3">
                    <div className="text-xs text-muted-foreground">
                      Speak your mind, but remember... the darkness is listening
                    </div>
                    <Button
                      type="submit"
                      disabled={!newComment.trim() || submitting}
                      className="spooky-glow"
                    >
                      {submitting ? "Whispering..." : "Whisper into the Void"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <Card className="bg-background/30 border-border/50">
              <CardContent className="p-6 text-center">
                <Ghost className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Join the darkness to share your thoughts
                </p>
                <Button asChild className="spooky-glow">
                  <a href="/login">Sign In to Comment</a>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card
                    key={i}
                    className="bg-background/30 border-border/50 animate-pulse"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-1/4"></div>
                          <div className="h-3 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <Card className="bg-background/30 border-border/50">
                <CardContent className="p-8 text-center">
                  <Skull className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    Silence in the Void
                  </h3>
                  <p className="text-muted-foreground">
                    No whispers have been heard yet. Be the first to break the
                    silence.
                  </p>
                </CardContent>
              </Card>
            ) : (
              comments.map((comment) => (
                <Comment
                  key={comment._id}
                  comment={comment}
                  onLike={handleLikeComment}
                  onReply={handleReplyToComment}
                  onEdit={handleEditComment}
                  onDelete={handleDeleteComment}
                  session={session}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this comment? This action will
              also erase all replies to this comment, and cannot be undone. The
              darkness will consume them forever...
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border hover:bg-background hover:text-foreground">
              Keep Comment
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white border-none"
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
