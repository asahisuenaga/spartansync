import { useState } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import ActivityCard from "../components/ActivityCard";
import PostActivityModal from "../components/PostActivityModal";
import { useAuth } from "../context/SupabaseAuthContext";
import { useActivities, createActivity, joinActivity, leaveActivity } from "../hooks/useActivities";
import type { Activity } from "../types/activity";
import type { BroadCategory, SubCategory } from "../constants/categories";
import spartanLogo from "../assets/spartan-logo.png";
import "../accessibility.css"; // Ensure accessibility styles are loaded
import { useAccessibility } from "../context/AccessibilityContext";

const Feed = () => {
  const { user, signOutUser } = useAuth();
  const navigate = useNavigate();
  const { activities: posts } = useActivities();
  const [modalOpen, setModalOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [joinMessage, setJoinMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | BroadCategory>("all");

  // Accessibility Context
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);
  const {
    dyslexicFont,
    toggleDyslexicFont,
    highContrast,
    toggleHighContrast
  } = useAccessibility();

  if (!user) return null;

  const handlePost = async (payload: {
    title: string;
    location: string;
    dateTime: string;
    maxParticipants: number;
    broadCategory: BroadCategory;
    subCategory: SubCategory;
    activityType: string;
    description: string;
  }) => {
    if (!user) return;
    const selectedDate = new Date(payload.dateTime);
    if (Number.isNaN(selectedDate.getTime())) {
      throw new Error("Please choose a valid time.");
    }
    const expiresAt = new Date(selectedDate.getTime() + 60 * 60 * 1000);

    try {
      await createActivity({
        title: payload.title,
        location: payload.location,
        eventTime: selectedDate,
        expiresAt: expiresAt,
        maxParticipants: payload.maxParticipants,
        createdBy: user.id,
        broadCategory: payload.broadCategory,
        subCategory: payload.subCategory,
        activityType: payload.activityType,
        description: payload.description,
      });
      setModalOpen(false); // Close modal on success
      console.log("DEBUG: Activity created successfully");
    } catch (error: any) {
      console.error("DEBUG: Error creating activity:", error);
      alert("Failed to create activity: " + (error.message || "Unknown error"));
    }
  };

  const handleJoinActivity = async (activity: Activity, event: React.MouseEvent) => {
    if (!user) return;
    setJoinMessage(null);
    try {
      const isAlreadyJoined = activity.participants.includes(user.id);

      if (isAlreadyJoined) {
        await leaveActivity(activity.id, user.id);
        setJoinMessage("Left activity.");
      } else {
        if (activity.participants.length >= activity.maxParticipants) {
          throw new Error("This activity is full.");
        }
        await joinActivity(activity.id, user.id);
        setJoinMessage("Joined activity!");

        // Calculate normalized origin for confetti
        const x = event.clientX / window.innerWidth;
        const y = event.clientY / window.innerHeight;

        confetti({
          particleCount: 150,
          spread: 70,
          origin: { x, y },
          colors: ['#18453B', '#116d4d', '#ffffff'], // MSU Colors + White
          zIndex: 9999
        });
      }
      setTimeout(() => setJoinMessage(null), 3000);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to join activity.";
      setJoinMessage(message);
      setTimeout(() => setJoinMessage(null), 3000);
    }
  };

  const getCategoryIcon = (category: string) => {
    if (category === "Fitness") return "fitness_center";
    if (category === "Social") return "groups";
    return "school";
  };

  const filteredPosts = posts.filter((post) => {
    // 1. Category Filter
    if (activeCategory !== "all" && post.broadCategory !== activeCategory) return false;

    // 2. Text Search
    const lowerQuery = searchQuery.trim().toLowerCase();
    if (!lowerQuery) return true;
    const searchable = [
      post.title,
      post.location,
      post.description,
      post.subCategory,
    ].join(" ").toLowerCase();

    return searchable.includes(lowerQuery);
  });

  // Group by category for display
  const categories = ["Social", "Fitness", "Academics"] as const;

  return (
    <div className={`min-h-screen bg-slate-50 relative overflow-x-hidden`}>
      <div className="relative z-10">
        {/* Sticky Glass Header */}
        <header className="sticky top-0 z-50 transition-all duration-300">
          <div className="shadow-sm border-b border-slate-200 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              {/* Brand */}
              <div className="flex items-center gap-5">
                <div className="flex size-20 items-center justify-center rounded-[2rem] bg-white p-1 shadow-2xl ring-1 ring-slate-100 transition-transform hover:scale-105">
                  <img src={spartanLogo} alt="Spartan Sync" className="w-full h-full object-contain" />
                </div>
                <h1 className="font-display hidden text-2xl font-black tracking-tight text-msu sm:block drop-shadow-sm">
                  Spartan Sync
                </h1>
              </div>

              {/* Center Search Bar */}
              <div className="flex max-w-lg flex-1 items-center justify-center px-8">
                <div className="relative w-full group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-msu">
                    search
                  </span>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Find your next activity..."
                    className="w-full rounded-2xl border-0 bg-slate-100 py-3 pl-12 pr-4 text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-msu/20 shadow-inner focus:shadow-lg"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setModalOpen(true)}
                  className="hidden sm:flex items-center gap-2 rounded-xl bg-msu px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-msu/20 transition-all hover:bg-msu-light hover:shadow-xl hover:-translate-y-0.5"
                >
                  <span className="material-symbols-outlined text-xl">add</span>
                  Create
                </button>
                <button className="sm:hidden flex size-10 items-center justify-center rounded-full bg-msu text-white shadow-lg" onClick={() => setModalOpen(true)}>
                  <span className="material-symbols-outlined">add</span>
                </button>

                {user && (
                  <div className="relative">
                    <button
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                      className="relative group transition-transform hover:scale-105 active:scale-95"
                    >
                      {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                        <img
                          src={user.user_metadata.avatar_url || user.user_metadata.picture}
                          alt={user.user_metadata.full_name || user.user_metadata.name || "User"}
                          className="size-10 rounded-full border-2 border-white object-cover shadow-md"
                        />
                      ) : (
                        <div className="size-10 rounded-full bg-msu text-white border-2 border-white flex items-center justify-center font-bold shadow-md">
                          {(user.user_metadata?.full_name || user.user_metadata?.name || "U")[0]}
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-emerald-500"></div>
                    </button>

                    {profileMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setProfileMenuOpen(false)}
                        ></div>
                        <div className="absolute right-0 mt-3 w-72 origin-top-right rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-black/5 animate-slide-up z-50">
                          <div className="px-4 py-3 border-b border-slate-100 mb-2">
                            <p className="text-sm font-bold text-slate-900 truncate">
                              {user.user_metadata?.full_name || user.user_metadata?.name || "User"}
                            </p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          </div>

                          <button
                            onClick={() => {
                              setProfileMenuOpen(false);
                              navigate("/profile");
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                          >
                            <span className="material-symbols-outlined text-msu">person</span>
                            My Profile
                          </button>

                          <div className="h-px bg-slate-100 my-2"></div>

                          <button
                            onClick={async () => {
                              setProfileMenuOpen(false);
                              await signOutUser();
                              navigate("/login");
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-50"
                          >
                            <span className="material-symbols-outlined">logout</span>
                            Sign Out
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="border-b border-slate-200 bg-white/60 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl gap-2 px-4 py-3 sm:px-6 lg:px-8 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveCategory("all")}
                className={`rounded-full px-4 py-1.5 text-sm font-bold transition-all ${activeCategory === "all"
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat as BroadCategory)}
                  className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold transition-all ${activeCategory === cat
                    ? "bg-msu text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <span className="material-symbols-outlined text-lg">
                    {getCategoryIcon(cat)}
                  </span>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Player Dashboard (replaces Oracle) */}
          {/* Welcome Section */}
          <div className="mb-10 p-8 rounded-[2.5rem] bg-gradient-to-br from-msu to-emerald-900 shadow-2xl text-white">
            <h2 className="text-3xl font-black mb-2">Welcome back, {user.user_metadata?.full_name?.split(' ')[0] || "Spartan"}!</h2>
            <p className="text-emerald-100 font-medium opacity-80">Discover what's happening on campus today and connect with your fellow Spartans.</p>
          </div>

          {/* Toast Notification */}
          {joinMessage && (
            <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-slide-up">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-900/90 px-6 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur-md">
                <span className="material-symbols-outlined text-emerald-400">check_circle</span>
                {joinMessage}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.filter(c => activeCategory === 'all' || activeCategory === c).map(category => {
              const categoryPosts = filteredPosts
                .filter(p => p.broadCategory === category)
                .sort((a, b) => a.eventTime.getTime() - b.eventTime.getTime());

              // Always render the column structure even if empty, so the layout holds shape
              // unless activeCategory is filtering it out specifically.
              if (activeCategory !== 'all' && activeCategory !== category) return null;

              return (
                <section
                  key={category}
                  className="flex flex-col bg-white/20 backdrop-blur-xl rounded-[2.5rem] border border-white/30 shadow-2xl transition-all duration-500 hover:bg-white/30 hover:shadow-msu/5"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/10 rounded-t-[2.5rem]">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-msu">{getCategoryIcon(category)}</span>
                      <h2 className="font-display text-lg font-bold text-slate-700">{category}</h2>
                    </div>
                    <span className="bg-slate-200/60 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-bold">
                      {categoryPosts.length}
                    </span>
                  </div>

                  {/* Column Content */}
                  <div className="p-4 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
                    {categoryPosts.length === 0 ? (
                      <div className="py-12 text-center rounded-xl border border-dashed border-slate-300/50 bg-slate-50/50">
                        <p className="text-3xl mb-2">🍃</p>
                        <p className="text-sm font-medium text-slate-500">No events yet</p>
                        <button
                          onClick={() => setModalOpen(true)}
                          className="mt-2 text-xs font-bold text-msu hover:underline"
                        >
                          + Creates one
                        </button>
                      </div>
                    ) : (
                      categoryPosts.map((post) => (
                        <ActivityCard
                          key={post.id}
                          activity={post}
                          user={user}
                          onJoin={handleJoinActivity}
                        />
                      ))
                    )}
                  </div>
                </section>
              );
            })}
          </div>

          {filteredPosts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="mb-6 flex size-24 items-center justify-center rounded-3xl bg-white shadow-xl shadow-slate-200">
                <span className="material-symbols-outlined text-5xl text-slate-300">search_off</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-900">No activities found</h2>
              <p className="mt-2 text-slate-500 max-w-sm">
                We couldn't find any activities matching your search. Try adjusting your filters or create a new one!
              </p>
            </div>
          )}
        </main>

        <PostActivityModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onPost={handlePost}
        />
        <div className="pb-20"></div>

        {/* Accessibility Floating Action Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative">
            {accessibilityOpen && (
              <div className="absolute bottom-16 right-0 w-72 rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-slate-900/5 animate-scale-in origin-bottom-right mb-2">
                <h3 className="mb-3 text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Accessibility</h3>

                <div className="space-y-3">
                  {/* Visual Settings */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Visual Details</p>
                    <button
                      onClick={toggleHighContrast}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors ${highContrast ? 'bg-black text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                    >
                      <span>High Contrast</span>
                      <span className="material-symbols-outlined text-lg">{highContrast ? 'check' : 'contrast'}</span>
                    </button>
                  </div>

                </div>
              </div>
            )}

            <button
              onClick={() => setAccessibilityOpen(!accessibilityOpen)}
              aria-label="Accessibility options"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-2xl transition-transform hover:scale-110 active:scale-95 hover:shadow-slate-900/40"
            >
              <span className="material-symbols-outlined text-2xl">accessibility_new</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
