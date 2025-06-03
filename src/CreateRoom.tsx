// src/CreateRoom.tsx
import React, { useState, useEffect } from 'react';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

interface CreateRoomProps {
  onCreated: (roomId: string) => void;
  onBack: () => void;
}

export default function CreateRoom({ onCreated, onBack }: CreateRoomProps) {
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');               // ◀ Konu için eklenen state
  const [turCount, setTurCount] = useState<number>(1);
  const [durations, setDurations] = useState<string[]>(['1']);

  // turCount değiştiğinde durations dizisini güncelle
  useEffect(() => {
    setDurations(prev => {
      const arr = [...prev];
      while (arr.length < turCount) arr.push('1');
      arr.length = turCount;
      return arr;
    });
  }, [turCount]);

  const handleCreateRoom = async () => {
    if (!topic.trim()) {
      alert('Lütfen önce bir “Konu” girin.');
      return;
    }

    setLoading(true);
    try {
      const roomRef = doc(collection(db, 'rooms'));
      await setDoc(roomRef, {
        createdAt: serverTimestamp(),
        status: 'waiting',
        currentTur: 0,
        turCount,
        durations: durations.map(d => parseInt(d, 10)),
        topic: topic.trim(),                // ◀ Firestore’a topic’u kaydedelim
      });
      onCreated(roomRef.id);
    } catch (err) {
      console.error(err);
      alert('Oda oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 space-y-6 mx-auto">
      {/* ← Geri Butonu */}
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

      <h2 className="text-xl font-semibold text-center">Oda Oluştur</h2>

      <div className="space-y-4">
        {/* —— Konu Input —— */}
        <label className="flex flex-col">
          <span className="font-medium mb-1">Konu:</span>
          <input
            type="text"
            placeholder="Oda konusu girin"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#510093]"
          />
        </label>

        {/* —— Tur Adedi Input —— */}
        <label className="flex flex-col">
          <span className="font-medium mb-1">Tur Adedi:</span>
          <input
            type="number"
            min={1}
            value={turCount}
            onChange={(e) => setTurCount(parseInt(e.target.value) || 1)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#510093]"
          />
        </label>

        {/* —— Her Tura Ait Süre Input’ları —— */}
        {durations.map((dur, idx) => (
          <label key={idx} className="flex flex-col">
            <span className="font-medium mb-1">Tur {idx + 1} Süresi (dakika):</span>
            <input
              type="number"
              min={1}
              value={dur}
              onChange={(e) =>
                setDurations(prev => prev.map((v, i) => (i === idx ? e.target.value : v)))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#510093]"
            />
          </label>
        ))}
      </div>

      <button
        onClick={handleCreateRoom}
        disabled={loading}
        className="w-full bg-[#510093] hover:bg-[#6f23a7] text-white font-medium py-3 rounded-xl shadow-md transition disabled:opacity-50"
      >
        {loading ? 'Oluşturuluyor...' : 'Oda Oluştur'}
      </button>
    </div>
  );
}
