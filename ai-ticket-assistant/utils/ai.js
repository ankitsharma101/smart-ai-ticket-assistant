import { createAgent, gemini } from "@inngest/agent-kit";

const analyzeTicket = async (ticket) => {
  const prompt = `Analyze the following support ticket and return a JSON object with:
- summary
- priority ("low", "medium", "high")
- helpfulNotes
- relatedSkills

Respond ONLY as raw JSON. Do NOT use markdown or wrap your answer in triple backticks.

---
Ticket Title: ${ticket.title}
Description: ${ticket.description}
`;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Clean up any backticks
    let cleaned = text.trim();
    if (cleaned.startsWith("```json") || cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/```json|```/g, "").trim();
    }

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("❌ Gemini API call failed:", err.message);
    return null;
  }
};

export default analyzeTicket;
