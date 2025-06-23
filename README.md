# 🌟 Stellar Adventure

A 2D platformer game where players adventure through constellation worlds to collect stellar powers. Built with Next.js, TypeScript, and HTML5 Canvas.

## 🎮 Game Features

- **Star Spirit Character**: Play as a magical star spirit collecting constellation powers
- **2D Platformer Mechanics**: Classic jump and run gameplay with physics
- **Mobile Support**: Touch controls for mobile devices
- **Progressive Web App**: Installable on mobile devices
- **Constellation Themes**: Adventure through different star constellation worlds

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
- Swipe left/right: Move
- Tap right side of screen: Jump

## 🛠️ Development

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS
- **Game Engine**: Custom Canvas-based engine
- **Input**: Unified keyboard and touch input system

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
- [x] Mobile touch controls
- [ ] Multiple game levels
- [ ] Enemies and obstacles
- [ ] Power-ups and collectibles
- [ ] Sound effects and music
- [ ] Particle effects
- [ ] Leaderboard system