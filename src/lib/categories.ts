export type BroadCategory = "fitness" | "social" | "academics";

export type SubcategoryGroup =
  | "Workouts"
  | "Sports"
  | "Outdoor Activities"
  | "Casual Hang-outs"
  | "Events"
  | "Networking"
  | "Study Sessions"
  | "Exam prep"
  | "Skill building"
  | "Productivity";

export const BROAD_CATEGORIES: Array<{ value: BroadCategory; label: string }> = [
  { value: "fitness", label: "Fitness" },
  { value: "social", label: "Social" },
  { value: "academics", label: "Academics" },
];

export const CATEGORY_GROUPS: Record<
  BroadCategory,
  Array<{ value: SubcategoryGroup; label: string }>
> = {
  fitness: [
    { value: "Workouts", label: "Workouts" },
    { value: "Sports", label: "Sports" },
    { value: "Outdoor Activities", label: "Outdoor Activities" },
  ],
  social: [
    { value: "Casual Hang-outs", label: "Casual Hang-outs" },
    { value: "Events", label: "Events" },
    { value: "Networking", label: "Networking" },
  ],
  academics: [
    { value: "Study Sessions", label: "Study Sessions" },
    { value: "Exam prep", label: "Exam prep" },
    { value: "Skill building", label: "Skill building" },
    { value: "Productivity", label: "Productivity" },
  ],
};

export const SUBCATEGORY_OPTIONS: Record<SubcategoryGroup, string[]> = {
  Workouts: ["Weight lifting", "HIIT", "Cardio", "Pilates", "Yoga", "Other"],
  Sports: ["Basketball", "Tennis", "Soccer", "Volleyball", "Swimming", "Other"],
  "Outdoor Activities": [
    "Running",
    "Walking",
    "Hiking",
    "Biking",
    "Other",
  ],
  "Casual Hang-outs": [
    "Coffee chats",
    "Dining hall runs",
    "Movie nights",
    "Game nights",
    "Other",
  ],
  Events: [
    "Club events",
    "Campus events",
    "Cultural events",
    "Concerts",
    "Other",
  ],
  Networking: [
    "Career meetups",
    "Resume reviews",
    "Industry discussions",
    "Other",
  ],
  "Study Sessions": ["Course-specific study groups", "Other"],
  "Exam prep": ["Exam prep", "Other"],
  "Skill building": ["Coding practice", "Interview prep", "Other"],
  Productivity: ["Pomodoro sessions", "Deep work blocks", "Other"],
};
