// src/App.tsx
import React, { useState } from 'react';
import CreateRoom from './CreateRoom';
import JoinRoom from './JoinRoom';
import AdminReadyPanel from './AdminReadyPanel';
import TurScreen from './TurScreen';
import HeroCarousel from './HeroCarousel';

type Page = 'home' | 'create' | 'join' | 'admin' | 'tur';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [roomId, setRoomId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  return (
    <div className="min-h-screen flex flex-col">
      {/* ======================= HEADER ======================= */}
      <header className="w-full bg-gradient-to-r from-[#510093] to-[#ff7e5f] text-white shadow-lg">
        {/* Header içeriğini de max-w-3xl mx-auto px-4 ile ortaladık */}
        <div className="max-w-3xl mx-auto py-5 px-4 relative">
          <h1
            className="
              absolute 
              left-1/2 top-1/2 
              transform -translate-x-1/2 -translate-y-1/2 
              text-3xl font-semibold tracking-tight
            "
          >
            Brainstorming App
          </h1>
        </div>
      </header>

      {/* ======================= MAIN CONTENT ======================= */}
      <main className="flex-grow bg-gray-50 pt-10">
        {/* Burası uygulamanın “container” kısmı */}
        <div className="max-w-3xl mx-auto px-4 space-y-10">
          {/* ========= ANASAYFA ========= */}
          {page === 'home' && (
            <div className="space-y-8">
              {/* —— HERO CAROUSEL —— */}
              <HeroCarousel />

              {/* —— BUTONLAR —— */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setPage('create')}
                  className="flex-1 bg-[#510093] hover:bg-[#6f23a7] text-white font-medium py-3 rounded-xl shadow-md transition"
                >
                  Odayı Kur
                </button>
                <button
                  onClick={() => setPage('join')}
                  className="flex-1 bg-[#00c6ff] hover:bg-[#66dfff] text-white font-medium py-3 rounded-xl shadow-md transition"
                >
                  Odaya Katıl
                </button>
              </div>
            </div>
          )}

          {/* ========= ODA OLUŞTURMA ========= */}
          {page === 'create' && (
            <CreateRoom
              onBack={() => setPage('home')}
              onCreated={(newRoomId) => {
                setRoomId(newRoomId);
                setPage('admin');
              }}
            />
          )}

          {/* ========= ODAYA KATILMA ========= */}
          {page === 'join' && (
            <JoinRoom
              onBack={() => setPage('home')}
              onJoined={(name, newRoomId) => {
                setUserName(name);
                setRoomId(newRoomId);
                setPage('tur');
              }}
            />
          )}

          {/* ========= ADMİN PANELİ ========= */}
          {page === 'admin' && (
            <AdminReadyPanel 
              roomId={roomId} 
              onBack={() => setPage('home')} 
            />
          )}

          {/* ========= TUR EKRANI ========= */}
          {page === 'tur' && (
            <TurScreen 
              roomId={roomId} 
              userName={userName} 
            />
          )}
        </div>
      </main>

      {/* ======================= FOOTER ======================= */}
      <footer className="w-full bg-white border-t">
        {/* Footer içeriğini de ortalayalım */}
        <div className="max-w-3xl mx-auto py-4 px-4 text-center text-sm text-gray-500">
          © 2025 Brainstorming App
        </div>
      </footer>
    </div>
  );
}
