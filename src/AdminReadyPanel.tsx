// src/AdminReadyPanel.tsx
import React, { useEffect, useState } from 'react';
import {
  doc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  orderBy,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';

interface AdminReadyPanelProps {
  roomId: string;
  onBack: () => void;
}

interface Participant {
  name: string;
  ready: boolean;
  active: boolean;
}

export default function AdminReadyPanel({ roomId, onBack }: AdminReadyPanelProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentTur, setCurrentTur] = useState(0);
  const [status, setStatus] = useState('waiting');
  const [turCount, setTurCount] = useState(1);
  const [contribs, setContribs] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [contribCount, setContribCount] = useState(0);

  // Oda metadata dinleyici
  useEffect(() => {
    const roomRef = doc(db, 'rooms', roomId);
    const unsub = onSnapshot(roomRef, snap => {
      const data = snap.data();
      if (data) {
        setCurrentTur(data.currentTur);
        setStatus(data.status);
        setTurCount(data.turCount || 1);
      }
    });
    return () => unsub();
  }, [roomId]);

  // Katılımcıları dinleyen listener
  useEffect(() => {
    const partsQuery = query(
      collection(db, 'rooms', roomId, 'participants'),
      orderBy('joinedAt')
    );
    const unsub = onSnapshot(partsQuery, snap => {
      setParticipants(
        snap.docs.map(d => ({
          name: d.id,
          ready: d.data().ready,
          active: d.data().active ?? true
        }))
      );
    });
    return () => unsub();
  }, [roomId]);

  // Contribları dinleyen listener
  useEffect(() => {
    if (status === 'inProgress' && currentTur > 0) {
      const contribQuery = collection(
        db,
        'rooms',
        roomId,
        'turs',
        `tur${currentTur}`,
        'contributions'
      );
      const unsub = onSnapshot(contribQuery, snap => {
        const names = snap.docs.map(d => d.id);
        setContribs(names);
        setContribCount(names.length);
      });
      return () => unsub();
    }
    setContribs([]);
    setContribCount(0);
  }, [roomId, status, currentTur]);

  const activeParticipants = participants.filter(p => p.active);
  const allReady = activeParticipants.length > 0 && activeParticipants.every(p => p.ready);

  const isFinalTurn = status === 'inProgress' && currentTur >= turCount;
  const readyToExport = isFinalTurn && contribCount === activeParticipants.length;

  const startOrNext = async () => {
    const roomRef = doc(db, 'rooms', roomId);
    if (status === 'waiting') {
      if (!allReady) return;
      await updateDoc(roomRef, { status: 'inProgress', currentTur: 1 });
      activeParticipants.forEach(async p => {
        const pref = doc(db, 'rooms', roomId, 'participants', p.name);
        await updateDoc(pref, { ready: false });
      });
    } else if (status === 'inProgress' && currentTur < turCount) {
      await updateDoc(roomRef, { currentTur: currentTur + 1 });
      activeParticipants.forEach(async p => {
        const pref = doc(db, 'rooms', roomId, 'participants', p.name);
        await updateDoc(pref, { ready: false });
      });
    }
  };

  // CSV dışa aktarma fonksiyonu
  const exportContributions = async () => {
    setExporting(true);
    let csv = '\uFEFFTur;Katılımcı;Katkı\n';
    for (let tur = 1; tur <= turCount; tur++) {
      for (const p of activeParticipants) {
        const cref = doc(
          db,
          'rooms',
          roomId,
          'turs',
          `tur${tur}`,
          'contributions',
          p.name
        );
        const snap = await getDoc(cref);
        const text = snap.exists()
          ? (snap.data().contribution as string).replace(/\n/g, ' ')
          : '';
        csv += `${tur};${p.name};${text.replace(/"/g, '""')}\n`;
      }
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `contributions_room_${roomId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  return (
    <div className="max-w-lg w-full mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-6">
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

      <h2 className="text-xl font-semibold text-center">Oda ID: {roomId}</h2>
      <p className="text-sm text-gray-600 text-center">
        Tur {currentTur} / {turCount} tamamlandı
      </p>

      <h3 className="text-lg font-medium text-center">Katılımcı Listesi</h3>
      <ul className="space-y-2">
        {participants.map(p => {
          const icon = p.active ? '✔️' : '❌';
          let label = '';
          let classes = 'px-2 py-1 rounded text-sm ';

          if (!p.active) {
            label = 'Pasif';
            classes += 'bg-gray-200 text-gray-600';
          } else if (status === 'waiting') {
            label = p.ready ? 'Hazırım' : 'Bekleniyor';
            classes += p.ready
              ? 'bg-[#00c853] text-white'   // Lime Green
              : 'bg-[#ff7e5f] text-white';  // Soft Orange
          } else {
            if (isFinalTurn) {
              label = contribs.includes(p.name) ? 'Tamamlandı' : 'Katkı Bekleniyor';
              classes += contribs.includes(p.name)
                ? 'bg-[#00c853] text-white'   // Lime Green
                : 'bg-[#ff7e5f] text-white';  // Soft Orange
            } else {
              if (!contribs.includes(p.name)) {
                label = 'Katkı Bekleniyor';
                classes += 'bg-[#dd2a7b] text-white';  // Soft Pink
              } else if (!p.ready) {
                label = 'Hazırlanıyor';
                classes += 'bg-[#00c6ff] text-white';  // Cyan Blue
              } else {
                label = 'Hazırım';
                classes += 'bg-[#00c853] text-white';  // Lime Green
              }
            }
          }

          return (
            <li key={p.name} className="flex justify-between items-center p-2 border rounded-lg">
              <div className="flex items-center space-x-2">
                <button
                  onClick={async () => {
                    const pref = doc(db, 'rooms', roomId, 'participants', p.name);
                    await updateDoc(pref, { active: !p.active });
                  }}
                  className="text-xl"
                  title={p.active ? 'Pasife Al' : 'Aktif Et'}
                >
                  {icon}
                </button>
                <span className="font-medium">{p.name}</span>
              </div>
              <span className={classes}>{label}</span>
            </li>
          );
        })}
      </ul>

      {isFinalTurn ? (
        <button
          onClick={exportContributions}
          disabled={!readyToExport || exporting}
          className="w-full bg-[#00c853] hover:bg-[#33d46a] text-white font-medium py-3 rounded-xl shadow-md transition disabled:opacity-50"
        >
          {exporting ? 'İndiriliyor...' : 'Katkıları Dışa Aktar'}
        </button>
      ) : (
        <button
          onClick={startOrNext}
          disabled={!allReady}
          className="w-full bg-[#510093] hover:bg-[#6f23a7] text-white font-medium py-3 rounded-xl shadow-md transition disabled:opacity-50"
        >
          {status === 'waiting'
            ? '1. TURU Başlat'
            : `${currentTur + 1}. TURU Başlat`}
        </button>
      )}
    </div>
  );
}
