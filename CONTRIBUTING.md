# Contributing to Stellar Adventure

We want to make contributing to this project as approachable and transparent as possible.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please be respectful and professional in all interactions.

## Our Development Process

We use GitHub to track issues and feature requests, as well as accept pull requests. Development happens in the open on GitHub.

## Pull Requests

We actively welcome your pull requests.

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code follows our style guide.
6. Update the README.md if necessary.

## Coding Style

This project follows the [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html).

### Key Conventions:
- **Naming**: Use `PascalCase` for classes/interfaces, `camelCase` for variables/functions, `CONSTANT_CASE` for constants
- **Exports**: Use named exports only (no default exports)
- **Imports**: Prefer named imports for frequently used symbols, namespace imports for large APIs
- **Line Length**: Aim for 80-100 characters per line
- **Indentation**: 2 spaces (no tabs)

### Before Submitting:
- Run `npm run lint` to check for linting errors
- Run `npm run build` to ensure the project builds successfully
- Run `npm run dev` to test locally

## Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/
│   └── Game/              # Game-related React components
├── lib/
│   ├── game/              # Core game engine and logic
│   └── input/             # Input management system
└── types/                 # TypeScript type definitions
```

## Game Architecture

### Core Systems:
- **GameEngine**: Handles physics, collisions, and game state
- **InputManager**: Unified keyboard and touch input handling
- **GameCanvas**: React component for rendering and UI

### Adding New Features:

1. **Game Logic**: Add to `src/lib/game/`
2. **UI Components**: Add to `src/components/`
3. **Types**: Define in appropriate files in `src/types/` or inline

## Issues

We use GitHub issues to track bugs and feature requests. When creating an issue:

1. **Be descriptive**: Provide clear reproduction steps
2. **Include context**: Browser, OS, device type
3. **Add labels**: Use appropriate labels for categorization

### Issue Labels:
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `documentation` - Improvements or additions to documentation
- `mobile` - Mobile-specific issues
- `desktop` - Desktop-specific issues

## Feature Requests

We welcome feature requests! Please:

1. Check existing issues first
2. Describe the feature clearly
3. Explain the use case
4. Consider the scope (should it be core or plugin?)

## Game Design Guidelines

### Core Principles:
- **Mobile-First**: All features must work on mobile devices
- **Progressive Enhancement**: Start simple, add complexity incrementally
- **Accessibility**: Consider players with different abilities
- **Performance**: Maintain smooth 60fps gameplay

### Art Style:
- **Theme**: Constellation and space motifs
- **Colors**: Dark space backgrounds with bright star elements
- **Graphics**: SVG-based for scalability

## Testing

### Manual Testing:
- Test on both desktop and mobile
- Verify touch controls work properly
- Check different screen sizes
- Test game performance

### Automated Testing:
- Unit tests for game logic
- Component tests for React components
- Integration tests for game systems

## Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/herring101/constellation-adventure.git
   cd constellation-adventure
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**: http://localhost:3000

## Release Process

1. Features are developed in feature branches
2. Pull requests are reviewed by maintainers
3. Approved changes are merged to `main`
4. Releases are tagged and deployed to Vercel

## Team Roles

- **Seira (セイラ)**: Game engine, physics, backend logic
- **Stella (ステラ)**: UI/UX, frontend components, visual design

## Getting Help

- **Documentation**: Check the README.md first
- **Issues**: Search existing issues or create a new one
- **Code Review**: Feel free to ask questions in pull request comments

## License

By contributing to Stellar Adventure, you agree that your contributions will be licensed under the MIT License.

## Thank You!

We appreciate all contributions, whether they're bug reports, feature requests, documentation improvements, or code changes. Every contribution helps make Stellar Adventure better for everyone! 🌟