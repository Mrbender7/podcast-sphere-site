// src/services/VoiceEnhancerService.ts

class VoiceEnhancer {
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  private eqNode: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private isEnabled = false;
  private isSupported = false;

  init(audioElement: HTMLAudioElement): boolean {
    if (this.audioContext && this.isSupported) return true;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return false;

      this.audioContext = new AudioContextClass();
      this.sourceNode = this.audioContext.createMediaElementSource(audioElement);
      this.compressorNode = this.audioContext.createDynamicsCompressor();
      this.eqNode = this.audioContext.createBiquadFilter();
      this.gainNode = this.audioContext.createGain();

      this.eqNode.type = "peaking";
      this.eqNode.frequency.value = 3000;
      this.eqNode.Q.value = 1;

      this.sourceNode.connect(this.compressorNode);
      this.compressorNode.connect(this.eqNode);
      this.eqNode.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);

      this.applyDisabledSettings();
      this.isSupported = true;
      console.log("[VoiceEnhancer] Initialisé avec succès");
      return true;
    } catch (e) {
      this.isSupported = false;
      this.isEnabled = false;
      this.audioContext = null;
      this.sourceNode = null;
      this.compressorNode = null;
      this.eqNode = null;
      this.gainNode = null;
      console.error("[VoiceEnhancer] Non disponible sur ce flux/appareil", e);
      return false;
    }
  }

  private applyDisabledSettings() {
    if (!this.compressorNode || !this.eqNode || !this.gainNode) return;
    this.compressorNode.threshold.value = 0;
    this.compressorNode.knee.value = 0;
    this.compressorNode.ratio.value = 1;
    this.compressorNode.attack.value = 0.003;
    this.compressorNode.release.value = 0.25;
    this.eqNode.gain.value = 0;
    this.gainNode.gain.value = 1;
  }

  private applyEnabledSettings() {
    if (!this.compressorNode || !this.eqNode || !this.gainNode) return;
    this.compressorNode.threshold.value = -24;
    this.compressorNode.knee.value = 30;
    this.compressorNode.ratio.value = 12;
    this.compressorNode.attack.value = 0.003;
    this.compressorNode.release.value = 0.25;
    this.eqNode.gain.value = 8;
    this.gainNode.gain.value = 2;
  }

  async toggle(enable: boolean): Promise<boolean> {
    if (!this.isSupported || !this.audioContext || !this.sourceNode || !this.compressorNode || !this.eqNode || !this.gainNode) {
      this.isEnabled = false;
      return false;
    }

    try {
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      this.isEnabled = enable;

      if (enable) {
        this.applyEnabledSettings();
        console.log("[VoiceEnhancer] Activé");
      } else {
        this.applyDisabledSettings();
        console.log("[VoiceEnhancer] Désactivé");
      }

      return this.isEnabled;
    } catch (e) {
      this.isEnabled = false;
      this.applyDisabledSettings();
      console.error("[VoiceEnhancer] Échec du basculement", e);
      return false;
    }
  }

  getState() {
    return this.isEnabled;
  }

  canUse() {
    return this.isSupported;
  }
}

export const voiceEnhancer = new VoiceEnhancer();
