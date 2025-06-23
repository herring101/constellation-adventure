# Contributing to Stellar Adventure

We want to make contributing to this project as approachable and transparent as possible.

## Code of Conduct
We expect project participants to adhere to a respectful and inclusive environment. Please be kind and constructive in all interactions.

## Our Development Process
We use GitHub to manage our codebase. We track issues, feature requests, and accept pull requests through GitHub.

## Pull Requests
We actively welcome your pull requests.

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes (`npm test`).
5. Make sure your code lints (`npm run lint`).
6. Ensure TypeScript compilation passes (`npm run type-check`).
7. Test your changes in both desktop and mobile environments.

## Coding Style
We follow Google's style guides strictly:

### TypeScript/JavaScript
- Follow [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- Use **lowerCamelCase** for variables and functions
- Use **UpperCamelCase** for classes and interfaces
- Use **CONSTANT_CASE** for constants
- 2 spaces for indentation
- 100 character line length
- Run `npm run lint` to conform to our lint rules
- Run `npm run format` to auto-format code

### File Organization
- Component files: `ComponentName.tsx`
- Utility files: `utilityName.ts`
- Types: Define in same file or `types.ts`
- Assets: Place SVGs in `public/` directory

### Git Commit Messages
- Use conventional commit format: `type(scope): description`
- Examples:
  - `feat(game): add enemy collision detection`
  - `fix(ui): resolve mobile touch input lag`
  - `docs(readme): update installation instructions`

## Development Setup

### Prerequisites
- Node.js 18+
- npm 9+

### Installation
```bash
git clone https://github.com/herring101/constellation-adventure.git
cd constellation-adventure
npm install
```

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
npm test             # Run tests (when available)
npm run format       # Format code with Prettier
```

## Project Structure
```
constellation-adventure/
├── public/           # Static assets (SVGs, images)
├── src/
│   ├── app/         # Next.js app router pages
│   ├── components/  # React components
│   ├── lib/         # Utility libraries and game engine
│   └── types/       # TypeScript type definitions
├── tests/           # Test files
└── docs/            # Documentation
```

## Issues
We use GitHub issues to track public bugs and feature requests. Please ensure your description is:
- Clear and detailed
- Includes steps to reproduce (for bugs)
- Includes expected vs actual behavior
- Includes browser/device information if relevant

### Issue Labels
- `good first issue` - Perfect for newcomers
- `help wanted` - We welcome contributions
- `bug` - Something isn't working
- `feature` - New functionality request
- `documentation` - Improvements to docs
- `mobile` - Mobile-specific issues
- `desktop` - Desktop-specific issues
- `ui/ux` - User interface improvements
- `game-engine` - Core game logic issues

## Feature Development Guidelines

### Game Features
- All new game features should be mobile-responsive
- Include appropriate SVG assets
- Follow the star constellation theme
- Test on multiple devices/browsers

### UI Components
- Use Tailwind CSS for styling
- Ensure accessibility (ARIA labels, keyboard navigation)
- Follow responsive design principles
- Include proper TypeScript types

### Performance
- Optimize SVG assets
- Minimize bundle size impact
- Test game performance on lower-end devices
- Profile rendering performance

## Testing
- Write unit tests for utility functions
- Include integration tests for game mechanics
- Test mobile touch interactions
- Verify cross-browser compatibility

## Documentation
- Update README.md for significant changes
- Document new APIs and components
- Include code examples for complex features
- Update this CONTRIBUTING.md as needed

## Architecture Decisions
When making significant architectural changes:
1. Open an issue for discussion first
2. Consider impact on mobile performance
3. Ensure TypeScript compatibility
4. Follow established patterns in the codebase

## Deployment
This project is deployed on Vercel. Main branch deployments are automatic.

## Questions?
Feel free to open an issue with the `question` label or reach out to the maintainers.

## License
By contributing to Stellar Adventure, you agree that your contributions will be licensed under the MIT License.

---

## Recommended Technology Stack

Based on our development experience, we recommend the following stable configuration:

### Core Technologies
- **Next.js 15** (App Router)
- **TypeScript** (strict mode)
- **Pure CSS or CSS Modules** (avoid Tailwind CSS v4 beta)
- **Canvas API** (for game rendering)
- **SVG** (for game assets)

### Deployment Workflow
1. **Setup Phase**: Basic page with minimal dependencies
2. **Build Verification**: Ensure `npm run build` succeeds
3. **Game Components**: Add Canvas-based game components
4. **Incremental Features**: Add features one by one
5. **Deploy Testing**: Test each major change on Vercel

### Lessons Learned
- Always check official documentation when encountering frequent errors
- Avoid beta versions in production (e.g., Tailwind CSS v4)
- Use stable, well-documented libraries
- Test builds locally before pushing to deployment
- Document successful configurations for future reference

## Special Thanks
This project was built collaboratively by Stella and Seira as part of a live coding stream. We appreciate all contributions to make this game even better! ⭐