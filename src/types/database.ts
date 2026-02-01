export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            activities: {
                Row: {
                    id: string;
                    title: string;
                    description: string | null;
                    location: string;
                    event_time: string;
                    expires_at: string;
                    max_participants: number;
                    created_by: string;
                    broad_category: string;
                    sub_category: string;
                    activity_type: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    description?: string | null;
                    location: string;
                    event_time: string;
                    expires_at: string;
                    max_participants: number;
                    created_by: string;
                    broad_category: string;
                    sub_category: string;
                    activity_type: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    description?: string | null;
                    location?: string;
                    event_time?: string;
                    expires_at?: string;
                    max_participants?: number;
                    created_by?: string;
                    broad_category?: string;
                    sub_category?: string;
                    activity_type?: string;
                    created_at?: string;
                };
            };
            activity_participants: {
                Row: {
                    activity_id: string;
                    user_id: string;
                    joined_at: string;
                };
                Insert: {
                    activity_id: string;
                    user_id: string;
                    joined_at?: string;
                };
                Update: {
                    activity_id?: string;
                    user_id?: string;
                    joined_at?: string;
                };
            };
            comments: {
                Row: {
                    id: string;
                    activity_id: string;
                    user_id: string;
                    text: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    activity_id: string;
                    user_id: string;
                    text: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    activity_id?: string;
                    user_id?: string;
                    text?: string;
                    created_at?: string;
                };
            };
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    display_name: string | null;
                    avatar_url: string | null;
                    created_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    display_name?: string | null;
                    avatar_url?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    display_name?: string | null;
                    avatar_url?: string | null;
                    created_at?: string;
                };
            };
        };
    };
}
