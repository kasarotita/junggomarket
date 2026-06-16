import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SellPage from './pages/SellPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 헤더 없는 페이지 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* 헤더 있는 페이지 */}
        <Route path="*" element={
          <>
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/sell" element={<SellPage />} />
              </Routes>
            </main>
          </>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
