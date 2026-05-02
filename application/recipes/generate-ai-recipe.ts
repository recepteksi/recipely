import { fail, ok, type Result } from '@core/result/result';
import { Failure } from '@core/failure';

export interface RecipeDraft {
  name: string;
  cuisine: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  ingredients: string[];
  instructions: string[];
}

export class AiUnavailableFailure extends Failure {
  readonly code = 'AI_UNAVAILABLE';
  constructor(readonly message: string = 'AI is not configured') {
    super();
  }
}

export class AiCallFailure extends Failure {
  readonly code = 'AI_CALL_FAILED';
  constructor(readonly message: string) {
    super();
  }
}

const SYSTEM_PROMPT = (langName: string): string =>
  `You are a chef assistant. Reply with VALID JSON only (no markdown fences, no commentary). Schema:
{"name":string,"cuisine":string,"difficulty":"Easy"|"Medium"|"Hard","prepTimeMinutes":number,"cookTimeMinutes":number,"servings":number,"ingredients":string[],"instructions":string[]}
Write the recipe in ${langName}.`;

const userMessage = (
  request: string,
  previous: RecipeDraft | undefined,
): string =>
  previous !== undefined
    ? `Current recipe JSON:\n${JSON.stringify(previous)}\n\nApply this change and return the full updated JSON: ${request}`
    : `Request: ${request}`;

const stripFences = (raw: string): string =>
  raw.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();

export interface GenerateAiRecipeArgs {
  prompt: string;
  lang: 'en' | 'tr';
  previous?: RecipeDraft;
}

export const isAiConfigured = (): boolean =>
  typeof process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY === 'string' &&
  process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY.length > 0;

export const generateAiRecipe = async ({
  prompt,
  lang,
  previous,
}: GenerateAiRecipeArgs): Promise<Result<RecipeDraft, Failure>> => {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (apiKey === undefined || apiKey.length === 0) {
    return fail(new AiUnavailableFailure('AI is not configured'));
  }

  const langName = lang === 'tr' ? 'Turkish' : 'English';
  const sys = SYSTEM_PROMPT(langName);
  const user = userMessage(prompt, previous);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: sys,
        messages: [{ role: 'user', content: user }],
      }),
    });

    if (!response.ok) {
      return fail(new AiCallFailure(`AI request failed (${response.status})`));
    }

    const json = (await response.json()) as {
      content?: { type: string; text: string }[];
    };
    const text = json.content?.find((c) => c.type === 'text')?.text ?? '';
    if (text.length === 0) {
      return fail(new AiCallFailure('AI returned an empty response'));
    }

    const parsed = JSON.parse(stripFences(text)) as RecipeDraft;
    return ok(parsed);
  } catch (err) {
    return fail(new AiCallFailure(`AI call failed: ${(err as Error).message}`));
  }
};
