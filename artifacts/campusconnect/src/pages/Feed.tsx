import { useState, useCallback } from "react";
import { Heart, MessageCircle, Send, Clock } from "lucide-react";
import { savePosts } from "@/lib/jsonbin";
import { isConfigured } from "@/lib/jsonbin";
import type { Post, PostTag } from "@/types";

const TAGS: PostTag[] = ["General", "Housing", "StudyGroups", "RideSharing"];

const TAG_STYLES: Record<PostTag, string> = {
  General: "bg-indigo-100 text-indigo-700 border-indigo-200",
  Housing: "bg-amber-100 text-amber-700 border-amber-200",
  StudyGroups: "bg-emerald-100 text-emerald-700 border-emerald-200",
  RideSharing: "bg-sky-100 text-sky-700 border-sky-200",
};

const TAG_HASHTAG: Record<PostTag, string> = {
  General: "#General",
  Housing: "#Housing",
  StudyGroups: "#StudyGroups",
  RideSharing: "#RideSharing",
};

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface Props {
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
}

const MY_ID = "guest";
const MY_NAME = "Guest User";
const MY_TRACK = "Summer Student";
const MY_AVATAR = `https://api.dicebear.com/7.x/avataaars/svg?seed=GuestUser&backgroundColor=e0e7ff`;

export default function Feed({ posts, setPosts }: Props) {
  const [newContent, setNewContent] = useState("");
  const [newTag, setNewTag] = useState<PostTag>("General");
  const [submitting, setSubmitting] = useState(false);

  const persist = useCallback(async (updated: Post[]) => {
    if (isConfigured()) {
      try {
        await savePosts(updated);
      } catch (err) {
        console.error("Failed to persist posts:", err);
      }
    }
  }, []);

  const handleSubmit = async () => {
    if (!newContent.trim()) return;
    setSubmitting(true);
    const newPost: Post = {
      id: `p_${Date.now()}`,
      authorId: MY_ID,
      authorName: MY_NAME,
      authorTrack: MY_TRACK,
      authorAvatar: MY_AVATAR,
      tag: newTag,
      content: newContent.trim(),
      timestamp: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      comments: [],
    };
    const updated = [newPost, ...posts];
    setPosts(updated);
    await persist(updated);
    setNewContent("");
    setSubmitting(false);
  };

  const handleLike = useCallback(
    async (postId: string) => {
      setPosts((prev) => {
        const updated = prev.map((p) => {
          if (p.id !== postId) return p;
          const liked = p.likedBy.includes(MY_ID);
          return {
            ...p,
            likes: liked ? p.likes - 1 : p.likes + 1,
            likedBy: liked ? p.likedBy.filter((id) => id !== MY_ID) : [...p.likedBy, MY_ID],
          };
        });
        void persist(updated);
        return updated;
      });
    },
    [persist]
  );

  const handleAddComment = useCallback(
    async (postId: string, content: string) => {
      if (!content.trim()) return;
      setPosts((prev) => {
        const updated = prev.map((p) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            comments: [
              ...p.comments,
              {
                id: `c_${Date.now()}`,
                authorName: MY_NAME,
                content: content.trim(),
                timestamp: new Date().toISOString(),
              },
            ],
          };
        });
        void persist(updated);
        return updated;
      });
    },
    [persist]
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-foreground">Community Feed</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Share updates, find rides, and connect</p>
      </div>

      {/* Post Composer */}
      <div className="bg-card border border-card-border rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-start gap-3">
          <img
            src={MY_AVATAR}
            alt="You"
            className="w-10 h-10 rounded-full border border-border flex-shrink-0"
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Share something with your cohort..."
            rows={3}
            className="flex-1 resize-none rounded-xl border border-input bg-background text-foreground text-sm px-3 py-2.5 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setNewTag(tag)}
                className={`text-xs font-medium px-3 py-1 rounded-full border transition-all ${
                  newTag === tag
                    ? TAG_STYLES[tag]
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {TAG_HASHTAG[tag]}
              </button>
            ))}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!newContent.trim() || submitting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>

      {/* Posts */}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onLike={handleLike} onComment={handleAddComment} />
      ))}
    </div>
  );
}

function PostCard({
  post,
  onLike,
  onComment,
}: {
  post: Post;
  onLike: (id: string) => void;
  onComment: (id: string, content: string) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const isLiked = post.likedBy.includes("guest");

  const submitComment = () => {
    if (!commentText.trim()) return;
    onComment(post.id, commentText);
    setCommentText("");
  };

  return (
    <div className="bg-card border border-card-border rounded-2xl shadow-sm overflow-hidden">
      {/* Post Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={post.authorAvatar}
              alt={post.authorName}
              className="w-10 h-10 rounded-full border border-border flex-shrink-0"
            />
            <div>
              <p className="text-sm font-semibold text-foreground leading-tight">{post.authorName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-muted-foreground">{post.authorTrack}</p>
                <span className="text-muted-foreground/40 text-xs">·</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {timeAgo(post.timestamp)}
                </span>
              </div>
            </div>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${
              TAG_STYLES[post.tag]
            }`}
          >
            {TAG_HASHTAG[post.tag]}
          </span>
        </div>

        {/* Content */}
        <p className="mt-3 text-sm text-foreground leading-relaxed">{post.content}</p>
      </div>

      {/* Actions */}
      <div className="px-5 py-3 border-t border-border flex items-center gap-4">
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
            isLiked ? "text-rose-500" : "text-muted-foreground hover:text-rose-400"
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500" : ""}`} />
          {post.likes}
        </button>
        <button
          onClick={() => setShowComments((s) => !s)}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          {post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-border bg-muted/30 p-4 space-y-3">
          {post.comments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                <span className="text-accent-foreground text-xs font-semibold">
                  {c.authorName[0]}
                </span>
              </div>
              <div className="flex-1 bg-card rounded-xl px-3 py-2 border border-border">
                <p className="text-xs font-semibold text-foreground">{c.authorName}</p>
                <p className="text-xs text-foreground/80 mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}

          {/* Comment Input */}
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitComment()}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={submitComment}
              disabled={!commentText.trim()}
              className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
