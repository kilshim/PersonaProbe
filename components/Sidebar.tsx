import React, { useState, useEffect } from 'react';
import { Settings, Key, Moon, Sun, BookOpen, Trash2, Check, ExternalLink, Menu, X, History, MessageSquare } from 'lucide-react';
import { SavedInterview } from '../types';

interface SidebarProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
  savedInterviews: SavedInterview[];
  onLoadInterview: (interview: SavedInterview) => void;
  onDeleteInterview: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  apiKey, 
  setApiKey, 
  isDark, 
  toggleTheme,
  savedInterviews,
  onLoadInterview,
  onDeleteInterview
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [tempKey, setTempKey] = useState(apiKey);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'history'>('settings');

  useEffect(() => {
    setTempKey(apiKey);
  }, [apiKey]);

  const handleSaveKey = () => {
    setApiKey(tempKey);
    localStorage.setItem('gemini_api_key', tempKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleDeleteKey = () => {
    setApiKey('');
    setTempKey('');
    localStorage.removeItem('gemini_api_key');
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-600 dark:text-gray-300"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar Container */}
      <div className={`
        fixed top-0 left-0 h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800 
        w-80 transition-transform duration-300 ease-in-out z-40 overflow-y-auto flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static flex-shrink-0
      `}>
        <div className="p-6 pb-0">
           {/* Header */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">설정</h1>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 mb-6 border-b border-gray-200 dark:border-gray-700">
             <button
                onClick={() => setActiveTab('settings')}
                className={`pb-2 px-2 text-sm font-medium transition-colors relative ${
                  activeTab === 'settings' 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
             >
                <span className="flex items-center"><Settings className="w-4 h-4 mr-1"/> 기본 설정</span>
                {activeTab === 'settings' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400"></div>}
             </button>
             <button
                onClick={() => setActiveTab('history')}
                className={`pb-2 px-2 text-sm font-medium transition-colors relative ${
                  activeTab === 'history' 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
             >
                <span className="flex items-center"><History className="w-4 h-4 mr-1"/> 저장된 리포트</span>
                {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400"></div>}
             </button>
          </div>
        </div>

        <div className="p-6 pt-0 space-y-8 flex-1 overflow-y-auto">
          
          {activeTab === 'settings' && (
            <>
              {/* Theme Toggle */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center">
                  <Moon className="w-4 h-4 mr-2" /> 테마 설정
                </h3>
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow transition-all"
                >
                  <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">
                    {isDark ? '다크 모드' : '라이트 모드'}
                  </span>
                  {isDark ? (
                    <Moon className="w-5 h-5 text-indigo-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-orange-400" />
                  )}
                </button>
              </div>

              {/* API Key Management */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center">
                  <Key className="w-4 h-4 mr-2" /> API 키 관리
                </h3>
                
                <div className="space-y-3">
                  <input
                    type="password"
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    placeholder="Gemini API Key 입력"
                    className="w-full p-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveKey}
                      className={`flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-medium transition-colors ${
                        isSaved 
                          ? 'bg-green-500 text-white' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {isSaved ? <Check className="w-4 h-4 mr-1" /> : '저장'}
                    </button>
                    <button
                      onClick={handleDeleteKey}
                      className="px-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
                >
                  API 키 무료로 발급받기 <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>

              {/* User Guide */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                 <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" /> 사용 가이드
                </h3>
                <ul className="space-y-4">
                  <li className="relative pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">1. API 키 설정</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Google AI Studio에서 무료 API 키를 발급받아 위 입력창에 저장하세요.
                    </p>
                  </li>
                  <li className="relative pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">2. 아이디어 입력</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      구상 중인 서비스나 제품에 대한 설명을 구체적으로 작성하세요.
                    </p>
                  </li>
                  <li className="relative pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">3. 페르소나 선택</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      AI가 생성한 5명의 가상 사용자 중 인터뷰하고 싶은 대상을 선택하세요.
                    </p>
                  </li>
                  <li className="relative pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">4. 요약 및 저장</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      인터뷰 후 '요약 및 저장' 버튼을 눌러 리포트를 생성하고 저장하세요.
                    </p>
                  </li>
                </ul>
              </div>
            </>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {savedInterviews.length === 0 ? (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400 text-sm">
                   저장된 인터뷰가 없습니다.
                </div>
              ) : (
                savedInterviews.map((interview) => (
                  <div key={interview.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors group relative">
                    <div 
                      className="cursor-pointer"
                      onClick={() => onLoadInterview(interview)}
                    >
                      <div className="flex items-center justify-between mb-2">
                         <div className="flex items-center">
                            <span className="text-xl mr-2">{interview.persona.avatar}</span>
                            <span className="font-bold text-gray-800 dark:text-white text-sm">{interview.persona.name}</span>
                         </div>
                         <span className="text-xs text-gray-400">
                           {new Date(interview.timestamp).toLocaleDateString()}
                         </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                        {interview.idea}
                      </p>
                      <div className="flex items-center text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        메시지 {interview.messages.length}개
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if(window.confirm('정말 삭제하시겠습니까?')) {
                          onDeleteInterview(interview.id);
                        }
                      }}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="pt-4 text-center mt-auto">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              © 2025 PersonaProbe<br/>Powered by Google Gemini
            </p>
          </div>

        </div>
      </div>
    </>
  );
};
