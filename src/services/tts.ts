import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const DB_NAME = 'ai-gitflow-tts-v2';
const STORE_NAME = 'audio-cache';

function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

async function getCachedAudio(text: string): Promise<string | null> {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(text);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  } catch (e) {
    console.warn('IndexedDB get failed', e);
    return null;
  }
}

async function cacheAudio(text: string, base64Data: string): Promise<void> {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(base64Data, text);
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
  } catch (e) {
    console.warn('IndexedDB put failed', e);
  }
}

export async function generateSpeech(text: string, retries = 2, signal?: AbortSignal): Promise<string | null> {
  const cached = await getCachedAudio(text);
  if (cached) {
    console.log("Using cached audio from IndexedDB");
    return cached;
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (signal?.aborted) return null;
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      if (signal?.aborted) return null;

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        await cacheAudio(text, base64Audio);
        return base64Audio;
      }
      return null;
    } catch (error: any) {
      if (signal?.aborted) return null;
      console.error(`Error generating speech (attempt ${attempt + 1}):`, error);
      if (attempt < retries) {
        // Exponential backoff: 2s, 4s
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt + 1) * 1000));
      }
    }
  }
  return null;
}

let sharedAudioContext: AudioContext | null = null;

export function initAudioContext() {
  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(console.error);
  }
  return sharedAudioContext;
}

export async function playBase64Pcm(base64Data: string, sampleRate: number = 24000, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const audioContext = initAudioContext();
      
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Ensure length is even for Int16Array
      const validLength = bytes.length % 2 === 0 ? bytes.length : bytes.length - 1;
      
      if (validLength === 0) {
        throw new Error("Audio data is empty");
      }
      
      // Convert to Int16Array (PCM 16-bit)
      const buffer = new ArrayBuffer(validLength);
      const view = new DataView(buffer);
      for (let i = 0; i < validLength; i++) {
        view.setUint8(i, bytes[i]);
      }
      const int16Array = new Int16Array(buffer);
      
      // Convert to Float32Array for Web Audio API
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }
      
      const audioBuffer = audioContext.createBuffer(1, float32Array.length, sampleRate);
      audioBuffer.getChannelData(0).set(float32Array);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      let isEnded = false;
      
      source.onended = () => {
        if (isEnded) return;
        isEnded = true;
        resolve();
      };
      
      if (signal) {
        signal.addEventListener('abort', () => {
          if (isEnded) return;
          isEnded = true;
          try { source.stop(); } catch (e) {}
          resolve(); // Resolve early when aborted
        });
      }
      
      source.start(0);
    } catch (error) {
      console.error("Error playing audio:", error);
      reject(error);
    }
  });
}
