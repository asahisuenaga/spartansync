import { useEffect, useState, type FormEvent } from "react";
import {
  type ActivityType,
  type BroadCategory,
  type SubCategory,
} from "../constants/categories";
import CategorySelector from "./CategorySelector";

type PostActivityModalProps = {
  open: boolean;
  onClose: () => void;
  onPost: (payload: {
    title: string;
    location: string;
    dateTime: string;
    maxParticipants: number;
    broadCategory: BroadCategory;
    subCategory: SubCategory;
    activityType: ActivityType;
    description: string;
  }) => Promise<void>;
};

const PostActivityModal = ({ open, onClose, onPost }: PostActivityModalProps) => {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(1);
  const [broadCategory, setBroadCategory] = useState<BroadCategory | null>(null);
  const [subCategory, setSubCategory] = useState<SubCategory | null>(null);
  const [activityType, setActivityType] = useState<ActivityType | null>(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setLocation("");
      // Reset to next available hour with 00 minutes
      const now = new Date();
      now.setHours(now.getHours() + 1, 0, 0, 0);
      const tzOffset = now.getTimezoneOffset() * 60000;
      const localISOTime = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
      setDateTime(localISOTime);

      setMaxParticipants(1);
      setBroadCategory(null);
      setSubCategory(null);
      setActivityType(null);
      setDescription("");
      setSubmitting(false);
      setError(null);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) {
      setError("Please enter an activity title");
      return;
    }
    if (!location.trim()) {
      setError("Please enter a location");
      return;
    }
    if (!dateTime) {
      setError("Please select a date and time");
      return;
    }
    const selectedDate = new Date(dateTime);
    if (selectedDate.getTime() < Date.now()) {
      setError("Activities cannot be scheduled in the past.");
      return;
    }
    if (!maxParticipants || maxParticipants < 1) {
      setError("Please enter a valid capacity (minimum 1 person)");
      return;
    }
    if (!description.trim()) {
      setError("Please add a description");
      return;
    }
    if (!broadCategory || !subCategory || !activityType) {
      setError("Please select all 3 category levels (Broad → Sub → Activity Type)");
      return;
    }

    setSubmitting(true);
    try {
      await onPost({
        title: title.trim(),
        location: location.trim(),
        dateTime,
        maxParticipants,
        broadCategory,
        subCategory,
        activityType,
        description: description.trim(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post activity");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-800">Create Activity</h2>
            <p className="text-sm text-slate-500">Host an event for the community</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="max-h-[80vh] overflow-y-auto px-6 py-5 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error ? (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                <span className="material-symbols-outlined text-base">error</span>
                {error}
              </div>
            ) : null}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Activity Title <span className="text-rose-500">*</span></label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g., Evening basketball at IM Circle"
                  className="w-full rounded-xl border-0 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-msu/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">When? <span className="text-rose-500">*</span></label>
                  <input
                    value={dateTime}
                    onChange={(event) => setDateTime(event.target.value)}
                    type="datetime-local"
                    className="w-full rounded-xl border-0 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-msu/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Capacity <span className="text-rose-500">*</span></label>
                  <input
                    value={maxParticipants}
                    onChange={(event) => setMaxParticipants(Number(event.target.value))}
                    type="number"
                    min={1}
                    max={50}
                    className="w-full rounded-xl border-0 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-msu/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Where? <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">location_on</span>
                  <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="e.g., IM Circle West"
                    className="w-full rounded-xl border-0 bg-slate-100 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-msu/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Category <span className="text-rose-500">*</span></label>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <CategorySelector
                    value={
                      broadCategory && subCategory && activityType
                        ? { broadCategory, subCategory, activityType }
                        : null
                    }
                    onChange={(value) => {
                      setBroadCategory(value.broadCategory);
                      setSubCategory(value.subCategory);
                      setActivityType(value.activityType);
                    }}
                  />
                  <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">info</span>
                    Select: Broad Category → Subcategory → Activity Type
                  </p>
                </div>
              </div>

              {broadCategory && subCategory && activityType ? (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  {broadCategory} › {subCategory} › {activityType}
                </div>
              ) : null}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Description <span className="text-rose-500">*</span></label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Provide more details about the activity..."
                  rows={3}
                  className="w-full resize-none rounded-xl border-0 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-msu/50 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border-2 border-slate-100 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:border-slate-200 hover:bg-slate-50 active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-xl bg-msu px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-msu/20 transition hover:bg-msu-light hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>
                    Posting...
                  </>
                ) : "Post Activity"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostActivityModal;
