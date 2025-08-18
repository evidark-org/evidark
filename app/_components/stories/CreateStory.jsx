"use client";

import React, { useState } from "react";
import axios from "axios";
import TiptapEditor from "../editor/TipTapEditor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Pass the session userId as prop
const CreateStory = ({ session }) => {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleContentChange = (value) => {
    if (value.length <= 1000000) setContent(value);
  };

  const handleSubmit = async () => {
    if (!title || !content) {
      setError("Title and content are required.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const payload = {
      title,
      description,
      content,
      author: session?.user?.userId,
    };

    try {
      const res = await axios.post("/api/v1/stories", payload, {
        headers: { "Content-Type": "application/json" },
      });

      setSuccess("Story submitted successfully!");
      setTitle("");
      setDescription("");
      setContent("");
      console.log("Story uploaded:", res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col mb-20">
      {/* Editor */}
      <TiptapEditor content={content} onChange={handleContentChange} />

      {/* Popup for story metadata */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="rounded-xs w-fit ml-auto mt-8 cursor-pointer bg-green-600 hover:bg-green-500">
            Next
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-lg rounded-xs">
          <DialogHeader>
            <DialogTitle>Submit Story</DialogTitle>
            <DialogDescription>
              Add your story details before publishing.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter story title"
                className="col-span-3 rounded-xs"
              />
            </div>

            {/* Description */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right mt-2">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description (max 500 chars)"
                className="col-span-3 rounded-xs resize-none"
                rows={3}
              />
            </div>

            {/* Error / Success Messages */}
            {error && <p className="text-red-600 col-span-4 mt-2">{error}</p>}
            {success && (
              <p className="text-green-600 col-span-4 mt-2">{success}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              className="rounded-xs"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit for Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateStory;
