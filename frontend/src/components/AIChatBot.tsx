import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Minimize2, Sparkles } from 'lucide-react';

interface Message { role: 'user' | 'assistant'; content: string; }

const QUICK_QUESTIONS = [
  '사기 예방 방법 알려줘',
  '가격 협상 어떻게 해?',
  '안전한 거래 장소는?',
  '택배 거래 주의사항',
];

const AIChatBot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '안녕하세요! 중고마켓 AI 상담사입니다 😊\n\n중고 거래에 대해 궁금한 것이 있으시면 편하게 물어보세요! 아래 자주 묻는 질문을 클릭해도 됩니다.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text?: string) => {
    const content = text || input.trim();
    if (!content || loading) return;
    const userMsg: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, history: messages.slice(-6) }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || '죄송합니다, 잠시 후 다시 시도해주세요.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '죄송합니다, 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl flex items-center justify-center z-50 transition-all hover:scale-105 active:scale-95">
        {open ? <X size={22}/> : <MessageCircle size={22}/>}
        {!open && <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"/>}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl flex flex-col z-50 border border-gray-100" style={{height:'520px'}}>
          <div className="flex items-center gap-3 px-4 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-t-3xl">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <Sparkles size={20} className="text-white"/>
            </div>
            <div>
              <p className="font-black text-white text-sm">중고마켓 AI 상담사</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/>
                <p className="text-indigo-200 text-xs">온라인</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-white/60 hover:text-white transition-colors"><Minimize2 size={18}/></button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                    <Sparkles size={14} className="text-indigo-600"/>
                  </div>
                )}
                <div className={'max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ' + (msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-900 rounded-tl-sm')}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Sparkles size={14} className="text-indigo-600"/>
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                  {[0,1,2].map(i=><div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: i===0?'0s':i===1?'0.15s':'0.3s'}}/>)}
                </div>
              </div>
            )}
            {messages.length === 1 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-400 text-center">자주 묻는 질문</p>
                {QUICK_QUESTIONS.map(q=>(
                  <button key={q} onClick={() => send(q)}
                    className="w-full text-left px-3 py-2.5 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors font-medium border border-indigo-100">
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          <div className="px-4 py-3 border-t border-gray-100">
            <div className="flex gap-2">
              <input value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
                className="flex-1 px-4 py-2.5 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                placeholder="중고 거래 관련 질문을 입력하세요"/>
              <button onClick={() => send()} disabled={!input.trim()||loading}
                className="w-11 h-11 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-2xl transition-colors flex-shrink-0">
                <Send size={16}/>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default AIChatBot;
