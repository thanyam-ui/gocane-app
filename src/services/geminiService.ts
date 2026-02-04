// src/services/geminiService.ts
import { GoogleGenAI } from "@google/genai";
import { UserProfile, AssessmentData, DeviceRecommendation, HealthCondition, Gender } from "../types";

/**
 * NOTE:
 * - This file is written to be TS-safe (no possibly-undefined access).
 * - It uses Vite env: import.meta.env.VITE_API_KEY (client-side).
 * - For production security, move API calls to serverless (do later).
 */

function getApiKey(): string {
  const key = import.meta.env.VITE_API_KEY;
  if (!key) throw new Error("Missing VITE_API_KEY");
  return key;
}

function normalizeProfile(profile: UserProfile): UserProfile {
  return {
    ...profile,
    conditions: profile.conditions ?? [HealthCondition.NONE],
    gender: profile.gender ?? Gender.NOT_SPECIFIED,
  };
}

function safeJsonParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function getDeviceRecommendations(
  profile: UserProfile,
  assessment: AssessmentData,
  language: "th" | "en"
): Promise<DeviceRecommendation[]> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const p = normalizeProfile(profile);

  const conditions = p.conditions ?? [HealthCondition.NONE];

  // คุณสามารถปรับ prompt ให้ตรง requirement ได้
  const prompt = `
You are a professional physical therapist.
Return ONLY JSON array. No markdown.

Language: ${language}

User profile:
- name: ${p.name}
- age: ${p.age}
- gender: ${p.gender}
- weight: ${p.weight ?? 0}
- height: ${p.height ?? 0}
- conditions: ${conditions.join(", ")}
- isSelf: ${p.isSelf ? "true" : "false"}

Assessment:
- mobilityLevel: ${assessment.mobilityLevel}
- sitToStand: ${assessment.sitToStand}
- upperBodyStrength: ${assessment.upperBodyStrength}
- weightBearing: ${assessment.weightBearing}
- primaryEnvironment: ${assessment.primaryEnvironment}
- budgetRange: ${assessment.budgetRange}

You must recommend 3-5 walking aid devices.
Each item MUST match this schema:

[
  {
    "id": "string",
    "name": "string",
    "reason": "string",
    "qualityRating": number,
    "approxPrice": number,
    "tutorialVideoId": "CANE" | "QUAD_CANE" | "WALKER" | "ROLLATOR",
    "purchaseLinks": [
      { "vendor": "string", "price": number, "url": "string" }
    ]
  }
]
`;

  // รุ่น SDK อาจต่างกันตามเวอร์ชัน; ใช้ generateContent แบบปลอดภัย
  const result = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const text =
    (result as any)?.text ??
    (result as any)?.response?.text ??
    (result as any)?.candidates?.[0]?.content?.parts?.map((x: any) => x?.text ?? "").join("") ??
    "";

  const parsed = safeJsonParse<DeviceRecommendation[]>(text);
  if (Array.isArray(parsed)) return parsed;

  // fallback: ถ้าโมเดลตอบไม่เป็น JSON ให้ return ว่าง เพื่อไม่ให้ app พัง
  return [];
}
