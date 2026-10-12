export type TextPolishInput = {
  originalText: string;
  locale: 'zh-CN' | 'en';
};

export type TextPolishResult = {
  polishedText: string;
  providerId: string;
  modelId: string;
};

export type PolishErrorCode =
  | 'no_key'
  | 'unauthorized'
  | 'insufficient_balance'
  | 'rate_limited'
  | 'network'
  | 'timeout'
  | 'bad_response'
  | 'server';

export class PolishError extends Error {
  code: PolishErrorCode;
  constructor(code: PolishErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

export interface TextPolishProvider {
  id: string;
  polish(input: TextPolishInput, signal?: AbortSignal): Promise<TextPolishResult>;
}
