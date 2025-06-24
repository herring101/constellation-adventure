export class SoundManager {
  private static instance: SoundManager;
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private bgmSource: AudioBufferSourceNode | null = null;
  private bgmGainNode: GainNode | null = null;
  private seGainNode: GainNode | null = null;
  private enabled: boolean = true;

  private constructor() {}

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  async initialize(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      // ゲインノード作成
      this.bgmGainNode = this.audioContext.createGain();
      this.bgmGainNode.gain.value = 0.3; // BGM音量
      this.bgmGainNode.connect(this.audioContext.destination);
      
      this.seGainNode = this.audioContext.createGain();
      this.seGainNode.gain.value = 0.5; // SE音量
      this.seGainNode.connect(this.audioContext.destination);
      
      // 音源をプリロード
      await this.loadSounds();
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      this.enabled = false;
    }
  }

  private async loadSounds(): Promise<void> {
    const soundFiles = {
      bgm: '/sounds/bgm.ogg',
      jump: '/sounds/jump.wav',
      collect: '/sounds/collect.wav',
      goal: '/sounds/goal.wav',
      gameOver: '/sounds/death.wav' // 専用のゲームオーバー音（宇宙船爆発音）
    };

    const loadPromises = Object.entries(soundFiles).map(async ([key, url]) => {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
        this.sounds.set(key, audioBuffer);
      } catch (error) {
        console.error(`Failed to load sound ${key}:`, error);
      }
    });

    await Promise.all(loadPromises);
  }

  playBGM(): void {
    if (!this.enabled || !this.audioContext || !this.bgmGainNode) return;
    
    const bgmBuffer = this.sounds.get('bgm');
    if (!bgmBuffer) return;

    // 既存のBGMを停止
    if (this.bgmSource) {
      this.bgmSource.stop();
    }

    this.bgmSource = this.audioContext.createBufferSource();
    this.bgmSource.buffer = bgmBuffer;
    this.bgmSource.loop = true;
    this.bgmSource.connect(this.bgmGainNode);
    this.bgmSource.start();
  }

  stopBGM(): void {
    if (this.bgmSource) {
      this.bgmSource.stop();
      this.bgmSource = null;
    }
  }

  playSE(soundKey: string): void {
    if (!this.enabled || !this.audioContext || !this.seGainNode) return;
    
    const buffer = this.sounds.get(soundKey);
    if (!buffer) return;

    // 重複防止のため、既存のSEが再生中でも新しいインスタンスを作成
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    
    // ゲームオーバー音はcollect音をそのまま使用（違いを明確にするため）
    source.connect(this.seGainNode);
    
    // デバッグ用ログ追加
    console.log(`[SoundManager] Playing SE: ${soundKey} at ${Date.now()}`);
    
    source.start();
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.stopBGM();
    }
  }

  setBGMVolume(volume: number): void {
    if (this.bgmGainNode) {
      this.bgmGainNode.gain.value = Math.max(0, Math.min(1, volume));
      console.log(`[SoundManager] BGM volume set to: ${volume} (${Math.round(volume * 100)}%)`);
    } else {
      console.warn('[SoundManager] BGM gain node not available');
    }
  }

  setSEVolume(volume: number): void {
    if (this.seGainNode) {
      this.seGainNode.gain.value = Math.max(0, Math.min(1, volume));
      console.log(`[SoundManager] SE volume set to: ${volume} (${Math.round(volume * 100)}%)`);
    } else {
      console.warn('[SoundManager] SE gain node not available');
    }
  }
  
  // ゲインノードへの直接アクセス（設定画面用）
  getBGMGainNode() {
    return this.bgmGainNode;
  }
  
  getSEGainNode() {
    return this.seGainNode;
  }
}