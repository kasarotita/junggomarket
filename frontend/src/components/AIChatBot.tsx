import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Minimize2 } from 'lucide-react';

interface Message { role: 'user' | 'assistant'; content: string; }

const SYSTEM = '당신은 중고마켓의 친절한 AI 상담사입니다. 중고 거래 관련 질문에 답변하고 안전한 거래 방법을 안내합니다. 사기 예방, 가격 협상, 물품 상태 확인 등에 대해 도움을 드립니다. 항상 친절하고 간결하게 한국어로 답변하세요.';

const AIChatBot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '안녕하세요! 중고마켓 AI 상담사입니다 😊\n중고 거래에 대해 궁금한 것이 있으시면 편하게 물어보세요!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: SYSTEM,
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || '죄송합니다, 잠시 후 다시 시도해주세요.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '네트워크 오류가 발생했습니다.' }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-all hover:scale-110 active:scale-95">
        {open ? <X size={24}/> : <MessageCircle size={24}/>}
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl flex flex-col z-50 border border-gray-100" style={{height:'480px'}}>
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 bg-orange-500 rounded-t-3xl">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <Bot size={20} className="text-white"/>
            </div>
            <div>
              <p className="font-bold text-white text-sm">중고마켓 AI 상담사</p>
              <p className="text-orange-100 text-xs">안전한 거래를 도와드립니다</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-white/70 hover:text-white"><Minimize2 size={18}/></button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex \${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                    <Bot size={14} className="text-orange-500"/>
                  </div>
                )}
                <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap \${msg.role === 'user' ? 'bg-orange-500 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-900 rounded-tl-sm'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center"><Bot size={14} className="text-orange-500"/></div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                  {[0,1,2].map(i=><div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:`\${i*0.15}s`}}/>)}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>
          <div className="px-4 py-3 border-t border-gray-100">
            <div className="flex gap-2">
              <input value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
                className="flex-1 px-3.5 py-2.5 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all"
                placeholder="메시지를 입력하세요"/>
              <button onClick={send} disabled={!input.trim()||loading}
                className="w-10 h-10 flex items-center justify-center bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-2xl transition-colors flex-shrink-0">
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
