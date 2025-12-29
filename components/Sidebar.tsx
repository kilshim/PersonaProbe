import React, { useState, useEffect } from 'react';
import { Settings, Moon, Sun, BookOpen, Trash2, History, MessageSquare, Menu, X, Key, Check } from 'lucide-react';
import { SavedInterview } from '../types';

interface SidebarProps {
  isDark: boolean;
  toggleTheme: () => void;
  savedInterviews: SavedInterview[];
  onLoadInterview: (interview: SavedInterview) => void;
  onDeleteInterview: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isDark, 
  toggleTheme,
  savedInterviews,
  onLoadInterview,
  onDeleteInterview
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'history'>('settings');
  
  // API Key Local State
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setIsOpen(true);
    }

    // Load API Key from sessionStorage on mount
    const savedKey = sessionStorage.getItem('GEMINI_API_KEY');
    if (savedKey) {
      setApiKeyInput(savedKey);
      // Sync with process.env for the SDK
      syncEnvKey(savedKey);
    }
  }, []);

  const syncEnvKey = (key: string) => {
    // Ensure process.env is available for the SDK to read from
    if (!(window as any).process) (window as any).process = { env: {} };
    if (!(window as any).process.env) (window as any).process.env = {};
    (window as any).process.env.API_KEY = key;
  };

  const handleSaveKey = () => {
    sessionStorage.setItem('GEMINI_API_KEY', apiKeyInput);
    syncEnvKey(apiKeyInput);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleDeleteKey = () => {
    sessionStorage.removeItem('GEMINI_API_KEY');
    setApiKeyInput('');
    syncEnvKey('');
  };

  const handleMobileClose = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-3 left-4 z-50 p-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-label="Toggle Sidebar"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`
        fixed top-0 left-0 h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800 
        w-80 transition-transform duration-300 ease-in-out z-40 overflow-y-auto flex flex-col shadow-2xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static flex-shrink-0
      `}>
        <div className="p-6 pb-0 pt-16 lg:pt-6">
          <div className="flex items-center space-x-2 mb-6">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">설정</h1>
          </div>

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
              {/* API Key Management */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center">
                  <Key className="w-4 h-4 mr-2" /> Gemini API Key
                </h3>
                <div className="space-y-3">
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="API 키를 입력하세요"
                    className="w-full p-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveKey}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold text-white transition-all flex items-center justify-center ${
                        isSaved ? 'bg-green-500' : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {isSaved ? <Check className="w-4 h-4 mr-1" /> : null}
                      {isSaved ? '저장됨' : '저장'}
                    </button>
                    <button
                      onClick={handleDeleteKey}
                      className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
                    키는 세션 중에만 유지됩니다 (sessionStorage)
                  </p>
                </div>
              </div>

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

              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                 <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" /> 사용 가이드
                </h3>
                <ul className="space-y-4">
                  <li className="relative pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">1. 서비스 분석</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      구상 중인 제품 아이디어를 입력하여 가상 사용자를 생성하세요.
                    </p>
                  </li>
                  <li className="relative pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">2. 페르소나 선택</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      AI가 생성한 5명의 가상 사용자 중 인터뷰하고 싶은 대상을 선택하세요.
                    </p>
                  </li>
                  <li className="relative pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">3. 대화 시뮬레이션</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      선택한 페르소나와 자유롭게 대화하며 제품 피드백을 수집하세요.
                    </p>
                  </li>
                  <li className="relative pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">4. 리포트 생성</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      인터뷰 내용을 AI가 요약하여 핵심 인사이트를 도출해 드립니다.
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
                      onClick={() => {
                        onLoadInterview(interview);
                        handleMobileClose();
                      }}
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
            <a 
              href="https://xn--design-hl6wo12cquiba7767a.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              떨림과울림Design.com
            </a>
          </div>

        </div>
      </div>
    </>
  );
};
