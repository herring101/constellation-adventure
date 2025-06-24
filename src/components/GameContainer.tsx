'use client';

import { useState } from 'react';
import type { FC } from 'react';
import { GameCanvas } from './GameCanvas';

type GameScreen = 'title' | 'playing' | 'gameOver';

interface GameContainerProps {
  width: number;
  height: number;
}

export const GameContainer: FC<GameContainerProps> = ({ width, height }) => {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('title');
  const [finalScore, setFinalScore] = useState(0);

  const handleStartGame = () => {
    setCurrentScreen('playing');
  };

  const handleGameComplete = (score: number) => {
    setFinalScore(score);
    setCurrentScreen('gameOver');
  };

  const handleRetry = () => {
    setCurrentScreen('playing');
  };

  const handleBackToTitle = () => {
    setCurrentScreen('title');
  };

  return (
    <div className="relative">
      {currentScreen === 'title' && (
        <TitleScreen
          width={width}
          height={height}
          onStartGame={handleStartGame}
        />
      )}

      {currentScreen === 'playing' && (
        <GameCanvas
          width={width}
          height={height}
          onGameComplete={handleGameComplete}
        />
      )}

      {currentScreen === 'gameOver' && (
        <GameOverScreen
          width={width}
          height={height}
          score={finalScore}
          onRetry={handleRetry}
          onBackToTitle={handleBackToTitle}
        />
      )}
    </div>
  );
};

interface TitleScreenProps {
  width: number;
  height: number;
  onStartGame: () => void;
}

const TitleScreen: FC<TitleScreenProps> = ({ width, height, onStartGame }) => {
  return (
    <div
      className="flex flex-col items-center justify-center bg-gradient-to-b from-indigo-900 via-purple-900 to-blue-900 relative overflow-hidden"
      style={{ width, height }}
    >
      {/* 背景の星アニメーション */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 1}s`,
            }}
          />
        ))}
      </div>

      {/* タイトル */}
      <div className="relative z-10 text-center">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 bg-clip-text text-transparent">
          ⭐ STELLAR ⭐
        </h1>
        <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          ADVENTURE
        </h2>
        
        <p className="text-white text-lg mb-8 opacity-90">
          星座の世界を冒険して星の欠片を集めよう！
        </p>

        {/* スタートボタン */}
        <button
          onClick={onStartGame}
          className="relative px-12 py-5 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:from-purple-500 hover:via-pink-400 hover:to-orange-400 text-white font-bold text-2xl rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 active:scale-95 border-4 border-white/30 backdrop-blur-sm"
        >
          <span className="relative z-10 flex items-center gap-3">
            <span className="text-3xl animate-pulse">✨</span>
            ゲームスタート
            <span className="text-3xl animate-pulse">✨</span>
          </span>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/20 to-pink-400/20 blur-xl animate-pulse"></div>
        </button>

        {/* 操作説明 */}
        <div className="mt-8 text-gray-300 text-sm space-y-2">
          <div className="hidden sm:block">
            <p>🎮 PC: ← → または A D で移動</p>
            <p>⬆️ ↑ / W / Space でジャンプ</p>
          </div>
          <div className="block sm:hidden">
            <p>📱 タッチ: 左右で移動、下部タップでジャンプ</p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface GameOverScreenProps {
  width: number;
  height: number;
  score: number;
  onRetry: () => void;
  onBackToTitle: () => void;
}

const GameOverScreen: FC<GameOverScreenProps> = ({ 
  width, 
  height, 
  score, 
  onRetry, 
  onBackToTitle 
}) => {
  // ハイスコアの管理
  const currentHighScore = typeof window !== 'undefined' 
    ? parseInt(localStorage.getItem('stellarAdventureHighScore') || '0')
    : 0;
  
  const isNewHighScore = score > currentHighScore;
  
  if (typeof window !== 'undefined' && isNewHighScore) {
    localStorage.setItem('stellarAdventureHighScore', score.toString());
  }

  return (
    <div
      className="flex flex-col items-center justify-center bg-gradient-to-b from-purple-900 via-indigo-900 to-blue-900 relative"
      style={{ width, height }}
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
          ⭐ ゲームクリア！ ⭐
        </h1>
        
        <div className="mb-8 space-y-4">
          <div className="text-2xl text-white">
            スコア: <span className="text-yellow-400 font-bold">{score}</span>
          </div>
          
          {isNewHighScore && (
            <div className="text-lg text-green-400 animate-pulse">
              🎉 新記録達成！ 🎉
            </div>
          )}
          
          <div className="text-lg text-gray-300">
            ハイスコア: <span className="text-yellow-300">{Math.max(score, currentHighScore)}</span>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={onRetry}
            className="relative px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-white font-bold text-xl rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 active:scale-95 border-4 border-white/30 backdrop-blur-sm mr-4"
          >
            <span className="relative z-10 flex items-center gap-2">
              <span className="text-2xl">🔄</span>
              もう一度プレイ
            </span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400/20 to-blue-400/20 blur-xl"></div>
          </button>
          
          <button
            onClick={onBackToTitle}
            className="relative px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-bold text-xl rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 active:scale-95 border-4 border-white/30 backdrop-blur-sm"
          >
            <span className="relative z-10 flex items-center gap-2">
              <span className="text-2xl">🏠</span>
              タイトルへ戻る
            </span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/20 to-pink-400/20 blur-xl"></div>
          </button>
        </div>
      </div>
    </div>
  );
};