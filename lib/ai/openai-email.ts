import OpenAI from "openai";

/**
 * GPT-4o cold email — tuned for punchy B2B outreach (LeadForge MVP).
 */
export async function generateColdEmailDraft(input: {
  firstName: string;
  company: string;
  linkedinUrl: string | null;
  targetProblem: string;
}): Promise<{ text: string }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set on the server");
  }

  const client = new OpenAI({ apiKey });

  const contextBits = [
    input.linkedinUrl ? `LinkedIn: ${input.linkedinUrl}` : null,
    input.targetProblem ? `Likely pain / hypothesis: ${input.targetProblem}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const userPrompt = `You are a 7-figure B2B Sales Consultant.

Context: ${input.firstName} works at ${input.company}. Their LinkedIn profile/role suggests:
${contextBits || "(Use role + company only.)"}

Task: Write a short, punchy 3-part cold email:
1. The Observation: A peer-to-peer non-cringe opening line.
2. The Bridge: Connect their likely pain point to a solution (Lead Gen / AI Receptionist style outcomes for ${input.company}).
3. The Low-Friction CTA: Ask a 'mind-shifted' question (e.g., "Open to a brief chat?" not "Book a demo").

Tone: Professional, brief (max 75 words), zero fluff, no "I hope you're well", no subject line — body only.

Use plain text with line breaks between the 3 parts.`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 350,
    temperature: 0.65,
    messages: [
      {
        role: "system",
        content:
          "You write concise B2B cold email bodies. Never fabricate private facts; stick to public-role inference and user-provided hints.",
      },
      { role: "user", content: userPrompt },
    ],
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("OpenAI returned an empty completion");
  }
  return { text };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
