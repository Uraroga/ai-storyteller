import { GoogleGenAI, Type } from "@google/genai";
import { Story } from "../types";

// Ensure API Key is available
const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Define schema for text generation
interface SceneResponse {
  narrative: string;
  imagePrompt: string;
}

export const generateSceneContent = async (
  story: Story,
  chapterIndex: number
): Promise<SceneResponse> => {
  if (!API_KEY) throw new Error("API Key missing");

  const chapterContent = story.chapters[chapterIndex];
  
  const prompt = `
    Sei un Narratore Esperto, capace di adattare lo stile alla storia fornita.
    
    CONTESTO STORIA:
    Titolo: ${story.title}
    Sinossi: ${story.synopsis}
    
    CAPITOLO CORRENTE (${chapterIndex + 1}/${story.chapters.length}):
    ${chapterContent}
    
    COMPITI:
    1. Genera una narrazione coinvolgente (max 60-80 parole) per questo capitolo. 
       Stile: Moderno, vivido, cinematografico, scorrevole. Usa l'italiano.
    2. Genera un prompt in INGLESE per un generatore di immagini che descriva visivamente questa scena.
       IMPORTANTE PER LO STILE VISIVO: 
       Usa: "Cinematic digital art, high resolution, soft dramatic lighting, highly detailed, 4k, modern illustration style".
       Evita stili retrò o pixel-art a meno che la storia non lo richieda esplicitamente.
    
    Rispondi in JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            narrative: { type: Type.STRING, description: "La narrazione della scena in italiano" },
            imagePrompt: { type: Type.STRING, description: "Il prompt per l'immagine in inglese" }
          },
          required: ["narrative", "imagePrompt"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No text response from Gemini");
    
    return JSON.parse(text) as SceneResponse;
  } catch (error) {
    console.error("Text Generation Error:", error);
    throw new Error("Failed to generate scene narrative.");
  }
};

export const generateSceneImage = async (imagePrompt: string): Promise<string> => {
  if (!API_KEY) throw new Error("API Key missing");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: imagePrompt }]
      },
      config: {
        // Image generation logic remains the same, prompt controls style
      }
    });

    // Iterate parts to find the image
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
        for (const part of candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                return part.inlineData.data;
            }
        }
    }
    
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw new Error("Failed to generate scene image.");
  }
};