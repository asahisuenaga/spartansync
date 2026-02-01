# PlayPal

Minimal React + Vite + TypeScript app with Firebase authentication (Google) and Firestore, styled with Tailwind CSS.

## Quick start

1. Create a Firebase project.
2. Enable Google authentication (Firebase Console → Authentication → Sign-in method).
3. Create a Firestore database.
4. Add a web app in Firebase and copy the config values.
5. Create a `.env` file in the project root:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Run locally

```
npm install
npm run dev
```

## Notes

- Firestore uses an `activities` collection for the activity feed.
- Firebase config is loaded from Vite environment variables.

## Activity schema

```
Activity {
  id: string
  title: string
  location: string
  eventTime: timestamp
  expiresAt: timestamp
  maxParticipants: number
  participants: string[]
  createdBy: string
  broadCategory: "Fitness" | "Social" | "Academics"
  subCategory: string
  activityType: string
  description: string
  createdAt: timestamp
}
```
