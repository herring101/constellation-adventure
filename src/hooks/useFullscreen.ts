import { useState, useEffect, useCallback } from 'react';

interface FullscreenState {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  exitFullscreen: () => void;
}

export const useFullscreen = (elementRef?: React.RefObject<HTMLElement | null>): FullscreenState => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const enterFullscreen = useCallback(async (element: HTMLElement) => {
    try {
      // Fullscreen APIのブラウザ互換性対応
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if ('webkitRequestFullscreen' in element) {
        await (element as HTMLElement & { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
      } else if ('mozRequestFullScreen' in element) {
        await (element as HTMLElement & { mozRequestFullScreen: () => Promise<void> }).mozRequestFullScreen();
      } else if ('msRequestFullscreen' in element) {
        await (element as HTMLElement & { msRequestFullscreen: () => Promise<void> }).msRequestFullscreen();
      }

      // 横向きロックを試みる（モバイル対応）
      if ('orientation' in screen && screen.orientation && 'lock' in screen.orientation) {
        try {
          await (screen.orientation as ScreenOrientation & { lock: (orientation: string) => Promise<void> }).lock('landscape');
        } catch {
          // 横向きロックがサポートされていない場合は無視
          console.log('Screen orientation lock not supported');
        }
      }
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ('webkitExitFullscreen' in document) {
        await (document as Document & { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen();
      } else if ('mozCancelFullScreen' in document) {
        await (document as Document & { mozCancelFullScreen: () => Promise<void> }).mozCancelFullScreen();
      } else if ('msExitFullscreen' in document) {
        await (document as Document & { msExitFullscreen: () => Promise<void> }).msExitFullscreen();
      }

      // 横向きロックを解除
      if ('orientation' in screen && screen.orientation && 'unlock' in screen.orientation) {
        try {
          (screen.orientation as ScreenOrientation & { unlock: () => void }).unlock();
        } catch {
          // 解除がサポートされていない場合は無視
        }
      }
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    const element = elementRef?.current || document.documentElement;
    
    if (!isFullscreen) {
      enterFullscreen(element);
    } else {
      exitFullscreen();
    }
  }, [isFullscreen, elementRef, enterFullscreen, exitFullscreen]);

  return {
    isFullscreen,
    toggleFullscreen,
    exitFullscreen,
  };
};