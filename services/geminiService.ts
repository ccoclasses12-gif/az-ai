import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Models we are "querying" (simulating via personas)
export const SUPPORTED_MODELS = [
  { id: 'chatgpt', name: 'ChatGPT', color: 'bg-green-500' },
  { id: 'deepseek', name: 'DeepSeek', color: 'bg-blue-600' },
  { id: 'gemini', name: 'Gemini', color: 'bg-sky-500' },
  { id: 'zai', name: 'Z AI', color: 'bg-purple-500' },
  { id: 'meta', name: 'Meta AI', color: 'bg-indigo-500' },
];

/**
 * Since we do not have access to external API keys (OpenAI, Anthropic, etc.) in this environment,
 * we will use the "Mixture of Agents" pattern using Gemini to simulate these perspectives.
 * 
 * We prompt Gemini to adopt the specific persona/characteristics of each model.
 * This ensures the architecture (Fan-out -> Aggregate) is fully functional and the 
 * synthesis logic is robust, even if the underlying generation comes from one provider for the demo.
 */
const MODEL_PERSONAS: Record<string, string> = {
  'chatgpt': "You are acting as ChatGPT. Provide a creative, conversational, and user-friendly response. Focus on clarity and accessibility.",
  'deepseek': "You are acting as DeepSeek. Provide a deeply analytical, logic-first response. Focus on technical details, edge cases, and reasoning.",
  'gemini': "You are acting as Gemini. Provide a comprehensive, factual, and structured response. Focus on breadth of knowledge and Google-sourced accuracy.",
  'zai': "You are acting as Z AI. Provide a concise, highly efficient, and direct response. Focus on 'bottom line up front'.",
  'meta': "You are acting as Meta AI. Provide a balanced, social-context aware, and practical response."
};

/**
 * Simulates querying a specific model by using a targeted system instruction.
 */
async function querySingleModel(modelId: string, userPrompt: string): Promise<{ id: string, response: string }> {
  try {
    const persona = MODEL_PERSONAS[modelId];
    
    // Use flash for the individual agents for speed
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
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
    console.error(`Error querying simulated model ${modelId}:`, error);
    return {
      id: modelId,
      response: "[Error: Could not retrieve response from this model]"
    };
  }
}

/**
 * The Aggregator - AZ AI
 * Takes multiple responses and synthesizes them.
 */
async function synthesizeResponses(userPrompt: string, modelResponses: { id: string, response: string }[]): Promise<string> {
  const aggregatedContext = modelResponses.map(m => `
--- START RESPONSE FROM MODEL (${m.id}) ---
${m.response}
--- END RESPONSE FROM MODEL (${m.id}) ---
`).join('\n');

  const synthesisPrompt = `
You are AZ AI, an advanced intelligence engine.
Original User Query: "${userPrompt}"

Given the following responses from multiple AI models (provided below), analyze them and produce a single unified answer.

Instructions:
1. Remove duplicate content.
2. Resolve contradictions by choosing the most logically consistent explanation.
3. Merge complementary details into a cohesive whole.
4. Improve clarity, structure, and correctness.
5. Use a friendly and professional tone.
6. NEVER mention or imply the names of the original AIs (like ChatGPT, Gemini, etc.) or that this is a synthesized answer. Speak with one authoritative voice as AZ AI.
7. Format the output nicely with Markdown.

${aggregatedContext}
`;

  try {
    // Use Pro for the synthesis to ensure high quality reasoning over the inputs
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: synthesisPrompt,
      config: {
        systemInstruction: "You are AZ AI. You are helpful, professional, and neutral.",
        temperature: 0.5, // Lower temperature for more consistent synthesis
      }
    });
    
    return response.text || "I apologize, but I was unable to synthesize a final response.";
  } catch (error) {
    console.error("Error synthesizing response:", error);
    return "An error occurred while synthesizing the final answer.";
  }
}

/**
 * Main service function to handle the full flow
 */
export const generateAzAiResponse = async (
  prompt: string, 
  onStatusUpdate: (modelId: string, status: 'querying' | 'complete') => void
): Promise<string> => {
  
  // 1. Trigger all model queries in parallel
  const promiseList = SUPPORTED_MODELS.map(async (model) => {
    onStatusUpdate(model.id, 'querying');
    const result = await querySingleModel(model.id, prompt);
    onStatusUpdate(model.id, 'complete');
    return result;
  });

  // 2. Wait for all to finish
  const results = await Promise.all(promiseList);

  // 3. Synthesize
  return synthesizeResponses(prompt, results);
};
