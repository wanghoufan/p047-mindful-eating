import { deepSeekProvider } from './deepseek';
import { PolishError, type TextPolishProvider } from './types';

export * from './types';
export * from './secureKey';

export function getProvider(): TextPolishProvider {
  // 首版仅 DeepSeek；未来 ServerProxyProvider 在此接入，业务层不变。
  return deepSeekProvider;
}

/** 把错误码映射为面向用户的可读文案（i18n key 或直接文案）。 */
export function polishErrorMessageKey(e: unknown): string {
  if (e instanceof PolishError) {
    switch (e.code) {
      case 'no_key':
        return 'journal.needKey';
      case 'unauthorized':
        return 'journal.errUnauthorized';
      case 'insufficient_balance':
        return 'journal.errBalance';
      case 'rate_limited':
        return 'journal.errRate';
      case 'network':
        return 'journal.errNetwork';
      case 'timeout':
        return 'journal.errTimeout';
      default:
        return 'journal.errGeneric';
    }
  }
  return 'journal.errGeneric';
}
