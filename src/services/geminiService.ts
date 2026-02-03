
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, AssessmentData, DeviceRecommendation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getDeviceRecommendations(
  profile: UserProfile,
  assessment: AssessmentData,
  language: 'th' | 'en' = 'th'
): Promise<DeviceRecommendation[]> {
  const prompt = `
    Analyze the following elderly user profile and mobility assessment to recommend suitable mobility aids.
    Language for Output: ${language.toUpperCase()} (Thai or English as requested).
    
    User Profile:
    - Age: ${profile.age}
    - Weight: ${profile.weight} kg
    - Height: ${profile.height} cm
    - Gender: ${profile.gender}
    - Conditions: ${profile.conditions.join(", ")}
    
    Assessment:
    - Mobility Level: ${assessment.mobilityLevel}
    - Sit-to-Stand Ability: ${assessment.sitToStand}
    - Upper Body Strength: ${assessment.upperBodyStrength}
    - Weight Bearing Status: ${assessment.weightBearing}
    - Environment: ${assessment.primaryEnvironment}
    - Budget: ${assessment.budgetRange}
    
    Please provide a list of 3-4 recommended devices in JSON format.
    Each device should include:
    - id (unique string)
    - name (Name in ${language === 'th' ? 'Thai' : 'English'})
    - category (Cane, Walker, Rollator, Wheelchair)
    - description (Short description in ${language === 'th' ? 'Thai' : 'English'})
    - reason (Professional PT insight based on sit-to-stand ability, strength, and weight bearing. Explain WHY this specific device helps their condition. Output in ${language === 'th' ? 'Thai' : 'English'})
    - tutorialVideoId (just a string like 'CANE', 'WALKER', etc.)
    - approxPrice (number in Baht, matching budget: Low <1000, Medium 1000-3000, High >3000)
    - qualityRating (1 to 5)
    - purchaseLinks (an array of {vendor: string, url: string, price: number})
  `;

  try {
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
                    price: { type: Type.NUMBER }
                  },
                  required: ["vendor", "url", "price"]
                }
              }
            },
            required: ["id", "name", "category", "description", "reason", "tutorialVideoId", "approxPrice", "qualityRating", "purchaseLinks"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
}
