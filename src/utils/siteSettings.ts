export async function upsertSetting(key: string, value: string): Promise<boolean> {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
    return true;
  } catch (e) {
    return false;
  }
}
