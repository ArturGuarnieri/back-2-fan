
export function safeJsonParse(str: string): { [k: string]: number } | null {
  try {
    const val = JSON.parse(str);
    if (val && typeof val === 'object') return val;
  } catch (e) {}
  return null;
}
