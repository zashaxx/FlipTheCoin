
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
  if (isMuted && shouldPlay) return;

  const ctx = getContext();
  
  if (!shouldPlay) {
    if (bgMusicNode) {
      bgMusicNode.stop();
      bgMusicNode = null;
    }
    return;
  }

  if (bgMusicNode) return; 
  if (ctx.state === 'suspended' && !isMuted) ctx.resume();

  const tempo = 110; 
  const spb = 60.0 / tempo; 
  let isPlaying = true;
  let nextNoteTime = ctx.currentTime + 0.1;
  let beatCount = 0;

  const melodySequence = [
    { n: 0, d: 0.5 }, { n: 4, d: 0.5 }, { n: 7, d: 0.5 }, { n: 0, d: 0.5 }, 
    { n: 5, d: 0.5 }, { n: 9, d: 0.5 }, { n: 5, d: 0.5 }, { n: 2, d: 0.5 }, 
    { n: 4, d: 0.5 }, { n: 7, d: 0.5 }, { n: 11, d: 0.5 }, { n: 7, d: 0.5 }, 
    { n: 0, d: 1.0 }, { n: 12, d: 1.0 }, 
  ];
  
  const root = 60;
  const getFreq = (offset: number) => 440 * Math.pow(2, (root + offset - 69) / 12);

  const scheduleNote = () => {
    if (!isPlaying) return;
    
    if (!isMuted) {
       const beatIndex = beatCount % 16;
       const isDownBeat = beatIndex % 2 === 0;

       if (isDownBeat) {
         const bassOffset = (beatIndex % 4 === 0) ? -12 : -5; 
         playBrass(getFreq(bassOffset), nextNoteTime, spb * 0.8, 0.2);
       }

       const melodyIdx = Math.floor(beatCount / 2) % melodySequence.length;
       if (beatCount % 2 === 0) { 
          const noteVal = [0, 4, 7, 9, 7, 4, 2, -5][beatCount % 8];
          playMarimba(getFreq(noteVal), nextNoteTime, 0.15);
          
          if (beatCount % 16 === 14) {
             playMarimba(getFreq(12), nextNoteTime, 0.1);
             playMarimba(getFreq(16), nextNoteTime + 0.1, 0.1);
          }
       }
    }

    nextNoteTime += spb / 2; 
    beatCount++;

    const lookahead = 0.1; 
    if (nextNoteTime < ctx.currentTime + lookahead) {
       scheduleNote(); 
    } else {
       setTimeout(scheduleNote, (nextNoteTime - ctx.currentTime - lookahead) * 1000);
    }
  };

  scheduleNote();

  bgMusicNode = {
    stop: () => {
      isPlaying = false;
      bgMusicNode = null;
    }
  };
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

const playChoirChord = (rootFreq: number, time: number, duration: number) => {
  if (!audioCtx || isMuted) return;
  
  // Simulate a lush choir with multiple detuned sine/triangle waves
  const freqs = [rootFreq, rootFreq * 1.25, rootFreq * 1.5]; // Major chord
  
  freqs.forEach(f => {
     const osc = audioCtx!.createOscillator();
     const gain = audioCtx!.createGain();
     
     osc.type = 'triangle';
     osc.frequency.setValueAtTime(f, time);
     
     gain.gain.setValueAtTime(0, time);
     gain.gain.linearRampToValueAtTime(0.2, time + 0.2); // Slow attack
     gain.gain.exponentialRampToValueAtTime(0.001, time + duration); // Slow release
     
     // Add some vibrato
     const vibOsc = audioCtx!.createOscillator();
     const vibGain = audioCtx!.createGain();
     vibOsc.frequency.value = 5; 
     vibGain.gain.value = 3;
     vibOsc.connect(vibGain).connect(osc.frequency);
     vibOsc.start(time);
     vibOsc.stop(time + duration);

     osc.connect(gain).connect(audioCtx!.destination);
     osc.start(time);
     osc.stop(time + duration);
  });
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

  const click = ctx.createOscillator();
  const cGain = ctx.createGain();
  click.frequency.setValueAtTime(500, t);
  click.frequency.exponentialRampToValueAtTime(50, t + 0.05);
  cGain.gain.setValueAtTime(0.5, t);
  cGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  click.connect(cGain).connect(ctx.destination);
  click.start(t);
  click.stop(t + 0.05);

  const bufferSize = ctx.sampleRate * 0.4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(200, t);
  filter.frequency.linearRampToValueAtTime(800, t + 0.1); 
  
  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.15, t);
  nGain.gain.linearRampToValueAtTime(0, t + 0.3);

  noise.connect(filter).connect(nGain).connect(ctx.destination);
  noise.start(t);
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
  
  // 1. Bell
  playMarimba(523.25 * pitchMod, t, 0.3);
  playMarimba(1046.50 * pitchMod, t + 0.05, 0.2);

  // 2. Fire ignition "Whoosh"
  const bufferSize = ctx.sampleRate * 0.3;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(100, t);
  filter.frequency.exponentialRampToValueAtTime(3000, t + 0.15);

  const nGain = ctx.createGain();
  nGain.gain.setValueAtTime(0.2, t);
  nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  
  noise.connect(filter).connect(nGain).connect(ctx.destination);
  noise.start(t);
};

// STREAK BREAK SOUND
export const playStreakBreakSound = () => {
    if (isMuted) return;
    const ctx = getContext();
    const t = ctx.currentTime;
    
    // Dissonant "Shatter"
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

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(100, t);
  osc.frequency.exponentialRampToValueAtTime(30, t + 0.2);
  gain.gain.setValueAtTime(1.0, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.4);

  if (rarity === 'LEGENDARY' || rarity === 'RARE') {
      playBrass(261.63, t, 0.5, 0.6);
      playBrass(392.00, t, 0.5, 0.5);
      playBrass(523.25, t, 0.5, 0.4);
      
      for(let i=0; i<10; i++) {
        playMarimba(1500 + Math.random()*1000, t + i*0.05, 0.1);
      }
  }
};

export const playMilestoneSound = () => {
  if (isMuted) return;
  const ctx = getContext();
  const t = ctx.currentTime;
  
  // Simulate "Legendary Card" reveal style
  // Strong Brass Hit + Choir
  playBrass(523.25, t, 2.5, 0.6); // C5
  playBrass(659.25, t, 2.5, 0.6); // E5
  playBrass(783.99, t, 2.5, 0.6); // G5
  
  // Ascending arp
  playMarimba(523.25, t, 0.4);
  playMarimba(659.25, t+0.1, 0.4);
  playMarimba(783.99, t+0.2, 0.4);
  playMarimba(1046.5, t+0.3, 0.6);
  
  // Choir pad
  playChoirChord(261.63, t, 3.0); 
};

export const playMultiplierSound = () => {
  if (isMuted) return;
  const ctx = getContext();
  const t = ctx.currentTime;
  
  // Sharp High Pitch Ding + Power Up
  playMarimba(1046.50, t, 0.5);
  playMarimba(2093.00, t + 0.1, 0.5);
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(400, t);
  osc.frequency.linearRampToValueAtTime(1200, t + 0.3); // Slide up
  gain.gain.setValueAtTime(0.3, t);
  gain.gain.linearRampToValueAtTime(0, t + 0.3);
  
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
};
