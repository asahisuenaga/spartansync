import type { BroadCategory, SubCategory } from "../constants/categories";

/**
 * Activity — canonical type for documents in Firestore collection "activities".
 * Inferred from addDoc() in Feed.handlePost and doc.data() mapping in Feed.onSnapshot.
 *
 * Firestore fields (as stored):
 * - title, location, eventTime (Timestamp), expiresAt (Timestamp)
 * - maxParticipants, participants, createdBy
 * - broadCategory, subCategory, activityType, description
 * - createdAt (Timestamp)
 *
 * In-memory shape (after read): Timestamps converted to Date.
 */
export interface Activity {
  id: string;
  title: string;
  description: string;
  broadCategory: BroadCategory;
  subCategory: SubCategory;
  activityType: string;
  location: string;
  eventTime: Date;
  expiresAt: Date;
  createdBy: string;
  creatorName?: string;
  maxParticipants: number;
  participants: string[];
  createdAt?: Date;
}

/**
 * Comment — documents in Firestore subcollection activities/{id}/comments.
 */
export interface Comment {
  id: string;
  text: string;
  userName: string;
  createdAt?: Date;
}

/**
 * Expired = activity window has passed (expiresAt is 1 hour after eventTime).
 * Use for: grey out card, disable RSVP, show "Expired" badge.
 */
export function isActivityExpired(activity: Activity): boolean {
  return activity.expiresAt.getTime() < Date.now();
}

/**
 * Spots remaining for join/RSVP logic.
 */
export function spotsLeft(activity: Activity): number {
  return Math.max(activity.maxParticipants - activity.participants.length, 0);
}
