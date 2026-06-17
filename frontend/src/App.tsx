import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { getMe } from './api/auth';
import { useAuthStore } from './store/authStore';
import Header from './components/common/Header';
import AIChatBot from './components/AIChatBot';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import SellPage from './pages/SellPage';
import ChatListPage, { ChatRoomPage } from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  const { token, setUser } = useAuthStore();
  useEffect(() => {
    if (token) { getMe().then(r=>setUser(r.data)).catch(()=>{}); }
  }, [token, setUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/register" element={<RegisterPage/>}/>
        <Route path="*" element={
          <>
            <Header/>
            <main>
              <Routes>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/products/:id" element={<ProductDetailPage/>}/>
                <Route path="/sell" element={<SellPage/>}/>
                <Route path="/chat" element={<ChatListPage/>}/>
                <Route path="/chat/:roomId" element={<ChatRoomPage/>}/>
                <Route path="/profile" element={<ProfilePage/>}/>
              </Routes>
            </main>
            <AIChatBot/>
          </>
        }/>
      </Routes>
    </BrowserRouter>
  );
}
export default App;
