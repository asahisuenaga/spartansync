const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
// Popular Voices:
// Rachel: 21m00Tcm4TlvDq8ikWAM
// Adam: pNInz6obpgDQGcFmaJgB (Deep, narration)
// Charlie: IKne3meq5aSn9XLyUdCD (Casual, conversational)
const VOICE_ID = "pNInz6obpgDQGcFmaJgB"; // Switched to Adam for more human/narration feel

export const VOICES = {
    ADAM: "pNInz6obpgDQGcFmaJgB", // Deep, narration (Male)
    RACHEL: "21m00Tcm4TlvDq8ikWAM", // Standard (Female)
    CHARLIE: "IKne3meq5aSn9XLyUdCD", // Casual (Male)
};

/**
 * Synthesizes speech from text using ElevenLabs API.
 * @param text The text to speak.
 * @param voiceId The ElevenLabs Voice ID to use.
 * @returns A Promise resolving to an HTMLAudioElement that is ready to play.
 */
export const speakText = async (text: string, voiceId: string = VOICES.ADAM): Promise<HTMLAudioElement> => {
    if (!API_KEY) {
        throw new Error("ElevenLabs API Key is missing");
    }

    try {
        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "xi-api-key": API_KEY,
                },
                body: JSON.stringify({
                    text,
                    model_id: "eleven_monolingual_v1",
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail?.message || "Failed to synthesize speech");

        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        return audio;
    } catch (error) {
        console.error("ElevenLabs TTS Error:", error);
        throw error;
    }
};
