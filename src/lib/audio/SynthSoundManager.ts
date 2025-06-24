export class SynthSoundManager {
  private static instance: SynthSoundManager;
  private audioContext: AudioContext | null = null;
  private bgmGainNode: GainNode | null = null;
  private seGainNode: GainNode | null = null;
  private bgmNodes: OscillatorNode[] = [];
  private enabled: boolean = true;

  private constructor() {}

  static getInstance(): SynthSoundManager {
    if (!SynthSoundManager.instance) {
      SynthSoundManager.instance = new SynthSoundManager();
    }
    return SynthSoundManager.instance;
  }

  async initialize(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      // ゲインノード作成
      this.bgmGainNode = this.audioContext.createGain();
      this.bgmGainNode.gain.value = 0.1; // BGM音量（低めに設定）
      this.bgmGainNode.connect(this.audioContext.destination);
      
      this.seGainNode = this.audioContext.createGain();
      this.seGainNode.gain.value = 0.3; // SE音量
      this.seGainNode.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      this.enabled = false;
    }
  }

  playBGM(): void {
    if (!this.enabled || !this.audioContext || !this.bgmGainNode) return;
    
    // 既存のBGMを停止
    this.stopBGM();

    // シンプルな宇宙的BGMを生成
    const now = this.audioContext.currentTime;
    
    // ベース音
    const bass = this.audioContext.createOscillator();
    bass.type = 'triangle';
    bass.frequency.setValueAtTime(55, now); // A1
    bass.frequency.setValueAtTime(82.41, now + 2); // E2
    bass.frequency.setValueAtTime(55, now + 4); // A1に戻る
    
    const bassGain = this.audioContext.createGain();
    bassGain.gain.value = 0.3;
    bass.connect(bassGain);
    bassGain.connect(this.bgmGainNode);
    
    // メロディー
    const melody = this.audioContext.createOscillator();
    melody.type = 'sine';
    melody.frequency.setValueAtTime(440, now); // A4
    melody.frequency.setValueAtTime(523.25, now + 0.5); // C5
    melody.frequency.setValueAtTime(659.25, now + 1); // E5
    melody.frequency.setValueAtTime(440, now + 1.5); // A4
    
    const melodyGain = this.audioContext.createGain();
    melodyGain.gain.value = 0.2;
    melody.connect(melodyGain);
    melodyGain.connect(this.bgmGainNode);
    
    bass.start(now);
    melody.start(now);
    
    this.bgmNodes = [bass, melody];
    
    // ループ設定（4秒ごとに再生）
    setTimeout(() => {
      if (this.enabled) {
        this.playBGM();
      }
    }, 4000);
  }

  stopBGM(): void {
    this.bgmNodes.forEach(node => {
      try {
        node.stop();
      } catch {
        // Already stopped
      }
    });
    this.bgmNodes = [];
  }

  playSE(soundKey: string): void {
    if (!this.enabled || !this.audioContext || !this.seGainNode) return;
    
    const now = this.audioContext.currentTime;
    
    switch (soundKey) {
      case 'jump':
        this.playJumpSound(now);
        break;
      case 'collect':
        this.playCollectSound(now);
        break;
      case 'goal':
        this.playGoalSound(now);
        break;
    }
  }

  private playJumpSound(startTime: number): void {
    const osc = this.audioContext!.createOscillator();
    const gain = this.audioContext!.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, startTime);
    osc.frequency.exponentialRampToValueAtTime(800, startTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.seGainNode!);
    
    osc.start(startTime);
    osc.stop(startTime + 0.1);
  }

  private playCollectSound(startTime: number): void {
    // キラキラ音
    const osc1 = this.audioContext!.createOscillator();
    const osc2 = this.audioContext!.createOscillator();
    const gain = this.audioContext!.createGain();
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1047, startTime); // C6
    osc1.frequency.setValueAtTime(1319, startTime + 0.05); // E6
    osc1.frequency.setValueAtTime(1568, startTime + 0.1); // G6
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2093, startTime); // C7
    osc2.frequency.setValueAtTime(2637, startTime + 0.05); // E7
    osc2.frequency.setValueAtTime(3136, startTime + 0.1); // G7
    
    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.seGainNode!);
    
    osc1.start(startTime);
    osc1.stop(startTime + 0.3);
    osc2.start(startTime);
    osc2.stop(startTime + 0.3);
  }

  private playGoalSound(startTime: number): void {
    // ファンファーレ
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    
    notes.forEach((freq, index) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, startTime + index * 0.15);
      
      gain.gain.setValueAtTime(0.2, startTime + index * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + index * 0.15 + 0.4);
      
      osc.connect(gain);
      gain.connect(this.seGainNode!);
      
      osc.start(startTime + index * 0.15);
      osc.stop(startTime + index * 0.15 + 0.4);
    });
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.stopBGM();
    }
  }

  setBGMVolume(volume: number): void {
    if (this.bgmGainNode) {
      this.bgmGainNode.gain.value = Math.max(0, Math.min(1, volume * 0.1));
    }
  }

  setSEVolume(volume: number): void {
    if (this.seGainNode) {
      this.seGainNode.gain.value = Math.max(0, Math.min(1, volume * 0.3));
    }
  }
}