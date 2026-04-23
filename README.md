# Spartan Sync 🟢⚪️

A campus connection app designed for Michigan State University students to find study groups, gym buddies, and social events.

<div style="display: flex; justify-content: center; gap: 20;">
<img width=48% alt="image" src="https://github.com/user-attachments/assets/1fae6691-fbc8-44ab-a142-a22c94fab721"/> <img width=48% alt="image" src="https://github.com/user-attachments/assets/7ca59582-ec78-403b-b30a-55f9d7601bd4"/>
</div>

## Inspiration

It’s weirdly easy to feel lonely at a huge school like MSU. **Despite there being over 30,000 students on campus, depression rates in Michigan generally range from 20-40%, expressly stemming from a lack of meaningful social interactions.** It is ironic to walk past thousands of people every day on your way to class, yet still feel like you're on your own island. We’ve all had those moments where we wanted to hit the gym, study for a chem exam, or just grab coffee, but didn't want to go alone.

That feeling is what sparked **Spartan Sync**. We realized that social media often makes us feel more isolated, looking at highlights of other people's lives instead of living our own. We wanted to build something different—a simple way to say, "Hey, I'm doing this thing, who wants to come?"

## How It Works

We kept it simple to focus on what matters: getting people together.

1.  **Post an Activity**: Any student can create an event—whether it's "Leg day at IM West" or "Study for organic chem at the Library".
2.  **RSVP & Join**: To keep interactions meaningful and manageable, every event has a **participant cap**. You RSVP to claim a spot.
3.  **Coordinate in Context**: Every event has its own **dedicated comment section** underneath details. This lets you ask questions ("Where exactly are we meeting?") or coordinate plans without needing to share your phone number or social media handles with strangers immediately.

## Why SpartanSync?

We built this platform to turn those thousands of strangers on campus into friends you just haven't met yet.

-   **Real Connection**: There are no "likes" or "followers" here. The only thing that matters is showing up. We focused entirely on helping individuals connect in real life, face-to-face.
-   **Safe & Verified**: You log in with your **@msu.edu** email, ensuring that the community stays private, safe, and exclusive to students. No randoms.
-   **Privacy First**: We built a secure comment section for every event so you can coordinate details (like where to meet) without having to share your phone number or socials publicly.
-   **Inclusive by Design**: We didn't want anyone left out. We built in high-quality screen readers and high-contrast modes so that every single student has the same chance to get involved.

## Features

-   **Activity Feed**: Browse and filter events by **Social**, **Fitness**, or **Academics**.
-   **RSVP System**: Join activities with a defined participant limit.
-   **Accessibility First**:
    -   **Screen Reader**: Integrated ElevenLabs TTS for high-quality, human-like event reading (including time and location).
    -   **High Contrast Mode**: Toggleable high-contrast theme for better visibility.
-   **User Profiles**: Supabase Authentication for secure login and profile management.

## Tech Stack

-   **Frontend**: React, Vite, TypeScript, Tailwind CSS
-   **Backend**: Supabase (Auth & Database)
-   **Accessibility**: ElevenLabs API (Text-to-Speech)

## Quick Start

1.  **Clone the repo**:
    ```bash
    git clone https://github.com/niharika-kanw/SpartanSync.git
    cd SpartanSync
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**:
    Create a `.env` file in the root directory with the following keys:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_key
    VITE_ELEVENLABS_API_KEY=your_elevenlabs_key
    ```

4.  **Run locally**:
    ```bash
    npm run dev
    ```

## Go Green! 🟢
