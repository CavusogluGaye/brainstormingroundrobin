// checkTailwind.js
try {
  require('tailwindcss');
  console.log('✔️ tailwindcss bulunabiliyor ve YÜKLÜ');
} catch (e) {
  console.error('❌ tailwindcss YÜKLENMEMİŞ veya BULUNAMADI');
}

try {
  require('postcss');
  console.log('✔️ postcss bulunabiliyor ve YÜKLÜ');
} catch (e) {
  console.error('❌ postcss YÜKLENMEMİŞ veya BULUNAMADI');
}

try {
  require('autoprefixer');
  console.log('✔️ autoprefixer bulunabiliyor ve YÜKLÜ');
} catch (e) {
  console.error('❌ autoprefixer YÜKLENMEMİŞ veya BULUNAMADI');
}
