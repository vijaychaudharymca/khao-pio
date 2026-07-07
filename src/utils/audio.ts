/**
 * Plays a high-quality dual-tone bell notification sound using the Web Audio API.
 * This works natively in the browser without requiring external audio assets.
 */
export function playNotificationSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    // Low tone (G4) and High tone (E5) dual chime
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(392.00, now); // G4
    osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5
    
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(659.25, now); // E5
    osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.18); // E6
    
    gainNode.gain.setValueAtTime(0.25, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  } catch (e) {
    console.warn("Audio Context playback failed or blocked by autoplay policy", e);
  }
}
