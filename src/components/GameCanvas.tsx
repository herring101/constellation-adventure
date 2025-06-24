'use client';

import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import { SoundManager } from '@/lib/audio/SoundManager';

interface GameCanvasProps {
  width: number;
  height: number;
  onGameComplete?: (score: number, isGameOver?: boolean) => void;
}

interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ground' | 'star' | 'cloud' | 'ice' | 'pit';
}

interface Item {
  x: number;
  y: number;
  collected: boolean;
  type: 'star-fragment';
}

interface Enemy {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  type: 'shooting-star' | 'blackhole';
  width: number;
  height: number;
  minX?: number;
  maxX?: number;
  pullRadius?: number; // ブラックホール用の引き寄せ範囲
  killRadius?: number; // ブラックホール用の即死範囲
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
  platforms: Platform[];
  items: Item[];
  enemies: Enemy[];
  score: number;
  keys: Set<string>;
  gameCompleted: boolean;
  isPerfectScore: boolean; // 25個全て集めたかどうか
  goal: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export const GameCanvas: FC<GameCanvasProps> = ({ width, height, onGameComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const soundManagerRef = useRef<SoundManager | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
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
      // Section 1: 星の導き (0-500px) - 穴あり地面
      { x: 0, y: height - 32, width: 350, height: 32, type: 'ground' },
      // 穴1: x:350-450 (100px gap)
      { x: 450, y: height - 32, width: 300, height: 32, type: 'ground' },
      // 穴2: x:750-850 (100px gap)  
      { x: 850, y: height - 32, width: 400, height: 32, type: 'ground' },
      // 穴3: x:1250-1350 (100px gap)
      { x: 1350, y: height - 32, width: 500, height: 32, type: 'ground' },
      // 穴4: x:1850-1950 (100px gap)
      { x: 1950, y: height - 32, width: 400, height: 32, type: 'ground' },
      // 穴5: x:2350-2450 (100px gap)
      { x: 2450, y: height - 32, width: 400, height: 32, type: 'ground' },
      // 穴6: x:2850-2950 (100px gap)
      { x: 2950, y: height - 32, width: 500, height: 32, type: 'ground' },
      // 穴7: x:3450-3550 (100px gap)
      { x: 3550, y: height - 32, width: 450, height: 32, type: 'ground' },
      { x: 200, y: height - 120, width: 128, height: 32, type: 'star' },
      { x: 400, y: height - 200, width: 128, height: 32, type: 'star' },
      
      // Section 2: 雲の浮島 (500-1000px)
      { x: 600, y: height - 280, width: 128, height: 32, type: 'cloud' },
      { x: 800, y: height - 160, width: 128, height: 32, type: 'cloud' },
      { x: 1000, y: height - 240, width: 128, height: 32, type: 'cloud' },
      
      // Section 3: 氷の試練 (1000-1500px)
      { x: 1200, y: height - 180, width: 128, height: 32, type: 'ice' },
      { x: 1400, y: height - 300, width: 128, height: 32, type: 'ice' },
      { x: 1600, y: height - 220, width: 128, height: 32, type: 'ice' },
      
      // Section 4: 混合チャレンジ (1500-2000px)
      { x: 1800, y: height - 150, width: 128, height: 32, type: 'star' },
      { x: 2000, y: height - 280, width: 128, height: 32, type: 'cloud' },
      { x: 2200, y: height - 200, width: 128, height: 32, type: 'ice' },
      
      // Section 5: 上昇の道 (2000-2500px)
      { x: 2400, y: height - 150, width: 96, height: 32, type: 'star' },
      { x: 2500, y: height - 220, width: 96, height: 32, type: 'star' },
      { x: 2600, y: height - 290, width: 96, height: 32, type: 'star' },
      { x: 2700, y: height - 360, width: 96, height: 32, type: 'star' },
      
      // Section 6: 浮遊大陸 (2500-3000px)
      { x: 2900, y: height - 300, width: 160, height: 32, type: 'cloud' },
      { x: 3100, y: height - 280, width: 160, height: 32, type: 'cloud' },
      { x: 3300, y: height - 260, width: 160, height: 32, type: 'cloud' },
      
      // Section 7: 最終試練 (3000-3500px)
      { x: 3500, y: height - 200, width: 96, height: 32, type: 'ice' },
      { x: 3600, y: height - 280, width: 96, height: 32, type: 'star' },
      { x: 3700, y: height - 360, width: 96, height: 32, type: 'cloud' },
      
      // Section 8: ゴール地点 (3500-4000px)
      { x: 3800, y: height - 150, width: 200, height: 32, type: 'star' },
    ],
    items: [
      // Section 1の星のかけら
      { x: 250, y: height - 150, collected: false, type: 'star-fragment' as const },
      { x: 450, y: height - 230, collected: false, type: 'star-fragment' as const },
      { x: 350, y: height - 100, collected: false, type: 'star-fragment' as const },
      
      // Section 2の星のかけら
      { x: 650, y: height - 310, collected: false, type: 'star-fragment' as const },
      { x: 850, y: height - 190, collected: false, type: 'star-fragment' as const },
      { x: 1050, y: height - 270, collected: false, type: 'star-fragment' as const },
      
      // Section 3の星のかけら
      { x: 1250, y: height - 210, collected: false, type: 'star-fragment' as const },
      { x: 1450, y: height - 330, collected: false, type: 'star-fragment' as const },
      { x: 1650, y: height - 250, collected: false, type: 'star-fragment' as const },
      
      // Section 4の星のかけら
      { x: 1850, y: height - 180, collected: false, type: 'star-fragment' as const },
      { x: 2050, y: height - 310, collected: false, type: 'star-fragment' as const },
      { x: 2250, y: height - 230, collected: false, type: 'star-fragment' as const },
      
      // Section 5の星のかけら（高所チャレンジ）
      { x: 2450, y: height - 180, collected: false, type: 'star-fragment' as const },
      { x: 2550, y: height - 250, collected: false, type: 'star-fragment' as const },
      { x: 2650, y: height - 320, collected: false, type: 'star-fragment' as const },
      { x: 2750, y: height - 390, collected: false, type: 'star-fragment' as const },
      
      // Section 6の星のかけら
      { x: 2950, y: height - 330, collected: false, type: 'star-fragment' as const },
      { x: 3150, y: height - 310, collected: false, type: 'star-fragment' as const },
      { x: 3350, y: height - 290, collected: false, type: 'star-fragment' as const },
      
      // Section 7の星のかけら（最難関）
      { x: 3550, y: height - 230, collected: false, type: 'star-fragment' as const },
      { x: 3650, y: height - 310, collected: false, type: 'star-fragment' as const },
      { x: 3750, y: height - 390, collected: false, type: 'star-fragment' as const },
      
      // Section 8の星のかけら（ゴール報酬）
      { x: 3800, y: height - 180, collected: false, type: 'star-fragment' as const },
      { x: 3840, y: height - 220, collected: false, type: 'star-fragment' as const },
      { x: 3880, y: height - 180, collected: false, type: 'star-fragment' as const },
    ],
    enemies: [
      // 流れ星敵（セクション2と3の間）
      { 
        x: 900, y: height - 200, velocityX: 2, velocityY: 0, 
        type: 'shooting-star', width: 40, height: 20,
        minX: 800, maxX: 1100
      },
      // 流れ星敵（セクション4）
      { 
        x: 1700, y: height - 180, velocityX: -1.5, velocityY: 0, 
        type: 'shooting-star', width: 40, height: 20,
        minX: 1600, maxX: 1900
      },
      // 流れ星敵（セクション6）
      { 
        x: 3000, y: height - 220, velocityX: 3, velocityY: 0, 
        type: 'shooting-star', width: 40, height: 20,
        minX: 2900, maxX: 3400
      },
      // ブラックホール敵（セクション5の高所）
      { 
        x: 2600, y: height - 350, velocityX: 0, velocityY: 0, 
        type: 'blackhole', width: 60, height: 60,
        pullRadius: 120, killRadius: 30
      },
      // ブラックホール敵（セクション7の最終試練）
      { 
        x: 3650, y: height - 400, velocityX: 0, velocityY: 0, 
        type: 'blackhole', width: 60, height: 60,
        pullRadius: 100, killRadius: 30
      },
    ],
    score: 0,
    keys: new Set(),
    gameCompleted: false,
    isPerfectScore: false,
    goal: {
      x: 3920,
      y: height - 180,  // 地面の上に配置
      width: 50,
      height: 150
    }
  });

  // サウンドマネージャーの初期化
  useEffect(() => {
    const initSound = async () => {
      const soundManager = SoundManager.getInstance();
      await soundManager.initialize();
      soundManagerRef.current = soundManager;
      // BGM開始
      soundManager.playBGM();
    };
    
    initSound();
    
    return () => {
      soundManagerRef.current?.stopBGM();
    };
  }, []);

  // キーボード入力処理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setGameState(prev => {
        if (prev.gameCompleted) return prev; // ゲーム完了後は入力を無効化
        return {
          ...prev,
          keys: new Set(prev.keys).add(e.key.toLowerCase()),
        };
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setGameState(prev => {
        if (prev.gameCompleted) return prev; // ゲーム完了後は入力を無効化
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
  }, [gameState.gameCompleted]);

  // タッチ入力処理（モバイル対応）
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (gameState.gameCompleted) return; // ゲーム完了後は入力を無効化
      
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
  }, [width, height, gameState.gameCompleted]);

  // ゲームループ
  useEffect(() => {
    const gameLoop = () => {
      setGameState(prev => {
        // ゲーム完了後は更新を停止
        if (prev.gameCompleted) return prev;
        
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
          // ジャンプ音再生
          soundManagerRef.current?.playSE('jump');
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

        // 穴への落下チェック（地面レベル付近で穴エリアにいる場合）
        const groundLevel = height - 32;
        const pitAreas = [
          {x: 350, width: 100}, // 穴1
          {x: 750, width: 100}, // 穴2  
          {x: 1250, width: 100}, // 穴3
          {x: 1850, width: 100}, // 穴4
          {x: 2350, width: 100}, // 穴5
          {x: 2850, width: 100}, // 穴6
          {x: 3450, width: 100}, // 穴7
        ];
        
        for (const pit of pitAreas) {
          if (player.x > pit.x && player.x < pit.x + pit.width && player.y > groundLevel - 50) {
            // ゲームオーバーSE再生
            soundManagerRef.current?.playSE('gameOver');
            soundManagerRef.current?.stopBGM();
            
            // 少し遅延してからゲームオーバー画面へ
            setTimeout(() => {
              if (onGameComplete) {
                onGameComplete(newState.score, true); // 穴に落ちてゲームオーバー
              }
            }, 500); // 0.5秒後
            
            return prev;
          }
        }

        // 画面下への落下時のゲームオーバー
        if (player.y > height + 50) {
          // ゲームオーバーSE再生
          soundManagerRef.current?.playSE('gameOver');
          soundManagerRef.current?.stopBGM();
          
          // 少し遅延してからゲームオーバー画面へ
          setTimeout(() => {
            if (onGameComplete) {
              onGameComplete(newState.score, true); // isGameOver = true
            }
          }, 500); // 0.5秒後
          
          return prev; // 状態更新を停止
        }
        
        // 敵の移動とプレイヤーとの当たり判定
        const enemies = [...newState.enemies];
        for (let i = 0; i < enemies.length; i++) {
          const enemy = enemies[i];
          
          if (enemy.type === 'shooting-star') {
            // 流れ星の左右移動
            enemy.x += enemy.velocityX;
            
            // 範囲制限と反転
            if (enemy.minX !== undefined && enemy.maxX !== undefined) {
              if (enemy.x <= enemy.minX || enemy.x >= enemy.maxX) {
                enemy.velocityX *= -1; // 速度反転
              }
              enemy.x = Math.max(enemy.minX, Math.min(enemy.maxX, enemy.x));
            }
            
            // プレイヤーとの当たり判定
            if (
              player.x + 12 > enemy.x - enemy.width/2 &&
              player.x - 12 < enemy.x + enemy.width/2 &&
              player.y + 12 > enemy.y - enemy.height/2 &&
              player.y - 12 < enemy.y + enemy.height/2
            ) {
              // ゲームオーバーSE再生
              soundManagerRef.current?.playSE('gameOver');
              soundManagerRef.current?.stopBGM();
              
              // 少し遅延してからゲームオーバー画面へ
              setTimeout(() => {
                if (onGameComplete) {
                  onGameComplete(newState.score, true);
                }
              }, 500); // 0.5秒後
              
              return prev;
            }
          } else if (enemy.type === 'blackhole') {
            // ブラックホールとプレイヤーの距離計算
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 即死範囲チェック
            if (enemy.killRadius && distance < enemy.killRadius) {
              // ゲームオーバーSE再生
              soundManagerRef.current?.playSE('gameOver');
              soundManagerRef.current?.stopBGM();
              
              // 少し遅延してからゲームオーバー画面へ
              setTimeout(() => {
                if (onGameComplete) {
                  onGameComplete(newState.score, true);
                }
              }, 500); // 0.5秒後
              
              return prev;
            }
            
            // 引き寄せ効果
            if (enemy.pullRadius && distance < enemy.pullRadius && distance > 0) {
              const pullStrength = Math.max(0.1, (enemy.pullRadius - distance) / enemy.pullRadius) * 0.3;
              const pullX = (-dx / distance) * pullStrength;
              const pullY = (-dy / distance) * pullStrength;
              
              // プレイヤーの速度に引き寄せ力を追加
              player.velocityX += pullX;
              player.velocityY += pullY;
              
              // 速度制限（引き寄せが強すぎないように）
              const maxPullVelocity = 8;
              player.velocityX = Math.max(-maxPullVelocity, Math.min(maxPullVelocity, player.velocityX));
              player.velocityY = Math.max(-maxPullVelocity, Math.min(maxPullVelocity, player.velocityY));
            }
          }
        }
        
        // 星のかけら収集チェック
        const items = [...newState.items];
        let newScore = newState.score;
        let isPerfectScore = newState.isPerfectScore;
        
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (!item.collected) {
            const dx = player.x - item.x;
            const dy = player.y - item.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 30) { // 収集範囲
              items[i] = { ...item, collected: true };
              newScore += 100; // 100点獲得
              // 収集音再生
              soundManagerRef.current?.playSE('collect');
              
              // パーフェクトスコア(25個=2500点)チェック
              if (newScore >= 2500) {
                isPerfectScore = true;
                // 特別なパーフェクト音を再生（goal音を使用）
                setTimeout(() => {
                  soundManagerRef.current?.playSE('goal');
                }, 200);
              }
            }
          }
        }

        return { ...newState, player, items, enemies, score: newScore, isPerfectScore };
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

  // ゲーム完了の監視（ゴールとの当たり判定）
  useEffect(() => {
    const player = gameState.player;
    const goal = gameState.goal;
    
    // プレイヤーとゴールの当たり判定
    const isColliding = 
      player.x + 16 > goal.x &&
      player.x - 16 < goal.x + goal.width &&
      player.y + 16 > goal.y &&
      player.y - 16 < goal.y + goal.height;
    
    if (isColliding && !gameState.gameCompleted) {
      setGameState(prev => ({ ...prev, gameCompleted: true }));
      
      // パーフェクトスコアかどうかで演出を変える
      if (gameState.isPerfectScore) {
        // パーフェクト達成の特別演出
        soundManagerRef.current?.playSE('goal');
        setTimeout(() => {
          soundManagerRef.current?.playSE('goal'); // 2回目の特別音
        }, 300);
        setTimeout(() => {
          soundManagerRef.current?.playSE('collect'); // 3回目のキラキラ音
        }, 600);
      } else {
        // 通常のゴール音
        soundManagerRef.current?.playSE('goal');
      }
      
      soundManagerRef.current?.stopBGM();
      
      // 少し遅延してからゲーム完了コールバックを実行
      const delay = gameState.isPerfectScore ? 3000 : 2000; // パーフェクトは3秒、通常は2秒
      setTimeout(() => {
        onGameComplete?.(gameState.score, false); // isGameOver = false
      }, delay);
    }
  }, [gameState.player, gameState.goal, gameState.gameCompleted, gameState.score, gameState.isPerfectScore, onGameComplete]);

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

    // 自然な穴の視覚的表現
    const pitAreas = [
      {x: 350, width: 100}, // 穴1
      {x: 750, width: 100}, // 穴2  
      {x: 1250, width: 100}, // 穴3
      {x: 1850, width: 100}, // 穴4
      {x: 2350, width: 100}, // 穴5
      {x: 2850, width: 100}, // 穴6
      {x: 3450, width: 100}, // 穴7
    ];
    
    for (const pit of pitAreas) {
      const screenX = pit.x - gameState.camera.x;
      if (screenX + pit.width >= 0 && screenX <= width) {
        // 深い穴のグラデーション
        const pitGradient = ctx.createLinearGradient(screenX, height - 32, screenX, height + 20);
        pitGradient.addColorStop(0, '#2d2d2d');
        pitGradient.addColorStop(0.3, '#1a1a1a');
        pitGradient.addColorStop(0.7, '#0d0d0d');
        pitGradient.addColorStop(1, '#000000');
        
        ctx.fillStyle = pitGradient;
        ctx.fillRect(screenX, height - 32, pit.width, 52);
        
        // 穴の縁部分（地面との境界）
        ctx.fillStyle = '#8B4513';
        // 左の縁
        ctx.fillRect(screenX - 3, height - 35, 3, 8);
        // 右の縁  
        ctx.fillRect(screenX + pit.width, height - 35, 3, 8);
        
        // 穴の内部に岩や石のテクスチャ
        ctx.fillStyle = '#333333';
        for (let i = 0; i < 5; i++) {
          const rockX = screenX + (pit.width / 6) * (i + 1);
          const rockY = height - 25 + Math.random() * 15;
          const rockSize = 2 + Math.random() * 3;
          ctx.beginPath();
          ctx.arc(rockX, rockY, rockSize, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // 微かな赤い光（危険の示唆）
        ctx.fillStyle = 'rgba(255, 100, 100, 0.1)';
        ctx.fillRect(screenX + 10, height - 30, pit.width - 20, 10);
      }
    }
    
    // プラットフォーム描画関数
    function drawPlatform(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, type: string) {
      ctx.save();
      
      switch (type) {
        case 'star':
          // 星雲プラットフォーム（紺と金のグラデーション）
          const nebulaGradient = ctx.createLinearGradient(x, y, x + width, y + height);
          nebulaGradient.addColorStop(0, '#1a237e');
          nebulaGradient.addColorStop(0.3, '#311b92');
          nebulaGradient.addColorStop(0.6, '#4a148c');
          nebulaGradient.addColorStop(0.8, '#6a1b9a');
          nebulaGradient.addColorStop(1, '#7b1fa2');
          
          // ベースの矩形を描画（透過なし）
          ctx.fillStyle = nebulaGradient;
          ctx.fillRect(x, y, width, height);
          
          // 星雲の模様
          ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
          for (let i = 0; i < 5; i++) {
            const cloudX = x + (width / 6) * (i + 1);
            const cloudY = y + height / 2 + Math.sin(i * 1.5) * height * 0.2;
            const cloudR = height * 0.4;
            const cloudGrad = ctx.createRadialGradient(cloudX, cloudY, 0, cloudX, cloudY, cloudR);
            cloudGrad.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
            cloudGrad.addColorStop(0.5, 'rgba(255, 193, 7, 0.3)');
            cloudGrad.addColorStop(1, 'rgba(255, 152, 0, 0)');
            ctx.fillStyle = cloudGrad;
            ctx.beginPath();
            ctx.arc(cloudX, cloudY, cloudR, 0, Math.PI * 2);
            ctx.fill();
          }
          
          // キラキラ星
          ctx.fillStyle = '#ffffff';
          for (let i = 0; i < 8; i++) {
            const starX = x + Math.random() * width;
            const starY = y + Math.random() * height;
            ctx.globalAlpha = 0.6 + Math.random() * 0.4;
            ctx.beginPath();
            ctx.arc(starX, starY, 1, 0, Math.PI * 2);
            ctx.fill();
          }
          
          // エッジのハイライト
          ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.8;
          ctx.strokeRect(x, y, width, height);
          break;
          
        case 'cloud':
          // 天空の雲プラットフォーム（深い青紫・ソリッド）
          const skyGradient = ctx.createLinearGradient(x, y, x, y + height);
          skyGradient.addColorStop(0, '#5c6bc0');
          skyGradient.addColorStop(0.5, '#3f51b5');
          skyGradient.addColorStop(1, '#303f9f');
          
          // ベースの矩形を描画（透過なし）
          ctx.fillStyle = skyGradient;
          ctx.fillRect(x, y, width, height);
          
          // 雲のテクスチャ
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          for (let i = 0; i < 3; i++) {
            const swirlX = x + width * (0.2 + i * 0.3);
            const swirlY = y + height * 0.5;
            const swirlR = height * 0.6;
            ctx.beginPath();
            ctx.arc(swirlX, swirlY, swirlR, 0, Math.PI * 2);
            ctx.fill();
          }
          
          // 星のキラメキ
          ctx.fillStyle = '#ffffff';
          for (let i = 0; i < 5; i++) {
            ctx.globalAlpha = 0.3 + Math.random() * 0.5;
            const sparkX = x + Math.random() * width;
            const sparkY = y + Math.random() * height;
            ctx.beginPath();
            ctx.arc(sparkX, sparkY, 0.5, 0, Math.PI * 2);
            ctx.fill();
          }
          
          // エッジの光
          ctx.strokeStyle = 'rgba(147, 229, 252, 0.6)';
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.8;
          ctx.strokeRect(x, y, width, height);
          break;
          
        case 'ice':
          // 結晶プラットフォーム（エメラルド・ソリッド）
          const crystalGradient = ctx.createLinearGradient(x, y, x + width, y);
          crystalGradient.addColorStop(0, '#006064');
          crystalGradient.addColorStop(0.3, '#00838f');
          crystalGradient.addColorStop(0.6, '#0097a7');
          crystalGradient.addColorStop(1, '#00acc1');
          
          // ベースの矩形を描画（透過なし）
          ctx.fillStyle = crystalGradient;
          ctx.fillRect(x, y, width, height);
          
          // 結晶パターン
          ctx.strokeStyle = 'rgba(224, 247, 250, 0.5)';
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.6;
          
          // ダイヤモンドパターン
          for (let i = 0; i < 3; i++) {
            const diamondX = x + width * (0.2 + i * 0.3);
            const diamondY = y + height / 2;
            const size = height * 0.3;
            
            ctx.beginPath();
            ctx.moveTo(diamondX, diamondY - size);
            ctx.lineTo(diamondX + size * 0.5, diamondY);
            ctx.lineTo(diamondX, diamondY + size);
            ctx.lineTo(diamondX - size * 0.5, diamondY);
            ctx.closePath();
            ctx.stroke();
          }
          
          // キラキラ光
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          for (let i = 0; i < 6; i++) {
            const glintX = x + Math.random() * width;
            const glintY = y + Math.random() * height;
            ctx.globalAlpha = 0.6 + Math.random() * 0.4;
            ctx.beginPath();
            ctx.arc(glintX, glintY, 0.8, 0, Math.PI * 2);
            ctx.fill();
          }
          
          // エッジハイライト
          ctx.strokeStyle = 'rgba(178, 235, 242, 0.7)';
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.9;
          ctx.strokeRect(x, y, width, height);
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

    // 星のかけら描画
    gameState.items.forEach(item => {
      if (!item.collected) {
        const screenX = item.x - gameState.camera.x;
        const screenY = item.y;
        
        // 画面内にある場合のみ描画
        if (screenX >= -20 && screenX <= width + 20) {
          ctx.save();
          
          // 回転アニメーション
          const rotation = (Date.now() / 1000) * 2;
          
          // 光る効果
          ctx.shadowColor = '#ffff00';
          ctx.shadowBlur = 15;
          
          // 星のかけら描画
          ctx.translate(screenX, screenY);
          ctx.rotate(rotation);
          
          const starGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
          starGradient.addColorStop(0, '#ffffff');
          starGradient.addColorStop(0.5, '#ffeb3b');
          starGradient.addColorStop(1, '#ffc107');
          ctx.fillStyle = starGradient;
          
          // 小さい星形
          ctx.beginPath();
          const spikes = 5;
          const outerRadius = 12;
          const innerRadius = 6;
          
          for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          
          // 中央の輝き
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.8;
          ctx.beginPath();
          ctx.arc(0, 0, 3, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
        }
      }
    });

    // 敵の描画
    gameState.enemies.forEach(enemy => {
      const enemyScreenX = enemy.x - gameState.camera.x;
      
      // 画面内にある場合のみ描画
      if (enemyScreenX + enemy.width >= 0 && enemyScreenX <= width) {
        ctx.save();
        ctx.translate(enemyScreenX, enemy.y);
        
        if (enemy.type === 'shooting-star') {
          // 流れ星の描画
          const time = Date.now() / 1000;
          
          // 軌跡効果
          ctx.shadowColor = '#ff6600';
          ctx.shadowBlur = 15;
          
          // メインの流れ星
          const starGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, enemy.width/2);
          starGradient.addColorStop(0, '#ffffff');
          starGradient.addColorStop(0.3, '#ffaa00');
          starGradient.addColorStop(0.7, '#ff6600');
          starGradient.addColorStop(1, '#ff4400');
          
          ctx.fillStyle = starGradient;
          ctx.beginPath();
          ctx.ellipse(0, 0, enemy.width/2, enemy.height/2, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // コアの輝き
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.8 + Math.sin(time * 8) * 0.2;
          ctx.beginPath();
          ctx.arc(0, 0, 5, 0, Math.PI * 2);
          ctx.fill();
          
          // 尻尾エフェクト
          ctx.globalAlpha = 0.6;
          ctx.fillStyle = '#ff8800';
          const tailLength = 30;
          const direction = enemy.velocityX > 0 ? -1 : 1;
          
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(direction * tailLength, -8);
          ctx.lineTo(direction * tailLength * 0.7, 0);
          ctx.lineTo(direction * tailLength, 8);
          ctx.closePath();
          ctx.fill();
        } else if (enemy.type === 'blackhole') {
          // ブラックホールの描画
          const time = Date.now() / 1000;
          
          // 引き寄せ範囲の視覚効果（薄い紫の円）
          if (enemy.pullRadius) {
            ctx.globalAlpha = 0.1 + Math.sin(time * 2) * 0.05;
            const pullGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, enemy.pullRadius);
            pullGradient.addColorStop(0, 'rgba(128, 0, 128, 0.3)');
            pullGradient.addColorStop(0.7, 'rgba(75, 0, 130, 0.2)');
            pullGradient.addColorStop(1, 'rgba(25, 25, 112, 0)');
            ctx.fillStyle = pullGradient;
            ctx.beginPath();
            ctx.arc(0, 0, enemy.pullRadius, 0, Math.PI * 2);
            ctx.fill();
          }
          
          // メインのブラックホール
          ctx.globalAlpha = 1;
          const blackholeGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, enemy.width/2);
          blackholeGradient.addColorStop(0, '#000000');
          blackholeGradient.addColorStop(0.3, '#1a0033');
          blackholeGradient.addColorStop(0.6, '#330066');
          blackholeGradient.addColorStop(0.8, '#4b0082');
          blackholeGradient.addColorStop(1, '#6a0d83');
          
          ctx.fillStyle = blackholeGradient;
          ctx.beginPath();
          ctx.arc(0, 0, enemy.width/2, 0, Math.PI * 2);
          ctx.fill();
          
          // 回転する外縁のリング
          ctx.save();
          ctx.rotate(time * 2);
          ctx.strokeStyle = '#8a2be2';
          ctx.lineWidth = 3;
          ctx.globalAlpha = 0.8;
          ctx.beginPath();
          ctx.arc(0, 0, enemy.width/2 - 5, 0, Math.PI * 2);
          ctx.stroke();
          
          // 内側の輝くリング
          ctx.rotate(-time * 4);
          ctx.strokeStyle = '#da70d6';
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.6 + Math.sin(time * 6) * 0.3;
          ctx.beginPath();
          ctx.arc(0, 0, enemy.width/2 - 15, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          
          // 中心の完全な暗闇（即死範囲）
          if (enemy.killRadius) {
            ctx.fillStyle = '#000000';
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.arc(0, 0, enemy.killRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        
        ctx.restore();
      }
    });
    
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

    // パーフェクトスコア時の特別エフェクト
    if (gameState.isPerfectScore && !gameState.gameCompleted) {
      const time = Date.now() / 1000;
      
      // 画面全体にキラキラエフェクト
      ctx.save();
      for (let i = 0; i < 30; i++) {
        const sparkX = (Math.sin(time * 2 + i) * width * 0.8) + width * 0.5;
        const sparkY = (Math.cos(time * 1.5 + i * 0.5) * height * 0.6) + height * 0.3;
        const sparkSize = 2 + Math.sin(time * 8 + i) * 2;
        
        ctx.fillStyle = `hsl(${(time * 100 + i * 30) % 360}, 100%, 70%)`;
        ctx.globalAlpha = 0.8 + Math.sin(time * 10 + i) * 0.2;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // 「PERFECT!」テキスト表示
      ctx.globalAlpha = 0.9 + Math.sin(time * 6) * 0.1;
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#FF6B00';
      ctx.lineWidth = 3;
      
      const perfectText = 'PERFECT!';
      const textY = height * 0.2;
      ctx.strokeText(perfectText, width * 0.5, textY);
      ctx.fillText(perfectText, width * 0.5, textY);
      
      // サブテキスト
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px Arial';
      const subText = '全ての星の欠片を集めました！';
      ctx.fillText(subText, width * 0.5, textY + 50);
      
      ctx.restore();
    }

    // ゴールの描画
    const goalX = gameState.goal.x - gameState.camera.x;
    if (goalX >= -100 && goalX <= width + 100) {
      ctx.save();
      
      // ゴールの旗ポール
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(goalX - 2, height - 200, 4, 170);
      
      // 旗の部分（星の冠デザイン）
      ctx.translate(goalX, height - 180);
      
      // 冠の背景（光る効果）
      const time = Date.now() / 1000;
      const glowSize = 15 + Math.sin(time * 2) * 5;
      const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize + 20);
      glowGradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
      glowGradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.4)');
      glowGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(-40, -40, 80, 80);
      
      // 星の冠
      ctx.fillStyle = '#FFD700';
      ctx.strokeStyle = '#FFA500';
      ctx.lineWidth = 2;
      
      // 冠の本体
      ctx.beginPath();
      ctx.moveTo(-25, 0);
      ctx.lineTo(-25, -15);
      ctx.lineTo(-15, -25);
      ctx.lineTo(-5, -20);
      ctx.lineTo(0, -30);
      ctx.lineTo(5, -20);
      ctx.lineTo(15, -25);
      ctx.lineTo(25, -15);
      ctx.lineTo(25, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // 冠の宝石（星）
      ctx.fillStyle = '#FFFFFF';
      for (let i = -1; i <= 1; i++) {
        ctx.save();
        ctx.translate(i * 15, -15);
        ctx.rotate(time);
        ctx.beginPath();
        for (let j = 0; j < 5; j++) {
          const angle = (j * Math.PI * 2) / 5 - Math.PI / 2;
          const x = Math.cos(angle) * 5;
          const y = Math.sin(angle) * 5;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      
      // "GOAL" テキスト
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GOAL', 0, 30);
      
      ctx.restore();
    }

    // UI描画
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('🌟 Stellar Adventure', 10, 30);
    
    // スコア表示（回転する星付き）
    ctx.save();
    ctx.translate(10, 55);
    ctx.fillText('スコア: ', 0, 0);
    
    // 回転する星
    const scoreStarRotation = (Date.now() / 1000) * Math.PI * 2; // 1秒で1回転
    ctx.save();
    ctx.translate(50, -5);
    ctx.rotate(scoreStarRotation);
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    const starSize = 8;
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const innerAngle = ((i + 0.5) * Math.PI * 2) / 5 - Math.PI / 2;
      const x = Math.cos(angle) * starSize;
      const y = Math.sin(angle) * starSize;
      const innerX = Math.cos(innerAngle) * (starSize * 0.5);
      const innerY = Math.sin(innerAngle) * (starSize * 0.5);
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      ctx.lineTo(innerX, innerY);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${gameState.score}`, 70, 0);
    ctx.restore();
    
    ctx.fillText(`星のかけら: ${gameState.items.filter(i => i.collected).length} / ${gameState.items.length}`, 10, 80);
    ctx.fillText(`距離: ${Math.round(player.x)}m`, 10, 105);
    
    // サウンドボタン
    ctx.save();
    ctx.fillStyle = soundEnabled ? '#4ade80' : '#ef4444';
    ctx.fillRect(width - 50, 10, 40, 30);
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(soundEnabled ? '🔊' : '🔇', width - 30, 32);
    ctx.restore();
    
    // ゴール到達チェック（当たり判定ベース）
    const isAtGoal = 
      player.x + 16 > gameState.goal.x &&
      player.x - 16 < gameState.goal.x + gameState.goal.width &&
      player.y + 16 > gameState.goal.y &&
      player.y - 16 < gameState.goal.y + gameState.goal.height;
      
    if (isAtGoal || gameState.gameCompleted) {
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText('🎉 ゴール到達！ 🎉', width / 2, height / 2);
      ctx.font = '18px Arial';
      ctx.fillText(`最終スコア: ${gameState.score}`, width / 2, height / 2 + 30);
    }
  }, [gameState, width, height, soundEnabled]);

  // クリック処理（サウンドボタン）
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // サウンドボタンの範囲内かチェック
    if (x >= width - 50 && x <= width - 10 && y >= 10 && y <= 40) {
      setSoundEnabled(prev => {
        const newEnabled = !prev;
        soundManagerRef.current?.setEnabled(newEnabled);
        if (newEnabled && !gameState.gameCompleted) {
          soundManagerRef.current?.playBGM();
        }
        return newEnabled;
      });
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border border-gray-600 bg-gray-900 cursor-pointer"
      style={{ 
        imageRendering: 'pixelated',
        touchAction: 'none' // スマホでのスクロール防止
      }}
      onClick={handleCanvasClick}
    />
  );
};