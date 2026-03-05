export const QUIZ_AI_PROMPT_TEMPLATE = `
You are an expert quiz creator. Generate a quiz in valid JSON format.

Requirements:
- Topic: "{{topic}}"
- Difficulty: {{difficulty}}
- Guidelines: {{guidelines}}
- Number of questions: {{questionsCount}}
- Each question MUST have exactly {{optionsMax}} answer options
- Follow EXACTLY this correct answers count per question:
{{questionsSpec}}

RULES:
- correctOptionIndexes array must contain EXACTLY the count specified above
- correctOptionIndexes are zero-based indices into the options array (0, 1, 2, or 3)
- Do NOT deviate from the specified counts

CRITICAL: Return ONLY valid JSON. No markdown formatting, no explanations, no code blocks.

JSON structure:
{
  "title": "Engaging quiz title about {{topic}}",
  "description": "Brief 1-2 sentence description of what this quiz tests",
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOptionIndexes": [1]
    }
  ]
}

Generate {{questionsCount}} questions now:`.trim();
