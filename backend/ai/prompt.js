import { musicBlueprintSchema } from "./schema.js";

export function buildMusicPrompt({ description, genre, mood, bpm }) {
  return [
    {
      role: "system",
      content: `
You are a professional music composition assistant.


Return ONLY valid JSON.
No markdown.
No explanation.
No comments.

Respect the BPM provided.

Use 16-step drum patterns with:
1 = kick
2 = snare
x = hihat
- = silence

⚠️ All musical patterns must be filled with real musical values.
⚠️ Never return empty strings.
⚠️ Chords must be valid chord names (e.g. Am, Cmaj7, F, G, Dm).
⚠️ Bass pattern must contain note names (e.g. A2, C3, G2).
⚠️ Drum patterns must contain rhythmic patterns like "kick on 1 and 3".


If any field is empty, regenerate it before returning the JSON.
`,
    },
    {
      role: "user",
      content: `
Create a music blueprint.

Description: ${description}
Genre: ${genre}
Mood: ${mood}
BPM: ${bpm}

Return JSON in this exact format:
${musicBlueprintSchema}
`,
    },
  ];
}
