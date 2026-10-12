import { buildPolishUserText, POLISH_SYSTEM_PROMPT } from './prompt';
import { getApiKey } from './secureKey';
import { PolishError, type TextPolishInput, type TextPolishProvider, type TextPolishResult } from './types';

const ENDPOINT = 'https://api.deepseek.com/chat/completions';
const MODEL = 'deepseek-chat';
const TIMEOUT_MS = 30000;
const MAX_INPUT = 4000;

function mapStatus(status: number): PolishError {
  if (status === 401 || status === 403) return new PolishError('unauthorized');
  if (status === 402) return new PolishError('insufficient_balance');
  if (status === 429) return new PolishError('rate_limited');
  if (status >= 500) return new PolishError('server');
  return new PolishError('bad_response');
}

export const deepSeekProvider: TextPolishProvider = {
  id: 'deepseek',
  async polish(input: TextPolishInput, signal?: AbortSignal): Promise<TextPolishResult> {
    const key = await getApiKey();
    if (!key) throw new PolishError('no_key');

    const original = input.originalText.trim();
    if (!original) throw new PolishError('bad_response');
    const text = original.length > MAX_INPUT ? original.slice(0, MAX_INPUT) : original;

    const controller = new AbortController();
    const onAbort = () => controller.abort();
    signal?.addEventListener('abort', onAbort);
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0.2,
          stream: false,
          messages: [
            { role: 'system', content: POLISH_SYSTEM_PROMPT },
            { role: 'user', content: buildPolishUserText(text, input.locale) },
          ],
        }),
        signal: controller.signal,
      });

      if (!res.ok) throw mapStatus(res.status);

      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) throw new PolishError('bad_response');

      return { polishedText: content, providerId: 'deepseek', modelId: MODEL };
    } catch (e) {
      if (e instanceof PolishError) throw e;
      if (e instanceof Error && e.name === 'AbortError') throw new PolishError('timeout');
      throw new PolishError('network');
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    }
  },
};
