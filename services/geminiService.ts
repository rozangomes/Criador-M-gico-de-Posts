
import { GoogleGenAI, Modality, GenerateContentResponse, Part } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real application, you might want to show this error in the UI.
  // For this example, we throw an error to halt execution if the key is missing.
  throw new Error("API_KEY do Google não encontrada. Verifique suas variáveis de ambiente.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Generates or edits an image using the Gemini 2.5 Flash Image model.
 * @param prompt The user's text prompt.
 * @param base64Images Optional array of base64 data URLs of images to edit.
 * @returns A promise that resolves to a base64 data URL of the generated image.
 */
export async function generateImageFromPrompt(prompt: string, base64Images: string[] | null): Promise<string> {
  try {
    const parts: Part[] = [];

    // If base64 images are provided, add them to the parts for editing.
    if (base64Images && base64Images.length > 0) {
      for (const base64Image of base64Images) {
          const match = base64Image.match(/^data:(image\/.+);base64,(.+)$/);
          if (!match) {
            console.warn("Formato de imagem inválido pulado:", base64Image.substring(0, 30));
            continue; // Skip invalid image formats
          }
          const [, mimeType, data] = match;

          parts.push({
            inlineData: { mimeType, data },
          });
      }
    }
    
    // Use a different prompt structure for generation vs. editing.
    const hasImages = parts.some(p => p.inlineData);
    const textPrompt = hasImages
      ? prompt // For editing, use the prompt as a direct instruction.
      : `Gere uma imagem criativa e envolvente para uso no Instagram, com alta qualidade e visualmente atraente, em formato quadrado (1:1). A imagem deve ser baseada na seguinte frase: "${prompt}"`;
    
    if (!textPrompt.trim()) {
        throw new Error("O prompt de texto não pode estar vazio.");
    }

    parts.push({ text: textPrompt });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }

    throw new Error("Nenhuma imagem foi gerada pela IA. Tente novamente com um prompt diferente.");

  } catch (error) {
    console.error("Erro ao gerar imagem com a API Gemini:", error);
    if (error instanceof Error) {
        return Promise.reject(`Falha ao gerar imagem: ${error.message}`);
    }
    return Promise.reject("Ocorreu um erro desconhecido ao se comunicar com a API.");
  }
}
