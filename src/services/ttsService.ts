
import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// ฟังก์ชันถอดรหัส Base64 เป็น Uint8Array (ตามกฎการเขียนโค้ด)
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// ฟังก์ชันแปลงข้อมูลเสียงดิบเป็น AudioBuffer
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

let currentAudioSource: AudioBufferSourceNode | null = null;
let audioCtx: AudioContext | null = null;

export async function speakText(text: string) {
  // หยุดเสียงที่กำลังเล่นอยู่เดิม
  if (currentAudioSource) {
    currentAudioSource.stop();
    currentAudioSource = null;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `กรุณาอ่านข้อความแนะนำอุปกรณ์ช่วยเดินนี้ด้วยน้ำเสียงใจดีและชัดเจน: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore ให้เสียงที่ค่อนข้างเป็นธรรมชาติในภาษาไทย
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("ไม่ได้รับข้อมูลเสียงจาก API");

    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }

    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      audioCtx,
      24000,
      1
    );

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.start();
    currentAudioSource = source;

    return new Promise((resolve) => {
      source.onended = () => {
        currentAudioSource = null;
        resolve(true);
      };
    });
  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
}

export function stopSpeaking() {
  if (currentAudioSource) {
    currentAudioSource.stop();
    currentAudioSource = null;
  }
}
