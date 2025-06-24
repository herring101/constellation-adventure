# 🌟 Stellar Adventure

A 2D platformer game where players adventure through constellation worlds to collect stellar powers. Built with Next.js, TypeScript, and HTML5 Canvas.

## 🎮 Game Features

- **Star Spirit Character**: Play as a golden star spirit on an adventure
- **Horizontal Scrolling**: 4000px extended stage with camera following
- **Star Fragment Collection**: Collect 26 star fragments for points
- **Beautiful Platform Types**: 
  - ⭐ Star platforms (golden, sparkly)
  - ☁️ Cloud platforms (blue, fluffy)
  - ❄️ Ice platforms (crystal-like)
- **Mobile Support**: Multi-touch controls for simultaneous move and jump
- **Score System**: 100 points per star fragment collected
- **8 Stage Sections**: Each with unique platform arrangements and challenges

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with Canvas support

### Installation

1. Clone the repository:
```bash
git clone https://github.com/herring101/constellation-adventure.git
cd constellation-adventure
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎯 How to Play

### Controls

**Desktop:**
- Arrow Keys or WASD: Move left/right
- Spacebar or Up Arrow: Jump
- Enter or E: Action/Interact

**Mobile:**
- Left half of screen: Move left
- Right half of screen: Move right  
- Bottom 80% of screen: Jump
- Multi-touch supported for simultaneous actions

## 🛠️ Development

### Tech Stack

- **Framework**: Next.js 15.3.4 with App Router and Turbopack
- **Language**: TypeScript 5.8.3 with strict mode
- **Styling**: Pure CSS (converted from Tailwind for testing)
- **Game Engine**: Custom Canvas-based engine with React hooks
- **Input**: Multi-touch support with proper touch point tracking
- **Deployment**: Vercel with automatic CI/CD

### Project Structure

```
src/
├── app/                    # Next.js app router
├── components/
│   └── Game/              # Game-related components
├── lib/
│   ├── game/              # Game engine and logic
│   └── input/             # Input management
└── types/                 # TypeScript type definitions
```

### Code Style

This project follows the [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html).

Key conventions:
- `PascalCase` for classes and interfaces
- `camelCase` for variables and functions
- `CONSTANT_CASE` for constants
- Named exports only (no default exports)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🌟 Team

- **Seira (セイラ)**: Game engine and backend logic
- **Stella (ステラ)**: UI/UX and frontend components

## 🚢 Deployment

This project is configured for deployment on [Vercel](https://vercel.com):

```bash
npm run build
npm run start
```

For Vercel deployment, connect your GitHub repository to Vercel and it will automatically deploy on push to main.

## 🎯 Roadmap

- [x] Basic player movement and physics
- [x] Canvas rendering system
- [x] Mobile multi-touch controls
- [x] Horizontal scrolling (4000px stage)
- [x] Star fragment collection system
- [x] Score tracking
- [x] Beautiful platform graphics (star, cloud, ice)
- [ ] Enemy characters (3+ types)
- [ ] HP/damage system
- [ ] Game over conditions
- [ ] Power-ups and special abilities
- [ ] Sound effects and music
- [ ] Particle effects for collection/damage
- [ ] Stage select and progression
- [ ] Leaderboard system

## 📝 Known Issues

- Goal presentation needs improvement (currently just text)
- No enemies or real challenge elements yet
- Missing damage/game over mechanics
- No sound effects or BGM