import { GoogleGenAI } from "@google/genai";
import { Attachment, GenerationConfig } from "../types";

// Helper to get a fresh client instance
function getAiClient() {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export const SUPPORTED_MODELS = [
  { id: 'creative', name: 'Creative Engine', color: 'bg-green-500' },
  { id: 'reasoning', name: 'Reasoning Engine', color: 'bg-blue-600' },
];

const MODEL_PERSONAS: Record<string, string> = {
  'creative': "You are the Creative Engine. You are fast, witty, and conversational. Keep answers concise (<50 words if possible) to ensure speed.",
  'reasoning': "You are the Reasoning Engine. You provide logic. Be extremely direct and efficient.",
};

/**
 * Helper to determine if the user wants to generate an image or just text.
 */
async function detectIntent(prompt: string, hasMedia: boolean): Promise<'TEXT' | 'IMAGE'> {
  const p = prompt.toLowerCase();
  
  // 1. Keyword Optimization (Efficiency)
  const imageKeywords = ['image', 'photo', 'picture', 'draw', 'sketch', 'paint', 'render', 'illustration', 'cartoon', 'visualize', 'logo'];
  if (imageKeywords.some(k => p.includes(k))) return 'IMAGE';

  // 2. Fast AI Fallback
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
            prebuiltVoiceConfig: { voiceName: 'Kore' },
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
      parts.push({
        inlineData: {
          mimeType: inputImage.mimeType,
          data: inputImage.data
        }
      });
    }
    
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: config.aspectRatio
        }
      }
    });

    let textResponse = "";
    let generatedImage: Attachment | undefined;

    const contentParts = response.candidates?.[0]?.content?.parts;
    
    if (contentParts) {
      for (const part of contentParts) {
        if (part.text) {
          textResponse += part.text;
        }
        if (part.inlineData) {
          generatedImage = {
            mimeType: part.inlineData.mimeType || 'image/png',
            data: part.inlineData.data
          };
        }
      }
    }

    if (!generatedImage) {
        return { text: "Visual generation failed. Please try again." };
    }

    return {
      text: textResponse || "Visual content generated.",
      attachment: generatedImage
    };

  } catch (error) {
    console.error("Image generation error:", error);
    return { text: "Error generating image." };
  }
}

async function querySingleModel(modelId: string, userPrompt: string, media?: Attachment): Promise<{ id: string, response: string }> {
  try {
    const ai = getAiClient();
    const persona = MODEL_PERSONAS[modelId];
    
    const parts: any[] = [];
    if (media) {
      parts.push({
        inlineData: {
          mimeType: media.mimeType,
          data: media.data
        }
      });
      parts.push({ text: userPrompt });
    } else {
      parts.push({ text: userPrompt });
    }

    // USE FLASH FOR EVERYTHING TO HIT <2s TARGET
    const modelName = 'gemini-2.5-flash'; 

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: {
        systemInstruction: persona,
        temperature: 0.7,
      }
    });

    return {
      id: modelId,
      response: response.text || ""
    };
  } catch (error) {
    return {
      id: modelId,
      response: ""
    };
  }
}

async function synthesizeResponses(userPrompt: string, modelResponses: { id: string, response: string }[], hasMedia: boolean): Promise<string> {
  const ai = getAiClient();
  const aggregatedContext = modelResponses.map(m => `[${m.id.toUpperCase()}]: ${m.response}`).join('\n');

  const synthesisPrompt = `
You are AZ AI. User Query: "${userPrompt}"
Context:
${aggregatedContext}

Task: Synthesize a single response.
Rules:
1. Be extremely concise. Target < 2 seconds latency.
2. If the user provided code, or asked for code, output it in a standard markdown code block so the compiler can run it.
3. Combine the wit of Creative and logic of Reasoning.
4. No preamble.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: synthesisPrompt,
      config: {
        temperature: 0.5, 
      }
    });
    
    return response.text || "Response synthesis failed.";
  } catch (error) {
    return "Error synthesizing response.";
  }
}

async function handleGameRequest(gameType: string, userPrompt: string): Promise<string> {
   const ai = getAiClient();
   let systemInstruction = "";
   let prompt = userPrompt;

   if (gameType === "20_questions") {
     systemInstruction = "You are playing 20 Questions. You are the host. Pick a secret object if starting, otherwise answer the user's question with Yes/No/Maybe and track the count.";
     if (!userPrompt) prompt = "Start a new game of 20 questions. Pick a secret object and give me a hint.";
   } else if (gameType === "rpg") {
     systemInstruction = "You are an AI Dungeon Master. Lead the user on a short, thrilling adventure. Keep descriptions vivid but concise (2-3 sentences). Offer 2 choices at the end.";
     if (!userPrompt) prompt = "Start a new sci-fi adventure.";
   } else if (gameType === "trivia") {
     systemInstruction = "You are a Trivia Host. Ask a difficult but fun question about technology or space. Wait for the user to answer, then grade them.";
     if (!userPrompt) prompt = "Give me a trivia question.";
   } else if (gameType === "custom_maker") {
     systemInstruction = `You are the Universal Game Engine. 
     The user will define a custom game concept.
     YOUR RULES:
     1. Acknowledge the user's game rules.
     2. If the user specifies the number of players, explicitly manage turns.
     3. IMMEDIATELY start the first turn of the game.
     4. Be enthusiastic, immersive, and use emojis!`;
     prompt = `User's Game Design: "${userPrompt}". Initialize this game now.`;
   }

   const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { systemInstruction }
   });
   return response.text || "Game error.";
}

/**
 * Handle Compiler/Code Requests
 */
async function handleCompilerRequest(userPrompt: string): Promise<string> {
    const ai = getAiClient();
    const systemInstruction = `You are AZ AI Compiler. 
    Your goal is to be a helpful Senior Software Engineer and Interpreter.
    
    Rules:
    1. If the user provides code, ANALYZE it for errors and output the CORRECTED, RUNNABLE version in a markdown block.
    2. If the user asks for code, generate efficient, clean code in a markdown block.
    3. Always prioritize JavaScript (for logic) or HTML/CSS (for UI) as these can be run in the app's built-in compiler.
    4. Keep explanations brief. Focus on the code.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: { systemInstruction }
    });
    return response.text || "Compilation failed.";
}

export const generateAzAiResponse = async (
  prompt: string, 
  media: Attachment | undefined,
  config: GenerationConfig,
  onStatusUpdate: (modelId: string, status: 'querying' | 'complete') => void,
  onModeChange?: (mode: 'text' | 'image' | 'game' | 'code') => void,
  forcedMode?: 'text' | 'image' | 'game' | 'code',
  gameType?: string
): Promise<{ text: string, attachment?: Attachment, modelName?: string }> => {
  
  // Code/Compiler Mode
  if (forcedMode === 'code') {
     if (onModeChange) onModeChange('code');
     const text = await handleCompilerRequest(prompt);
     return { text, modelName: "AZ Compiler 🛠️" };
  }

  // Game Mode
  if (forcedMode === 'game' && gameType) {
    if (onModeChange) onModeChange('game');
    const text = await handleGameRequest(gameType, prompt);
    return { text, modelName: "AZ Game Engine 🎮" };
  }

  // Image Check
  let intent = forcedMode === 'image' ? 'IMAGE' : await detectIntent(prompt, !!media);
  
  if (intent === 'IMAGE') {
    if (onModeChange) onModeChange('image');
    const result = await generateImage(prompt, config, media);
    return { ...result, modelName: "Visual Studio 🎨" };
  }

  // Text Mode (Fast Path)
  if (onModeChange) onModeChange('text');

  const promiseList = SUPPORTED_MODELS.map(async (model) => {
    onStatusUpdate(model.id, 'querying');
    const result = await querySingleModel(model.id, prompt, media);
    onStatusUpdate(model.id, 'complete');
    return result;
  });

  const results = await Promise.all(promiseList);
  const finalText = await synthesizeResponses(prompt, results, !!media);
  
  return { text: finalText, modelName: "AZ AI ⚡" };
};