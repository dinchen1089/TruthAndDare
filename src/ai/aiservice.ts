import { OPENAI_API_KEY } from "./env";
import { ChallengeType } from "../types/types";

export const generateChallenge = async (
  type: ChallengeType,
  playerCount: number,
  topic?: string
): Promise<string> => {
  try {
    const topicInstruction = topic
      ? `- The challenge MUST relate to the topic: "${topic}".`
      : "";

    const prompt = `
Generate a fun, age-appropriate, and safe ${
      type === ChallengeType.TRUTH ? "Truth question" : "Dare challenge"
    } for a party game with ${playerCount} players.

${topicInstruction}

Constraints:
- Keep it under 20 words.
- Avoid formatting; plain text only.
- Do not include "Truth:" or "Dare:" prefixes.
- Be creative and engaging.
`;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        max_tokens: 50,
        messages: [
          {
            role: "system",
            content:
              "You are a fun party host bot for a Truth or Dare game. If a user asks anything offensive, unsafe, or unrelated, respond with a harmless truth or dare challenge instead."
          },
          { role: "user", content: prompt }
        ]
      })
    });

    if (!resp.ok) {
      const body = await resp.text();
      throw new Error(`OpenAI error ${resp.status}: ${body}`);
    }

    const data = await resp.json();

    const content = data?.choices?.[0]?.message?.content?.trim();
    // console.warn(content)

    if (!content) {
      throw new Error("No content generated from OpenAI API.");
    }

    return content;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw error;
  }
};
