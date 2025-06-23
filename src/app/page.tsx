'use client';

import { GameCanvas } from '@/components/GameCanvas';

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
          <div className="text-center">
            🚧 現在開発中... Coming Soon! 🚧
          </div>
        </div>
      </header>
      
      <main className="flex flex-col items-center">
        <div className="mb-4 text-center">
          <p className="text-gray-300 text-sm">
            🎮 矢印キーまたはWASDで操作 | スペースキーでジャンプ
          </p>
          <p className="text-gray-400 text-xs mt-1">
            📱 スマホの場合: 画面タッチで操作
          </p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg shadow-2xl">
          <GameCanvas width={800} height={600} />
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-gray-400 text-sm">
            🌟 リアルタイム開発配信中！
          </p>
        </div>
      </main>
      
      <footer className="mt-8 text-center text-gray-500 text-xs">
        <p>Developed by Stella & Seira ✨</p>
      </footer>
    </div>
  );
}