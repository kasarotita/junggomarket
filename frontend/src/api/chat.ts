import client from './client';
export interface ChatRoom {
  id: number; product_id: number; buyer_id: number; seller_id: number;
  product_title: string; product_image: string;
  other_nickname: string; last_message: string; last_message_at: string;
}
export interface ChatMessage { id: number; room_id: number; sender_id: number; content: string; is_read: boolean; created_at: string; }
export const createRoom = (product_id: number) => client.post('/chat/rooms', null, { params: { product_id } });
export const getRooms = () => client.get<ChatRoom[]>('/chat/rooms');
export const getMessages = (room_id: number) => client.get<ChatMessage[]>(`/chat/rooms/${room_id}/messages`);
export const sendMessage = (room_id: number, content: string) => client.post(`/chat/rooms/${room_id}/messages`, { content });
