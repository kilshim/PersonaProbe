export interface Persona {
  name: string;
  age: number;
  job: string;
  personality: string;
  background: string;
  interests: string[];
  painPoints: string[];
  avatar: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface SavedInterview {
  id: string;
  timestamp: number;
  idea: string;
  persona: Persona;
  messages: Message[];
  summary?: string;
}

export type AppStep = 'input' | 'selection' | 'interview';
