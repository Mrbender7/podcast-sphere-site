// src/services/VoiceEnhancerService.ts

class VoiceEnhancer {
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  private eqNode: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private isEnabled: boolean = false;

  init(audioElement: HTMLAudioElement) {
    // Ne créer le contexte qu'une seule fois pour éviter l'erreur InvalidStateError
    if (this.audioContext) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();

      // 1. Source (le lecteur audio global)
      this.sourceNode = this.audioContext.createMediaElementSource(audioElement);

      // 2. Compresseur Dynamique (Niveleur de volume)
      this.compressorNode = this.audioContext.createDynamicsCompressor();
      this.compressorNode.threshold.value = -24;
      this.compressorNode.knee.value = 30;
      this.compressorNode.ratio.value = 12;
      this.compressorNode.attack.value = 0.003;
      this.compressorNode.release.value = 0.25;

      // 3. Égaliseur (EQ) pour la clarté vocale
      this.eqNode = this.audioContext.createBiquadFilter();
      this.eqNode.type = 'peaking';
      this.eqNode.frequency.value = 3000;
      this.eqNode.Q.value = 1;
      this.eqNode.gain.value = 0;

      // 4. Gain de compensation (Makeup Gain)
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 1;

      // Routage par défaut (Bypass : Source -> Destination)
      this.sourceNode.connect(this.audioContext.destination);

      console.log("[VoiceEnhancer] Initialisé avec succès");
    } catch (e) {
      console.error("[VoiceEnhancer] Web Audio API non supportée ou erreur d'initialisation", e);
    }
  }

  toggle(enable: boolean) {
    if (!this.audioContext || !this.sourceNode || !this.compressorNode || !this.eqNode || !this.gainNode) return;

    this.isEnabled = enable;

    // Déconnexion de la route audio actuelle
    this.sourceNode.disconnect();
    this.compressorNode.disconnect();
    this.eqNode.disconnect();
    this.gainNode.disconnect();

    if (enable) {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Activation des filtres
      this.eqNode.gain.value = 8;
      this.gainNode.gain.value = 2.0;

      // Routage Premium : Source -> Compresseur -> EQ -> Gain -> Sortie
      this.sourceNode.connect(this.compressorNode);
      this.compressorNode.connect(this.eqNode);
      this.eqNode.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);

      console.log("[VoiceEnhancer] Activé");
    } else {
      // Retour à la normale
      this.eqNode.gain.value = 0;
      this.gainNode.gain.value = 1;
      this.sourceNode.connect(this.audioContext.destination);

      console.log("[VoiceEnhancer] Désactivé");
    }
  }

  getState() {
    return this.isEnabled;
  }
}

export const voiceEnhancer = new VoiceEnhancer();
