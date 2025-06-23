'use client';

import React, { useEffect, useRef, useState } from 'react';

interface GameCanvasProps {
  width: number;
  height: number;
}

export interface GameState {
  player: {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
    grounded: boolean;
  };
  platforms: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  keys: Set<string>;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  
  const [gameState, setGameState] = useState<GameState>({
    player: {
      x: 50,
      y: height - 100,
      velocityX: 0,
      velocityY: 0,
      grounded: false,
    },
    platforms: [
      { x: 0, y: height - 32, width: width, height: 32 }, // 地面
      { x: 200, y: height - 120, width: 128, height: 32 }, // プラットフォーム1
      { x: 400, y: height - 200, width: 128, height: 32 }, // プラットフォーム2
    ],
    keys: new Set(),
  });

  // キーボード入力処理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setGameState(prev => ({
        ...prev,
        keys: new Set(prev.keys).add(e.key.toLowerCase()),
      }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setGameState(prev => {
        const newKeys = new Set(prev.keys);
        newKeys.delete(e.key.toLowerCase());
        return { ...prev, keys: newKeys };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // タッチ入力処理（モバイル対応）
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // タッチ位置に基づく操作判定
      if (y > height * 0.8) { // 下部80%はジャンプ
        setGameState(prev => ({
          ...prev,
          keys: new Set(prev.keys).add(' '),
        }));
      } else if (x < width * 0.5) { // 左半分は左移動
        setGameState(prev => ({
          ...prev,
          keys: new Set(prev.keys).add('arrowleft'),
        }));
      } else { // 右半分は右移動
        setGameState(prev => ({
          ...prev,
          keys: new Set(prev.keys).add('arrowright'),
        }));
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      // 全てのタッチ操作をリセット
      setGameState(prev => {
        const newKeys = new Set(prev.keys);
        newKeys.delete(' ');
        newKeys.delete('arrowleft');
        newKeys.delete('arrowright');
        return { ...prev, keys: newKeys };
      });
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [width, height]);

  // ゲームループ
  useEffect(() => {
    const gameLoop = () => {
      setGameState(prev => {
        const newState = { ...prev };
        const player = { ...newState.player };

        // 重力
        player.velocityY += 0.8;

        // キー入力に基づく移動
        if (newState.keys.has('arrowleft') || newState.keys.has('a')) {
          player.velocityX = Math.max(player.velocityX - 0.5, -5);
        } else if (newState.keys.has('arrowright') || newState.keys.has('d')) {
          player.velocityX = Math.min(player.velocityX + 0.5, 5);
        } else {
          player.velocityX *= 0.8; // 摩擦
        }

        // ジャンプ
        if ((newState.keys.has('arrowup') || newState.keys.has('w') || newState.keys.has(' ')) && player.grounded) {
          player.velocityY = -15;
          player.grounded = false;
        }

        // 位置更新
        player.x += player.velocityX;
        player.y += player.velocityY;

        // プラットフォームとの当たり判定
        player.grounded = false;
        for (const platform of newState.platforms) {
          if (
            player.x + 16 > platform.x &&
            player.x - 16 < platform.x + platform.width &&
            player.y + 16 > platform.y &&
            player.y - 16 < platform.y + platform.height
          ) {
            if (player.velocityY > 0) { // 落下中のみ
              player.y = platform.y - 16;
              player.velocityY = 0;
              player.grounded = true;
            }
          }
        }

        // 画面端の制限
        player.x = Math.max(16, Math.min(width - 16, player.x));

        // 落下時のリセット
        if (player.y > height + 50) {
          player.x = 50;
          player.y = height - 100;
          player.velocityX = 0;
          player.velocityY = 0;
        }

        return { ...newState, player };
      });

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [width, height]);

  // 描画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 背景
    ctx.fillStyle = '#1a1b2e';
    ctx.fillRect(0, 0, width, height);

    // 星空背景
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
      const x = (i * 123.4) % width;
      const y = (i * 234.5) % (height * 0.7);
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // プラットフォーム描画
    ctx.fillStyle = '#4a5568';
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;
    for (const platform of gameState.platforms) {
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    }

    // プレイヤー描画（星の精霊）
    const player = gameState.player;
    ctx.save();
    ctx.translate(player.x, player.y);
    
    // 光る効果
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 10;
    
    // 星の形
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    const spikes = 5;
    const outerRadius = 16;
    const innerRadius = 8;
    
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffaa00';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.restore();
  }, [gameState, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border border-gray-600 bg-gray-900"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};