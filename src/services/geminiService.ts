// src/services/geminiService.ts
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, AssessmentData, DeviceRecommendation, HealthCondition, Gender } from "../types";

function getApiKey(): string {
  const key = (import.meta as any).env?.VITE_API_KEY as string | undefined;
  if (!key) throw new Error("Missing VITE_API_KEY");
  return key;
}

export async function getDeviceRecommendations(
  profile: UserProfile,
  assessment: AssessmentData,
  language: "th" | "en" = "th"
): Promise<DeviceRecommendation[]> {
  // ✅ normalize กัน undefined ตั้งแต่ต้น
  const safeProfile: UserProfile = {
    ...profile,
    conditions: profile.conditions ?? [HealthCondition.NONE],
    gender: profile.gender ?? Gender.NOT_SPECIFIED,
    weight: profile.weight ?? 0,
    height: profile.height ?? 0,
  };

  const prompt = `
Analyze the following elderly user profile and mobility assessment to recommend suitable mobility aids.
Language for Output: ${language.toUpperCase()}.

User Profile:
- Age: ${safeProfile.age}
- Weight: ${safeProfile.weight} kg
- Height: ${safeProfile.height} cm
- Gender: ${safeProfile.gender}
- Conditions: ${(safeProfile.conditions ?? []).join(", ")}

Assessment:
- Mobility Level: ${assessment.mobilityLevel}
- Sit-to-Stand Ability: ${assessment.sitToStand}
- Upper Body Strength: ${assessment.upperBodyStrength}
- Weight Bearing Status: ${assessment.weightBearing}
- Environment: ${assessment.primaryEnvironment}
- Budget: ${assessment.budgetRange}

Return a JSON array of 3-4 devices.
Each device fields:
id, name, category, description, reason, tutorialVideoId, approxPrice, qualityRating, purchaseLinks[{vendor,url,price}]
`;

  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
              reason: { type: Type.STRING },
              tutorialVideoId: { type: Type.STRING },
              approxPrice: { type: Type.NUMBER },
              qualityRating: { type: Type.NUMBER },
              purchaseLinks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    vendor: { type: Type.STRING },
                    url: { type: Type.STRING },
                    price: { type: Type.NUMBER },
                  },
                  required: ["vendor", "url", "price"],
                },
              },
            },
            required: [
              "id",
              "name",
              "category",
              "description",
              "reason",
              "tutorialVideoId",
              "approxPrice",
              "qualityRating",
              "purchaseLinks",
            ],
          },
        },
      },
    });

    const text = response.text?.trim();
    if (!text) return [];
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? (parsed as DeviceRecommendation[]) : [];
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
}
