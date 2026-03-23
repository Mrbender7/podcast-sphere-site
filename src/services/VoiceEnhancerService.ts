// src/services/VoiceEnhancerService.ts

class VoiceEnhancer {
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  private eqNode: BiquadFilterNode | null = null;
  private highPassNode: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private attachedElement: HTMLAudioElement | null = null;
  private sourceSupportCache = new Map<string, boolean>();
  private isEnabled = false;
  private isSupported = false;

  private getSourceUrl(audioElement: HTMLAudioElement): string {
    return audioElement.currentSrc || audioElement.src || "";
  }

  private isUrlLocallySafe(sourceUrl: string): boolean {
    if (!sourceUrl) return false;

    try {
      const parsedUrl = new URL(sourceUrl, window.location.href);
      return (
        parsedUrl.origin === window.location.origin ||
        parsedUrl.protocol === "blob:" ||
        parsedUrl.protocol === "data:" ||
        parsedUrl.protocol === "file:" ||
        parsedUrl.protocol === "capacitor:" ||
        parsedUrl.protocol === "content:" ||
        parsedUrl.protocol === "filesystem:"
      );
    } catch {
      return false;
    }
  }

  private async canProcessSource(audioElement: HTMLAudioElement): Promise<boolean> {
    const sourceUrl = this.getSourceUrl(audioElement);
    if (!sourceUrl) return false;

    if (this.sourceSupportCache.has(sourceUrl)) {
      return this.sourceSupportCache.get(sourceUrl) ?? false;
    }

    if (this.isUrlLocallySafe(sourceUrl)) {
      this.sourceSupportCache.set(sourceUrl, true);
      return true;
    }

    try {
      const headResponse = await fetch(sourceUrl, {
        method: "HEAD",
        mode: "cors",
        cache: "no-store",
      });

      const supported = headResponse.ok;
      this.sourceSupportCache.set(sourceUrl, supported);
      return supported;
    } catch {
      try {
        const rangedResponse = await fetch(sourceUrl, {
          method: "GET",
          mode: "cors",
          cache: "no-store",
          headers: {
            Range: "bytes=0-1",
          },
        });

        const supported = rangedResponse.ok || rangedResponse.status === 206;
        this.sourceSupportCache.set(sourceUrl, supported);
        return supported;
      } catch {
        this.sourceSupportCache.set(sourceUrl, false);
        return false;
      }
    }
  }

  private resetNodes() {
    this.isEnabled = false;
    this.isSupported = false;
    this.attachedElement = null;

    try {
      this.sourceNode?.disconnect();
      this.highPassNode?.disconnect();
      this.compressorNode?.disconnect();
      this.eqNode?.disconnect();
      this.gainNode?.disconnect();
    } catch {
      // no-op
    }

    if (this.audioContext && this.audioContext.state !== "closed") {
      void this.audioContext.close().catch(() => {});
    }

    this.audioContext = null;
    this.sourceNode = null;
    this.compressorNode = null;
    this.eqNode = null;
    this.highPassNode = null;
    this.gainNode = null;
  }

  async init(audioElement: HTMLAudioElement): Promise<boolean> {
    if (this.audioContext && this.isSupported && this.attachedElement === audioElement) return true;

    if (!(await this.canProcessSource(audioElement))) {
      console.warn("[VoiceEnhancer] Flux non compatible avec le traitement local", this.getSourceUrl(audioElement));
      this.resetNodes();
      return false;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return false;

      this.audioContext = new AudioContextClass();
      this.attachedElement = audioElement;
      this.sourceNode = this.audioContext.createMediaElementSource(audioElement);
      this.compressorNode = this.audioContext.createDynamicsCompressor();
      this.eqNode = this.audioContext.createBiquadFilter();
      this.highPassNode = this.audioContext.createBiquadFilter();
      this.gainNode = this.audioContext.createGain();

      this.eqNode.type = "peaking";
      this.eqNode.frequency.value = 3000;
      this.eqNode.Q.value = 1.2;

      this.highPassNode.type = "highpass";
      this.highPassNode.frequency.value = 85;
      this.highPassNode.Q.value = 0.7;

      this.sourceNode.connect(this.highPassNode);
      this.highPassNode.connect(this.compressorNode);
      this.compressorNode.connect(this.eqNode);
      this.eqNode.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);

      this.applyDisabledSettings();
      this.isSupported = true;
      console.log("[VoiceEnhancer] Initialisé avec succès");
      return true;
    } catch (e) {
      this.resetNodes();
      console.error("[VoiceEnhancer] Non disponible sur ce flux/appareil", e);
      return false;
    }
  }

  private applyDisabledSettings() {
    if (!this.compressorNode || !this.eqNode || !this.gainNode || !this.highPassNode) return;
    this.compressorNode.threshold.value = 0;
    this.compressorNode.knee.value = 0;
    this.compressorNode.ratio.value = 1;
    this.compressorNode.attack.value = 0.003;
    this.compressorNode.release.value = 0.25;
    this.eqNode.gain.value = 0;
    this.gainNode.gain.value = 1;
  }

  private applyEnabledSettings() {
    if (!this.compressorNode || !this.eqNode || !this.gainNode || !this.highPassNode) return;
    this.compressorNode.threshold.value = -18;
    this.compressorNode.knee.value = 10;
    this.compressorNode.ratio.value = 4;
    this.compressorNode.attack.value = 0.003;
    this.compressorNode.release.value = 0.25;
    this.eqNode.gain.value = 4;
    this.highPassNode.frequency.value = 85;
    this.gainNode.gain.value = 1.3;
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

  release() {
    this.resetNodes();
  }

  canUse() {
    return this.isSupported;
  }
}

export const voiceEnhancer = new VoiceEnhancer();
