import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export const getCampusSummary = async (activities: any[]) => {
    if (!API_KEY || API_KEY === "your_gemini_api_key_here") {
        return "The Oracle needs a key to speak! (Check your .env file)";
    }
    if (activities.length === 0) return "It's quiet on campus right now. Why not start the first activity?";

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const activityData = activities.slice(0, 10).map(a => ({
        title: a.title,
        category: a.broadCategory,
        location: a.location,
    }));

    const prompt = `
    SYSTEM: You are the "Spartan Oracle," a legendary MSU student spirit.
    TASK: Summarize the campus "vibe" based on these activities: ${JSON.stringify(activityData)}
    CONSTRAINTS: Exactly 2 energetic sentences. MSU lingo (Go Green, Red Cedar).
    VERSION: 1.1
  `;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error: any) {
        console.error("Gemini Error:", error);
        if (error.status === 403) return "API Key failed (403). Check Google AI Studio permissions.";
        return "The Oracle is currently meditating... check back soon!";
    }
};

export const getPersonalizedRecommendation = async (activities: any[], userInterests: string) => {
    if (!API_KEY || API_KEY === "your_gemini_api_key_here") return null;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const activityData = activities.slice(0, 15).map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
    }));

    const prompt = `
    You are the Spartan Oracle. Reach into the data and pick ONE activity for a student who is feeling: "${userInterests}"
    Activities: ${JSON.stringify(activityData)}
    Response format: { "id": "the_id", "reason": "1 short MSU-themed phrase" }
  `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return null;
    } catch (error) {
        console.error("Recommendation Error:", error);
        return null;
    }
};
