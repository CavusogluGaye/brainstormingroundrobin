// src/HeroCarousel.tsx
import React, { useState } from 'react';

interface Slide {
  title: string;
  description: string[];
}

const slides: Slide[] = [
  {
    title: 'Hoş Geldiniz!',
    description: [
      'RoundRobin, katılımcıların sırayla fikir ürettiği ve birbirlerinin düşüncelerini beslediği yaratıcı bir beyin fırtınası tekniğidir.',
      'Her ekip üyesinin katkısı dikkate alınır, daha kapsayıcı ve çok yönlü sonuçlar ortaya çıkar.',
    ],
  },
  {
    title: 'Nedir?',
    description: [
      'Katılımcıların her turda fikirleriyle katkı sağladığı bir sistemdir.',
      'Katılımcılar aralarında bir döngüye sahiptir ve her turda önceki katkıları görebilir.',
      'Böylece bir fikir dalgası başlar ve her yeni katkı zinciri güçlendirir.',
    ],
  },
  {
    title: 'Dikkat!',
    description: [
      'Her tur kalan süreniz ekranda yer alacaktır.',
      'Süre bittiğinde katkınız otomatik olarak kaydedilir, eksik olsa bile gönderilir.',
      'Sizden önceki fikirlerin size ilham verdiği yönlere odaklanın, mükemmel cümle kurmak için zaman harcamayın.',
    ],
  },
  {
    title: 'Hemen Başlayın',
    description: [
      '“Odayı Kur” butonuna tıklayıp bir oda oluşturun veya',
      '“Odaya Katıl” ile mevcut bir odaya hızlıca katılın.',
      'Keyifli beyin fırtınaları dileriz!',
    ],
  },
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const total = slides.length;

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const goTo = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    // Dikkat: overflow-hidden kaldırıldı, yerine overflow-visible yapıldı
    <div className="relative w-full overflow-visible rounded-2xl shadow-lg bg-white">
      {/* “Slayt göstergesini” overflow-hidden yapıyoruz */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, idx) => (
            <div key={idx} className="flex-shrink-0 w-full px-8 py-6 break-words">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">{slide.title}</h2>
              {slide.description.map((line, i) => (
                <p key={i} className="text-gray-600 mb-1">{line}</p>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* SOL OK — Artık tam dışarıya çıkacak */}
      <button
        onClick={goPrev}
        className="
          absolute 
          top-1/2 -translate-y-1/2 
          left-0 -ml-10      /* -ml-10 ≈ -2.5rem ≈ -40px dışarı taşır */
          z-10 
          bg-white bg-opacity-100 
          text-gray-700 
          rounded-full 
          p-2 
          shadow-md 
          transition
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* SAĞ OK — Artık tam dışarıya çıkacak */}
      <button
        onClick={goNext}
        className="
          absolute 
          top-1/2 -translate-y-1/2 
          right-0 -mr-10     /* -mr-10 ≈ -2.5rem ≈ -40px dışarı taşır */
          z-10 
          bg-white bg-opacity-100 
          text-gray-700 
          rounded-full 
          p-2 
          shadow-md 
          transition
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* ALT NOKTA NAVİGASYONU */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`h-3 w-3 rounded-full transition ${
              idx === currentIndex
                ? 'bg-[#510093]'    /* Aktif slayt için gürok moru */
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
