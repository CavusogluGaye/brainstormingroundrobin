// src/JoinRoom.tsx
import React, { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

interface JoinRoomProps {
  onJoined: (name: string, roomId: string) => void;
  onBack: () => void;
}

export default function JoinRoom({ onJoined, onBack }: JoinRoomProps) {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!name || !roomId) {
      alert('Ad ve Oda ID gerekli');
      return;
    }
    setLoading(true);
    try {
      const partRef = doc(db, 'rooms', roomId, 'participants', name);
      await setDoc(partRef, { name, joinedAt: serverTimestamp(), ready: false });
      onJoined(name, roomId);
    } catch (err) {
      console.error(err);
      alert('Katılma hatası');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 space-y-6 mx-auto">
      {/* ← Geri Butonu (Deep Purple Hex) */}
      <button
        onClick={onBack}
        className="flex items-center text-[#510093] hover:text-[#6f23a7] transition mb-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
        Ana Sayfaya Dön
      </button>

      <h2 className="text-xl font-semibold text-center">Odaya Katıl</h2>

      <div className="space-y-4">
        <label className="flex flex-col">
          <span className="font-medium mb-1">Adınız:</span>
          <input
            placeholder="Adınızı girin"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff]"
          />
        </label>

        <label className="flex flex-col">
          <span className="font-medium mb-1">Oda ID:</span>
          <input
            placeholder="Oda ID girin"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff]"
          />
        </label>
      </div>

      <button
        onClick={handleJoin}
        disabled={loading}
        className="w-full bg-[#00c6ff] hover:bg-[#66dfff] text-white font-medium py-3 rounded-xl shadow-md transition disabled:opacity-50"
      >
        {loading ? 'Katılıyor...' : 'Katıl'}
      </button>
    </div>
  );
}
