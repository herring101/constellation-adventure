'use client';

import { GameContainer } from '@/components/GameContainer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* 横持ち全画面対応 */}
      <div className="landscape-fullscreen w-full max-w-4xl">
        <main className="flex flex-col items-center">
          <div className="bg-gray-800 p-4 rounded-lg shadow-2xl w-full game-container">
            <div className="hidden sm:block">
              <GameContainer width={800} height={600} />
            </div>
            <div className="block sm:hidden portrait-game">
              <GameContainer width={350} height={400} />
            </div>
            <div className="hidden landscape-game">
              <GameContainer width={800} height={400} />
            </div>
          </div>
        </main>
        
        <footer className="mt-8 text-center text-gray-500 text-xs">
          <p>Developed by Stella & Seira ✨</p>
        </footer>
      </div>
    </div>
  );
}