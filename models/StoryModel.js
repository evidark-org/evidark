import mongoose from "mongoose";
import slugify from "slugify"; // npm install slugify

const storySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    photo: { type: String, default: "default-story.png" },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: { type: String, maxlength: 500 },
    content: { type: String, required: true }, // long form
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    media: [{ type: mongoose.Schema.Types.ObjectId, ref: "Media" }],
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Like" }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bookmark" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ----------------------------
// Pre-save hook to generate slug
// ----------------------------
storySchema.pre("save", async function (next) {
  // Only generate slug if it's new (created)
  if (!this.isNew || this.slug) return next();

  // Base slug from title
  let baseSlug = slugify(this.title, { lower: true, strict: true });

  // If title is very short, append description (first 30 chars)
  if (baseSlug.length < 5 && this.description) {
    baseSlug +=
      "-" +
      slugify(this.description.substring(0, 30), { lower: true, strict: true });
  }

  // Ensure uniqueness by adding a random short string if needed
  let slug = baseSlug;
  let count = 0;

  while (await mongoose.models.Story.exists({ slug })) {
    count++;
    slug = `${baseSlug}-${count}`;
  }

  this.slug = slug;
  next();
});

// ----------------------------
// Prevent slug from being updated
// ----------------------------
storySchema.pre("findOneAndUpdate", function (next) {
  if (this._update.slug) {
    delete this._update.slug; // prevent slug from changing
  }
  next();
});

const Story = mongoose.models.Story || mongoose.model("Story", storySchema);
export default Story;
