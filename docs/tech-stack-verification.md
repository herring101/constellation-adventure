# 技術スタック選定・検証文書

## 🎯 目的
次回配信で技術的トラブルを完全に排除し、ゲーム開発のみに集中できる環境を確立する

## ✅ 推奨技術スタック (検証済み)

### フロントエンド
```json
{
  "framework": "Next.js 15.3.4",
  "language": "TypeScript 5.8.3",
  "styling": "Pure CSS (Tailwind除外)",
  "canvas": "HTML5 Canvas API",
  "validation": "完全動作確認済み"
}
```

### 開発ツール
```json
{
  "linter": "ESLint 9 + eslint-config-next",
  "formatter": "Prettier (設定済み)",
  "testing": "@playwright/test 1.53.1",
  "bundler": "Next.js内蔵 (Turbopack対応)",
  "validation": "ビルド・デプロイ確認済み"
}
```

### デプロイ・インフラ
```json
{
  "hosting": "Vercel",
  "domain": "constellation-adventure.vercel.app",
  "ci_cd": "Vercel自動デプロイ",
  "validation": "URL動作確認済み"
}
```

## 🚫 除外技術・理由

### Tailwind CSS
- **除外理由**: v4互換性問題、PostCSS設定複雑化
- **代替案**: Pure CSS + CSS Variables
- **実証**: 今回の配信で大幅な時間消費要因

### 外部CSS Framework
- **除外理由**: 設定・カスタマイズのオーバーヘッド
- **方針**: 必要最小限のCSS、インラインスタイルも活用

### 複雑なState Management
- **除外理由**: 小規模ゲームには過剰
- **方針**: React useState、useEffect で十分

## 🔧 プロジェクトテンプレート仕様

### ディレクトリ構造
```
constellation-adventure/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # Reactコンポーネント
│   │   └── GameCanvas.tsx   # ゲーム描画コンポーネント
│   ├── lib/                 # ユーティリティ・ロジック
│   │   ├── game/           # ゲームエンジン
│   │   └── input/          # 入力管理
│   └── types/              # TypeScript型定義
├── docs/                   # プロジェクト文書
├── public/                 # 静的ファイル
└── tests/                  # テストファイル
```

### 必須実装済み機能
1. **基本ゲームエンジン** (`src/lib/game/GameEngine.ts`)
   - 物理システム (重力・衝突判定)
   - プレイヤー管理
   - プラットフォーム管理

2. **入力管理システム** (`src/lib/input/InputManager.ts`)
   - キーボード入力 (WASD・矢印キー)
   - モバイルタッチ入力
   - 統一インターフェース

3. **描画システム** (`src/components/GameCanvas.tsx`)
   - HTML5 Canvas描画
   - 星の精霊キャラクター
   - UI・HUD表示

## 📋 事前検証チェックリスト

### 環境構築検証
- [ ] `npm install` エラーなし
- [ ] `npm run dev` 正常起動
- [ ] `npm run build` 成功
- [ ] `npm run lint` エラーなし

### ゲーム機能検証
- [ ] キャラクター移動 (左右・ジャンプ)
- [ ] 重力・落下システム
- [ ] プラットフォーム衝突判定
- [ ] モバイルタッチ操作
- [ ] 画面サイズ対応

### デプロイ検証
- [ ] Vercel デプロイ成功
- [ ] 公開URL アクセス可能
- [ ] PC ブラウザ動作確認
- [ ] モバイルブラウザ動作確認

## 🎮 ゲーム機能仕様

### 実装済み基本機能
```typescript
interface GameFeatures {
  player: {
    movement: ["left", "right", "jump"];
    physics: ["gravity", "collision"];
    appearance: "star_spirit";
  };
  environment: {
    platforms: "multiple_levels";
    background: "starry_night";
    boundaries: "screen_edges";
  };
  controls: {
    keyboard: ["WASD", "arrow_keys", "space"];
    mobile: "touch_gestures";
  };
}
```

### 次回実装予定機能
```typescript
interface NextFeatures {
  enemies: {
    types: ["moving_obstacle", "patrol_enemy"];
    behavior: "basic_ai";
    collision: "player_damage";
  };
  collectibles: {
    items: ["stars", "power_ups"];
    effects: ["score_increase", "temporary_ability"];
  };
  levels: {
    progression: "linear";
    difficulty: "gradual_increase";
  };
}
```

## ⚡ パフォーマンス要件

### 目標指標
- **フレームレート**: 60 FPS維持
- **初回ロード**: < 3秒
- **バンドルサイズ**: < 500KB
- **メモリ使用量**: < 50MB

### 最適化方針
- Canvas描画の効率化
- 不要な再描画の削減
- イメージ・アセットの最適化
- コードスプリッティング (必要に応じて)

## 🔍 開発ツール設定

### ESLint設定 (eslint.config.mjs)
```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
```

### TypeScript設定 (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## 🚨 既知の問題・回避策

### 1. Tailwind CSS v4 互換性問題
- **問題**: PostCSS設定エラー、ビルド失敗
- **回避策**: Pure CSS使用、Tailwind完全除外
- **代替**: CSS Variables + インラインスタイル

### 2. Next.js 15 + React 19 警告
- **問題**: 一部ライブラリの互換性警告
- **対応**: 最新版ライブラリ使用、警告は無視可能

### 3. Vercel デプロイURL
- **問題**: ランダムハッシュ付きURL生成
- **解決**: vercel inspectでシンプルURL確認済み

## 📈 成功指標

### 技術的成功
- [ ] ゼロトラブル配信の実現
- [ ] 設定・環境問題なし
- [ ] スムーズなデプロイ

### 開発効率
- [ ] 実装時間 > 80%
- [ ] トラブル対応時間 < 20%
- [ ] 新機能追加の高速化

## 🔄 継続的改善

### 配信後の振り返り
- 使用した技術の有効性評価
- 新たに発見した問題点
- 次回への改善提案

### 技術スタックの更新
- 新バージョンの検証
- 代替技術の調査
- パフォーマンス改善の検討

---

**作成日**: 2025-06-23  
**作成者**: セイラ (プロジェクトマネージャー)  
**検証状況**: 第1回配信で実証済み  
**次回検証**: 次回配信前の事前テスト