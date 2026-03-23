// src/services/VoiceEnhancerService.ts

class VoiceEnhancer {
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  private eqNode: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private isEnabled = false;

  init(audioElement: HTMLAudioElement) {
    if (this.audioContext) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();
      this.sourceNode = this.audioContext.createMediaElementSource(audioElement);
      this.compressorNode = this.audioContext.createDynamicsCompressor();
      this.eqNode = this.audioContext.createBiquadFilter();
      this.gainNode = this.audioContext.createGain();

      this.eqNode.type = "peaking";
      this.eqNode.frequency.value = 3000;
      this.eqNode.Q.value = 1;

      // Chaîne audio stable: on connecte une seule fois, puis on ajuste seulement les paramètres.
      this.sourceNode.connect(this.compressorNode);
      this.compressorNode.connect(this.eqNode);
      this.eqNode.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);

      this.applyDisabledSettings();
      console.log("[VoiceEnhancer] Initialisé avec succès");
    } catch (e) {
      console.error("[VoiceEnhancer] Web Audio API non supportée ou erreur d'initialisation", e);
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

  async toggle(enable: boolean) {
    if (!this.audioContext || !this.sourceNode || !this.compressorNode || !this.eqNode || !this.gainNode) return;

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
    } catch (e) {
      this.isEnabled = false;
      this.applyDisabledSettings();
      console.error("[VoiceEnhancer] Échec du basculement", e);
    }
  }

  getState() {
    return this.isEnabled;
  }
}

export const voiceEnhancer = new VoiceEnhancer();
