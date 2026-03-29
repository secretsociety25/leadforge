import Anthropic from "@anthropic-ai/sdk";

const DEFAULT_MODEL = "claude-3-5-sonnet-20241022";

/**
 * Claude 3.5 Sonnet — LeadForge Alpha cold email (max ~75 words).
 */
export async function generateClaudeColdEmail(input: {
  firstName: string;
  company: string;
  linkedinUrl: string | null;
  email: string | null;
}): Promise<{ text: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set on the server");
  }

  const client = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL;

  const contextParts = [
    input.linkedinUrl ? `LinkedIn: ${input.linkedinUrl}` : null,
    input.email ? `Email on file: ${input.email}` : null,
  ].filter(Boolean);
  const context =
    contextParts.length > 0 ? contextParts.join("\n") : "No extra profile fields — infer from name and company only.";

  const userPrompt = `You are a top B2B SDR. Write a short, natural, punchy cold email (max 75 words) for this lead:

Name: ${input.firstName}
Company: ${input.company}
Context: ${context}

Structure:
1. Sharp, relevant opening observation (no 'hope this finds you well')
2. One sentence value prop for LeadForge (AI-powered lead generation tool)
3. Low-friction CTA (e.g. 'Open to a quick chat?')

Tone: professional but casual, peer-to-peer, zero fluff. Make it sound 100% human.

Output only the email body text — no subject line, no labels.`;

  const message = await client.messages.create({
    model,
    max_tokens: 512,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("\n")
    .trim();
  if (!text) {
    throw new Error("Claude returned an empty response");
  }
  return { text };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
