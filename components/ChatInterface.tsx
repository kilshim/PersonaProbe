import React, { useRef, useEffect, useState } from 'react';
import { Persona, Message } from '../types';
import { Send, ArrowLeft, RefreshCw, User, Bot, FileText, X, Save, Download, Copy, History, Check } from 'lucide-react';

interface ChatInterfaceProps {
  idea: string;
  persona: Persona;
  messages: Message[];
  inputValue: string;
  setInputValue: (val: string) => void;
  onSend: () => void;
  onBack: () => void;
  isSending: boolean;
  onSummarize: () => void;
  isSummarizing: boolean;
  summary: string | null;
  clearSummary: () => void;
  onSave: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  idea,
  persona,
  messages,
  inputValue,
  setInputValue,
  onSend,
  onBack,
  isSending,
  onSummarize,
  isSummarizing,
  summary,
  clearSummary,
  onSave,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  useEffect(() => {
    if (summary) {
      setShowSummaryModal(true);
    }
  }, [summary]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleCopyToClipboard = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  const handleDownload = () => {
    if (summary) {
      const element = document.createElement("a");
      const file = new Blob([summary], {type: 'text/markdown'});
      element.href = URL.createObjectURL(file);
      element.download = `${persona.name}_인터뷰_요약.md`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const handleSaveToHistory = () => {
    onSave();
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in border border-gray-200 dark:border-gray-700 relative">
      
      {/* Header */}
      <div className="bg-indigo-600 dark:bg-indigo-700 p-4 flex items-center justify-between shadow-md z-10 transition-colors flex-shrink-0">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="text-indigo-200 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center">
            <div className="relative">
              <div className="text-3xl bg-white dark:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center border-2 border-indigo-300 dark:border-indigo-500">
                {persona.avatar}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-indigo-600 dark:border-indigo-700 rounded-full"></div>
            </div>
            <div className="ml-3 text-white">
              <h3 className="font-bold text-lg leading-tight">{persona.name}</h3>
              <p className="text-indigo-200 text-xs font-medium">{persona.job}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
           <button
             onClick={onSummarize}
             disabled={messages.length < 2 || isSummarizing}
             className="flex items-center bg-white/20 hover:bg-white/30 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {isSummarizing ? (
               <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
             ) : (
               <FileText className="w-4 h-4 mr-1" />
             )}
             {isSummarizing ? '분석 중...' : '요약 및 저장'}
           </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Intro Banner */}
        <div className="flex justify-center mb-8">
           <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 px-4 py-2 rounded-lg text-sm text-center shadow-sm">
             지금 <strong>{persona.name}</strong>님과 인터뷰 중입니다. 제품 아이디어에 대해 무엇이든 물어보세요.
           </div>
        </div>

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 mx-2 shadow-sm ${
                message.role === 'user' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
              }`}>
                {message.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              
              <div
                className={`p-4 rounded-2xl shadow-sm text-sm sm:text-base leading-relaxed ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-600 rounded-tl-none'
                }`}
              >
                {message.content}
              </div>
            </div>
          </div>
        ))}
        
        {isSending && (
          <div className="flex justify-start">
             <div className="flex flex-row max-w-[80%]">
               <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 flex items-center justify-center mt-1 mx-2 shadow-sm">
                 <Bot className="w-5 h-5" />
               </div>
               <div className="bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-2">
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
               </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 transition-colors flex-shrink-0">
        <div className="flex items-end space-x-2 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="질문을 입력하세요..."
              className="w-full pl-4 pr-10 py-3 bg-gray-100 dark:bg-gray-700 border-transparent focus:bg-white dark:focus:bg-gray-600 border focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl focus:outline-none resize-none min-h-[50px] max-h-[120px] shadow-inner text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 transition-all"
              rows={1}
              style={{ minHeight: '52px' }}
              disabled={isSending || isSummarizing}
            />
          </div>
          <button
            onClick={onSend}
            disabled={!inputValue.trim() || isSending || isSummarizing}
            className={`p-3 rounded-xl flex-shrink-0 transition-all duration-200 ${
              !inputValue.trim() || isSending || isSummarizing
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 shadow-lg hover:shadow-indigo-500/30'
            }`}
          >
            {isSending ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
          </button>
        </div>
        <div className="text-center mt-2">
           <p className="text-xs text-gray-400 dark:text-gray-500">AI 응답은 부정확할 수 있습니다. 이는 시뮬레이션입니다.</p>
        </div>
      </div>

      {/* Summary Modal */}
      {showSummaryModal && summary && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90%] flex flex-col border border-gray-200 dark:border-gray-700 animate-fade-in-up">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-indigo-50 dark:bg-gray-800/50 rounded-t-2xl">
              <div className="flex items-center text-indigo-700 dark:text-indigo-400">
                <FileText className="w-5 h-5 mr-2" />
                <h3 className="font-bold text-lg">인터뷰 요약 리포트</h3>
              </div>
              <button 
                onClick={() => setShowSummaryModal(false)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {summary}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl">
               <div className="flex flex-col space-y-3">
                 <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 text-center mb-1">
                   저장 방식을 선택하세요
                 </p>
                 <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={handleSaveToHistory}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                        saveFeedback 
                          ? 'bg-green-50 border-green-500 text-green-700' 
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:border-indigo-300'
                      }`}
                    >
                      {saveFeedback ? <Check className="w-6 h-6 mb-1"/> : <History className="w-6 h-6 mb-1 text-indigo-500"/>}
                      <span className="text-xs font-medium dark:text-gray-300">{saveFeedback ? '저장됨' : '히스토리에 저장'}</span>
                    </button>

                    <button
                      onClick={handleDownload}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:border-indigo-300 transition-all"
                    >
                      <Download className="w-6 h-6 mb-1 text-blue-500"/>
                      <span className="text-xs font-medium dark:text-gray-300">파일 다운로드</span>
                    </button>

                    <button
                      onClick={handleCopyToClipboard}
                       className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                        copyFeedback 
                          ? 'bg-green-50 border-green-500 text-green-700' 
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:border-indigo-300'
                      }`}
                    >
                      {copyFeedback ? <Check className="w-6 h-6 mb-1"/> : <Copy className="w-6 h-6 mb-1 text-gray-500"/>}
                      <span className="text-xs font-medium dark:text-gray-300">{copyFeedback ? '복사됨' : '복사하기'}</span>
                    </button>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
