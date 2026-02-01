import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { isActivityExpired, type Activity, type Comment } from "../types/activity";
import { deleteActivity } from "../hooks/useActivities";
import { useTTS } from "../hooks/useTTS";

type ActivityCardProps = {
  activity: Activity;
  user: User | null;
  onJoin: (activity: Activity, event: React.MouseEvent) => void;
};


const ActivityCard = ({ activity, user, onJoin }: ActivityCardProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const { speak, stop, isSpeaking, isLoading: isTTSLoading } = useTTS();

  const handleSpeak = () => {
    if (isSpeaking) {
      stop();
    } else {
      const textToRead = `
        ${activity.title}.
        Posted by ${activity.creatorName}.
        In ${activity.subCategory}.
        At ${activity.location}.
        On ${activity.eventTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at ${activity.eventTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}.
        ${activity.description ? `Description: ${activity.description}` : ""}
      `;
      speak(textToRead);
    }
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        id,
        text,
        created_at,
        user_id,
        profiles (
          display_name,
          email
        )
      `)
      .eq("activity_id", activity.id)
      .order("created_at", { ascending: true });

    if (error) {
      return;
    }

    if (data) {
      const mappedComments = data.map((d: any) => ({
        id: d.id,
        text: d.text,
        userId: d.user_id,
        userName: d.profiles?.display_name || d.profiles?.email?.split('@')[0] || "User",
        createdAt: new Date(d.created_at),
      }));
      setComments(mappedComments);
    }
  };

  useEffect(() => {
    fetchComments();

    // 2. Subscribe to new comments
    const channel = supabase
      .channel(`comments-${activity.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `activity_id=eq.${activity.id}`,
        },
        async (_payload) => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activity.id]);

  const isJoined = user ? activity.participants.includes(user.id) : false;
  const isFull = activity.participants.length >= activity.maxParticipants;
  const isExpired = isActivityExpired(activity);
  const timeUntil = activity.eventTime.getTime() - Date.now();

  const handleCommentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !commentText.trim()) return;
    setSubmitting(true);

    try {
      const { error } = await (supabase.from("comments") as any).insert({
        activity_id: activity.id,
        user_id: user.id,
        text: commentText.trim(),
      });

      if (error) throw error;
      setCommentText("");
      // Force a manual refetch to show the comment immediately
      fetchComments();
    } catch (err: any) {
      console.error("Error posting comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    if (isExpired) {
      return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800">
          Expired
        </span>
      );
    }
    if (isFull && !isJoined) {
      return (
        <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/10">
          Full
        </span>
      );
    }
    const ratio = activity.participants.length / activity.maxParticipants;
    if (ratio >= 0.8) {
      return (
        <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700 ring-1 ring-inset ring-orange-600/10">
          {activity.participants.length}/{activity.maxParticipants} spots
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
        {activity.participants.length}/{activity.maxParticipants} joined
      </span>
    );
  };

  return (
    <article id={`activity-${activity.id}`} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span className="material-symbols-outlined text-sm">person</span>
              <span>Posted by {activity.creatorName}</span>
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                {activity.subCategory}
              </span>
              {getStatusBadge()}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Read Aloud Button */}
            <button
              onClick={handleSpeak}
              disabled={isTTSLoading}
              aria-label={isSpeaking ? "Stop reading" : "Read aloud"}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${isSpeaking ? "bg-msu text-white animate-pulse" : "text-slate-400 hover:bg-slate-50 hover:text-msu"
                } ${isTTSLoading ? "cursor-wait opacity-50" : ""}`}
            >
              <span className="material-symbols-outlined text-xl">
                {isTTSLoading ? "downloading" : isSpeaking ? "stop_circle" : "volume_up"}
              </span>
            </button>

            {/* Option Menu (Only for Creator) */}
            {user?.id === activity.createdBy && (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label="Options menu"
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${isMenuOpen ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600 opacity-0 group-hover:opacity-100"
                    }`}
                >
                  <span className="material-symbols-outlined text-xl">more_vert</span>
                </button>

                {isMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-9 z-20 w-36 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl animate-scale-in">
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setDeleteConfirm(true);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                        Delete Post
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <h3 className="font-display text-lg font-bold text-slate-900 leading-snug mb-2 group-hover:text-msu transition-colors">
          {activity.title}
        </h3>

        {/* Updated metadata visual */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">location_on</span>
            <span className="line-clamp-1 font-medium">{activity.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">event</span>
            <span className="font-medium">
              {timeUntil > 0
                ? activity.eventTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
                : "Started"}
            </span>
          </div>
        </div>

        {/* Description Section */}
        {activity.description && (
          <div className="mb-4 rounded-xl bg-slate-50 p-3">
            <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
              {activity.description}
            </p>
          </div>
        )}
      </div>

      <div className="mt-auto space-y-4">
        <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
          <button
            onClick={(e) => onJoin(activity, e)}
            disabled={isExpired || (isFull && !isJoined)}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-95 ${isJoined
              ? "bg-red-50 text-red-600 ring-1 ring-red-200 hover:bg-red-100"
              : isExpired || (isFull && !isJoined)
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-msu text-white shadow-emerald-900/10 hover:bg-msu-light hover:shadow-emerald-900/20"
              }`}
          >
            {isExpired ? "Event Ended" : isJoined ? "Cancel RSVP" : isFull ? "Waitlist Full" : "RSVP"}
          </button>

          <button
            type="button"
            aria-label={`Comments (${comments.length})`}
            onClick={() => setShowComments((prev) => !prev)}
            className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${showComments ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
          >
            <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
            <span>{comments.length}</span>
          </button>
        </div>


        {/* Comments Section with Slide Animation */}
        <div className={`grid transition-all duration-300 ease-in-out ${showComments ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
          <div className="overflow-hidden">
            <div className="space-y-3 pt-2">
              {comments.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400 italic bg-slate-50 rounded-lg">
                  No comments yet. Start the conversation!
                </div>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {comments.map((comment) => (
                    <div key={comment.id} className="rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span className="font-bold text-slate-700">{comment.userName}</span>
                        <span>{comment.createdAt ? comment.createdAt.toLocaleString(undefined, { hour: 'numeric', minute: '2-digit' }) : "Just now"}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{comment.text}</p>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <input
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder={user ? "Add a comment..." : "Login to comment"}
                  disabled={!user || submitting}
                  className="flex-1 rounded-lg border-0 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-msu/50 disabled:opacity-50"
                />
                <button
                  type="submit"
                  aria-label="Send comment"
                  disabled={!user || submitting || !commentText.trim()}
                  className="rounded-lg bg-white p-2 text-msu shadow-sm ring-1 ring-slate-900/10 transition-all hover:bg-slate-50 disabled:opacity-50 disabled:shadow-none"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Overlay */}
      {deleteConfirm && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-2xl bg-white/95 backdrop-blur-sm p-6 text-center animate-fade-in">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <span className="material-symbols-outlined">warning</span>
          </div>
          <h4 className="mb-1 font-bold text-slate-900">Delete this post?</h4>
          <p className="mb-6 text-xs text-slate-500">This action cannot be undone. All comments and RSVPs will be removed.</p>

          <div className="flex w-full gap-2">
            <button
              onClick={() => setDeleteConfirm(false)}
              className="flex-1 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-200"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                setIsDeleting(true);
                try {
                  await deleteActivity(activity.id);
                  // Real-time listener in Feed will handle removal from UI
                } catch (error) {
                  console.error("Failed to delete activity:", error);
                  setIsDeleting(false);
                  setDeleteConfirm(false);
                }
              }}
              className="flex-1 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-700 disabled:opacity-50"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      )}
    </article>
  );
};

export default ActivityCard;
