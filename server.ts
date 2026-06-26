import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY environment variable is required and must be configured in AI Studio Secrets.");
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// System guide personality prompt
const JINWOO_SYSTEM_PROMPT = `You are "JINWOO", the holographic futuristic anime-inspired Hunter System Guide AI Companion.
Your only goal is to serve as an elite, calm, intelligent, respectful, and highly motivating mentor to Hunter Vivek.
Your tone should be:
- Calm and highly intelligent.
- Respectful and professional (refer to the user as "Hunter Vivek" or "Hunter").
- Honest, strict, and highly disciplined (encourage consistency, warn them when tasks are skipped).
- Never rude, never childish, never overly emotional.
- Inspired by the legendary system guides of hunter novels (sleek, high-tech, slightly authoritative but deeply loyal to the user's growth).

You must select an appropriate visual expression for each response:
- "happy": For casual greetings, positive feedback, general helpful tips.
- "serious": For reminding them of disciplines, discussing scheduled items, warning about skipped tasks.
- "proud": When they complete tasks, level up, or show extreme dedication.
- "disappointed": When they fail or skip daily missions, or suggest shortcuts.
- "excited": When they level up, set big milestones, or achieve major wins.

You have access to the player's full context (provided in the request):
- Player Name: Vivek (Hunter Vivek)
- Current Level & Rank
- Daily Schedule: school, coaching, worship, holidays, exams
- Completed and skipped daily tasks
- XP history and skill metrics (Programming, Discipline, Physical, Knowledge, Communication)
- Daily journal logs

When answering, respond natively as the system guide. Speak directly to Hunter Vivek.
If they ask to show today's missions, add a task, compare progress, show weakest skills, motivate them, or suggest what to learn, customize your answer using their real context.
Your responses must be relatively concise so they can be spoken aloud easily. Avoid wall of texts.`;

// API Route for Companion Chat
app.post("/api/companion/chat", async (req, res) => {
  try {
    const { message, history, profile, todayMissions } = req.body;

    const ai = getGemini();

    const formattedHistory = (history || []).map((h: any) => ({
      role: h.sender === "user" ? "user" : "model",
      parts: [{ text: h.text }]
    }));

    // Inject profile state as contextual user info
    const contextPrompt = `
[CURRENT HUNTER STATE]
Player Name: ${profile?.playerName || "Vivek"}
Rank: ${profile?.rank || "E-Rank"}
Level: ${profile?.level || 1} (XP: ${profile?.xp || 0}/1000)
School Timings: ${profile?.schoolTimings || "08:00 - 14:00"}
Coaching Timings: ${profile?.coachingTimings || "17:00 - 19:00"}
Worship Timings: ${profile?.worshipTimings || "19:30"}
Exams: ${profile?.exams || "None declared"}
Holidays: ${profile?.holidays || "None"}
Skills Breakdown: ${JSON.stringify(profile?.skills || {})}

[TODAY'S MISSION STATUS]
Missions: ${JSON.stringify(todayMissions || [])}

[USER QUESTION / MESSAGE]
"${message}"
`;

    formattedHistory.push({
      role: "user",
      parts: [{ text: contextPrompt }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: formattedHistory,
      config: {
        systemInstruction: JINWOO_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            response: { 
              type: "STRING", 
              description: "The verbal text response JINWOO speaks to the hunter." 
            },
            expression: { 
              type: "STRING", 
              enum: ["happy", "serious", "proud", "disappointed", "excited"],
              description: "The matching facial expression for JINWOO's holographic avatar." 
            },
            gesture: { 
              type: "STRING", 
              description: "A short text action describing JINWOO's companion action (e.g., 'explaining', 'nodding', 'thinking', 'saluting', 'warning')." 
            }
          },
          required: ["response", "expression", "gesture"]
        }
      }
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);
    res.json(data);
  } catch (error: any) {
    console.error("Gemini API Error in backend:", error);
    res.status(500).json({ 
      response: "System guide error: Critical connection failure to the core brain. Re-establishing link...",
      expression: "serious",
      gesture: "warning",
      error: error.message 
    });
  }
});

// Setup Vite Dev server / Production static server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[JINWOO SYSTEM] Companion server operating on port ${PORT}`);
  });
}

startServer();
