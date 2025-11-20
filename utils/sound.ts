
let audioCtx: AudioContext | null = null;
let bgMusicNode: { stop: () => void } | null = null;

// Global mute state
let isMuted = false;

export const setGlobalMute = (muted: boolean) => {
  isMuted = muted;
  const ctx = getContext();
  if (muted) {
    if (bgMusicNode) bgMusicNode.stop();
    if (ctx && ctx.state === 'running') ctx.suspend();
  } else {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }
};

const getContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

// --- BACKGROUND MUSIC (Mock-Royale Theme) ---
export const toggleBackgroundMusic = (shouldPlay: boolean) => {
  // Logic removed per previous request, kept empty for interface compatibility if needed
};

// --- INSTRUMENTS ---

const playMarimba = (freq: number, time: number, vol: number) => {
  if (!audioCtx || isMuted) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine'; 
  osc.frequency.setValueAtTime(freq, time);
  
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(vol, time + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

  osc.connect(gain).connect(audioCtx.destination);
  osc.start(time);
  osc.stop(time + 0.35);
};

const playBrass = (freq: number, time: number, duration: number, vol: number) => {
  if (!audioCtx || isMuted) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, time);
  
  filter.type = 'lowpass';
  filter.Q.value = 2;
  filter.frequency.setValueAtTime(200, time);
  filter.frequency.linearRampToValueAtTime(1000, time + 0.1); 
  filter.frequency.exponentialRampToValueAtTime(200, time + duration); 

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(vol, time + 0.05);
  gain.gain.linearRampToValueAtTime(vol * 0.8, time + 0.2);
  gain.gain.linearRampToValueAtTime(0, time + duration);

  osc.connect(filter).connect(gain).connect(audioCtx.destination);
  osc.start(time);
  osc.stop(time + duration + 0.1);
};

const playSparkle = (time: number) => {
  if (!audioCtx || isMuted) return;
  const count = 10;
  for(let i=0; i<count; i++) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 1000 + Math.random() * 2000;
    gain.gain.setValueAtTime(0.05, time + (i*0.05));
    gain.gain.exponentialRampToValueAtTime(0.001, time + (i*0.05) + 0.1);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(time + (i*0.05));
    osc.stop(time + (i*0.05) + 0.1);
  }
}

// --- SFX ---

export const playFlipSound = () => {
  if (isMuted) return;
  const ctx = getContext();
  const t = ctx.currentTime;
  if (ctx.state === 'suspended') ctx.resume();

  const freqs = [2200, 2600, 3400];
  freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = f;
      osc.detune.value = (Math.random() * 40) - 20; 
      
      const vol = 0.04 / (i+1);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2); 
      
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 1.2);
  });
};

export const playClickSound = () => {
  if (isMuted) return;
  const ctx = getContext();
  if (ctx.state === 'suspended') ctx.resume();
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(900, ctx.currentTime);
  
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
};

export const startSpinSound = () => { return () => {}; };
export const stopSpinSound = () => {};

// STREAK START/INCREMENT SOUND
export const playStreakStepSound = (streakLevel: number) => {
  if (isMuted) return;
  const ctx = getContext();
  const t = ctx.currentTime;
  
  const pitchMod = Math.min(1 + (streakLevel * 0.05), 2.0);
  
  // Bright 'Ding'
  playMarimba(523.25 * pitchMod, t, 0.3); // C
  playMarimba(783.99 * pitchMod, t + 0.05, 0.3); // G
};

// STREAK BREAK SOUND
export const playStreakBreakSound = () => {
    if (isMuted) return;
    const ctx = getContext();
    const t = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    
    osc1.frequency.setValueAtTime(300, t);
    osc1.frequency.exponentialRampToValueAtTime(50, t + 0.5);
    osc2.frequency.setValueAtTime(315, t); 
    osc2.frequency.exponentialRampToValueAtTime(55, t + 0.5);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.6);
    osc2.stop(t + 0.6);
};

export const playRevealSound = (rarity: 'COMMON' | 'RARE' | 'LEGENDARY') => {
  if (isMuted) return;
  const ctx = getContext();
  const t = ctx.currentTime;

  if (rarity === 'LEGENDARY' || rarity === 'RARE') {
      // Major triad up
      playMarimba(523.25, t, 0.2);
      playMarimba(659.25, t + 0.1, 0.2);
      playMarimba(783.99, t + 0.2, 0.2);
      playMarimba(1046.50, t + 0.3, 0.4);
      playSparkle(t);
  } else {
      playMarimba(523.25, t, 0.2);
  }
};

export const playMilestoneSound = () => {
  if (isMuted) return;
  const ctx = getContext();
  const t = ctx.currentTime;
  
  // Bright, vibrant victory fanfare
  // Quick arpeggio up
  [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98].forEach((f, i) => {
     playMarimba(f, t + (i * 0.05), 0.3);
  });

  // Power chords
  playBrass(523.25, t + 0.3, 1.0, 0.4);
  playBrass(783.99, t + 0.3, 1.0, 0.4);
  playBrass(1046.50, t + 0.3, 1.0, 0.4);
  
  playSparkle(t);
};

export const playMultiplierSound = () => {
  if (isMuted) return;
  const ctx = getContext();
  const t = ctx.currentTime;
  
  playMarimba(1046.50, t, 0.3);
  playMarimba(2093.00, t + 0.1, 0.3);
};
