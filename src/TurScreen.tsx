// src/TurScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  doc,
  collection,
  onSnapshot,
  query,
  orderBy,
  getDoc,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from './firebase';

interface TurScreenProps {
  roomId: string;
  userName: string;
}

function maskName(name: string): string {
  if (name.length <= 1) return name;
  return name[0] + '*'.repeat(name.length - 1);
}

export default function TurScreen({ roomId, userName }: TurScreenProps) {
  const [topic, setTopic] = useState<string>('');       // ◀ Firestore’dan çekilecek topic
  const [participants, setParticipants] = useState<string[]>([]);
  const [currentTur, setCurrentTur] = useState(0);
  const [turCount, setTurCount] = useState(1);
  const [durations, setDurations] = useState<number[]>([]);
  const [history, setHistory] = useState<{ tur: number; contributor: string; contribution: string }[]>([]);
  const [contribution, setContribution] = useState('');
  const [ready, setReady] = useState(false);
  const [turnDone, setTurnDone] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  // ***************************************
  // A) Firestore’dan “topic” Bilgisini Çekme
  // ***************************************
  useEffect(() => {
    const roomRef = doc(db, 'rooms', roomId);
    getDoc(roomRef).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.topic) {
          setTopic(data.topic as string);
        }
      }
    }).catch(err => {
      console.error('Topic çekme hatası:', err);
    });
  }, [roomId]);

  // ******************************************
  // B) Oda & katılımcı verilerini dinleyelim
  // ******************************************
  useEffect(() => {
    const roomRef = doc(db, 'rooms', roomId);
    const unsubRoom = onSnapshot(roomRef, snap => {
      if (snap.exists()) {
        const data = snap.data();
        setCurrentTur(data.currentTur);
        setTurCount(data.turCount || 1);
        setDurations(data.durations || []);
      }
    });

    const partsQuery = query(
      collection(db, 'rooms', roomId, 'participants'),
      orderBy('joinedAt')
    );
    const unsubParts = onSnapshot(partsQuery, snap => {
      const names = snap.docs.map(d => d.id);
      setParticipants(names);
      const me = snap.docs.find(d => d.id === userName);
      setReady(me?.data().ready || false);
    });

    return () => {
      unsubRoom();
      unsubParts();
    };
  }, [roomId, userName]);

  // ***************************************
  // C) Her tura hazırlık (timer mantığı)
  // ***************************************
  useEffect(() => {
    setContribution('');
    setTurnDone(false);
    setReady(false);
    setTimerActive(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const dur = durations[currentTur - 1];
    if (currentTur > 0 && currentTur <= turCount && typeof dur === 'number' && dur > 0) {
      const secs = dur * 60;
      setSecondsLeft(secs);
      setTimerActive(true);
      timerRef.current = setInterval(() => {
        setSecondsLeft(prev => Math.max(prev - 1, 0));
      }, 1000);
    } else {
      setSecondsLeft(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentTur, turCount, durations]);

  // ***************************************
  // D) Geçmiş katkıları yükleme
  // ***************************************
  useEffect(() => {
    async function loadHistory() {
      const hist: typeof history = [];
      for (let tur = 1; tur <= Math.min(currentTur, turCount); tur++) {
        const idx = participants.indexOf(userName);
        const offset = currentTur - tur;
        const contribIdx = (idx - offset + participants.length) % participants.length;
        const contribUser = participants[contribIdx];
        const ref = doc(
          db,
          'rooms',
          roomId,
          'turs',
          `tur${tur}`,
          'contributions',
          contribUser
        );
        const snap = await getDoc(ref);
        hist.push({
          tur,
          contributor: contribUser,
          contribution: snap.data()?.contribution || ''
        });
      }
      setHistory(hist);
    }
    if (currentTur > 0) loadHistory();
  }, [currentTur, participants, userName, roomId, turCount]);

  // ***************************************
  // E) Turu bitirme fonksiyonu
  // ***************************************
  async function endTurn() {
    if (turnDone) return;
    const contribRef = doc(
      db,
      'rooms',
      roomId,
      'turs',
      `tur${currentTur}`,
      'contributions',
      userName
    );
    await setDoc(contribRef, { contribution, timestamp: new Date() });
    setTurnDone(true);
    setTimerActive(false);
  }

  // *****************************************
  // F) Zaman dolunca otomatik gönder
  // *****************************************
  useEffect(() => {
    if (timerActive && secondsLeft === 0 && !turnDone) {
      if (timerRef.current) clearInterval(timerRef.current);
      endTurn();
    }
  }, [secondsLeft, timerActive, turnDone]);

  // ***************************************
  // G) Hazırım/Vazgeç butonu
  // ***************************************
  const toggleReady = async () => {
    const pref = doc(db, 'rooms', roomId, 'participants', userName);
    await updateDoc(pref, { ready: !ready });
    setReady(!ready);
  };

  // === RENDER ===

  // 1) Oturum başlamadıysa (currentTur === 0)
  if (currentTur === 0) {
    return (
      <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-6">
        {/* ►►► Burada topic en üstte gösteriliyor ►►► */}
        <h2 className="text-2xl font-bold text-center">{topic}</h2>

        <p className="text-gray-700 text-center">Oturum admin tarafından başlatılmayı bekliyor…</p>
        <button
          onClick={toggleReady}
          className={`block mx-auto px-4 py-2 rounded-lg transition ${
            ready ? 'bg-[#00c853] text-white' : 'bg-[#510093] text-white'
          }`}
        >
          {ready ? 'Vazgeç' : 'Hazırım'}
        </button>
      </div>
    );
  }

  // 2) Son turun bitişi => teşekkür mesajı
  if (turnDone && currentTur === turCount) {
    return (
      <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-6">
        {/* ►►► Burada topic en üstte gösteriliyor ►►► */}
        <h2 className="text-2xl font-bold text-center">{topic}</h2>
        <p className="text-[#00c853] font-semibold text-center">
          Tüm turlar tamamlandı. Katkılarınız için teşekkürler!
        </p>
      </div>
    );
  }

  // 3) Ara tur bekleme ekranı
  if (turnDone && currentTur < turCount) {
    return (
      <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-6">
        {/* ►►► Burada topic en üstte gösteriliyor ►►► */}
        <h2 className="text-2xl font-bold text-center">{topic}</h2>
        <p className="text-gray-700 text-center">Tur {currentTur} bitti. Sonraki tur için hazır mısınız?</p>
        <button
          onClick={toggleReady}
          className={`block mx-auto px-4 py-2 rounded-lg transition ${
            ready ? 'bg-[#00c853] text-white' : 'bg-[#510093] text-white'
          }`}
        >
          {ready ? 'Vazgeç' : 'Hazırım'}
        </button>
      </div>
    );
  }

  // 4) Tur esnası: timer, geçmiş, textarea ve Gönder butonu
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-6">
      {/* ►►► Burada topic en üstte gösteriliyor ►►► */}
      <h2 className="text-2xl font-bold text-center">{topic}</h2>

      {/* TUR ve Maskelenmiş İsim */}
      <h3 className="text-lg font-semibold text-center">
        TUR {currentTur} / {turCount} — {maskName(userName)}
      </h3>

      {/* Kalan Süre */}
      <div className="text-lg font-mono text-gray-800 text-center mb-2">
        Kalan Süre: {minutes}:{seconds.toString().padStart(2, '0')}
      </div>

      {/* Geçmiş Katkılar */}
      {history.map(h => (
        <div key={h.tur} className="mb-4 p-3 border-l-4 border-[#00c6ff] bg-gray-50 rounded-lg">
          <h4 className="font-medium">
            TUR {h.tur} — {maskName(h.contributor)}
          </h4>
          <p className="mt-1 text-gray-700">{h.contribution}</p>
        </div>
      ))}

      {/* Katkı Textarea */}
      <textarea
        rows={4}
        value={contribution}
        onChange={e => setContribution(e.target.value)}
        placeholder="Katkınızı yazın..."
        disabled={turnDone}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#510093] disabled:opacity-50"
      />

      {/* Gönder Butonu */}
      <button
        onClick={endTurn}
        disabled={turnDone}
        className="block mx-auto px-4 py-2 bg-[#510093] hover:bg-[#6f23a7] text-white rounded-xl shadow-md transition disabled:opacity-50"
      >
        Gönder
      </button>
    </div>
  );
}
