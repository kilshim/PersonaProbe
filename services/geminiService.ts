import { GoogleGenAI, Type } from "@google/genai";
import { Persona, Message } from "../types";

// Helper to get API key from storage or env
const getApiKey = (): string => {
  if (typeof window !== 'undefined') {
    const storedKey = sessionStorage.getItem('GEMINI_API_KEY');
    if (storedKey) return storedKey;
  }
  return process.env.API_KEY || '';
};

export const generatePersonas = async (idea: string): Promise<Persona[]> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key가 설정되지 않았습니다. 사이드바 설정에서 API Key를 입력해주세요.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelId = "gemini-3-flash-preview";
  
  const prompt = `
    제품 아이디어: "${idea}".
    
    이 제품의 잠재적 사용자나 이해관계자가 될 수 있는 현실적인 사용자 페르소나 5명을 생성해주세요.
    나이, 기술 숙련도, 배경이 다양해야 합니다.
    
    모든 내용은 한국어로 작성해주세요.
    avatar 필드에는 해당 페르소나를 가장 잘 나타내는 이모지 하나를 넣어주세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: "당신은 전문 UX 리서처이자 프로덕트 매니저입니다. 한국어로 응답하세요. 반드시 유효한 JSON 배열만 반환하세요.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "한국어 이름" },
              age: { type: Type.INTEGER },
              job: { type: Type.STRING, description: "직업 (한국어)" },
              personality: { type: Type.STRING, description: "성격 묘사 (한국어)" },
              background: { type: Type.STRING, description: "배경 설명 (한국어)" },
              interests: { 
                type: Type.ARRAY,
                items: { type: Type.STRING, description: "관심사 (한국어)" }
              },
              painPoints: { 
                type: Type.ARRAY,
                items: { type: Type.STRING, description: "불편 사항 (한국어)" }
              },
              avatar: { type: Type.STRING, description: "페르소나를 대표하는 단일 이모지" },
            },
            required: ["name", "age", "job", "personality", "background", "interests", "painPoints", "avatar"],
          },
        },
      },
    });

    let text = response.text;
    if (!text) throw new Error("Gemini로부터 응답을 받지 못했습니다.");

    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    
    if (start !== -1 && end !== -1 && end > start) {
      text = text.substring(start, end + 1);
    } else {
      text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    }

    return JSON.parse(text) as Persona[];
  } catch (error: any) {
    console.error("Persona Generation Error:", error);
    
    let errorMessage = "페르소나 생성 중 오류가 발생했습니다.";
    
    if (error.message) {
      if (error.message.includes("429")) {
        errorMessage = "요청이 너무 많습니다. 잠시 후 다시 시도해주세요. (429 Error)";
      } else if (error.message.includes("API key") || error.message.includes("403") || error.message.includes("invalid") || error.message.includes("must be set")) {
        errorMessage = "API 키가 올바르지 않거나 설정되지 않았습니다. 사이드바 설정에서 API 키를 입력해주세요.";
      } else if (error instanceof SyntaxError) {
        errorMessage = "AI 응답 형식이 올바르지 않습니다. 다시 시도해주세요.";
      } else {
        errorMessage = `오류 발생: ${error.message}`;
      }
    }
    
    throw new Error(errorMessage);
  }
};

export const analyzePersonaFromData = async (data: string): Promise<Persona> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key가 필요합니다.");

  const ai = new GoogleGenAI({ apiKey });
  const modelId = "gemini-3-flash-preview";

  const prompt = `
    다음은 실제 사용자의 인터뷰 내용, 채팅 로그, 또는 피드백 데이터입니다.
    이 데이터를 분석하여 이 사용자를 대표하는 '페르소나 프로필'을 추출해주세요.
    
    [데이터]
    ${data}

    분석 지침:
    1. 데이터에 명시된 내용(직업, 나이 등)을 최우선으로 반영하세요.
    2. 명시되지 않은 내용은 말투, 관심사, 문맥을 통해 합리적으로 추론하세요.
    3. 이름이 없다면 어울리는 가명을 지어주세요.
    4. 한국어로 작성해주세요.
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
    config: {
      systemInstruction: "당신은 데이터 분석에 능한 UX 리서처입니다. 주어진 텍스트에서 사용자 특징을 추출하여 구조화된 페르소나 JSON으로 반환하세요.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "이름 (가명 포함)" },
          age: { type: Type.INTEGER, description: "추정 나이" },
          job: { type: Type.STRING, description: "추정 직업" },
          personality: { type: Type.STRING, description: "성격 분석" },
          background: { type: Type.STRING, description: "사용자 배경 및 상황" },
          interests: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          painPoints: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          avatar: { type: Type.STRING, description: "어울리는 이모지" },
        },
        required: ["name", "age", "job", "personality", "background", "interests", "painPoints", "avatar"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("분석 결과를 받지 못했습니다.");
  
  return JSON.parse(text) as Persona;
};

export const createChatSession = (persona: Persona, idea: string) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key가 필요합니다.");

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `
    당신은 ${persona.name}이라는 특정 페르소나를 연기해야 합니다.
    
    프로필:
    - 나이: ${persona.age}세
    - 직업: ${persona.job}
    - 성격: ${persona.personality}
    - 배경: ${persona.background}
    - 불편 사항: ${persona.painPoints.join(", ")}
    - 관심사: ${persona.interests.join(", ")}
    
    상황:
    당신은 "${idea}"라는 제품 아이디어에 대해 인터뷰를 받고 있습니다.
    
    지침:
    - 언어: 반드시 한국어만 사용하세요.
    - 캐릭터 유지: 제4의 벽을 깨지 말고 철저히 캐릭터에 몰입하세요. AI라고 밝히지 마세요.
    - 자연스러운 반응: 프로필에 기반하여 자연스럽게 반응하세요. 제품이 당신의 불편 사항을 해결해준다면 관심을 보이고, 배경지식에 비해 너무 복잡하다면 혼란스러워하세요.
    - 솔직함: 성격에 맞춰 솔직하고 건설적인 피드백, 혹은 비판적인 의견을 제시하세요.
    - 대화체: 대화하듯이 자연스럽고 간결하게(최대 1~3문단) 답변하세요.
  `;

  return ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: systemInstruction,
    },
  });
};

export const summarizeInterview = async (
  messages: Message[], 
  idea: string, 
  persona: Persona
): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key가 필요합니다.");

  const ai = new GoogleGenAI({ apiKey });
  const modelId = "gemini-3-flash-preview";

  const conversationText = messages
    .map(m => `${m.role === 'user' ? '인터뷰어' : persona.name}: ${m.content}`)
    .join('\n');

  const prompt = `
    다음은 제품 아이디어 "${idea}"에 대한 사용자 인터뷰 내용입니다.
    인터뷰 대상 페르소나: ${persona.name} (${persona.job}, ${persona.age}세)

    [대화 내용]
    ${conversationText}

    위 인터뷰 내용을 바탕으로 다음 항목을 포함하여 요약 리포트를 한국어로 작성해주세요:
    1. 핵심 인사이트 (Key Insights): 사용자가 가장 중요하게 생각한 점
    2. 긍정적인 피드백: 제품에 대해 좋게 평가한 부분
    3. 우려 사항 및 개선점: 사용자가 걱정하거나 불편해한 부분
    4. 총평: 이 페르소나가 제품을 사용할 가능성과 종합적인 의견

    마크다운(Markdown) 형식을 사용하여 가독성 있게 작성해주세요.
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: prompt,
  });

  return response.text || "요약을 생성할 수 없습니다.";
};