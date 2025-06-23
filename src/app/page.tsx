'use client';

import { useState, useEffect } from 'react';
import { GameCanvas } from '@/components/GameCanvas';

export default function Home() {
  const [windowSize, setWindowSize] = useState({
    width: 800,
    height: 600
  });

  // ウィンドウサイズ監視
  useEffect(() => {
    const handleResize = () => {
      const maxWidth = Math.min(window.innerWidth - 40, 1200);
      const maxHeight = Math.min(window.innerHeight - 40, 800);
      setWindowSize({
        width: maxWidth,
        height: maxHeight
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
          ⭐ Stellar Adventure ⭐
        </h1>
        <p className="text-gray-300 text-lg">
          星座の世界を冒険しよう！
        </p>
        <div className="text-gray-400 text-sm mt-2">
          <div className="hidden sm:block">
            PC: ← → / A D で移動 | ↑ / W / Space でジャンプ
          </div>
          <div className="block sm:hidden">
            タッチ: 左右で移動 | 下部タップでジャンプ
          </div>
          <div className="hidden sm:block text-xs text-gray-500 mt-1">
            スマホでも遊べます！
          </div>
        </div>
      </header>
      
      <main className="flex flex-col items-center">
        <div className="bg-gray-800 p-4 rounded-lg shadow-2xl">
          <GameCanvas 
            width={windowSize.width} 
            height={windowSize.height} 
          />
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-gray-300 text-sm">
            🎮 星の精霊を操作して星座の力を集めよう！
          </p>
        </div>
      </main>
      
      <footer className="mt-8 text-center text-gray-500 text-xs">
        <p>Developed by Stella & Seira ✨</p>
      </footer>
    </div>
  );
}
