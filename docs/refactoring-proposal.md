# Constellation Adventure リファクタリング提案書

## 現状の分析

### 🔍 コード構造の確認結果

最新のコードを分析した結果、以下の構造になっています：

1. **useFullscreen Hook** (`src/hooks/useFullscreen.ts`)
   - 全画面管理のカスタムフック
   - ブラウザ互換性対応済み
   - 横向きロック機能付き

2. **GameContainer** (`src/components/GameContainer.tsx`)
   - 全体のゲーム状態管理
   - 画面遷移制御
   - 全画面ボタンの実装（ゲーム中のみ）

3. **問題点**
   - タイトル画面での全画面ボタンの実装が不完全
   - 画面遷移時に全画面状態が維持されない
   - 全画面時のタッチ座標計算に問題がある可能性

## 📋 リファクタリング提案

### 1. 全画面状態の統一管理

**問題**: 現在、全画面ボタンがゲーム画面にのみ存在し、画面遷移で状態が失われる

**解決策**:
```typescript
// GameContainer の最上位レベルで全画面ボタンを管理
<div ref={gameContainerRef} className={`relative ${isFullscreen ? 'fullscreen-game' : ''}`}>
  {/* 全画面ボタンを全画面共通で表示 */}
  <FullscreenButton 
    isFullscreen={isFullscreen}
    toggleFullscreen={toggleFullscreen}
    className="fixed top-4 left-4 z-50"
  />
  
  {/* 各画面のレンダリング */}
  {currentScreen === 'title' && <TitleScreen />}
  {currentScreen === 'playing' && <GameCanvas />}
  {/* ... */}
</div>
```

### 2. 全画面時のタッチ座標補正

**問題**: 全画面時にCanvas要素のスケーリングによりタッチ座標がずれる

**解決策**:
```typescript
// GameCanvas.tsx のタッチイベントハンドラーを改善
const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
  const canvas = canvasRef.current;
  if (!canvas) return;
  
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  // タッチ座標をCanvas座標系に変換
  const touches = Array.from(e.touches).map(touch => ({
    x: (touch.clientX - rect.left) * scaleX,
    y: (touch.clientY - rect.top) * scaleY
  }));
  
  // 座標変換後の処理
  // ...
};
```

### 3. コンポーネントの責務分離

**現状の問題点**:
- GameContainer が肥大化している
- 設定モーダルのロジックが散在
- 全画面管理とゲームロジックが混在

**提案する構造**:
```
src/
├── components/
│   ├── GameContainer.tsx        // 全体のコンテナ（軽量化）
│   ├── GameCanvas.tsx          // ゲーム本体
│   ├── screens/
│   │   ├── TitleScreen.tsx
│   │   ├── GameOverScreen.tsx
│   │   └── GameClearScreen.tsx
│   ├── ui/
│   │   ├── FullscreenButton.tsx
│   │   ├── SettingsModal.tsx
│   │   └── VolumeSlider.tsx
│   └── game/
│       ├── Player.tsx
│       ├── Enemy.tsx
│       └── Platform.tsx
├── hooks/
│   ├── useFullscreen.ts
│   ├── useGameState.ts        // 新規：ゲーム状態管理
│   └── useSettings.ts         // 新規：設定管理
└── lib/
    ├── game/
    │   ├── GameEngine.ts
    │   └── constants.ts
    └── audio/
        └── SoundManager.ts
```

### 4. 状態管理の改善

**提案**: React Context API を使用した状態管理

```typescript
// contexts/GameContext.tsx
interface GameContextValue {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  settings: GameSettings;
  updateSettings: (settings: Partial<GameSettings>) => void;
  gameState: GameState;
  // ...
}

const GameContext = createContext<GameContextValue>(...);

// 使用例
export const GameProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  
  return (
    <GameContext.Provider value={{ isFullscreen, toggleFullscreen, ... }}>
      {children}
    </GameContext.Provider>
  );
};
```

### 5. パフォーマンス最適化

1. **Canvas レンダリングの最適化**
   - requestAnimationFrame の適切な使用
   - 不要な再レンダリングの防止
   - Canvas のオフスクリーンレンダリング

2. **メモ化の活用**
   ```typescript
   const MemoizedGameCanvas = memo(GameCanvas, (prevProps, nextProps) => {
     return prevProps.isPaused === nextProps.isPaused;
   });
   ```

3. **遅延読み込み**
   ```typescript
   const SettingsModal = lazy(() => import('./ui/SettingsModal'));
   ```

## 🎯 実装優先順位

1. **高優先度**（ヘリンの指摘事項）
   - 全画面ボタンの統一管理
   - 画面遷移時の全画面状態維持
   - タッチ座標の補正

2. **中優先度**
   - コンポーネントの分離
   - 状態管理の改善

3. **低優先度**
   - パフォーマンス最適化
   - コードの整理・リファクタリング

## 📝 実装計画

### Phase 1: 全画面機能の修正（即座に対応）
- [ ] 全画面ボタンをGameContainer直下に移動
- [ ] 画面遷移時の状態維持を実装
- [ ] タッチ座標の補正ロジック追加

### Phase 2: コンポーネント分離（次回配信まで）
- [ ] 画面コンポーネントの分離
- [ ] UIコンポーネントの作成
- [ ] ゲームオブジェクトの分離

### Phase 3: 状態管理改善（将来的に）
- [ ] Context API の導入
- [ ] カスタムフックの整理
- [ ] パフォーマンス最適化

## 💡 追加提案

### TypeScript の型安全性向上
```typescript
// types/game.ts
export interface GameState {
  readonly screen: GameScreen;
  readonly score: number;
  readonly isPaused: boolean;
  readonly isGameOver: boolean;
}

export type GameAction = 
  | { type: 'START_GAME' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'GAME_OVER'; score: number }
  | { type: 'GAME_CLEAR'; score: number };
```

### エラーハンドリングの強化
- 全画面API のエラーハンドリング
- 音源読み込みエラーの適切な処理
- ユーザーへのフィードバック改善

この提案に基づいて、まずは全画面機能の根本的な修正から着手することを推奨します。