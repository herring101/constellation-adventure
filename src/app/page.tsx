'use client';

import GameCanvas from '@/components/Game/GameCanvas';

export default function Home() {
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
        </div>
      </header>
      
      <main className="flex flex-col items-center">
        <div className="bg-gray-800 p-4 rounded-lg shadow-2xl">
          <GameCanvas />
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