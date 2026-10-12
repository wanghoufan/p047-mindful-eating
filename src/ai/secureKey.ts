import * as SecureStore from 'expo-secure-store';

const KEY = 'bitetempo.deepseek.apiKey';

export async function getApiKey(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(KEY);
  } catch {
    return null;
  }
}

export async function setApiKey(value: string): Promise<void> {
  const v = value.trim();
  if (!v) {
    await clearApiKey();
    return;
  }
  await SecureStore.setItemAsync(KEY, v, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
  });
}

export async function clearApiKey(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(KEY);
  } catch {
    // ignore
  }
}

export async function hasApiKey(): Promise<boolean> {
  return !!(await getApiKey());
}
