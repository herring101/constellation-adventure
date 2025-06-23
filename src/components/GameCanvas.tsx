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
  camera: {
    x: number;
  };
  platforms: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'ground' | 'star' | 'cloud' | 'ice';
  }>;
  keys: Set<string>;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  
  const [gameState, setGameState] = useState<GameState>({
    player: {
      x: 50,
      y: height - 100,
      velocityX: 0,
      velocityY: 0,
      grounded: false,
    },
    camera: {
      x: 0,
    },
    platforms: [
      { x: 0, y: height - 32, width: width * 3, height: 32, type: 'ground' }, // 長い地面
      { x: 200, y: height - 120, width: 128, height: 32, type: 'star' }, // 星型プラットフォーム1
      { x: 400, y: height - 200, width: 128, height: 32, type: 'cloud' }, // 雲型プラットフォーム1
      { x: 600, y: height - 280, width: 128, height: 32, type: 'star' }, // 星型プラットフォーム2
      { x: 800, y: height - 160, width: 128, height: 32, type: 'ice' }, // 氷結晶プラットフォーム1
      { x: 1000, y: height - 240, width: 128, height: 32, type: 'cloud' }, // 雲型プラットフォーム2
      { x: 1200, y: height - 180, width: 128, height: 32, type: 'star' }, // 星型プラットフォーム3
      { x: 1400, y: height - 300, width: 128, height: 32, type: 'ice' }, // 氷結晶プラットフォーム2
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
      const rect = canvas.getBoundingClientRect();
      
      // 全てのタッチポイントを処理
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
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
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      
      // 残っているタッチポイントを再評価
      const activeKeys = new Set<string>();
      
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        if (y > height * 0.8) {
          activeKeys.add(' ');
        } else if (x < width * 0.5) {
          activeKeys.add('arrowleft');
        } else {
          activeKeys.add('arrowright');
        }
      }
      
      // タッチ関連のキーを更新
      setGameState(prev => {
        const newKeys = new Set(prev.keys);
        // タッチ関連のキーをクリア
        newKeys.delete(' ');
        newKeys.delete('arrowleft');
        newKeys.delete('arrowright');
        // アクティブなキーを追加
        activeKeys.forEach(key => newKeys.add(key));
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

        // カメラ更新（プレイヤーが画面中央を超えたらスクロール）
        const playerScreenX = player.x - newState.camera.x;
        if (playerScreenX > width * 0.6) {
          newState.camera.x = player.x - width * 0.6;
        } else if (playerScreenX < width * 0.3 && newState.camera.x > 0) {
          newState.camera.x = Math.max(0, player.x - width * 0.3);
        }

        // 左端の制限（カメラを考慮）
        player.x = Math.max(16, player.x);

        // 落下時のリセット
        if (player.y > height + 50) {
          player.x = 50;
          player.y = height - 100;
          player.velocityX = 0;
          player.velocityY = 0;
          newState.camera.x = 0; // カメラもリセット
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

    // プラットフォーム描画（カメラオフセット適用）
    for (const platform of gameState.platforms) {
      const screenX = platform.x - gameState.camera.x;
      // 画面内にある場合のみ描画
      if (screenX + platform.width >= 0 && screenX <= width) {
        drawPlatform(ctx, screenX, platform.y, platform.width, platform.height, platform.type);
      }
    }
    
    // プラットフォーム描画関数
    function drawPlatform(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, type: string) {
      ctx.save();
      
      switch (type) {
        case 'star':
          // 星型プラットフォーム（金色・キラキラ）
          const gradient = ctx.createLinearGradient(x, y, x, y + height);
          gradient.addColorStop(0, '#ffd700');
          gradient.addColorStop(0.5, '#ffed4e');
          gradient.addColorStop(1, '#d97706');
          ctx.fillStyle = gradient;
          
          // 星型の描画
          ctx.beginPath();
          const spikes = 5;
          const centerX = x + width / 2;
          const centerY = y + height / 2;
          const outerRadius = Math.min(width, height) / 2;
          const innerRadius = outerRadius * 0.6;
          
          for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes - Math.PI / 2;
            const px = centerX + Math.cos(angle) * radius;
            const py = centerY + Math.sin(angle) * radius;
            
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
          
          // キラキラエフェクト
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.8;
          for (let i = 0; i < 3; i++) {
            const sparkX = x + (width / 4) * (i + 1);
            const sparkY = y + height / 2;
            ctx.beginPath();
            ctx.arc(sparkX, sparkY, 2, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
          
        case 'cloud':
          // 雲型プラットフォーム（青・ふわふわ）
          const cloudGradient = ctx.createLinearGradient(x, y, x, y + height);
          cloudGradient.addColorStop(0, '#87ceeb');
          cloudGradient.addColorStop(0.5, '#4fc3f7');
          cloudGradient.addColorStop(1, '#29b6f6');
          ctx.fillStyle = cloudGradient;
          
          // ふわふわ雲の描画
          ctx.beginPath();
          const cloudHeight = height * 0.8;
          const cloudY = y + height * 0.2;
          
          // 雲の基本形
          ctx.arc(x + width * 0.2, cloudY + cloudHeight * 0.5, cloudHeight * 0.3, 0, Math.PI * 2);
          ctx.arc(x + width * 0.4, cloudY + cloudHeight * 0.3, cloudHeight * 0.4, 0, Math.PI * 2);
          ctx.arc(x + width * 0.6, cloudY + cloudHeight * 0.3, cloudHeight * 0.4, 0, Math.PI * 2);
          ctx.arc(x + width * 0.8, cloudY + cloudHeight * 0.5, cloudHeight * 0.3, 0, Math.PI * 2);
          ctx.fill();
          
          // 白いハイライト
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.6;
          ctx.arc(x + width * 0.3, cloudY + cloudHeight * 0.4, cloudHeight * 0.2, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'ice':
          // 氷結晶プラットフォーム（水色・光沢）
          const iceGradient = ctx.createLinearGradient(x, y, x, y + height);
          iceGradient.addColorStop(0, '#e0f7ff');
          iceGradient.addColorStop(0.5, '#81d4fa');
          iceGradient.addColorStop(1, '#0277bd');
          ctx.fillStyle = iceGradient;
          
          // 氷結晶の描画
          ctx.beginPath();
          ctx.moveTo(x, y + height);
          ctx.lineTo(x + width * 0.2, y);
          ctx.lineTo(x + width * 0.4, y + height * 0.3);
          ctx.lineTo(x + width * 0.6, y);
          ctx.lineTo(x + width * 0.8, y + height * 0.6);
          ctx.lineTo(x + width, y + height);
          ctx.closePath();
          ctx.fill();
          
          // 光沢エフェクト
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.7;
          ctx.stroke();
          break;
          
        default: // ground
          // 従来の地面
          ctx.fillStyle = '#4a5568';
          ctx.strokeStyle = '#6b7280';
          ctx.lineWidth = 2;
          ctx.fillRect(x, y, width, height);
          ctx.strokeRect(x, y, width, height);
          break;
      }
      
      ctx.restore();
    }

    // プレイヤー描画（星の精霊、カメラオフセット適用）
    const player = gameState.player;
    const playerScreenX = player.x - gameState.camera.x;
    ctx.save();
    ctx.translate(playerScreenX, player.y);
    
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


    // UI描画
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('🌟 Stellar Adventure', 10, 30);
    ctx.fillText(`ワールド座標: ${Math.round(player.x)}`, 10, 55);
    ctx.fillText(`カメラ: ${Math.round(gameState.camera.x)}`, 10, 80);
    ctx.fillText(player.grounded ? '接地中' : '空中', 10, 105);
  }, [gameState, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border border-gray-600 bg-gray-900"
      style={{ 
        imageRendering: 'pixelated',
        touchAction: 'none' // スマホでのスクロール防止
      }}
    />
  );
};