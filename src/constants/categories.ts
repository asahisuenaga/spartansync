export const CATEGORY_TREE = {
  Fitness: {
    Workouts: ["Weight Lifting", "HIIT", "Cardio", "Yoga", "Other"],
    Sports: ["Basketball", "Tennis", "Soccer", "Other"],
    Outdoor: ["Running", "Hiking", "Biking", "Other"],
  },
  Social: {
    "Casual Hangouts": ["Coffee Chats", "Game Nights", "Other"],
    Events: ["Campus Events", "Club Events", "Cultural Events", "Other"],
    Networking: ["Career Meetups", "Resume Reviews", "Other"],
  },
  Academics: {
    "Study Sessions": ["Course-Specific Groups", "Other"],
    "Skill Building": ["Coding Practice", "Interview Prep", "Other"],
    Productivity: ["Pomodoro", "Deep Work", "Other"],
  },
} as const;

export type BroadCategory = keyof typeof CATEGORY_TREE;
export type SubCategory = keyof (typeof CATEGORY_TREE)[BroadCategory];
export type ActivityType = (typeof CATEGORY_TREE)[BroadCategory][SubCategory][number];
