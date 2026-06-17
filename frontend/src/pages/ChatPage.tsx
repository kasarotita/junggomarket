import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Send, MessageCircle } from 'lucide-react';
import { getRooms, getMessages, sendMessage, ChatRoom, ChatMessage } from '../api/chat';
import { useAuthStore } from '../store/authStore';

const ChatListPage: React.FC = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    getRooms().then(r=>setRooms(r.data)).finally(()=>setLoading(false));
  }, [user, navigate]);

  if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent"/></div>;

  return (
    <div className="max-w-2xl mx-auto bg-white min-h-screen">
      <div className="px-4 py-4 border-b border-gray-100 sticky top-14 bg-white z-40">
        <h1 className="text-xl font-bold text-gray-900">채팅</h1>
      </div>
      {rooms.length === 0 ? (
        <div className="text-center py-24">
          <MessageCircle size={48} className="text-gray-200 mx-auto mb-4"/>
          <p className="text-gray-500 font-medium">채팅 내역이 없습니다</p>
          <p className="text-gray-400 text-sm mt-1">상품 상세 페이지에서 채팅을 시작해보세요</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {rooms.map(room=>(
            <Link key={room.id} to={`/chat/\${room.id}`} className="flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                {room.product_image
                  ? <img src={room.product_image} alt="" className="w-full h-full object-cover rounded-full"/>
                  : <span className="text-orange-600 font-bold text-lg">{(room.other_nickname||'?')[0]}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="font-semibold text-gray-900 text-sm">{room.other_nickname}</p>
                  <p className="text-xs text-gray-400">{room.last_message_at?new Date(room.last_message_at).toLocaleDateString():''}</p>
                </div>
                <p className="text-xs text-gray-500 truncate mb-0.5">[{room.product_title}]</p>
                <p className="text-sm text-gray-600 truncate">{room.last_message||'대화를 시작해보세요'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export const ChatRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (!roomId) return;
    const load = () => getMessages(Number(roomId)).then(r=>setMessages(r.data));
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [roomId, user, navigate]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()||!roomId||sending) return;
    setSending(true);
    try {
      const r = await sendMessage(Number(roomId), input.trim());
      setMessages(prev=>[...prev,r.data]); setInput('');
    } finally { setSending(false); }
  };

  const formatTime = (d: string) => new Date(d).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'});

  return (
    <div className="max-w-2xl mx-auto bg-white flex flex-col" style={{height:'100vh'}}>
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-white z-40">
        <button onClick={()=>navigate('/chat')} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-xl"><ChevronLeft size={20}/></button>
        <h2 className="font-bold text-gray-900">채팅</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-20">
        {messages.map(msg=>{
          const isMe = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex \${isMe?'justify-end':'justify-start'}`}>
              <div className={`max-w-[72%] flex flex-col gap-1 \${isMe?'items-end':'items-start'}`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed \${isMe?'bg-orange-500 text-white rounded-tr-sm':'bg-gray-100 text-gray-900 rounded-tl-sm'}`}>
                  {msg.content}
                </div>
                <span className="text-xs text-gray-400">{formatTime(msg.created_at)}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef}/>
      </div>
      <form onSubmit={handleSend} className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white border-t border-gray-100 px-4 py-3 flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all"
          placeholder="메시지를 입력하세요"/>
        <button type="submit" disabled={!input.trim()||sending}
          className="w-11 h-11 flex items-center justify-center bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-2xl transition-colors flex-shrink-0">
          <Send size={18}/>
        </button>
      </form>
    </div>
  );
};

export default ChatListPage;
