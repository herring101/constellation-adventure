export type InputAction = 'moveLeft' | 'moveRight' | 'jump' | 'action';

export interface InputHandler {
  onAction: (action: InputAction, pressed: boolean) => void;
}

export class InputManager {
  private inputHandler: InputHandler | null = null;
  private pressedKeys = new Set<string>();
  private touchStartX = 0;
  private touchStartY = 0;
  private isListening = false;

  // Key mappings
  private readonly keyMappings: Record<string, InputAction> = {
    'ArrowLeft': 'moveLeft',
    'KeyA': 'moveLeft',
    'ArrowRight': 'moveRight',
    'KeyD': 'moveRight',
    'Space': 'jump',
    'ArrowUp': 'jump',
    'KeyW': 'jump',
    'Enter': 'action',
    'KeyE': 'action',
  };

  public setInputHandler(handler: InputHandler): void {
    this.inputHandler = handler;
  }

  public startListening(): void {
    if (this.isListening) return;
    
    this.isListening = true;

    // Keyboard events
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);

    // Touch events for mobile
    document.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    document.addEventListener('touchmove', this.handleTouchMove, { passive: false });

    // Prevent default behaviors
    document.addEventListener('contextmenu', this.preventDefault);
  }

  public stopListening(): void {
    if (!this.isListening) return;
    
    this.isListening = false;

    // Remove keyboard events
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);

    // Remove touch events
    document.removeEventListener('touchstart', this.handleTouchStart);
    document.removeEventListener('touchend', this.handleTouchEnd);
    document.removeEventListener('touchmove', this.handleTouchMove);

    // Remove prevention
    document.removeEventListener('contextmenu', this.preventDefault);

    this.pressedKeys.clear();
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    event.preventDefault();
    
    const action = this.keyMappings[event.code];
    if (action && !this.pressedKeys.has(event.code)) {
      this.pressedKeys.add(event.code);
      this.inputHandler?.onAction(action, true);
    }
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    event.preventDefault();
    
    const action = this.keyMappings[event.code];
    if (action && this.pressedKeys.has(event.code)) {
      this.pressedKeys.delete(event.code);
      this.inputHandler?.onAction(action, false);
    }
  };

  private handleTouchStart = (event: TouchEvent): void => {
    event.preventDefault();
    
    if (event.touches.length === 0) return;
    
    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;

    // Determine touch action based on screen position
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Right side of screen = jump
    if (touch.clientX > screenWidth * 0.6) {
      this.inputHandler?.onAction('jump', true);
    }
    // Left side of screen = movement (will be determined in touchmove)
  };

  private handleTouchMove = (event: TouchEvent): void => {
    event.preventDefault();
    
    if (event.touches.length === 0) return;
    
    const touch = event.touches[0];
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;
    
    // Horizontal swipe detection
    const threshold = 20;
    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        this.inputHandler?.onAction('moveRight', true);
        this.inputHandler?.onAction('moveLeft', false);
      } else {
        this.inputHandler?.onAction('moveLeft', true);
        this.inputHandler?.onAction('moveRight', false);
      }
    }
  };

  private handleTouchEnd = (event: TouchEvent): void => {
    event.preventDefault();
    
    // Stop all movement actions on touch end
    this.inputHandler?.onAction('moveLeft', false);
    this.inputHandler?.onAction('moveRight', false);
    this.inputHandler?.onAction('jump', false);
  };

  private preventDefault = (event: Event): void => {
    event.preventDefault();
  };

  public isActionPressed(action: InputAction): boolean {
    for (const [key, mappedAction] of Object.entries(this.keyMappings)) {
      if (mappedAction === action && this.pressedKeys.has(key)) {
        return true;
      }
    }
    return false;
  }
}