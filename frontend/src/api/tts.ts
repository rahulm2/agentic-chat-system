import { apiFetch } from './client';

export async function synthesizeSpeech(text: string, messageId?: string): Promise<ArrayBuffer> {
  const response = await apiFetch('/api/tts', {
    method: 'POST',
    body: JSON.stringify({ text, messageId }),
  });

  if (!response.ok) {
    throw new Error(`TTS request failed: ${response.status}`);
  }

  return response.arrayBuffer();
}
