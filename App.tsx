import React, { useState, useEffect } from 'react';
import { generatePersonas, createChatSession, summarizeInterview } from './services/geminiService';
import { AppStep, Persona, Message, SavedInterview } from './types';
import { IdeaInput } from './components/IdeaInput';
import { PersonaList } from './components/PersonaList';
import { ChatInterface } from './components/ChatInterface';
import { Sidebar } from './components/Sidebar';
import { Users } from 'lucide-react';
import { Chat } from '@google/genai';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('input');
  const [idea, setIdea] = useState<string>('');
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  
  // Settings State
  const [apiKey, setApiKey] = useState<string>('');
  const [isDark, setIsDark] = useState<boolean>(false);
  
  // Chat state
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Summary State
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [savedInterviews, setSavedInterviews] = useState<SavedInterview[]>([]);

  // Initialize Settings & Data
  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) setApiKey(storedKey);

    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }

    const storedInterviews = localStorage.getItem('saved_interviews');
    if (storedInterviews) {
      try {
        setSavedInterviews(JSON.parse(storedInterviews));
      } catch (e) {
        console.error("Failed to load saved interviews");
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Generate Personas
  const handleGeneratePersonas = async () => {
    if (!apiKey) {
      alert("API 키가 없습니다. 왼쪽 사이드바에서 Gemini API 키를 입력해주세요.");
      return;
    }
    
    setIsLoading(true);
    try {
      const generatedPersonas = await generatePersonas(idea, apiKey);
      setPersonas(generatedPersonas);
      setStep('selection');
    } catch (error) {
      console.error(error);
      alert('페르소나 생성에 실패했습니다. API 키를 확인하거나 다시 시도해주세요.\n' + error);
    } finally {
      setIsLoading(false);
    }
  };

  // Start Interview
  const handleSelectPersona = (persona: Persona) => {
    if (!apiKey) {
      alert("API 키가 없습니다. 왼쪽 사이드바에서 Gemini API 키를 입력해주세요.");
      return;
    }

    setSelectedPersona(persona);
    setStep('interview');
    setMessages([]);
    setSummary(null);
    setIsLoading(false);
    
    try {
      // Initialize chat session
      const session = createChatSession(persona, idea, apiKey);
      setChatSession(session);
      
      // Initial greeting from Persona (Simulated)
      const initialGreeting: Message = {
        id: Date.now().toString(),
        role: 'model',
        content: `안녕하세요! 저는 ${persona.name}입니다. 새로운 서비스를 준비 중이시라고 들었어요. 어떤 점이 궁금하신가요?`,
        timestamp: Date.now()
      };
      setMessages([initialGreeting]);
    } catch (error) {
       console.error(error);
       alert("채팅 세션 시작 실패: " + error);
       setStep('selection');
    }
  };

  // Send Message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !chatSession) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const result = await chatSession.sendMessage({ message: userMsg.content });
      const responseText = result.text;

      if (responseText) {
        const modelMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: responseText,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, modelMsg]);
      }
    } catch (error) {
      console.error(error);
      alert('메시지 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // Summarize Only (No Save)
  const handleSummarize = async () => {
    if (!selectedPersona || !apiKey) return;
    
    setIsSummarizing(true);
    try {
      const summaryText = await summarizeInterview(messages, idea, selectedPersona, apiKey);
      setSummary(summaryText);
    } catch (error) {
      console.error(error);
      alert('요약 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Explicit Save to History
  const handleSaveInterview = () => {
    if (!selectedPersona || !summary) return;

    const newInterview: SavedInterview = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        idea: idea,
        persona: selectedPersona,
        messages: messages,
        summary: summary
    };
    
    const updatedInterviews = [newInterview, ...savedInterviews];
    setSavedInterviews(updatedInterviews);
    localStorage.setItem('saved_interviews', JSON.stringify(updatedInterviews));
  };

  // Load Saved Interview
  const handleLoadInterview = (interview: SavedInterview) => {
    setIdea(interview.idea);
    setSelectedPersona(interview.persona);
    setMessages(interview.messages);
    setSummary(interview.summary || null);
    setStep('interview');
    
    // Re-initialize chat session
    if (apiKey) {
      try {
        const session = createChatSession(interview.persona, interview.idea, apiKey);
        setChatSession(session); 
      } catch (e) {
        console.error("Failed to restore chat session context", e);
      }
    }
  };

  // Delete Saved Interview
  const handleDeleteInterview = (id: string) => {
    const updatedInterviews = savedInterviews.filter(item => item.id !== id);
    setSavedInterviews(updatedInterviews);
    localStorage.setItem('saved_interviews', JSON.stringify(updatedInterviews));
  };

  const handleBackToInput = () => {
    setStep('input');
    setPersonas([]);
  };

  const handleBackToSelection = () => {
    setStep('selection');
    setSelectedPersona(null);
    setChatSession(null);
    setSummary(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 font-sans text-gray-800 dark:text-gray-100 transition-colors duration-300 flex overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar 
        apiKey={apiKey} 
        setApiKey={setApiKey} 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
        savedInterviews={savedInterviews}
        onLoadInterview={handleLoadInterview}
        onDeleteInterview={handleDeleteInterview}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header / Nav */}
        <nav className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-white/20 dark:border-gray-800 px-6 py-4 flex-shrink-0 z-30 transition-colors">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer ml-12 lg:ml-0" onClick={() => window.location.reload()}>
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                PersonaProbe
              </h1>
            </div>
            {step !== 'input' && (
               <div className="hidden sm:block text-sm font-medium text-gray-500 dark:text-gray-400">
                  AI 사용자 리서치
               </div>
            )}
          </div>
        </nav>

        {/* Scrollable Main Content */}
        <main className={`flex-1 transition-all duration-300 ${
          step === 'interview' 
            ? 'overflow-hidden flex flex-col' // Full height for interview, internal scroll
            : 'overflow-y-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8 scroll-smooth'
        }`}>
          {step === 'input' && (
            <IdeaInput 
              idea={idea} 
              setIdea={setIdea} 
              onGenerate={handleGeneratePersonas} 
              isLoading={isLoading} 
            />
          )}

          {step === 'selection' && (
            <PersonaList 
              personas={personas} 
              onSelect={handleSelectPersona} 
              onBack={handleBackToInput} 
            />
          )}

          {step === 'interview' && selectedPersona && (
            <div className="flex-1 h-full w-full max-w-5xl mx-auto p-2 sm:p-4 flex flex-col">
              <ChatInterface 
                idea={idea}
                persona={selectedPersona}
                messages={messages}
                inputValue={inputValue}
                setInputValue={setInputValue}
                onSend={handleSendMessage}
                onBack={handleBackToSelection}
                isSending={isLoading}
                onSummarize={handleSummarize}
                isSummarizing={isSummarizing}
                summary={summary}
                clearSummary={() => setSummary(null)}
                onSave={handleSaveInterview}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
