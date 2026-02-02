# Spartan Sync 🟢⚪️

A campus connection app designed for Michigan State University students to find study groups, gym buddies, and social events.

<div style="display: flex; justify-content: center; gap: 20;">
<img width=48% alt="image" src="https://github.com/user-attachments/assets/1fae6691-fbc8-44ab-a142-a22c94fab721"/> <img width=48% alt="image" src="https://github.com/user-attachments/assets/7ca59582-ec78-403b-b30a-55f9d7601bd4"/>
</div>

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
