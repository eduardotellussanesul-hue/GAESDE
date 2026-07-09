import { env } from '../../core/config/env';

export type GeminiChatRole = 'user' | 'assistant';

export interface GeminiChatMessage {
  role: GeminiChatRole;
  text: string;
}

interface GeminiChatContext {
  studentName?: string;
  courseTitle?: string;
  progressPercentage?: number;
}

interface GeminiPart {
  text?: string;
}

interface GeminiContent {
  parts?: GeminiPart[];
}

interface GeminiCandidate {
  content?: GeminiContent;
}

interface GeminiGenerateContentResponse {
  candidates?: GeminiCandidate[];
  error?: {
    message?: string;
  };
}

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

function mapHistoryToPrompt(history: GeminiChatMessage[]): string {
  if (history.length === 0) {
    return '';
  }

  return history
    .slice(-8)
    .map((item) => `${item.role === 'assistant' ? 'Tutor' : 'Aluno'}: ${item.text}`)
    .join('\n');
}

function buildPrompt(userMessage: string, history: GeminiChatMessage[], context: GeminiChatContext): string {
  const contextLines = [
    `Aluno: ${context.studentName ?? 'Aluno'}`,
    `Curso atual: ${context.courseTitle ?? 'N/A'}`,
    `Progresso no curso: ${context.progressPercentage ?? 0}%`,
  ];

  const historyBlock = mapHistoryToPrompt(history);

  return [
    'Você é um tutor educacional em português do Brasil para um LMS.',
    'Responda de forma curta, prática e didática.',
    'Quando possível, dê passos objetivos para o aluno estudar melhor.',
    '',
    'Contexto:',
    ...contextLines,
    '',
    historyBlock ? `Histórico recente:\n${historyBlock}` : 'Sem histórico anterior.',
    '',
    `Pergunta do aluno: ${userMessage}`,
  ].join('\n');
}

function extractResponseText(payload: GeminiGenerateContentResponse): string {
  const parts = payload.candidates?.[0]?.content?.parts ?? [];
  const text = parts.map((part) => part.text ?? '').join('\n').trim();
  return text;
}

export async function askGeminiTutor(params: {
  userMessage: string;
  history: GeminiChatMessage[];
  context: GeminiChatContext;
}): Promise<string> {
  if (!env.geminiApiKey) {
    throw new Error('Configure a variável VITE_GEMINI_API_KEY para usar o chat.');
  }

  const endpoint = `${GEMINI_BASE_URL}/models/${env.geminiModel}:generateContent?key=${encodeURIComponent(env.geminiApiKey)}`;

  const prompt = buildPrompt(params.userMessage, params.history, params.context);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 700,
      },
    }),
  });

  const payload = (await response.json()) as GeminiGenerateContentResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message ?? 'Falha ao consultar o Gemini.');
  }

  const text = extractResponseText(payload);
  if (!text) {
    throw new Error('O Gemini não retornou resposta de texto.');
  }

  return text;
}
