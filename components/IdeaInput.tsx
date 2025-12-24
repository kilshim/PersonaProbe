import React from 'react';
import { Lightbulb, Sparkles } from 'lucide-react';

interface IdeaInputProps {
  idea: string;
  setIdea: (idea: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const IdeaInput: React.FC<IdeaInputProps> = ({ idea, setIdea, onGenerate, isLoading }) => {
  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-gray-700 p-6 sm:p-8 transition-colors duration-300">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full mr-4">
            <Lightbulb className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">어떤 서비스를 만들고 계신가요?</h2>
        </div>
        
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 text-center mb-6">
          제품, 서비스 또는 기능 아이디어를 설명해주세요. Gemini가 인터뷰할 실제 사용자 페르소나를 생성해 드립니다.
        </p>

        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="예: 원격 근무 팀이 소외감을 줄이기 위해 즉석 커피 타임을 가질 수 있도록 돕는 모바일 앱..."
          className="w-full h-40 p-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 dark:bg-gray-900 resize-none text-base text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all"
        />

        <button
          onClick={onGenerate}
          disabled={!idea.trim() || isLoading}
          className={`w-full mt-6 py-4 px-6 rounded-xl font-bold text-white shadow-lg transition-all transform flex items-center justify-center ${
            !idea.trim() || isLoading
              ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400'
              : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 hover:scale-[1.02] hover:shadow-indigo-500/30'
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
              시장 분석 중...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              페르소나 생성하기
            </>
          )}
        </button>
      </div>
    </div>
  );
};
