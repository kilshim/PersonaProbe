import React, { useState } from 'react';
import { Persona } from '../types';
import { MessageCircle, ArrowLeft, TrendingUp, AlertCircle, Plus, X, Check, FileText, Sparkles, UserPen } from 'lucide-react';
import { analyzePersonaFromData } from '../services/geminiService';

interface PersonaListProps {
  personas: Persona[];
  onSelect: (persona: Persona) => void;
  onBack: () => void;
}

export const PersonaList: React.FC<PersonaListProps> = ({ personas, onSelect, onBack }) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'manual' | 'analyze'>('manual');
  
  // Custom Persona State
  const [customPersona, setCustomPersona] = useState<Persona>({
    name: '',
    age: 30,
    job: '',
    personality: '',
    background: '',
    interests: [],
    painPoints: [],
    avatar: '😊'
  });
  
  // Helper for comma-separated inputs
  const [interestsInput, setInterestsInput] = useState('');
  const [painPointsInput, setPainPointsInput] = useState('');

  // Analyze Data State
  const [rawData, setRawData] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleCreateCustom = () => {
    const newPersona: Persona = {
      ...customPersona,
      interests: interestsInput.split(',').map(s => s.trim()).filter(s => s),
      painPoints: painPointsInput.split(',').map(s => s.trim()).filter(s => s),
    };
    
    if (!newPersona.name || !newPersona.job) {
      alert('이름과 직업은 필수입니다.');
      return;
    }

    onSelect(newPersona);
  };

  const handleAnalyze = async () => {
    if (!rawData.trim()) {
      alert("분석할 텍스트를 입력해주세요.");
      return;
    }

    // Fix: Removed manual API key retrieval and check; handled by internal service configuration
    setIsAnalyzing(true);
    try {
      const result = await analyzePersonaFromData(rawData);
      
      setCustomPersona({
        ...result,
        avatar: result.avatar || '🤔'
      });
      setInterestsInput(result.interests.join(', '));
      setPainPointsInput(result.painPoints.join(', '));
      
      setActiveTab('manual'); // Switch back to form view to show results
    } catch (error) {
      console.error(error);
      alert("데이터 분석 중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in pb-10">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          아이디어 수정
        </button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">인터뷰할 페르소나 선택</h2>
        <div className="w-24"></div> {/* Spacer for centering */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personas.map((persona, index) => (
          <div 
            key={index} 
            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col"
          >
            <div className="p-6 flex-grow">
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
                  {persona.avatar}
                </div>
                <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  {persona.age}세
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{persona.name}</h3>
              <p className="text-indigo-600 dark:text-indigo-400 font-medium text-sm mb-4">{persona.job}</p>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm italic mb-6 border-l-4 border-indigo-200 dark:border-indigo-700 pl-3">
                "{persona.personality}"
              </p>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <TrendingUp className="w-3 h-3 mr-1" /> 관심사
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {persona.interests.slice(0, 3).map((interest, i) => (
                      <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <AlertCircle className="w-3 h-3 mr-1" /> 불편 사항
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {persona.painPoints.slice(0, 2).map((point, i) => (
                      <span key={i} className="text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded-md">
                        {point}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => onSelect(persona)}
                className="w-full bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-600 dark:border-indigo-500 py-2 px-4 rounded-xl font-bold hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 dark:hover:text-white transition-colors flex items-center justify-center"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                인터뷰 시작하기
              </button>
            </div>
          </div>
        ))}

        {/* Custom Persona Card */}
        <div 
          onClick={() => setShowCustomModal(true)}
          className="group bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 cursor-pointer flex flex-col items-center justify-center min-h-[400px] transition-all duration-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
        >
          <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-md mb-4 group-hover:scale-110 transition-transform">
            <Plus className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">나만의 페르소나 만들기</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center px-8">
            원하는 사용자를 직접 정의하거나<br/>데이터를 학습시켜보세요
          </p>
        </div>
      </div>

      {/* Custom Persona Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90%] flex flex-col overflow-hidden animate-fade-in-up">
            
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-indigo-50 dark:bg-gray-800/50">
              <h3 className="font-bold text-lg text-indigo-800 dark:text-indigo-300">새 페르소나 생성</h3>
              <button onClick={() => setShowCustomModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex border-b border-gray-200 dark:border-gray-700">
               <button 
                  onClick={() => setActiveTab('manual')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center ${
                    activeTab === 'manual' 
                    ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                  }`}
               >
                 <UserPen className="w-4 h-4 mr-2" /> 직접 입력
               </button>
               <button 
                  onClick={() => setActiveTab('analyze')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center ${
                    activeTab === 'analyze' 
                    ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                  }`}
               >
                 <Sparkles className="w-4 h-4 mr-2" /> 데이터로 분석
               </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              
              {activeTab === 'manual' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이름</label>
                      <input 
                        type="text" 
                        value={customPersona.name}
                        onChange={(e) => setCustomPersona({...customPersona, name: e.target.value})}
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="예: 김철수"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">나이</label>
                      <input 
                        type="number" 
                        value={customPersona.age}
                        onChange={(e) => setCustomPersona({...customPersona, age: parseInt(e.target.value) || 0})}
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">직업</label>
                       <input 
                         type="text" 
                         value={customPersona.job}
                         onChange={(e) => setCustomPersona({...customPersona, job: e.target.value})}
                         className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                         placeholder="예: 대학생"
                       />
                    </div>
                    <div className="col-span-1">
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">아바타 (이모지)</label>
                       <input 
                         type="text" 
                         value={customPersona.avatar}
                         onChange={(e) => setCustomPersona({...customPersona, avatar: e.target.value})}
                         className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-center"
                         placeholder="😊"
                       />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">성격</label>
                    <input 
                      type="text" 
                      value={customPersona.personality}
                      onChange={(e) => setCustomPersona({...customPersona, personality: e.target.value})}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="예: 꼼꼼하고 분석적임"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">배경 설명</label>
                    <textarea 
                      value={customPersona.background}
                      onChange={(e) => setCustomPersona({...customPersona, background: e.target.value})}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none h-20"
                      placeholder="예: IT 기기에 관심이 많으며 얼리어답터 성향을 가짐..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">관심사 (쉼표로 구분)</label>
                    <input 
                      type="text" 
                      value={interestsInput}
                      onChange={(e) => setInterestsInput(e.target.value)}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="예: 여행, 사진, 맛집"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">불편 사항 (쉼표로 구분)</label>
                    <input 
                      type="text" 
                      value={painPointsInput}
                      onChange={(e) => setPainPointsInput(e.target.value)}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="예: 비싼 가격, 복잡한 사용법"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 h-full flex flex-col">
                   <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-4 rounded-lg">
                      <div className="flex items-start">
                         <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 mr-2" />
                         <div>
                            <h4 className="font-bold text-sm text-indigo-800 dark:text-indigo-300">데이터 붙여넣기</h4>
                            <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1">
                               기존 인터뷰 내용, 채팅 로그, 설문 응답 등을 여기에 붙여넣으세요.<br/>AI가 내용을 분석하여 자동으로 페르소나 정보를 추출합니다.
                            </p>
                         </div>
                      </div>
                   </div>
                   
                   <textarea
                      value={rawData}
                      onChange={(e) => setRawData(e.target.value)}
                      className="w-full flex-1 p-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white resize-none min-h-[200px]"
                      placeholder={`예시 데이터:\n\n인터뷰어: 평소 어떤 앱을 자주 쓰시나요?\n참여자: 저는 30대 직장인이라 주로 시간 관리에 도움이 되는 투두리스트 앱을 써요.\n인터뷰어: 불편한 점은 없나요?\n참여자: 기능이 너무 복잡해서 오히려 시간을 뺏기는 느낌이 들 때가 있어요. 심플한 게 좋거든요.`}
                   />
                </div>
              )}

            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end space-x-2">
               {activeTab === 'manual' ? (
                 <>
                   <button
                     onClick={() => setShowCustomModal(false)}
                     className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                   >
                     취소
                   </button>
                   <button
                     onClick={handleCreateCustom}
                     className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors flex items-center"
                   >
                     <Check className="w-4 h-4 mr-2" />
                     생성 및 시작
                   </button>
                 </>
               ) : (
                 <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !rawData.trim()}
                    className={`w-full py-3 rounded-lg font-bold text-white shadow-lg flex items-center justify-center transition-all ${
                       isAnalyzing || !rawData.trim()
                       ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                       : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30'
                    }`}
                 >
                    {isAnalyzing ? (
                       <>
                         <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                         분석 중...
                       </>
                    ) : (
                       <>
                         <Sparkles className="w-4 h-4 mr-2" />
                         데이터 분석 및 자동 입력
                       </>
                    )}
                 </button>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};