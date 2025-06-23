'use client';

import { useEffect, useRef, useState } from 'react';
import { GameEngine } from '@/lib/game/GameEngine';
import { InputManager, InputHandler } from '@/lib/input/InputManager';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const inputManagerRef = useRef<InputManager | null>(null);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Initialize game engine
      const gameEngine = new GameEngine();
      gameEngine.initialize(canvas);
      gameEngineRef.current = gameEngine;

      // Initialize input manager
      const inputManager = new InputManager();
      
      const inputHandler: InputHandler = {
        onAction: (action, pressed) => {
          if (!pressed) return; // Only handle key press, not release for simplicity
          
          switch (action) {
            case 'moveLeft':
              gameEngine.moveLeft();
              break;
            case 'moveRight':
              gameEngine.moveRight();
              break;
            case 'jump':
              gameEngine.jump();
              break;
          }
        }
      };

      inputManager.setInputHandler(inputHandler);
      inputManager.startListening();
      inputManagerRef.current = inputManager;

      // Start the game
      gameEngine.start();
      setIsGameRunning(true);
      setGameError(null);

    } catch (error) {
      console.error('Failed to initialize game:', error);
      setGameError(error instanceof Error ? error.message : 'Unknown error');
      setIsGameRunning(false);
    }

    // Cleanup function
    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.stop();
        gameEngineRef.current = null;
      }
      if (inputManagerRef.current) {
        inputManagerRef.current.stopListening();
        inputManagerRef.current = null;
      }
      setIsGameRunning(false);
    };
  }, []);

  const handleRestart = () => {
    window.location.reload(); // Simple restart for now
  };

  if (gameError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <h1 className="text-2xl font-bold mb-4">Game Error</h1>
        <p className="text-red-400 mb-4">{gameError}</p>
        <button
          onClick={handleRestart}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
        >
          Restart Game
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          🌟 Stellar Adventure
        </h1>
        <p className="text-gray-300 text-center">
          Use Arrow Keys or WASD to move and jump!
        </p>
        <p className="text-gray-400 text-sm text-center mt-1">
          Mobile: Swipe left/right to move, tap right side to jump
        </p>
      </div>

      <div className="relative border-2 border-gray-700 rounded-lg overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          className="block bg-gray-800"
          style={{ imageRendering: 'pixelated' }}
        />
        
        {!isGameRunning && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Loading Game...</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={handleRestart}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
        >
          Restart Game
        </button>
      </div>

      {/* Mobile Controls Hint */}
      <div className="mt-4 text-center md:hidden">
        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-white text-sm font-medium">Movement</div>
            <div className="text-gray-400 text-xs">Swipe left/right</div>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-white text-sm font-medium">Jump</div>
            <div className="text-gray-400 text-xs">Tap right side</div>
          </div>
        </div>
      </div>
    </div>
  );
}