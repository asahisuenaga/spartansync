import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ActivityCard from "../components/ActivityCard";
import { useAuth } from "../context/SupabaseAuthContext";
import { useActivities, joinActivity, leaveActivity } from "../hooks/useActivities";
import type { Activity } from "../types/activity";

const Profile = () => {
    const { user, signOutUser, updateProfile } = useAuth();
    const navigate = useNavigate();
    const { activities, loading } = useActivities();
    const [activeTab, setActiveTab] = useState<"attending" | "hosting">("attending");
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [joinMessage, setJoinMessage] = useState<string | null>(null);

    // Redirect if not logged in
    useEffect(() => {
        if (!user) navigate("/login");
    }, [user, navigate]);

    if (!user) return null;

    const hosting = activities.filter(a => a.createdBy === user.id);
    const attending = activities.filter(a => a.participants.includes(user.id) && a.createdBy !== user.id);

    const displayedActivities = activeTab === "hosting" ? hosting : attending;

    const handleJoinActivity = async (activity: Activity) => {
        if (!user) return;
        setJoinMessage(null);
        try {
            const isAlreadyJoined = activity.participants.includes(user.id);

            if (isAlreadyJoined) {
                // Prevent leaving own event if hosting
                if (activity.createdBy === user.id) {
                    setJoinMessage("You cannot leave your own event.");
                    setTimeout(() => setJoinMessage(null), 3000);
                    return;
                }
                await leaveActivity(activity.id, user.id);
                setJoinMessage("Left activity.");
            } else {
                if (activity.participants.length >= activity.maxParticipants) {
                    throw new Error("This activity is full.");
                }
                await joinActivity(activity.id, user.id);
                setJoinMessage("RSVP updated.");
            }
            setTimeout(() => setJoinMessage(null), 3000);
        } catch (error) {
            console.error(error);
            setJoinMessage("Failed to update RSVP.");
            setTimeout(() => setJoinMessage(null), 3000);
        }
    };

    const handleSignOut = async () => {
        await signOutUser();
        navigate("/login");
    }

    const handleUpdateProfile = async () => {
        if (!newName.trim()) return;
        setIsSaving(true);
        try {
            await updateProfile({ full_name: newName.trim() });
            setIsEditing(false);
            setJoinMessage("Profile updated successfully.");
        } catch (error) {
            console.error(error);
            setJoinMessage("Failed to update profile.");
        } finally {
            setIsSaving(false);
            setTimeout(() => setJoinMessage(null), 3000);
        }
    };

    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
    const displayName = user.user_metadata?.full_name || user.user_metadata?.name || "User";

    // Initialize newName when user data is available
    useEffect(() => {
        if (user && !newName) {
            setNewName(displayName);
        }
    }, [user, displayName]);

    return (
        <div className="min-h-screen bg-[#F0F2F5] pb-20">
            {/* Hero Header */}
            <header className="relative bg-msu pb-24 pt-10 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-msu"></div>

                <div className="relative mx-auto max-w-5xl px-6">
                    <button
                        onClick={() => navigate("/")}
                        className="mb-8 flex items-center gap-2 text-emerald-100/80 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back to Feed
                    </button>

                    <div className="flex flex-col md:flex-row items-center gap-8 animate-fade-in">
                        <div className="relative">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt="Profile"
                                    className="size-24 rounded-full border-4 border-emerald-400/30 shadow-xl object-cover"
                                />
                            ) : (
                                <div className="size-24 rounded-full bg-emerald-700 border-4 border-emerald-400/30 flex items-center justify-center text-3xl font-bold">
                                    {displayName[0] ?? "U"}
                                </div>
                            )}
                            <div className="absolute bottom-1 right-1 size-6 rounded-full bg-emerald-400 border-4 border-msu"></div>
                        </div>

                        <div className="text-center md:text-left flex-1">
                            {isEditing ? (
                                <div className="flex flex-col gap-3">
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400/50 w-full max-w-xs"
                                        placeholder="Enter your name..."
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleUpdateProfile}
                                            disabled={isSaving}
                                            className="bg-emerald-500 hover:bg-emerald-400 text-msu px-4 py-1.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                                        >
                                            {isSaving ? "Saving..." : "Save"}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                setNewName(displayName);
                                            }}
                                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 justify-center md:justify-start">
                                        <h1 className="font-display text-3xl font-bold">{displayName}</h1>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="text-emerald-200/60 hover:text-white transition-colors"
                                            title="Edit Profile"
                                        >
                                            <span className="material-symbols-outlined text-xl">edit</span>
                                        </button>
                                    </div>
                                    <p className="text-emerald-200/80">{user.email}</p>
                                    <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
                                        <div className="rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-sm text-sm font-medium">
                                            Student
                                        </div>
                                        <div className="rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-sm text-sm font-medium">
                                            Class of '26
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="md:ml-auto flex gap-6 text-center">
                            <div>
                                <div className="text-2xl font-bold">{attending.length}</div>
                                <div className="text-xs text-emerald-200 uppercase tracking-widest">Attending</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{hosting.length}</div>
                                <div className="text-xs text-emerald-200 uppercase tracking-widest">Hosting</div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative mx-auto max-w-5xl px-6 -mt-12">
                {/* Controls */}
                <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex bg-white/80 p-1.5 rounded-2xl shadow-lg backdrop-blur-md">
                        <button
                            onClick={() => setActiveTab("attending")}
                            className={`relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "attending"
                                ? "bg-msu text-white shadow-md"
                                : "text-slate-500 hover:bg-white/50"
                                }`}
                        >
                            Attending
                        </button>
                        <button
                            onClick={() => setActiveTab("hosting")}
                            className={`relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "hosting"
                                ? "bg-msu text-white shadow-md"
                                : "text-slate-500 hover:bg-white/50"
                                }`}
                        >
                            Hosting
                        </button>
                    </div>

                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        Sign Out
                    </button>
                </div>

                {/* Grid */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="text-center py-20 text-slate-500">Loading activities...</div>
                    ) : displayedActivities.length === 0 ? (
                        <div className="rounded-3xl bg-white p-12 text-center shadow-sm animate-fade-in">
                            <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                                <span className="material-symbols-outlined text-4xl">
                                    {activeTab === "attending" ? "event_busy" : "edit_calendar"}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">
                                {activeTab === "attending" ? "No upcoming events" : "You haven't hosted anything"}
                            </h3>
                            <p className="mt-2 text-slate-500">
                                {activeTab === "attending"
                                    ? "Explore the feed to find activities to join!"
                                    : "Create an activity to bring people together!"}
                            </p>
                            <button
                                onClick={() => navigate("/")}
                                className="mt-6 inline-flex items-center gap-2 text-msu font-bold hover:underline"
                            >
                                Go to Feed
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                            {displayedActivities.map(activity => (
                                <ActivityCard
                                    key={activity.id}
                                    activity={activity}
                                    user={user}
                                    onJoin={handleJoinActivity}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {joinMessage && (
                <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-slide-up">
                    <div className="flex items-center gap-3 rounded-2xl bg-slate-900/90 px-6 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur-md">
                        <span className="material-symbols-outlined text-emerald-400">info</span>
                        {joinMessage}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
