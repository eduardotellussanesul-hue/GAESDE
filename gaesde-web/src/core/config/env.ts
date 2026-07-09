export const env = {
  apiBaseUrl: 'http://localhost:3000',
  requestTimeoutMs: 8000,
  geminiApiKey: (import.meta.env.VITE_GEMINI_API_KEY ?? '').trim(),
  geminiModel: (import.meta.env.VITE_GEMINI_MODEL ?? 'gemini-2.5-flash').trim(),
};
