import { GoogleGenAI } from "@google/genai";
import { Attachment, GenerationConfig } from "../types";

// Helper to get a fresh client instance
function getAiClient() {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export const SUPPORTED_MODELS = [
  { id: 'creative', name: 'The Bard', color: 'bg-emerald-600' },
  { id: 'reasoning', name: 'The Scholar', color: 'bg-blue-700' },
];

const MODEL_PERSONAS: Record<string, string> = {
  'creative': "You are 'The Bard'. You are poetic, witty, and adventurous. You speak with a slight flair of old-world charm but keep it concise.",
  'reasoning': "You are 'The Scholar'. You are logical, precise, and wise. You provide facts and structure like an ancient librarian.",
};

async function detectIntent(prompt: string, hasMedia: boolean): Promise<'TEXT' | 'IMAGE'> {
  const p = prompt.toLowerCase();
  const imageKeywords = ['image', 'photo', 'picture', 'draw', 'sketch', 'paint', 'render', 'illustration', 'cartoon', 'visualize', 'logo', 'portrait', 'canvas'];
  if (imageKeywords.some(k => p.includes(k))) return 'IMAGE';

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite', 
      contents: `Classify intent: "IMAGE" if user wants visual generation/edit. "TEXT" otherwise. Prompt: "${prompt}". Output 1 word.`,
      config: { maxOutputTokens: 5 }
    });
    const text = response.text?.trim().toUpperCase();
    return text?.includes('IMAGE') ? 'IMAGE' : 'TEXT';
  } catch (e) {
    return 'TEXT';
  }
}

export async function generateSpeech(text: string): Promise<string | undefined> {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: { parts: [{ text: text }] },
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Fenrir' }, // Deeper voice for adventure
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    return undefined;
  }
}

async function generateImage(prompt: string, config: GenerationConfig, inputImage?: Attachment): Promise<{ text: string, attachment?: Attachment }> {
  try {
    const ai = getAiClient();
    const parts: any[] = [];
    if (inputImage && inputImage.mimeType.startsWith('image/')) {
      parts.push({ inlineData: { mimeType: inputImage.mimeType, data: inputImage.data } });
    }
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: { parts },
      config: { imageConfig: { aspectRatio: config.aspectRatio } }
    });

    let textResponse = "";
    let generatedImage: Attachment | undefined;
    const contentParts = response.candidates?.[0]?.content?.parts;
    
    if (contentParts) {
      for (const part of contentParts) {
        if (part.text) textResponse += part.text;
        if (part.inlineData) {
          generatedImage = { mimeType: part.inlineData.mimeType || 'image/png', data: part.inlineData.data };
        }
      }
    }

    if (!generatedImage) return { text: "The canvas remains blank. Let us try again." };
    return { text: textResponse || "A vision has been captured.", attachment: generatedImage };
  } catch (error) {
    console.error("Image generation error:", error);
    return { text: "The spirits of art are quiet today. Error generating image." };
  }
}

async function handleResearchRequest(userPrompt: string): Promise<string> {
    const ai = getAiClient();
    
    // We use Google Search Grounding to get real-time info
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
            tools: [{ googleSearch: {} }],
        }
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    let finalText = response.text || "Research complete.";

    if (groundingChunks && groundingChunks.length > 0) {
        finalText += "\n\n**Scrolls of Knowledge:**\n";
        groundingChunks.forEach((chunk: any) => {
            if (chunk.web?.uri) {
                finalText += `- [${chunk.web.title || 'Unknown Tome'}](${chunk.web.uri})\n`;
            }
        });
    }
    
    return finalText;
}

async function querySingleModel(modelId: string, userPrompt: string, media?: Attachment): Promise<{ id: string, response: string }> {
  try {
    const ai = getAiClient();
    const parts: any[] = [];
    if (media) {
      parts.push({ inlineData: { mimeType: media.mimeType, data: media.data } });
    }
    parts.push({ text: userPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: { systemInstruction: MODEL_PERSONAS[modelId], temperature: 0.7 }
    });

    return { id: modelId, response: response.text || "" };
  } catch (error) {
    return { id: modelId, response: "" };
  }
}

async function synthesizeResponses(userPrompt: string, modelResponses: { id: string, response: string }[], hasMedia: boolean): Promise<string> {
  const ai = getAiClient();
  const aggregatedContext = modelResponses.map(m => `[${m.id.toUpperCase()}]: ${m.response}`).join('\n');

  const synthesisPrompt = `
You are AZ AI, The Grand Archivist. User Query: "${userPrompt}"
Context from your advisors (Bard & Scholar):
${aggregatedContext}

Task: Synthesize a single response.
Rules:
1. Be concise but elegant.
2. If code is requested, provide it in a markdown block.
3. Combine the wit of the Bard and wisdom of the Scholar.
4. Speak with authority and grace.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: synthesisPrompt,
      config: { temperature: 0.5 }
    });
    return response.text || "The archives are silent.";
  } catch (error) {
    return "The connection to the archives has been severed.";
  }
}

async function handleGameRequest(gameType: string, userPrompt: string): Promise<string> {
   const ai = getAiClient();
   let systemInstruction = "";
   let prompt = userPrompt;

   if (gameType === "20_questions") {
     systemInstruction = "You are the Sphinx of Riddles. Play 20 Questions. Be mysterious yet fair.";
     if (!userPrompt) prompt = "Start a new game of 20 questions. Pick a secret object and give me a cryptic hint.";
   } else if (gameType === "rpg") {
     systemInstruction = "You are the Dungeon Master. Lead the user on a perilous fantasy adventure. Vivid descriptions, high stakes. Offer 2 choices.";
     if (!userPrompt) prompt = "Start a new fantasy adventure in a forgotten kingdom.";
   } else if (gameType === "trivia") {
     systemInstruction = "You are the Quiz Master. Ask difficult questions about history, science, or myth. Grade the answers sternly but fairly.";
     if (!userPrompt) prompt = "Challenge me with a trivia question.";
   } else if (gameType === "custom_maker") {
     systemInstruction = `You are the Game Architect. The user will define the rules. Follow them precisely but add flavor text.`;
     prompt = `User's Design: "${userPrompt}". Begin.`;
   }

   const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { systemInstruction }
   });
   return response.text || "The game cannot begin.";
}

async function handleCompilerRequest(userPrompt: string): Promise<string> {
    const ai = getAiClient();
    const systemInstruction = `You are the Royal Engineer. 
    Your goal is to build perfect structures (code).
    
    Rules:
    1. If the user provides code, fix it and present the pristine version.
    2. If the user asks for code, generate efficient, clean code in a markdown block.
    3. Prioritize JavaScript/HTML/CSS.
    4. Keep explanations brief.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: { systemInstruction }
    });
    return response.text || "The blueprint is flawed.";
}

export const generateAzAiResponse = async (
  prompt: string, 
  media: Attachment | undefined,
  config: GenerationConfig,
  onStatusUpdate: (modelId: string, status: 'querying' | 'complete') => void,
  onModeChange?: (mode: 'chat' | 'image' | 'game' | 'code' | 'research') => void,
  forcedMode?: 'chat' | 'image' | 'game' | 'code' | 'research',
  gameType?: string
): Promise<{ text: string, attachment?: Attachment, modelName?: string }> => {
  
  // Research Mode
  if (forcedMode === 'research') {
     if (onModeChange) onModeChange('research');
     const text = await handleResearchRequest(prompt);
     return { text, modelName: "The Oracle 🌐" };
  }

  // Code/Compiler Mode
  if (forcedMode === 'code') {
     if (onModeChange) onModeChange('code');
     const text = await handleCompilerRequest(prompt);
     return { text, modelName: "Royal Engineer 🛠️" };
  }

  // Game Mode
  if (forcedMode === 'game' && gameType) {
    if (onModeChange) onModeChange('game');
    const text = await handleGameRequest(gameType, prompt);
    return { text, modelName: "Dungeon Master 🎲" };
  }

  // Image Check
  let intent = forcedMode === 'image' ? 'IMAGE' : await detectIntent(prompt, !!media);
  
  if (intent === 'IMAGE') {
    if (onModeChange) onModeChange('image');
    const result = await generateImage(prompt, config, media);
    return { ...result, modelName: "Court Painter 🎨" };
  }

  // Text Mode (Fast Path)
  if (onModeChange) onModeChange('chat');

  const promiseList = SUPPORTED_MODELS.map(async (model) => {
    onStatusUpdate(model.id, 'querying');
    const result = await querySingleModel(model.id, prompt, media);
    onStatusUpdate(model.id, 'complete');
    return result;
  });

  const results = await Promise.all(promiseList);
  const finalText = await synthesizeResponses(prompt, results, !!media);
  
  return { text: finalText, modelName: "Grand Archivist 📜" };
};
