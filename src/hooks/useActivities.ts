import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Activity } from "../types/activity";

// Convert Supabase row to Activity type
function rowToActivity(
    row: any,
    participants: string[]
): Activity {
    const profile = row.profiles;
    const creatorName = profile?.display_name || profile?.email?.split('@')[0] || "User";

    return {
        id: row.id,
        title: row.title,
        description: row.description ?? "",
        location: row.location,
        eventTime: new Date(row.event_time),
        expiresAt: new Date(row.expires_at),
        maxParticipants: row.max_participants,
        participants,
        createdBy: row.created_by,
        creatorName,
        broadCategory: row.broad_category as Activity["broadCategory"],
        subCategory: row.sub_category as Activity["subCategory"],
        activityType: row.activity_type,
        createdAt: new Date(row.created_at),
    };
}

export function useActivities() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchActivities() {
            const now = new Date().toISOString();

            // 1. Try with join (Ideal)
            let { data: activityRows, error: fetchError } = await (supabase
                .from("activities") as any)
                .select(`
                    *,
                    profiles (
                        display_name,
                        avatar_url,
                        email
                    )
                `)
                .gt("expires_at", now)
                .order("event_time", { ascending: true });

            // 2. Fallback: If join fails, try WITHOUT join (Bulletproof)
            if (fetchError) {
                console.warn("DEBUG: Join fetch failed, trying fallback:", fetchError.message);
                const { data: fallbackRows, error: fallbackError } = await (supabase
                    .from("activities") as any)
                    .select("*")
                    .gt("expires_at", now)
                    .order("event_time", { ascending: true });

                if (fallbackError) {
                    console.error("DEBUG: Fatal fetch error:", fallbackError.message);
                    setError(fallbackError.message);
                    setLoading(false);
                    return;
                }
                activityRows = fallbackRows;
            }

            if (!activityRows || activityRows.length === 0) {
                console.log("DEBUG: Query successful but 0 activities found in database.");
                setActivities([]);
                setLoading(false);
                return;
            }

            console.log(`DEBUG: Displaying ${activityRows.length} activities.`);

            const activitiesWithParticipants = await Promise.all(
                (activityRows || []).map(async (row: any) => {
                    // Manual profile lookup if join info is missing
                    let creatorProfile = row.profiles;
                    if (!creatorProfile) {
                        const { data: profileData } = await (supabase
                            .from("profiles") as any)
                            .select("display_name, email")
                            .eq("id", row.created_by)
                            .single();
                        creatorProfile = profileData;
                    }

                    const { data: participantRows } = await (supabase
                        .from("activity_participants") as any)
                        .select("user_id")
                        .eq("activity_id", row.id);

                    const participants = (participantRows || []).map((p: any) => p.user_id);

                    // Manually construct the row with the found profile
                    const enrichedRow = { ...row, profiles: creatorProfile };
                    return rowToActivity(enrichedRow, participants);
                })
            );

            setActivities(activitiesWithParticipants);
            setLoading(false);
        }

        fetchActivities();

        // Subscribe to real-time changes
        const channel = supabase
            .channel("activities-changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "activities" },
                () => {
                    fetchActivities();
                }
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "activity_participants" },
                () => {
                    fetchActivities();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return { activities, loading, error };
}

export async function createActivity(
    activity: Omit<Activity, "id" | "participants" | "createdAt">
) {
    const { data, error } = await (supabase
        .from("activities") as any)
        .insert({
            title: activity.title,
            description: activity.description,
            location: activity.location,
            event_time: activity.eventTime.toISOString(),
            expires_at: activity.expiresAt.toISOString(),
            max_participants: activity.maxParticipants,
            created_by: activity.createdBy,
            broad_category: activity.broadCategory,
            sub_category: activity.subCategory,
            activity_type: activity.activityType,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function joinActivity(activityId: string, userId: string) {
    const { error } = await (supabase.from("activity_participants") as any).insert({
        activity_id: activityId,
        user_id: userId,
    });

    if (error) throw error;
}

export async function leaveActivity(activityId: string, userId: string) {
    const { error } = await (supabase
        .from("activity_participants") as any)
        .delete()
        .eq("activity_id", activityId)
        .eq("user_id", userId);

    if (error) throw error;
}

export async function deleteActivity(activityId: string) {
    // Delete participants first (foreign key constraint)
    await (supabase
        .from("activity_participants") as any)
        .delete()
        .eq("activity_id", activityId);

    const { error } = await (supabase
        .from("activities") as any)
        .delete()
        .eq("id", activityId);

    if (error) throw error;
}
