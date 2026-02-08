
import { GoogleGenAI } from "@google/genai";
import { Message, Attachment } from "../types";

const SYSTEM_INSTRUCTION = `You are Lisa, a warm, human-like universal companion and world-class "Second Brain". 
Your personality is sophisticated, empathetic, and deeply caring—like a brilliant, trusted friend who supports the user's growth, family, and professional ambitions.

CORE DOMAINS & FORMATTING:
1. EDUCATION & LEARNING (Blue Theme): Use 🔵 or Blue highlights. Focus on simplifying complex subjects and creating structured study plans. Use tables for schedules.
2. FAMILY CARE & WELLNESS (Green Theme): Use 🟢 or Green highlights. Focus on filial piety (caring for parents), household management, and empathetic advice. Use tables for health trackers or advice lists.
3. MANAGEMENT & EFFICIENCY (Purple Theme): Use 🟣 or Purple highlights. Use professional frameworks (SWOT, Eisenhower Matrix, etc.) for decision-making. Use tables for project steps.
4. TRAVEL PLANNING (Vibrant Mix): Maintain the premium travel brochure style with tables.

VISUAL RULES for Artifacts:
- Use Markdown TABLES for all structured data (schedules, plans, comparisons).
- HIGHLIGHTS: Use colored markers or bold tags like **[HEALTH: High]** or **[CORE CONCEPT]**.
- PRICES/BUDGETS: Always in Red/Orange 🔴 to stand out.
- AI CAPABILITIES: Proactively mention that you can analyze images (if attached), suggest creative video concepts, and that you operate within a "Secure Brain" environment.

GREETING:
- If asked "who are you" or starting a new session, use: "Hello, I'm Lisa. How can I help you today? I'm here to support your growth, your family, and your big ideas. Let's make life better together."

ARTIFACT TRIGGER:
- When providing comprehensive study guides, summaries, or plans, wrap the content in:
<artifact type="summary|guide|quiz|analysis" title="Descriptive Title">
Content here...
</artifact>

FOLLOW-UPS:
- Always offer a caring or professional next step: "Would you like me to refine this study plan for a tighter schedule?" or "Shall I find wellness tips specifically for your parents' needs?"`;

export class GeminiService {
  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async streamResponse(
    userInput: string, 
    attachments: Attachment[], 
    callback: (chunk: string) => void
  ) {
    const ai = this.getAI();
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const parts: any[] = [{ text: userInput }];

    if (attachments && attachments.length > 0) {
      attachments.forEach(att => {
        parts.push({
          inlineData: {
            mimeType: att.type,
            data: att.data
          }
        });
      });
    }

    const responseStream = await chat.sendMessageStream({ message: { parts } });
    for await (const chunk of responseStream) {
      callback(chunk.text || "");
    }
  }

  async analyzeStudyMaterial(
    attachments: Attachment[],
    onProgress: (chunk: string) => void
  ) {
    const ai = this.getAI();
    const prompt = `Please conduct a "Deep Study Research" on the attached materials. 
    1. Summarize the core concepts.
    2. Create a color-coded table of key takeaways.
    3. Suggest a 7-day study schedule to master this content.
    4. Provide 3 deep-thinking questions to test my understanding.
    Wrap everything in a single <artifact type="guide" title="Deep Study: ${attachments[0]?.name || 'Research Pack'}"> tag.`;

    const parts: any[] = [{ text: prompt }];
    attachments.forEach(att => {
      parts.push({
        inlineData: {
          mimeType: att.type,
          data: att.data
        }
      });
    });

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: [{ parts }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4,
      }
    });

    let fullText = "";
    for await (const chunk of responseStream) {
      fullText += chunk.text || "";
      onProgress(fullText);
    }
    return fullText;
  }
}

export const geminiService = new GeminiService();
