export interface Vector2D {
  x: number;
  y: number;
}

export interface GameObject {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  width: number;
  height: number;
  isActive: boolean;
}

export interface Player extends GameObject {
  isGrounded: boolean;
  health: number;
  maxHealth: number;
}

export interface GameState {
  player: Player;
  platforms: GameObject[];
  enemies: GameObject[];
  collectibles: GameObject[];
  camera: Vector2D;
  score: number;
  gameTime: number;
}

export class GameEngine {
  private gameState: GameState;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private lastTimestamp = 0;
  private animationFrameId: number | null = null;
  
  // Game constants
  private readonly GRAVITY = 0.8;
  private readonly JUMP_FORCE = -15;
  private readonly MOVE_SPEED = 5;
  private readonly FRICTION = 0.85;

  constructor() {
    this.gameState = this.initializeGameState();
  }

  private initializeGameState(): GameState {
    return {
      player: {
        id: 'player',
        position: { x: 100, y: 300 },
        velocity: { x: 0, y: 0 },
        width: 32,
        height: 32,
        isActive: true,
        isGrounded: false,
        health: 100,
        maxHealth: 100,
      },
      platforms: [
        {
          id: 'ground',
          position: { x: 0, y: 400 },
          velocity: { x: 0, y: 0 },
          width: 800,
          height: 200,
          isActive: true,
        },
      ],
      enemies: [],
      collectibles: [],
      camera: { x: 0, y: 0 },
      score: 0,
      gameTime: 0,
    };
  }

  public initialize(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    if (!this.ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;
  }

  public start(): void {
    if (!this.canvas || !this.ctx) {
      throw new Error('Game engine not initialized. Call initialize() first.');
    }

    this.lastTimestamp = performance.now();
    this.gameLoop(this.lastTimestamp);
  }

  public stop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private gameLoop = (timestamp: number): void => {
    const deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    this.update(deltaTime);
    this.render();

    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    this.gameState.gameTime += deltaTime;
    this.updatePlayer();
    this.updateCamera();
  }

  private updatePlayer(): void {
    const player = this.gameState.player;

    // Apply gravity
    player.velocity.y += this.GRAVITY;

    // Update position
    player.position.x += player.velocity.x;
    player.position.y += player.velocity.y;

    // Apply friction to horizontal movement
    player.velocity.x *= this.FRICTION;

    // Check collision with platforms
    this.checkPlatformCollisions(player);

    // Keep player in bounds
    if (player.position.x < 0) {
      player.position.x = 0;
      player.velocity.x = 0;
    }
  }

  private checkPlatformCollisions(player: Player): void {
    player.isGrounded = false;

    for (const platform of this.gameState.platforms) {
      if (this.checkCollision(player, platform)) {
        // Landing on top of platform
        if (player.velocity.y > 0 && 
            player.position.y < platform.position.y) {
          player.position.y = platform.position.y - player.height;
          player.velocity.y = 0;
          player.isGrounded = true;
        }
      }
    }
  }

  private checkCollision(obj1: GameObject, obj2: GameObject): boolean {
    return obj1.position.x < obj2.position.x + obj2.width &&
           obj1.position.x + obj1.width > obj2.position.x &&
           obj1.position.y < obj2.position.y + obj2.height &&
           obj1.position.y + obj1.height > obj2.position.y;
  }

  private updateCamera(): void {
    const player = this.gameState.player;
    // Simple camera follow
    this.gameState.camera.x = player.position.x - 400; // Center on player
    this.gameState.camera.y = player.position.y - 300;
  }

  private render(): void {
    if (!this.ctx || !this.canvas) return;

    // Clear canvas
    this.ctx.fillStyle = '#0a0e27'; // Dark blue space background
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw platforms
    this.ctx.fillStyle = '#4a5568';
    for (const platform of this.gameState.platforms) {
      this.ctx.fillRect(
        platform.position.x - this.gameState.camera.x,
        platform.position.y - this.gameState.camera.y,
        platform.width,
        platform.height
      );
    }

    // Draw player
    this.ctx.fillStyle = '#ffd700'; // Gold color for star spirit
    const player = this.gameState.player;
    this.ctx.fillRect(
      player.position.x - this.gameState.camera.x,
      player.position.y - this.gameState.camera.y,
      player.width,
      player.height
    );

    // Draw UI
    this.renderUI();
  }

  private renderUI(): void {
    if (!this.ctx) return;

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px Arial';
    this.ctx.fillText(`Score: ${this.gameState.score}`, 10, 30);
    this.ctx.fillText(`Health: ${this.gameState.player.health}/${this.gameState.player.maxHealth}`, 10, 60);
  }

  // Input handling methods
  public moveLeft(): void {
    this.gameState.player.velocity.x = -this.MOVE_SPEED;
  }

  public moveRight(): void {
    this.gameState.player.velocity.x = this.MOVE_SPEED;
  }

  public jump(): void {
    if (this.gameState.player.isGrounded) {
      this.gameState.player.velocity.y = this.JUMP_FORCE;
      this.gameState.player.isGrounded = false;
    }
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }
}